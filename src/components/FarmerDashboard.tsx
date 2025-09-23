import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Plus, 
  Package, 
  QrCode, 
  MapPin, 
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  ArrowLeft,
  Upload,
  Save,
  Send
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io as socketIO } from 'socket.io-client';

interface ProduceBatch {
  id: string;
  cropType: string;
  harvestDate: string;
  quantity: number;
  price: number;
  location: string;
  status: 'Created' | 'In Transit' | 'Sold';
  qrCode?: string;
}

const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [batches, setBatches] = useState<ProduceBatch[]>([]);

  const [formData, setFormData] = useState({
    cropType: '',
    harvestDate: '',
    quantity: '',
    price: '',
    location: 'Pune, Maharashtra'
  });

  // Real-time sensor data (updated via sockets)
  const [sensorData, setSensorData] = useState([
    { time: '00:00', temperature: 18, humidity: 65, gas: 0.2 },
    { time: '04:00', temperature: 16, humidity: 70, gas: 0.1 },
    { time: '08:00', temperature: 22, humidity: 60, gas: 0.3 },
    { time: '12:00', temperature: 28, humidity: 55, gas: 0.4 },
    { time: '16:00', temperature: 25, humidity: 58, gas: 0.2 },
    { time: '20:00', temperature: 20, humidity: 62, gas: 0.1 },
  ]);

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

  useEffect(() => {
    if (!token) return;
    const client = axios.create({ baseURL: `${API_BASE}/api`, headers: { Authorization: `Bearer ${token}` } });
    client.get('/batches').then(({ data }) => {
      const items = (data.items || []).map((d: any) => ({
        id: d.batchId,
        cropType: d.product,
        harvestDate: d.harvestDate,
        quantity: d.quantity,
        price: d.price,
        location: d.location,
        status: d.status,
      }));
      setBatches(items);
    });

    const socket = socketIO(API_BASE, { transports: ['websocket'] });
    socket.on('sensor:update', (doc: any) => {
      if (!doc) return;
      const time = new Date(doc.createdAt).toTimeString().slice(0,5);
      setSensorData(prev => [...prev.slice(-5), { time, temperature: doc.temperature ?? 22, humidity: doc.humidity ?? 60, gas: doc.gas ?? 0.2 }]);
    });
    return () => { socket.disconnect(); };
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = axios.create({ baseURL: `${API_BASE}/api`, headers: { Authorization: `Bearer ${token}` } });
    const { data } = await client.post('/batches', {
      cropType: formData.cropType,
      harvestDate: formData.harvestDate,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      location: formData.location,
    });
    const d = data.item;
    const newBatch: ProduceBatch = {
      id: d.batchId,
      cropType: d.product,
      harvestDate: d.harvestDate,
      quantity: d.quantity,
      price: d.price,
      location: d.location,
      status: d.status,
    };
    setBatches([...batches, newBatch]);
    setFormData({ cropType: '', harvestDate: '', quantity: '', price: '', location: 'Pune, Maharashtra' });
    setActiveTab('produce');
  };

  const generateQRCode = async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const qrData = {
      batchId: batch.id,
      product: batch.cropType,
      farmer: 'Rajesh Patel',
      location: batch.location,
      harvestDate: batch.harvestDate,
      quantity: batch.quantity,
      price: batch.price
    };

    try {
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#2E7D32',
          light: '#FFFFFF'
        }
      });

      setBatches(batches.map(b => 
        b.id === batchId ? { ...b, qrCode: qrCodeUrl } : b
      ));
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const transferOwnership = async (batchId: string) => {
    const client = axios.create({ baseURL: `${API_BASE}/api`, headers: { Authorization: `Bearer ${token}` } });
    const { data } = await client.post(`/batches/${encodeURIComponent(batchId)}/status`, { status: 'In Transit' });
    const d = data.item;
    if (d) setBatches(batches.map(b => b.id === batchId ? { ...b, status: 'In Transit' } : b));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">AgriTrace Farmer</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">{user?.name || 'Farmer'}</span>
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
                { id: 'dashboard', label: 'Dashboard', icon: <Leaf className="h-5 w-5" /> },
                { id: 'add', label: 'Add Produce', icon: <Plus className="h-5 w-5" /> },
                { id: 'produce', label: 'My Produce', icon: <Package className="h-5 w-5" /> },
                { id: 'sensors', label: 'Sensor Data', icon: <Thermometer className="h-5 w-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name || 'Farmer'}!</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-green-600">{batches.length}</div>
                        <div className="text-gray-600">Total Batches</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Send className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {batches.filter(b => b.status === 'In Transit').length}
                        </div>
                        <div className="text-gray-600">In Transit</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-yellow-600">₹45</div>
                        <div className="text-gray-600">Avg Price/kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Package className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">Tomato batch TOM-2025-001 transferred</div>
                      <div className="text-sm text-gray-600">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <QrCode className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">QR code generated for POT-2025-002</div>
                      <div className="text-sm text-gray-600">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Produce
                  </button>
                  <button 
                    onClick={() => setActiveTab('sensors')}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Thermometer className="h-5 w-5 mr-2" />
                    View Sensors
                  </button>
                  <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">28°C</div>
                  <div className="text-gray-600">Partly Cloudy</div>
                  <div className="flex justify-between mt-4 text-sm">
                    <span>Humidity: 65%</span>
                    <span>Wind: 12 km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Produce Tab */}
        {activeTab === 'add' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Produce Batch</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select crop type</option>
                    <option value="Organic Tomatoes">Organic Tomatoes</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Onions">Onions</option>
                    <option value="Carrots">Carrots</option>
                    <option value="Cabbage">Cabbage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Drag and drop an image, or click to browse</p>
                    <input type="file" accept="image/*" className="hidden" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Create Batch
                </button>
              </form>
            </div>
          </div>
        )}

        {/* My Produce Tab */}
        {activeTab === 'produce' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">My Produce Batches</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batch.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {batch.cropType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {batch.quantity} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{batch.price}/kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => generateQRCode(batch.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          {batch.status === 'Created' && (
                            <button
                              onClick={() => transferOwnership(batch.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QR Code Modals */}
            {batches.filter(b => b.qrCode).map(batch => (
              <div key={`qr-${batch.id}`} className="mt-8 p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">QR Code for {batch.id}</h3>
                <div className="flex items-center space-x-6">
                  <img src={batch.qrCode} alt={`QR Code for ${batch.id}`} className="w-32 h-32" />
                  <div>
                    <p className="text-gray-600 mb-2">
                      This QR code contains all the details about your {batch.cropType} batch.
                    </p>
                    <p className="text-sm text-gray-500">
                      Buyers can scan this code to verify authenticity and track the product journey.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sensor Data Tab */}
        {activeTab === 'sensors' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Thermometer className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">22°C</div>
                    <div className="text-gray-600">Temperature</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">65%</div>
                    <div className="text-gray-600">Humidity</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Wind className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">0.2 ppm</div>
                    <div className="text-gray-600">Gas Level</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">24-Hour Sensor Readings</h3>
              
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-700 mb-4">Temperature (°C)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} />
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
                    <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} />
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
                    <Line type="monotone" dataKey="gas" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;