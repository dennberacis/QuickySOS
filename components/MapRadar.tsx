import React, { useEffect, useState } from 'react';
import { NearbyAlert, EmergencyType } from '../types';

interface MapRadarProps {
  alerts: NearbyAlert[];
  isScanning: boolean;
}

const MapRadar: React.FC<MapRadarProps> = ({ alerts, isScanning }) => {
  // We simulate a radar view since we don't have a real map tile provider set up for this demo.
  // This visualizes "You" in the center and alerts relative to you.
  
  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto bg-navy-900 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl shadow-blue-900/20">
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-400"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-blue-400"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border border-blue-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border border-blue-400 rounded-full"></div>
      </div>

      {/* Scanning Effect */}
      {isScanning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-radar-spin origin-center" 
             style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}>
        </div>
      )}

      {/* User Dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"></div>
      </div>

      {/* Nearby Alerts Dots */}
      {alerts.map((alert) => {
        // Random placement for demo purposes based on distance
        // In a real app, we'd project lat/long to x/y
        const angle = parseInt(alert.id, 16) % 360;
        const radius = Math.min((alert.distance / 1000) * 45, 45); // Scale 1km to 45% of container
        const x = 50 + radius * Math.cos(angle * Math.PI / 180);
        const y = 50 + radius * Math.sin(angle * Math.PI / 180);
        
        let color = 'bg-yellow-500';
        if (alert.type === EmergencyType.VIOLENCE) color = 'bg-red-600';
        if (alert.type === EmergencyType.MEDICAL) color = 'bg-red-400';

        return (
          <div 
            key={alert.id}
            className={`absolute w-3 h-3 ${color} rounded-full border border-white/50 shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-ping-slow`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
             <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black/70 px-1 rounded text-white whitespace-nowrap">
               {alert.distance}m
             </span>
          </div>
        );
      })}
    </div>
  );
};

export default MapRadar;