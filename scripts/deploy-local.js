import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const rpc = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = await provider.getSigner();
  const abi = JSON.parse(fs.readFileSync(path.resolve('artifacts/ProduceRegistry.abi.json'), 'utf8'));
  const bytecode = '0x' + fs.readFileSync(path.resolve('artifacts/ProduceRegistry.bytecode.txt'), 'utf8');
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  const receipt = await contract.deploymentTransaction().wait();
  const address = await contract.getAddress();
  console.log('Deployed ProduceRegistry at:', address, 'in tx:', receipt.hash);

  // Update .env CONTRACT_ADDRESS and CONTRACT_ABI_JSON
  try {
    const envPath = path.resolve('.env');
    let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    envText = envText.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${address}`);
    if (!/CONTRACT_ADDRESS=/.test(envText)) envText += `\nCONTRACT_ADDRESS=${address}`;
    const abiEscaped = JSON.stringify(abi).replace(/\n/g, '');
    envText = envText.replace(/CONTRACT_ABI_JSON=.*/g, `CONTRACT_ABI_JSON=${abiEscaped}`);
    if (!/CONTRACT_ABI_JSON=/.test(envText)) envText += `\nCONTRACT_ABI_JSON=${abiEscaped}`;
    fs.writeFileSync(envPath, envText);
    console.log('Updated .env with CONTRACT_ADDRESS and CONTRACT_ABI_JSON');
  } catch (e) {
    console.warn('Failed to update .env automatically:', e.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


