// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {EquitoApp} from "equito/src/EquitoApp.sol";
import {bytes64, EquitoMessage, EquitoMessageLibrary} from "equito/src/libraries/EquitoMessageLibrary.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract LendingBorrowing is EquitoApp {
    struct Asset {
        address token;
        address priceFeedAddress;
        uint256 totalSupply;
        uint256 totalBorrowed;
    }

    struct UserAccount {
        uint256 supplied;
        uint256 borrowed;
    }

    mapping(uint256 chainSelector => mapping(address token => Asset asset))
        public assets;
    mapping(uint256 chainSelector => address[] supportedAssets)
        public supportedAssets;
    mapping(uint256 chainSelector => mapping(address token => mapping(address user => UserAccount userAccount)))
        public userAccounts;

    uint256 public constant COLLATERAL_FACTOR = 80; // 80% collateral factor
    uint256 public constant PRICE_FEED_DECIMALS = 8;
    uint256 public immutable chain;

    event Supplied(
        uint256 chainSelector,
        address token,
        address user,
        uint256 amount
    );
    event Borrowed(
        uint256 chainSelector,
        address token,
        address user,
        uint256 amount
    );
    event Repaid(
        uint256 chainSelector,
        address token,
        address user,
        uint256 amount
    );
    event Withdrawn(
        uint256 chainSelector,
        address token,
        address user,
        uint256 amount
    );

    constructor(address _router, uint256 _chainSelector) EquitoApp(_router) {
        chain = _chainSelector;
    }

    function addAsset(
        uint256 chainSelector,
        address token,
        address priceFeedAddress
    ) external onlyOwner {
        assets[chainSelector][token] = Asset(token, priceFeedAddress, 0, 0);
        supportedAssets[chainSelector].push(token);
    }

    function supply(
        uint256 chainSelector,
        address token,
        uint256 amount
    ) external payable {
        require(
            assets[chainSelector][token].token != address(0),
            "Asset not supported"
        );

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        assets[chainSelector][token].totalSupply += amount;
        userAccounts[chainSelector][token][msg.sender].supplied += amount;

        emit Supplied(chainSelector, token, msg.sender, amount);
    }

    function borrow(
        uint256 chainSelector,
        address token,
        uint256 amount
    ) external {
        require(
            assets[chainSelector][token].token != address(0),
            "Asset not supported"
        );
        require(
            (getCollateralValue(msg.sender) * COLLATERAL_FACTOR) / 100 >=
                getBorrowedValue(msg.sender) +
                    getAssetValue(chainSelector, token, amount),
            "Insufficient collateral"
        );

        assets[chainSelector][token].totalBorrowed += amount;
        userAccounts[chainSelector][token][msg.sender].borrowed += amount;

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }

        emit Borrowed(chainSelector, token, msg.sender, amount);
    }

    function repay(
        uint256 chainSelector,
        address token,
        uint256 amount
    ) external payable {
        require(
            assets[chainSelector][token].token != address(0),
            "Asset not supported"
        );

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        uint256 borrowed = userAccounts[chainSelector][token][msg.sender]
            .borrowed;
        uint256 repayAmount = amount > borrowed ? borrowed : amount;

        assets[chainSelector][token].totalBorrowed -= repayAmount;
        userAccounts[chainSelector][token][msg.sender].borrowed -= repayAmount;

        emit Repaid(chainSelector, token, msg.sender, repayAmount);
    }

    function withdraw(
        uint256 chainSelector,
        address token,
        uint256 amount
    ) external {
        require(
            assets[chainSelector][token].token != address(0),
            "Asset not supported"
        );
        require(
            userAccounts[chainSelector][token][msg.sender].supplied >= amount,
            "Insufficient balance"
        );
        require(
            (getCollateralValue(msg.sender) * COLLATERAL_FACTOR) / 100 >=
                getBorrowedValue(msg.sender),
            "Withdrawal would exceed collateral ratio"
        );

        assets[chainSelector][token].totalSupply -= amount;
        userAccounts[chainSelector][token][msg.sender].supplied -= amount;

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }

        emit Withdrawn(chainSelector, token, msg.sender, amount);
    }

    function getCollateralValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        uint256[] memory supportedChains = getSupportedChains();

        for (uint256 i = 0; i < supportedChains.length; i++) {
            uint256 chainSelector = supportedChains[i];
            address[] memory _supportedAssets = supportedAssets[chainSelector];

            for (uint256 j = 0; j < _supportedAssets.length; j++) {
                address token = _supportedAssets[j];
                uint256 supplied = userAccounts[chainSelector][token][user]
                    .supplied;
                totalValue += getAssetValue(chainSelector, token, supplied);
            }
        }

        return totalValue;
    }

    function getBorrowedValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;
        uint256[] memory supportedChains = getSupportedChains();

        for (uint256 i = 0; i < supportedChains.length; i++) {
            uint256 chainSelector = supportedChains[i];
            address[] memory _supportedAssets = supportedAssets[chainSelector];

            for (uint256 j = 0; j < _supportedAssets.length; j++) {
                address token = _supportedAssets[j];
                uint256 borrowed = userAccounts[chainSelector][token][user]
                    .borrowed;
                totalValue += getAssetValue(chainSelector, token, borrowed);
            }
        }

        return totalValue;
    }

    function getAssetValue(
        uint256 chainSelector,
        address token,
        uint256 amount
    ) public view returns (uint256) {
        int256 price = 1;
        if (assets[chainSelector][token].priceFeedAddress != address(0)) {
            (, price, , , ) = AggregatorV3Interface(
                assets[chainSelector][token].priceFeedAddress
            ).latestRoundData();
        }
        return (uint256(price) * amount) / (10 ** IERC20(token).decimals());
    }

    function getSupportedChains() public pure returns (uint256[] memory) {
        uint256[] memory chains = new uint256[](2);
        chains[0] = 1001; // Ethereum Sepolia
        chains[1] = 1003; // Polygon Amoy
        return chains;
    }

    function getSupportedAssets(
        uint256 chainSelector
    ) public view returns (address[] memory) {
        return supportedAssets[chainSelector];
    }

    function _receiveMessageFromPeer(
        EquitoMessage calldata message,
        bytes calldata messageData
    ) internal override {
        // Handle cross-chain messages here
        // This could include updating user balances, processing cross-chain borrows, etc.
    }

    receive() external payable {}
}
