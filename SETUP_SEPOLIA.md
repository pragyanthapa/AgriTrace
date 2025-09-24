# Setup for Sepolia Testnet

## Step 1: Get Sepolia ETH
1. Visit [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)
2. Connect your MetaMask wallet
3. Request Sepolia ETH (you'll get 0.1 ETH)

## Step 2: Get Infura API Key (Optional)
1. Go to [Infura.io](https://infura.io)
2. Create a free account
3. Create a new project
4. Copy your API key

## Step 3: Update Environment Variables
Add these to your `.env` file:

```bash
# Replace with your Infura key or use public RPC
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# OR use public RPC (slower but free):
# RPC_URL=https://rpc.sepolia.org

# Add your wallet private key (the one with Sepolia ETH)
PRIVATE_KEY=your_private_key_here
```

## Step 4: Deploy to Sepolia
```bash
node scripts/deploy-sepolia.js
```

## Step 5: Connect MetaMask to Sepolia
1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia test network"
4. Make sure you have Sepolia ETH in your account

## Step 6: Restart Frontend
```bash
npm run dev
```

## Alternative: Use Public Sepolia RPC
If you don't want to use Infura, you can use the public RPC:
- RPC URL: `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Currency: `ETH`
