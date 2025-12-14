import React from 'react';
import { UserSettings, GestureShape, SOSLogEntry, EmergencyType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (newSettings: UserSettings) => void;
  sosHistory: SOSLogEntry[];
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings, onSettingsChange, sosHistory, onClearHistory 
}) => {
  if (!isOpen) return null;

  const toggleSetting = (key: keyof UserSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const setGestureShape = (shape: GestureShape) => {
    onSettingsChange({
      ...settings,
      stealthGestureShape: shape
    });
  };

  const getEmergencyColor = (type: EmergencyType) => {
    switch(type) {
      case EmergencyType.MEDICAL: return 'text-red-400';
      case EmergencyType.VIOLENCE: return 'text-orange-400';
      case EmergencyType.ACCIDENT: return 'text-yellow-400';
      case EmergencyType.HARASSMENT: return 'text-purple-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          {/* Shake Gesture */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Shake to Alert</p>
              <p className="text-xs text-slate-400">Shake phone vigorously to SOS</p>
            </div>
            <button 
              onClick={() => toggleSetting('enableShake')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableShake ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableShake ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Swipe Gesture Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Stealth Gesture</p>
              <p className="text-xs text-slate-400">Draw shape on black screen</p>
            </div>
            <button 
              onClick={() => toggleSetting('enableSwipeS')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableSwipeS ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableSwipeS ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Gesture Shape Selector (Visible only if swipe enabled) */}
          {settings.enableSwipeS && (
            <div className="bg-slate-800 rounded-xl p-3 space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase">Select Gesture Shape</p>
              <div className="grid grid-cols-3 gap-2">
                {(['S', 'Circle', 'Z'] as GestureShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setGestureShape(shape)}
                    className={`text-sm py-2 rounded-lg font-medium transition ${settings.stealthGestureShape === shape ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Incoming Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Nearby Alerts</p>
              <p className="text-xs text-slate-400">Receive alerts from others</p>
            </div>
            <button 
              onClick={() => toggleSetting('enableIncomingAlerts')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableIncomingAlerts ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableIncomingAlerts ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Alert Sound */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Alert Sound</p>
              <p className="text-xs text-slate-400">Ambulance siren for SOS</p>
            </div>
            <button 
              onClick={() => toggleSetting('enableAlertSound')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableAlertSound ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableAlertSound ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* SOS History Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-medium">SOS History</p>
              {sosHistory.length > 0 && (
                <button onClick={onClearHistory} className="text-xs text-red-400 hover:text-red-300">
                  Clear Log
                </button>
              )}
            </div>
            
            <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 max-h-48 overflow-y-auto custom-scrollbar">
              {sosHistory.length === 0 ? (
                 <div className="p-4 text-center text-xs text-slate-500">No past alerts recorded locally.</div>
              ) : (
                 <div className="divide-y divide-slate-700/50">
                   {sosHistory.map(entry => (
                      <div key={entry.id} className="p-3 hover:bg-slate-700/30 transition">
                         <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold ${getEmergencyColor(entry.type)}`}>{entry.type}</span>
                            <span className="text-[10px] text-slate-400">{entry.timestamp.toLocaleString()}</span>
                         </div>
                         {entry.location && (
                           <div className="flex items-center gap-1 mt-1">
                             <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                             <span className="text-[10px] text-slate-500">
                               {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
                             </span>
                           </div>
                         )}
                      </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex-shrink-0 text-center">
          <p className="text-[10px] text-slate-500">QuickySOS v1.1 • Privacy Protected</p>
          <p className="text-[10px] text-slate-500 mt-1">Created by Denn Marc Beracis & Tom Aniban</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;