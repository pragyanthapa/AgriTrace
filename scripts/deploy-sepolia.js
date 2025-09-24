import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function deployToSepolia() {
  // Sepolia testnet configuration
  const sepoliaRpcUrl = 'https://rpc.sepolia.org'; // Sepolia RPC
  const privateKey = process.env.PRIVATE_KEY; // You need to add this to .env
  
  if (!privateKey) {
    console.error('Please add PRIVATE_KEY to your .env file');
    console.log('Get Sepolia ETH from: https://faucets.chain.link/sepolia');
    process.exit(1);
  }

  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('Deploying to Sepolia testnet...');
  console.log('Wallet address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.error('Insufficient balance. Get Sepolia ETH from: https://faucets.chain.link/sepolia');
    process.exit(1);
  }

  // Read contract bytecode and ABI
  const bytecodePath = path.resolve(__dirname, '../artifacts/ProduceRegistry.bytecode.txt');
  const abiPath = path.resolve(__dirname, '../artifacts/ProduceRegistry.abi.json');
  
  if (!fs.existsSync(bytecodePath) || !fs.existsSync(abiPath)) {
    console.error('Contract artifacts not found. Run: node scripts/compile-solc.js');
    process.exit(1);
  }

  const bytecode = fs.readFileSync(bytecodePath, 'utf8').trim();
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  try {
    const contract = await factory.deploy();
    console.log('Deploying contract...');
    
    const receipt = await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('Deployed ProduceRegistry at:', contractAddress);
    console.log('Transaction hash:', receipt.deploymentTransaction().hash);
    
    // Update .env file
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update RPC URL
    envContent = envContent.replace(
      /^RPC_URL=.*/m,
      `RPC_URL=${sepoliaRpcUrl}`
    );
    
    // Update contract address
    envContent = envContent.replace(
      /^CONTRACT_ADDRESS=.*/m,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    
    // Update ABI
    envContent = envContent.replace(
      /^CONTRACT_ABI_JSON=.*/m,
      `CONTRACT_ABI_JSON=${JSON.stringify(abi)}`
    );
    
    // Update frontend variables
    envContent = envContent.replace(
      /^VITE_CONTRACT_ADDRESS=.*/m,
      `VITE_CONTRACT_ADDRESS=${contractAddress}`
    );
    
    envContent = envContent.replace(
      /^VITE_CONTRACT_ABI_JSON=.*/m,
      `VITE_CONTRACT_ABI_JSON=${JSON.stringify(abi)}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env with Sepolia configuration');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deployToSepolia().catch(console.error);
