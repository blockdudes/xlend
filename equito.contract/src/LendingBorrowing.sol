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
    uint256[] public supportedChains;
    mapping(uint256 chainSelector => mapping(address token => mapping(address user => UserAccount userAccount)))
        public userAccounts;

    uint256 public constant PRICE_FEED_DECIMALS = 8;
    uint256 public immutable chain;
    uint256 public collateralFactor;

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
    event CollateralFactorUpdated(uint256 newFactor);
    event AssetAdded(
        uint256 chainSelector,
        address token,
        address priceFeedAddress
    );
    event PriceFeedUpdated(
        uint256 chainSelector,
        address token,
        address newPriceFeedAddress
    );

    error ChainNotSupported();
    error ChainAlreadySupported();
    error AssetNotSupported();
    error InsufficientCollateral();
    error IncorrectEthAmount();
    error InsufficientBalance();
    error WithdrawalExceedsCollateralRatio();

    constructor(address _router, uint256 _chainSelector) EquitoApp(_router) {
        chain = _chainSelector;
        collateralFactor = 80; // Initial 80% collateral factor
    }

    function setSupportedChains(uint256[] memory chainSelectors) external onlyOwner {
        supportedChains = chainSelectors;
    }

    function addAsset(
        uint256 chainSelector,
        address token,
        address priceFeedAddress
    ) external onlyOwner {
        bool isSupported = false;
        for (uint256 i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == chainSelector) isSupported = true;
        }
        if (!isSupported) revert ChainNotSupported();
        assets[chainSelector][token] = Asset(token, priceFeedAddress, 0, 0);
        supportedAssets[chainSelector].push(token);
        emit AssetAdded(chainSelector, token, priceFeedAddress);

        bytes memory messageData = abi.encode(
            "addAsset",
            abi.encode(chainSelector, token, priceFeedAddress)
        );
        _sendMessageToAllPeers(messageData);
    }

    function supply(address token, uint256 amount) external payable {
        if (assets[chain][token].token == address(0))
            revert AssetNotSupported();

        if (token == address(0)) {
            if (msg.value != amount) revert IncorrectEthAmount();
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        assets[chain][token].totalSupply += amount;
        userAccounts[chain][token][msg.sender].supplied += amount;
        emit Supplied(chain, token, msg.sender, amount);

        bytes memory messageData = abi.encode(
            "supply",
            abi.encode(msg.sender, chain, token, amount)
        );
        _sendMessageToAllPeers(messageData);
    }

    function borrow(address token, uint256 amount) external {
        if (assets[chain][token].token == address(0))
            revert AssetNotSupported();
        if (
            (getCollateralValue(msg.sender) * collateralFactor) / 100 <
            getBorrowedValue(msg.sender) + getAssetValue(chain, token, amount)
        ) {
            revert InsufficientCollateral();
        }

        assets[chain][token].totalBorrowed += amount;
        userAccounts[chain][token][msg.sender].borrowed += amount;

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }

        emit Borrowed(chain, token, msg.sender, amount);

        bytes memory messageData = abi.encode(
            "borrow",
            abi.encode(msg.sender, chain, token, amount)
        );
        _sendMessageToAllPeers(messageData);
    }

    function repay(address token, uint256 amount) external payable {
        if (assets[chain][token].token == address(0))
            revert AssetNotSupported();

        if (token == address(0)) {
            if (msg.value != amount) revert IncorrectEthAmount();
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        uint256 borrowed = userAccounts[chain][token][msg.sender].borrowed;
        uint256 repayAmount = amount > borrowed ? borrowed : amount;

        assets[chain][token].totalBorrowed -= repayAmount;
        userAccounts[chain][token][msg.sender].borrowed -= repayAmount;

        emit Repaid(chain, token, msg.sender, repayAmount);

        bytes memory messageData = abi.encode(
            "repay",
            abi.encode(msg.sender, chain, token, repayAmount)
        );
        _sendMessageToAllPeers(messageData);
    }

    function withdraw(address token, uint256 amount) external {
        if (assets[chain][token].token == address(0))
            revert AssetNotSupported();
        if (userAccounts[chain][token][msg.sender].supplied < amount)
            revert InsufficientBalance();
        if (
            (getCollateralValue(msg.sender) * collateralFactor) / 100 <
            getBorrowedValue(msg.sender)
        ) {
            revert WithdrawalExceedsCollateralRatio();
        }

        assets[chain][token].totalSupply -= amount;
        userAccounts[chain][token][msg.sender].supplied -= amount;

        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }

        emit Withdrawn(chain, token, msg.sender, amount);

        bytes memory messageData = abi.encode(
            "withdraw",
            abi.encode(msg.sender, chain, token, amount)
        );
        _sendMessageToAllPeers(messageData);
    }

    function setCollateralFactor(uint256 _newFactor) external onlyOwner {
        require(
            _newFactor > 0 && _newFactor <= 100,
            "Invalid collateral factor"
        );
        collateralFactor = _newFactor;
        emit CollateralFactorUpdated(_newFactor);
    }

    function updatePriceFeed(
        address token,
        address newPriceFeedAddress
    ) external onlyOwner {
        if (assets[chain][token].token == address(0))
            revert AssetNotSupported();
        assets[chain][token].priceFeedAddress = newPriceFeedAddress;
        emit PriceFeedUpdated(chain, token, newPriceFeedAddress);

        bytes memory messageData = abi.encode(
            "updatePriceFeed",
            abi.encode(chain, token, newPriceFeedAddress)
        );
        _sendMessageToAllPeers(messageData);
    }

    function getCollateralValue(address user) public view returns (uint256) {
        uint256 totalValue = 0;

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

    function getSupportedChains() public view returns (uint256[] memory) {
        return supportedChains;
    }

    function getSupportedAssets(
        uint256 chainSelector
    ) public view returns (address[] memory) {
        return supportedAssets[chainSelector];
    }

    function _sendMessageToAllPeers(bytes memory messageData) internal {
        for (uint256 i = 0; i < supportedChains.length; i++) {
            uint256 _chainSelector = supportedChains[i];
            address peerAddress = EquitoMessageLibrary.bytes64ToAddress(
                getPeer(_chainSelector)
            );
            if ((peerAddress != address(0)) && (peerAddress != address(this))) {
                router.sendMessage(
                    EquitoMessageLibrary.addressToBytes64(peerAddress),
                    _chainSelector,
                    messageData
                );
            }
        }
    }

    function _receiveMessageFromPeer(
        EquitoMessage calldata /* message */,
        bytes calldata messageData
    ) internal override {
        (string memory functionName, bytes memory data) = abi.decode(
            messageData,
            (string, bytes)
        );

        if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("addAsset"))
        ) {
            (
                uint256 chainSelector,
                address token,
                address priceFeedAddress
            ) = abi.decode(data, (uint256, address, address));
            assets[chainSelector][token] = Asset(token, priceFeedAddress, 0, 0);
            supportedAssets[chainSelector].push(token);
        } else if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("supply"))
        ) {
            (
                address sender,
                uint256 chainSelector,
                address token,
                uint256 amount
            ) = abi.decode(data, (address, uint256, address, uint256));
            assets[chainSelector][token].totalSupply += amount;
            userAccounts[chainSelector][token][sender].supplied += amount;
        } else if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("borrow"))
        ) {
            (
                address sender,
                uint256 chainSelector,
                address token,
                uint256 amount
            ) = abi.decode(data, (address, uint256, address, uint256));
            assets[chainSelector][token].totalBorrowed += amount;
            userAccounts[chainSelector][token][sender].borrowed += amount;
        } else if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("repay"))
        ) {
            (
                address sender,
                uint256 chainSelector,
                address token,
                uint256 amount
            ) = abi.decode(data, (address, uint256, address, uint256));
            uint256 borrowed = userAccounts[chainSelector][token][sender]
                .borrowed;
            uint256 repayAmount = amount > borrowed ? borrowed : amount;

            assets[chainSelector][token].totalBorrowed -= repayAmount;
            userAccounts[chainSelector][token][sender].borrowed -= repayAmount;
        } else if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("withdraw"))
        ) {
            (
                address sender,
                uint256 chainSelector,
                address token,
                uint256 amount
            ) = abi.decode(data, (address, uint256, address, uint256));
            assets[chainSelector][token].totalSupply -= amount;
            userAccounts[chainSelector][token][sender].supplied -= amount;
        } else if (
            keccak256(abi.encodePacked(functionName)) ==
            keccak256(abi.encodePacked("updatePriceFeed"))
        ) {
            (
                uint256 chainSelector,
                address token,
                address newPriceFeedAddress
            ) = abi.decode(data, (uint256, address, address));
            assets[chainSelector][token].priceFeedAddress = newPriceFeedAddress;
        }
    }
}
