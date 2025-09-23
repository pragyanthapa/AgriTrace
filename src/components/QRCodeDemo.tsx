import React from 'react';
import QRCode from 'qrcode';

const QRCodeDemo: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');

  React.useEffect(() => {
    const demoData = {
      batchId: 'TOM-2025-001',
      product: 'Organic Tomatoes',
      farmer: 'Rajesh Patel',
      location: 'Pune, Maharashtra',
      harvestDate: '2025-01-15',
      quality: 'Grade A',
      temperature: '18°C',
      humidity: '65%',
      freshness: 'Excellent'
    };

    QRCode.toDataURL(JSON.stringify(demoData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#2E7D32',
        light: '#FFFFFF'
      }
    }).then(url => {
      setQrCodeUrl(url);
    });
  }, []);

  const handleQRClick = () => {
    const demoData = {
      batchId: 'TOM-2025-001',
      product: 'Organic Tomatoes',
      farmer: 'Rajesh Patel',
      location: 'Pune, Maharashtra',
      harvestDate: '2025-01-15',
      quality: 'Grade A',
      temperature: '18°C',
      humidity: '65%',
      freshness: 'Excellent'
    };

    alert(`Demo Batch Data:\n\n${Object.entries(demoData).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
      {qrCodeUrl && (
        <div className="cursor-pointer" onClick={handleQRClick}>
          <img 
            src={qrCodeUrl} 
            alt="Demo QR Code" 
            className="mx-auto mb-4 rounded-lg hover:shadow-md transition-shadow"
          />
          <p className="text-sm text-gray-600">
            Click to view sample batch data
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodeDemo;