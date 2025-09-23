import React from 'react';
import { connectWallet } from '../lib/wallet';

const WalletConnect: React.FC = () => {
  const [address, setAddress] = React.useState<string | null>(null);
  const [networkName, setNetworkName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onConnect = async () => {
    try {
      setError(null);
      const { address, network } = await connectWallet();
      setAddress(address);
      setNetworkName(network?.name || String(network?.chainId));
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet');
    }
  };

  const onDisconnect = async () => {
    try {
      setAddress(null); setNetworkName(null);
    } catch {}
  };

  return (
    <div className="flex items-center space-x-3">
      {address ? (
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {networkName ? `${networkName} • ` : ''}{address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button onClick={onDisconnect} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 text-sm">Disconnect</button>
        </div>
      ) : (
        <button onClick={onConnect} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          Connect Wallet
        </button>
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default WalletConnect;


