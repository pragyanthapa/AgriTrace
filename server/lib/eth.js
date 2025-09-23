import { ethers } from 'ethers';

let cached = null;

export async function getEthersContext() {
  if (cached) return cached;
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  const contractAbiJson = process.env.CONTRACT_ABI_JSON || '[]';

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  let abi;
  try {
    abi = JSON.parse(contractAbiJson);
  } catch {
    abi = [];
  }
  const contract = new ethers.Contract(contractAddress, abi, provider);

  cached = { provider, contract, contractAddress };
  return cached;
}


