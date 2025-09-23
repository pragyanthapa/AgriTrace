import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Shield, 
  MapPin, 
  Users, 
  ChevronRight,
  Package,
  TrendingUp,
  CheckCircle,
  QrCode,
  Thermometer,
  Eye,
  Star
} from 'lucide-react';
import QRCodeDemo from './QRCodeDemo';
import WalletConnect from './WalletConnect';
import { SignupForm, LoginForm } from './AuthForms';
import { useAuth } from '../context/AuthContext';
import LiveMap from './LiveMap';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState<{ role: 'farmer' | 'buyer'; mode: 'login' | 'signup' } | null>(null);

  const handleEnter = (role: 'farmer' | 'buyer') => {
    if (user && user.role === role) {
      navigate(role === 'farmer' ? '/farmer' : '/buyer');
    } else {
      setShowAuth({ role, mode: 'login' });
    }
  };
  const [counters, setCounters] = useState({ farmers: 0, batches: 0, buyers: 0 });

  useEffect(() => {
    const animateCounters = () => {
      const targets = { farmers: 50, batches: 120, buyers: 200 };
      const duration = 2000;
      const steps = 60;
      const increment = {
        farmers: targets.farmers / steps,
        batches: targets.batches / steps,
        buyers: targets.buyers / steps
      };

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setCounters({
          farmers: Math.min(Math.floor(increment.farmers * currentStep), targets.farmers),
          batches: Math.min(Math.floor(increment.batches * currentStep), targets.batches),
          buyers: Math.min(Math.floor(increment.buyers * currentStep), targets.buyers)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    const target = document.getElementById('impact-section');
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">AgriTrace</span>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="hidden md:block"><WalletConnect /></div>
              <button 
                onClick={() => handleEnter('farmer')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Farmer Portal
              </button>
              <button 
                onClick={() => handleEnter('buyer')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Buyer Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 fade-in">
              Blockchain-Powered 
              <span className="text-green-600"> Transparency</span>
              <br />for Agriculture
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto fade-in">
              From seed to table, track every step with IoT + Blockchain for fair pricing, quality, and trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <button 
                onClick={() => handleEnter('farmer')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors hover-lift flex items-center justify-center"
              >
                <Users className="mr-2 h-5 w-5" />
                Enter as Farmer
              </button>
              <button 
                onClick={() => handleEnter('buyer')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors hover-lift flex items-center justify-center"
              >
                <Package className="mr-2 h-5 w-5" />
                Enter as Buyer
              </button>
            </div>
          </div>
        </div>
      </section>

      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {showAuth.role === 'farmer' ? 'Farmer' : 'Buyer'} {showAuth.mode === 'login' ? 'Login' : 'Signup'}
              </h3>
              <button onClick={() => setShowAuth(null)} className="text-gray-500">✕</button>
            </div>
            <div className="flex space-x-3 mb-4">
              <button onClick={() => setShowAuth({ ...showAuth, mode: 'login' })} className={`px-3 py-1 rounded ${showAuth.mode==='login'?'bg-gray-900 text-white':'bg-gray-100'}`}>Login</button>
              <button onClick={() => setShowAuth({ ...showAuth, mode: 'signup' })} className={`px-3 py-1 rounded ${showAuth.mode==='signup'?'bg-gray-900 text-white':'bg-gray-100'}`}>Signup</button>
            </div>
            {showAuth.mode === 'login' ? (
              <LoginForm onSuccess={() => { setShowAuth(null); navigate(showAuth.role==='farmer'?'/farmer':'/buyer'); }} />
            ) : (
              <SignupForm role={showAuth.role} onSuccess={() => { setShowAuth(null); navigate(showAuth.role==='farmer'?'/farmer':'/buyer'); }} />
            )}
          </div>
        </div>
      )}

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why AgriTrace?</h2>
            <p className="text-xl text-gray-600">Solving critical challenges in agriculture supply chain</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <TrendingUp className="h-12 w-12 text-red-500" />,
                title: "Farmer Exploitation",
                description: "Middlemen taking unfair profits, leaving farmers with minimal income"
              },
              {
                icon: <Eye className="h-12 w-12 text-orange-500" />,
                title: "Price Opacity",
                description: "Lack of transparency in pricing throughout the supply chain"
              },
              {
                icon: <Thermometer className="h-12 w-12 text-blue-500" />,
                title: "Food Spoilage",
                description: "Poor monitoring leads to quality degradation and waste"
              },
              {
                icon: <Shield className="h-12 w-12 text-purple-500" />,
                title: "Trust Deficit",
                description: "Consumers can't verify the origin and quality of their food"
              }
            ].map((problem, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover-lift">
                <div className="flex justify-center mb-4">{problem.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-2xl font-semibold text-green-600">
              AgriTrace solves these with blockchain and IoT technology
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Technology-driven solutions for modern agriculture</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-16 w-16 text-green-600" />,
                title: "Blockchain Traceability",
                description: "Immutable supply chain records ensuring complete transparency from farm to fork"
              },
              {
                icon: <MapPin className="h-16 w-16 text-blue-600" />,
                title: "Real-time Tracking",
                description: "GPS and IoT sensor monitoring for live location and condition updates"
              },
              {
                icon: <CheckCircle className="h-16 w-16 text-yellow-600" />,
                title: "Quality Assurance",
                description: "Continuous freshness and safety monitoring with automated alerts"
              },
              {
                icon: <Users className="h-16 w-16 text-purple-600" />,
                title: "Market Access",
                description: "Direct farmer-to-buyer connections eliminating middleman exploitation"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover-lift text-center">
                <div className="flex justify-center mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to transparent agriculture</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Leaf className="h-12 w-12 text-green-600" />,
                title: "Farmer Registration",
                description: "Farmers add produce details and create blockchain entries"
              },
              {
                step: "2",
                icon: <Thermometer className="h-12 w-12 text-blue-600" />,
                title: "IoT Monitoring",
                description: "Sensors track GPS location, temperature, humidity, and gas levels"
              },
              {
                step: "3",
                icon: <Package className="h-12 w-12 text-yellow-600" />,
                title: "Quality Verification",
                description: "Retailers and distributors verify product quality and authenticity"
              },
              {
                step: "4",
                icon: <QrCode className="h-12 w-12 text-purple-600" />,
                title: "Consumer Scanning",
                description: "Buyers scan QR codes to view complete product journey and quality"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-16 -right-4 h-8 w-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Demo</h2>
            <p className="text-xl text-gray-600">Experience AgriTrace in action</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Interactive QR Demo</h3>
              <p className="text-gray-600 mb-6">
                Scan this QR code to view a sample tomato batch's complete journey from farm to market, 
                including real-time sensor data and blockchain verification.
              </p>
              <QRCodeDemo />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Live Route Tracking</h3>
              <p className="text-gray-600 mb-6">
                Watch how our system tracks produce in real-time from Pune farms to Mumbai markets 
                with GPS precision and condition monitoring.
              </p>
              <LiveMap />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Growing the transparent agriculture ecosystem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-green-50 rounded-xl">
              <div className="text-5xl font-bold text-green-600 counter-animation mb-2">
                {counters.farmers}+
              </div>
              <div className="text-xl text-gray-600 mb-2">Farmers Onboarded</div>
              <Leaf className="h-8 w-8 text-green-600 mx-auto" />
            </div>
            <div className="text-center p-8 bg-blue-50 rounded-xl">
              <div className="text-5xl font-bold text-blue-600 counter-animation mb-2">
                {counters.batches}+
              </div>
              <div className="text-xl text-gray-600 mb-2">Produce Batches Tracked</div>
              <Package className="h-8 w-8 text-blue-600 mx-auto" />
            </div>
            <div className="text-center p-8 bg-yellow-50 rounded-xl">
              <div className="text-5xl font-bold text-yellow-600 counter-animation mb-2">
                {counters.buyers}+
              </div>
              <div className="text-xl text-gray-600 mb-2">Buyers Connected</div>
              <Users className="h-8 w-8 text-yellow-600 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from farmers and buyers</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-lg mb-6">
                "AgriTrace helped me get fair prices for my produce. Now I can directly connect 
                with buyers and they trust my organic tomatoes because of the blockchain verification."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Rajesh Patel</div>
                  <div className="text-gray-600">Organic Farmer, Maharashtra</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-lg mb-6">
                "Now I can trust where my food comes from. The QR code shows me everything - 
                from which farm it came, how fresh it is, and even the transport conditions."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-gray-600">Retail Buyer, Delhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join the Future of Transparent Agriculture
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Whether you're a farmer looking for fair prices or a buyer seeking quality assurance, 
            AgriTrace connects you to a transparent, efficient food system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleEnter('farmer')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors hover-lift"
            >
              Start as Farmer
            </button>
            <button 
              onClick={() => handleEnter('buyer')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors hover-lift"
            >
              Start as Buyer
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-white">AgriTrace</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing agriculture with blockchain transparency and IoT monitoring.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Portals</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => handleEnter('farmer')}
                    className="hover:text-white transition-colors"
                  >
                    Farmer Portal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleEnter('buyer')}
                    className="hover:text-white transition-colors"
                  >
                    Buyer Portal
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">support@agritrace.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Built for Smart India Hackathon 2025 • © 2025 AgriTrace</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;