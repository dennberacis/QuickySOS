import React from 'react';
import { UserSettings, GestureShape } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (newSettings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
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
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800">
          <p className="text-[10px] text-center text-slate-500">QuickySOS v1.1 • Privacy Protected</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;