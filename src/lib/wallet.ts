import { ethers } from 'ethers';

export async function connectWallet() {
  if (!(window as any).ethereum) throw new Error('No wallet found');
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = accounts?.[0] || (await signer.getAddress());
  const network = await provider.getNetwork();
  return { provider, signer, address, network };
}


