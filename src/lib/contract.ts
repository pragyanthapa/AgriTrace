import { ethers } from 'ethers';

function getEnv() {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {} as any;
  const address = env.VITE_CONTRACT_ADDRESS as string | undefined;
  const abiJson = env.VITE_CONTRACT_ABI_JSON as string | undefined;
  return { address: address || '', abiJson: abiJson || '' };
}

export async function getContractWithSigner() {
  if (!(window as any).ethereum) throw new Error('No wallet found');
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const { address, abiJson } = getEnv();
  if (!address) throw new Error('Missing VITE_CONTRACT_ADDRESS');
  if (!ethers.isAddress(address)) throw new Error(`Invalid contract address: ${address}`);
  const signerAddr = await signer.getAddress();
  if (address.toLowerCase() === signerAddr.toLowerCase()) {
    throw new Error('Misconfiguration: contract address equals your wallet address. Set VITE_CONTRACT_ADDRESS to the deployed ProduceRegistry contract.');
  }
  const abi = abiJson ? JSON.parse(abiJson) : [];
  return new ethers.Contract(address, abi, signer);
}

export async function createBatchOnChain(params: {
  batchId: string; product: string; location: string; harvestDate: string; quantity: number; pricePerKg: number;
}) {
  const contract = await getContractWithSigner();
  const tx = await contract.createBatch(
    params.batchId,
    params.product,
    params.location,
    params.harvestDate,
    params.quantity,
    params.pricePerKg,
    { gasLimit: 400000n }
  );
  const receipt = await tx.wait();
  return receipt?.hash as string;
}

export async function transferOwnershipOnChain(batchId: string, toAddress: string) {
  const contract = await getContractWithSigner();
  if (!ethers.isAddress(toAddress)) throw new Error('Invalid destination address');
  const tx = await contract.transferOwnership(batchId, toAddress, { gasLimit: 300000n });
  const receipt = await tx.wait();
  return receipt?.hash as string;
}

export async function setStatusOnChain(batchId: string, status: string) {
  const contract = await getContractWithSigner();
  const tx = await contract.setStatus(batchId, status);
  const receipt = await tx.wait();
  return receipt?.hash as string;
}

export async function setPriceOnChain(batchId: string, pricePerKg: number) {
  const contract = await getContractWithSigner();
  const tx = await contract.setPrice(batchId, pricePerKg, { gasLimit: 200000n });
  const receipt = await tx.wait();
  return receipt?.hash as string;
}


