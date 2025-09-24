# Setup for zkSync Sepolia Testnet

## Step 1: Get Sepolia ETH
1. Visit [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)
2. Connect your MetaMask wallet (address: 0x693754dcD60325117C5709f077B9F7Ae828Ce5Fe)
3. Request Sepolia ETH (you'll get 0.1 ETH)

## Step 2: Bridge ETH to zkSync Sepolia
1. Go to [zkSync Era Bridge](https://bridge.zksync.io/)
2. Connect your MetaMask wallet
3. Select "Sepolia" → "zkSync Era Sepolia Testnet"
4. Bridge some ETH (0.01-0.05 ETH is enough for testing)

## Step 3: Add zkSync Sepolia to MetaMask
1. Open MetaMask
2. Click network dropdown
3. Click "Add network"
4. Enter these details:
   - **Network Name:** zkSync Era Sepolia Testnet
   - **RPC URL:** https://sepolia.era.zksync.dev
   - **Chain ID:** 300
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.explorer.zksync.io
5. Click "Save"

## Step 4: Update Environment Variables
Add these to your `.env` file:

```bash
# zkSync Sepolia configuration
RPC_URL=https://sepolia.era.zksync.dev
PRIVATE_KEY=your_private_key_here
```

## Step 5: Deploy to zkSync Sepolia
```bash
node scripts/deploy-sepolia.js
```

## Step 6: Restart Frontend
```bash
npm run dev
```

## Benefits of zkSync Sepolia:
- ✅ Layer 2 scaling (faster transactions)
- ✅ Lower gas fees
- ✅ Real testnet environment
- ✅ Compatible with Ethereum tooling
- ✅ Your existing address works
