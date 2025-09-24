import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  QrCode, 
  Search, 
  MapPin, 
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Package,
  Clock,
  Shield
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
import WalletConnect from './WalletConnect';
import { fetchBatch, fetchLatestBatches, fetchBatchEvents } from '../lib/api';
import { io as socketIO } from 'socket.io-client';

interface BatchDetails {
  batchId: string;
  product: string;
  farmer: string;
  location: string;
  harvestDate: string;
  quantity: number;
  price: number;
  quality: string;
  temperature: string;
  humidity: string;
  freshness: 'Safe' | 'Risk' | 'Spoiled';
  certifications: string[];
  timeline: Array<{
    event: string;
    date: string;
    location: string;
    status: 'completed' | 'current' | 'pending';
  }>;
}

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scan');
  const [searchId, setSearchId] = useState('');
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [events, setEvents] = useState<Array<{ type: string; txHash: string; timestamp: number }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [latest, setLatest] = useState<Array<{ batchId: string; product: string; farmer: string; location: string; price: number }>>([]);

  // Real-time sensor data for selected batch
  const [sensorData, setSensorData] = useState([
    { time: '00:00', temperature: 18, humidity: 65, gas: 0.2 },
    { time: '04:00', temperature: 16, humidity: 70, gas: 0.1 },
    { time: '08:00', temperature: 22, humidity: 60, gas: 0.3 },
    { time: '12:00', temperature: 28, humidity: 55, gas: 0.4 },
    { time: '16:00', temperature: 25, humidity: 58, gas: 0.2 },
    { time: '20:00', temperature: 20, humidity: 62, gas: 0.1 },
  ]);
  const API_BASE = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE || 'http://localhost:4000';
  useEffect(() => {
    const socket = socketIO(API_BASE, { transports: ['websocket'] });
    socket.on('sensor:update', (doc: { batchId: string; temperature?: number; humidity?: number; gas?: number; createdAt: string }) => {
      if (!doc || !batchDetails || doc.batchId !== batchDetails.batchId) return;
      const time = new Date(doc.createdAt).toTimeString().slice(0,5);
      setSensorData(prev => [...prev.slice(-5), { time, temperature: doc.temperature ?? 22, humidity: doc.humidity ?? 60, gas: doc.gas ?? 0.2 }]);
    });
    return () => { socket.disconnect(); };
  }, [batchDetails, API_BASE]);

  useEffect(() => {
    fetchLatestBatches().then(({ items }) => setLatest(items.map(i => ({ batchId: i.batchId, product: i.product, farmer: i.farmer, location: i.location, price: i.price }))));
    const socket = socketIO(API_BASE, { transports: ['websocket'] });
    socket.on('batch:new', (doc: { batchId: string; product: string; farmer: string; location: string; price: number }) => {
      setLatest(prev => [{ batchId: doc.batchId, product: doc.product, farmer: doc.farmer, location: doc.location, price: doc.price }, ...prev].slice(0, 20));
    });
    return () => { socket.disconnect(); };
  }, [API_BASE]);

  // Mock batch data
  const mockBatchData: BatchDetails = {
    batchId: 'TOM-2025-001',
    product: 'Organic Tomatoes',
    farmer: 'Rajesh Patel',
    location: 'Pune, Maharashtra',
    harvestDate: '2025-01-15',
    quantity: 500,
    price: 45,
    quality: 'Grade A',
    temperature: '22°C',
    humidity: '65%',
    freshness: 'Safe',
    certifications: ['Organic Certified', 'ISO 22000', 'FSSAI'],
    timeline: [
      {
        event: 'Harvest Complete',
        date: '2025-01-15 08:00',
        location: 'Organic Farm, Pune',
        status: 'completed'
      },
      {
        event: 'Quality Check Passed',
        date: '2025-01-15 10:30',
        location: 'Farm Storage, Pune',
        status: 'completed'
      },
      {
        event: 'In Transit to Distribution Center',
        date: '2025-01-16 06:00',
        location: 'Highway EN Route',
        status: 'current'
      },
      {
        event: 'Retail Store Delivery',
        date: '2025-01-16 14:00',
        location: 'Mumbai Market',
        status: 'pending'
      }
    ]
  };

  const handleSearch = async (idOverride?: string) => {
    const id = (idOverride ?? searchId).trim();
    if (!id) return;
    try {
      const data = await fetchBatch(id);
      const merged = {
        ...mockBatchData,
        batchId: data.batchId,
        product: data?.offchain?.product || mockBatchData.product,
        farmer: data?.offchain?.farmer || mockBatchData.farmer,
        location: data?.offchain?.location || mockBatchData.location,
        harvestDate: data?.offchain?.harvestDate || mockBatchData.harvestDate,
        price: data?.onchain?.pricePerKg ?? mockBatchData.price,
        timeline: mockBatchData.timeline,
      } as BatchDetails;
      setBatchDetails(merged);
      const ev = await fetchBatchEvents(merged.batchId);
      setEvents(ev.events.map(e => ({ type: e.type, txHash: e.txHash, timestamp: e.timestamp })));
    } catch (e) {
      // fall back to showing minimal info with the ID
      setBatchDetails({ ...mockBatchData, batchId: id });
    } finally {
      setActiveTab('details');
    }
  };

  const startQRScanner = () => {
    setIsScanning(true);
    
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          let id = decodedText;
          try {
            const parsed = JSON.parse(decodedText);
            id = parsed.batchId || decodedText;
      } catch {/* ignore JSON parse errors */}
          const data = await fetchBatch(id);
          const merged = {
            ...mockBatchData,
            batchId: data.batchId,
            product: data?.offchain?.product || mockBatchData.product,
            farmer: data?.offchain?.farmer || mockBatchData.farmer,
          } as BatchDetails;
          setBatchDetails(merged);
          const ev = await fetchBatchEvents(merged.batchId);
          setEvents(ev.events.map(e => ({ type: e.type, txHash: e.txHash, timestamp: e.timestamp })));
          setActiveTab('details');
        } finally {
          scanner.clear();
          setIsScanning(false);
        }
      },
      (errorMessage) => {
        console.log('QR Code scan error:', errorMessage);
      }
    );

    scannerRef.current = scanner;
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'Safe': return 'text-green-600 bg-green-100';
      case 'Risk': return 'text-yellow-600 bg-yellow-100';
      case 'Spoiled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFreshnessIcon = (freshness: string) => {
    switch (freshness) {
      case 'Safe': return <CheckCircle className="h-5 w-5" />;
      case 'Risk': return <AlertTriangle className="h-5 w-5" />;
      case 'Spoiled': return <XCircle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">AgriTrace Buyer</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'scan', label: 'Scan QR / Search', icon: <QrCode className="h-5 w-5" /> },
                { id: 'details', label: 'Product Details', icon: <Package className="h-5 w-5" /> },
                { id: 'timeline', label: 'Provenance Timeline', icon: <Clock className="h-5 w-5" /> },
                { id: 'monitoring', label: 'Condition Monitoring', icon: <Thermometer className="h-5 w-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Scan/Search Tab */}
        {activeTab === 'scan' && (
          <div className="max-w-4xl mx-auto">
            {latest.length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Batches</h3>
                <div className="space-y-2">
                  {latest.map(item => (
                    <div key={item.batchId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{item.product}</div>
                        <div className="text-sm text-gray-600">{item.batchId} • {item.farmer} • {item.location}</div>
                      </div>
                      <button
                        onClick={() => {
                          // show immediate details using list data, then hydrate
                          setBatchDetails({
                            ...mockBatchData,
                            batchId: item.batchId,
                            product: item.product,
                            farmer: item.farmer,
                            location: item.location,
                            price: item.price,
                          } as BatchDetails);
                          setActiveTab('details');
                          setSearchId(item.batchId);
                          handleSearch(item.batchId);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Scanner */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Scan QR Code</h2>
                {!isScanning ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <QrCode className="h-16 w-16 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-6">
                      Point your camera at a QR code on the product to instantly verify its authenticity and track its journey.
                    </p>
                    <button 
                      onClick={startQRScanner}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Camera
                    </button>
                  </div>
                ) : (
                  <div>
                    <div id="qr-reader" className="mb-4"></div>
                    <button 
                      onClick={stopQRScanner}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Stop Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* Search by ID */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search by Batch ID</h2>
                <div className="text-center">
                  <div className="w-32 h-32 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Search className="h-16 w-16 text-green-600" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Enter the batch ID found on the product label to access detailed information.
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter Batch ID (e.g., TOM-2025-001)"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button 
                      onClick={handleSearch}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Batch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Batch */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Demo Batch</h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Sample Organic Tomatoes - TOM-2025-001</div>
                  <div className="text-sm text-gray-600">Click to view this sample batch for testing</div>
                </div>
                <button 
                  onClick={() => {
                    setBatchDetails(mockBatchData);
                    setActiveTab('details');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Tab */}
        {activeTab === 'details' && batchDetails && (
          <div className="space-y-8">
            {/* Batch Overview */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{batchDetails.product}</h2>
                  <p className="text-lg text-gray-600">Batch ID: {batchDetails.batchId}</p>
                </div>
                <div className={`flex items-center px-4 py-2 rounded-full ${getFreshnessColor(batchDetails.freshness)}`}>
                  {getFreshnessIcon(batchDetails.freshness)}
                  <span className="ml-2 font-semibold">{batchDetails.freshness}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <User className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{batchDetails.farmer}</div>
                    <div className="text-sm text-gray-600">Farmer</div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{batchDetails.location}</div>
                    <div className="text-sm text-gray-600">Origin</div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{batchDetails.harvestDate}</div>
                    <div className="text-sm text-gray-600">Harvest Date</div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <Package className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">₹{batchDetails.price}/kg</div>
                    <div className="text-sm text-gray-600">Price</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Current Conditions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Conditions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center p-4 bg-red-50 rounded-lg">
                      <Thermometer className="h-8 w-8 text-red-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{batchDetails.temperature}</div>
                        <div className="text-sm text-gray-600">Temperature</div>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <Droplets className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{batchDetails.humidity}</div>
                        <div className="text-sm text-gray-600">Humidity</div>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <Wind className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">0.2 ppm</div>
                        <div className="text-sm text-gray-600">Gas Level</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Grade:</span>
                      <span className="font-semibold">{batchDetails.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{batchDetails.quantity} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harvest Date:</span>
                      <span className="font-semibold">{batchDetails.harvestDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Conditions:</span>
                      <span className="font-semibold">Climate Controlled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications and Quality */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h3>
                  <div className="space-y-3">
                    {batchDetails.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="ml-3 text-sm font-medium text-gray-900">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Score</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">94/100</div>
                    <div className="text-sm text-gray-600 mb-4">Excellent Quality</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Verification</h3>
                  <div className="text-center">
                    <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <div className="text-green-600 font-semibold mb-2">Verified Authentic</div>
                    <div className="text-sm text-gray-600">
                      This product's journey is fully recorded on the blockchain and cannot be tampered with.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && batchDetails && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Provenance Timeline</h2>
              <div className="space-y-6">
                {events.map((e, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full mt-1 bg-green-500"></div>
                    <div className="ml-6">
                      <div className="font-semibold text-gray-900">{e.type}</div>
                      <div className="text-sm text-gray-600 mt-1">{new Date(e.timestamp).toLocaleString()}</div>
                      <div className="text-xs text-gray-500 break-all">Tx: {e.txHash}</div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-gray-500 text-sm">No on-chain events found for this batch yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && batchDetails && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Thermometer className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">22°C</div>
                    <div className="text-gray-600">Current Temperature</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">65%</div>
                    <div className="text-gray-600">Current Humidity</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Wind className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">0.2 ppm</div>
                    <div className="text-gray-600">Current Gas Level</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">24-Hour Monitoring Data</h3>
              
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-700 mb-4">Temperature (°C)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-700 mb-4">Humidity (%)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-4">Gas Level (ppm)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="gas" stroke="#EF4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* No batch selected message */}
        {(activeTab === 'details' || activeTab === 'timeline' || activeTab === 'monitoring') && !batchDetails && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Batch Selected</h3>
            <p className="text-gray-600 mb-6">Please scan a QR code or search for a batch ID to view details.</p>
            <button 
              onClick={() => setActiveTab('scan')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;