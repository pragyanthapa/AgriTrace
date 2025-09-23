import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current).setView([18.9588, 73.8151], 8);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define route coordinates (Pune to Mumbai)
    const routeCoords: [number, number][] = [
      [18.9588, 73.8151], // Pune (Farm)
      [19.0330, 73.0297], // Lonavala
      [19.0760, 72.8777], // Mumbai (Market)
    ];

    // Add route polyline
    const routeLine = L.polyline(routeCoords, {
      color: '#2E7D32',
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    // Add markers
    const farmIcon = L.divIcon({
      html: '<div style="background: #2E7D32; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marketIcon = L.divIcon({
      html: '<div style="background: #1565C0; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const currentIcon = L.divIcon({
      html: '<div style="background: #FBC02D; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite;"></div>',
      className: 'custom-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([18.9588, 73.8151], { icon: farmIcon })
      .addTo(map)
      .bindPopup('<b>Organic Farm</b><br>Rajesh Patel<br>Tomato Batch TOM-2025-001');

    L.marker([19.0760, 72.8777], { icon: marketIcon })
      .addTo(map)
      .bindPopup('<b>Mumbai Market</b><br>Destination<br>Expected: 2 hours');

    // Animate current position
    let currentIndex = 0;
    let currentMarker = L.marker(routeCoords[0], { icon: currentIcon }).addTo(map);
    
    const animateRoute = () => {
      if (currentIndex < routeCoords.length - 1) {
        currentIndex++;
        currentMarker.setLatLng(routeCoords[currentIndex]);
        
        if (currentIndex < routeCoords.length - 1) {
          setTimeout(animateRoute, 3000);
        }
      } else {
        // Reset animation
        setTimeout(() => {
          currentIndex = 0;
          currentMarker.setLatLng(routeCoords[0]);
          setTimeout(animateRoute, 1000);
        }, 2000);
      }
    };

    // Start animation
    setTimeout(animateRoute, 2000);

    // Fit map to show the entire route
    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div ref={mapRef} className="h-80 rounded-lg"></div>
      <div className="mt-4 flex justify-between text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
          <span>Farm Origin</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
          <span>Current Location</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
          <span>Market Destination</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;