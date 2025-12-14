import React, { useEffect, useRef } from 'react';
import { NearbyAlert, EmergencyType } from '../types';

interface LiveMapProps {
  userLocation: { lat: number; long: number } | null;
  alerts: NearbyAlert[];
}

const LiveMap: React.FC<LiveMapProps> = ({ userLocation, alerts }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current && typeof window !== 'undefined' && (window as any).L) {
      const L = (window as any).L;
      
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([0, 0], 2);

      // Dark Matter Tiles (CartoDB)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update User Location & Markers
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletMap.current || !L) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // User Marker
    if (userLocation) {
      leafletMap.current.setView([userLocation.lat, userLocation.long], 15);
      
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px #3b82f6;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.long], { icon: userIcon })
        .addTo(leafletMap.current)
        .bindPopup("You are here");
      
      markersRef.current.push(userMarker);
    }

    // Add Alert Markers using exact coordinates
    alerts.forEach(alert => {
      if (!alert.location) return;

      const lat = alert.location.latitude;
      const lng = alert.location.longitude;

      let color = '#ef4444'; // Red (Violence/General)
      if (alert.type === EmergencyType.ACCIDENT) color = '#eab308'; // Yellow
      if (alert.type === EmergencyType.MEDICAL) color = '#f97316'; // Orange

      const alertIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; animation: pulse 2s infinite;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([lat, lng], { icon: alertIcon })
        .addTo(leafletMap.current)
        .bindPopup(`<b>${alert.type}</b><br>${alert.distance}m away`);
      
      markersRef.current.push(marker);
    });
  }, [userLocation, alerts]);

  return <div ref={mapRef} className="w-full h-full min-h-[250px] bg-slate-900 z-0" />;
};

export default LiveMap;