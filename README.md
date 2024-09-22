# xLend

**xLend** is a decentralized lending and borrowing protocol utilizing Equitos' Cross-Chain capabilities. This project was built as part of the **Equito Builder Program - Interoperability Summer Hackathon** hosted on DoraHacks. xLend simplifies the management of assets across multiple blockchains, ensuring security, efficiency, and real-time transactions.

## Key Features

- **Seamless Cross-Chain Lending & Borrowing**: Effortless transactions across multiple blockchains.
- **Enhanced Transaction Speed**: Near-instant cross-chain transfers.
- **Robust Security**: Secure smart contracts using Foundry.
- **User-Friendly Interface**: Frontend built with Next.js.

## Problem Solved

Traditional cross-chain protocols suffer from complexity, delays, and security risks. xLend addresses these issues by providing:

- A streamlined interface for cross-chain asset management.
- Real-time transactions powered by Equitas.
- Robust security via Foundry-deployed smart contracts.

## Installation

### Frontend (Next.js)

1. Clone the repository:
   ```bash
   git clone https://github.com/blockdudes/xlend.git
   ```
2. Navigate to the frontend directory:
   ```bash
   cd xlend/equito.frontend
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```

### Contract (Foundry)

1. Navigate to the backend directory:
   ```bash
   cd xlend/equito.backend
   ```
2. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```
3. Compile the smart contracts:
   ```bash
   forge build
   ```

## Usage

1. Access the platform at [xlend.dev.blockdudes.com](https://xlend.dev.blockdudes.com) to start lending or borrowing assets.
2. Contract operations are powered by Foundry for secure and fast contract interactions, testing and deployments.
