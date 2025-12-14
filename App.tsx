import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EmergencyType, NearbyAlert, GeminiAdviceResponse, UserSettings, Contact, UserProfile, SOSLogEntry } from './types';
import LiveMap from './components/LiveMap';
import GestureManager from './components/GestureManager';
import SettingsModal from './components/SettingsModal';
import ContactsModal from './components/ContactsModal';
import ProfileModal from './components/ProfileModal';
import StealthOverlay from './components/StealthOverlay';
import NotificationToast, { Notification, NotificationType } from './components/NotificationToast';
import { getEmergencyAdvice } from './services/geminiService';

// SVG Icons
const Icons = {
  Siren: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Medical: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Eye: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 5 8.268 7.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  MapPin: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Cog: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Phone: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

const App: React.FC = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSafeConfirmation, setShowSafeConfirmation] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<NearbyAlert[]>([]);
  const [advice, setAdvice] = useState<GeminiAdviceResponse | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [alertFlash, setAlertFlash] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', gender: 'Prefer not to say' });
  const [sosHistory, setSosHistory] = useState<SOSLogEntry[]>([]);
  
  // Track the ID of the alert we broadcasted so we can delete it later
  const [myRemoteAlertId, setMyRemoteAlertId] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    enableShake: true,
    enableSwipeS: true,
    stealthGestureShape: 'S',
    enableIncomingAlerts: true,
    enableAlertSound: true
  });

  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'police', name: 'Police', phone: '911' },
    { id: 'ambulance', name: 'Ambulance', phone: '112' },
    { id: 'fire', name: 'Fire Station', phone: '101' },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenTimeoutRef = useRef<number | null>(null);

  // Track processed alerts to prevent duplicate notifications during polling
  const processedAlertIds = useRef<Set<string>>(new Set());

  // Ref to track notifications for interval closure access
  const notificationsRef = useRef<Notification[]>([]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Notification Helper
  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const stopSiren = useCallback(() => {
    // Clear 5m timeout if active
    if (sirenTimeoutRef.current) {
      window.clearTimeout(sirenTimeoutRef.current);
      sirenTimeoutRef.current = null;
    }

    if (sirenOscillatorRef.current) {
      try {
        const ctx = audioContextRef.current;
        if (ctx && sirenGainRef.current) {
          // Fade out to avoid pop
          sirenGainRef.current.gain.setValueAtTime(sirenGainRef.current.gain.value, ctx.currentTime);
          sirenGainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          setTimeout(() => {
             if (sirenOscillatorRef.current) {
               sirenOscillatorRef.current.stop();
               sirenOscillatorRef.current.disconnect();
               sirenOscillatorRef.current = null;
             }
          }, 100);
        } else {
           sirenOscillatorRef.current.stop();
           sirenOscillatorRef.current.disconnect();
           sirenOscillatorRef.current = null;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // High Volume Ambulance Siren with 5 Minute Timeout
  const playSiren = useCallback(() => {
    if (!settings.enableAlertSound) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Stop previous if exists
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
      }
      // Clear previous timeout
      if (sirenTimeoutRef.current) {
        window.clearTimeout(sirenTimeoutRef.current);
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Harsh wave for attention
      
      // Siren effect: Fast "Yelp" style
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.value = 3; // 3Hz cycle (Fast emergency yelp)
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 600; // Wide sweep modulation
      
      const baseFreq = 1000;
      osc.frequency.value = baseFreq; 
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      // Maximize volume
      gain.gain.setValueAtTime(0.8, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscillatorRef.current = osc;
      sirenGainRef.current = gain;

      // Auto stop after 5 minutes (300,000ms)
      sirenTimeoutRef.current = window.setTimeout(() => {
        stopSiren();
      }, 300000);

    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, [settings.enableAlertSound, stopSiren]);

  // Real-time API Polling for Alerts
  useEffect(() => {
    if (!settings.enableIncomingAlerts) {
      setNearbyAlerts([]);
      return;
    }

    const fetchAlerts = async () => {
      try {
        // Poll the serverless API
        const response = await fetch('/api/alerts');
        if (response.ok) {
          const alerts: NearbyAlert[] = await response.json();
          setNearbyAlerts(alerts);

          // STOP SIREN CHECK:
          // If there are no active alerts remotely, and we are not locally signaling SOS, stop the noise.
          // This handles the case where the victim marks themselves safe.
          if (alerts.length === 0 && !isSOSActive) {
            stopSiren();
            // Clear any sticking alert toasts
            setNotifications(prev => prev.filter(n => n.type !== 'alert'));
          }

          // Process new alerts
          alerts.forEach(alert => {
            // Check if alert is new and NOT generated by self (assuming we'd have a tracking ID, but for now just check processed set)
            if (!processedAlertIds.current.has(alert.id)) {
              processedAlertIds.current.add(alert.id);
              
              // Only trigger intrusive alert if no other notification is currently blocking view
              // to prevent stacking spam.
              if (notificationsRef.current.length === 0) {
                 playSiren();
                 setAlertFlash(true);
                 setTimeout(() => setAlertFlash(false), 500);
                 showNotification(`⚠️ ${alert.type} reported nearby!`, 'alert');
              }
            }
          });
        }
      } catch (e) {
        console.error("Failed to poll alerts", e);
      }
    };

    // Initial fetch
    fetchAlerts();

    // Poll every 3 seconds
    const interval = setInterval(fetchAlerts, 3000);

    return () => clearInterval(interval);
  }, [settings.enableIncomingAlerts, playSiren, stopSiren, isSOSActive, showNotification]);

  // Location Tracking
  useEffect(() => {
    let watchId: number | undefined;

    if ('geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 20000,     // Wait up to 20s for a reading
        maximumAge: 10000   // Reuse last reading if it's less than 10s old
      };

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Location error", error);
          let errorMsg = "Location unavailable";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Permission denied";
            // Do not continuously spam notification, reliance on map text
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "GPS Signal unavailable";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "GPS Timeout";
          }
          setLocationError(errorMsg);
        },
        options
      );
    } else {
      setLocationError("Not supported");
    }
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // SOS Trigger Logic
  const triggerSOS = useCallback(async (type: EmergencyType = EmergencyType.GENERAL) => {
    setIsSOSActive(true);
    setEmergencyType(type);
    setStealthMode(false); 
    
    // Play Loud Siren - REMOVED for silent alert on sender side
    // playSiren(); 
    showNotification(`SOS Signal Broadcasted for ${type}!`, 'alert');

    if (locationError) {
      showNotification(`Warning: ${locationError}`, 'info');
    }

    // Add to history
    const newLogEntry: SOSLogEntry = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      location: location ? { latitude: location.lat, longitude: location.long } : null
    };
    setSosHistory(prev => [newLogEntry, ...prev]);

    // 1. BROADCAST ALERT: Send to Serverless API for other users
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          distance: 0, // In a real app, backend calculates distance
          // Map local {lat, long} to {latitude, longitude} for consistent API structure
          location: location 
            ? { latitude: location.lat, longitude: location.long } 
            : { latitude: 0, longitude: 0 },
          userProfile // Include user profile in broadcast
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Save the ID so we can delete it later when we mark safe
        setMyRemoteAlertId(data.id);
      }
    } catch (e) {
      console.error("Failed to broadcast SOS to server", e);
    }
    
    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);

    setAdvice(null);
    
    // Fetch offline advice immediately
    const aiResponse = await getEmergencyAdvice(type, location ? `Lat: ${location.lat}, Long: ${location.long}` : 'Unknown Location');
    setAdvice(aiResponse);

  }, [location, playSiren, userProfile, locationError, showNotification]);

  const handleSOSClick = () => {
    if (isSOSActive) return;
    triggerSOS(EmergencyType.GENERAL);
  };

  const cancelSOS = async () => {
    stopSiren();
    setIsSOSActive(false);
    setEmergencyType(null);
    setAdvice(null);
    setShowSafeConfirmation(false);
    showNotification('Emergency Alert Cancelled', 'info');

    // Remove the alert from the server so others stop hearing the siren
    if (myRemoteAlertId) {
      try {
        await fetch('/api/alerts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: myRemoteAlertId })
        });
        setMyRemoteAlertId(null);
      } catch (e) {
        console.error("Failed to delete alert", e);
      }
    }
  };

  const handleAddContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    showNotification(`${contact.name} added to emergency contacts`, 'success');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    showNotification('Contact removed', 'info');
  };

  // Render Stealth Mode
  if (stealthMode) {
    return (
      <StealthOverlay 
        onExit={() => setStealthMode(false)}
        onSOS={() => triggerSOS(EmergencyType.GENERAL)}
        enableShake={settings.enableShake}
        enableSwipeS={settings.enableSwipeS}
        gestureShape={settings.stealthGestureShape}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-blue-50 flex flex-col relative overflow-hidden font-sans">
      {/* Alert Flash Overlay */}
      <div 
        className={`fixed inset-0 bg-red-600 z-[60] pointer-events-none transition-opacity duration-300 ${alertFlash ? 'opacity-40' : 'opacity-0'}`} 
      />

      {/* Notification Container (Top) */}
      <div className="fixed top-20 left-0 right-0 z-[100] px-4 flex flex-col items-center pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto w-full flex justify-center">
            <NotificationToast notification={n} onClose={removeNotification} />
          </div>
        ))}
      </div>

      {/* Safe Confirmation Modal */}
      {showSafeConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Safety</h3>
            <p className="text-slate-300 mb-6 text-sm">Are you sure you want to cancel the emergency alert?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSafeConfirmation(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Keep Alert
              </button>
              <button 
                onClick={cancelSOS}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg transition"
              >
                Yes, I'm Safe
              </button>
            </div>
          </div>
        </div>
      )}

      <GestureManager isActive={settings.enableShake} onShake={() => triggerSOS(EmergencyType.GENERAL)} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSettingsChange={setSettings}
        sosHistory={sosHistory}
        onClearHistory={() => setSosHistory([])}
      />

      <ContactsModal 
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
        contacts={contacts}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
      />

      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSave={setUserProfile}
      />

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-slate-800 z-10 sticky top-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">QuickySOS</h1>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
          <button 
            onClick={() => setStealthMode(true)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
            title="Stealth Mode (Screen Off Gesture)"
          >
            <Icons.EyeOff />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
            title="User Identity"
          >
            <Icons.User />
          </button>
          <button 
            onClick={() => setIsContactsOpen(true)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
            title="Emergency Contacts"
          >
            <Icons.Phone />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
            title="Settings"
          >
            <Icons.Cog />
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 gap-6 max-w-lg mx-auto w-full z-10">
        
        {/* Main SOS Section */}
        <div className="flex flex-col items-center justify-center py-6">
          {isSOSActive ? (
            <div className="w-full flex flex-col items-center animate-pulse">
               <div className="w-48 h-48 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.6)] mb-6">
                 <span className="text-4xl font-bold text-white">SOS SENT</span>
               </div>
               <p className="text-red-300 mb-2 text-center font-semibold">Alerting {contacts.length} Emergency Contacts...</p>
               <div className="flex flex-wrap justify-center gap-2 mb-4">
                 {contacts.slice(0, 3).map(c => (
                   <span key={c.id} className="text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded">{c.name}</span>
                 ))}
                 {contacts.length > 3 && <span className="text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded">+{contacts.length - 3}</span>}
               </div>
               <button 
                 onClick={() => setShowSafeConfirmation(true)}
                 className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform transition active:scale-95 flex items-center gap-2"
               >
                 <Icons.Shield /> I AM SAFE
               </button>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={handleSOSClick}
                className="w-56 h-56 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_40px_rgba(220,38,38,0.4)] border-8 border-slate-900 flex flex-col items-center justify-center transform transition active:scale-95 active:shadow-inner"
              >
                <Icons.Siren />
                <span className="text-4xl font-black text-white mt-2">SOS</span>
                <span className="text-xs text-red-200 mt-1 uppercase tracking-widest">Tap to Alert</span>
              </button>
              <div className="absolute -inset-4 rounded-full border border-red-900/30 -z-10 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Offline Advice Section (Visible when Alerting) */}
        {isSOSActive && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-3">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
               <h3 className="text-lg font-bold text-emerald-100">Emergency Guide</h3>
               <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                  Offline Mode
               </span>
             </div>
             
             {advice ? (
               <div className="space-y-4">
                  <ul className="space-y-2">
                    {advice.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-slate-800/50 p-2 rounded-lg">
                        <span className="bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">{idx + 1}</span>
                        <span className="text-slate-200 text-sm leading-tight">{step}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-lg flex gap-3 items-center">
                    <Icons.Shield />
                    <p className="text-xs text-yellow-200 font-medium">{advice.safetyTip}</p>
                  </div>
               </div>
             ) : (
               <div className="flex justify-center py-4">
                 <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
             )}
          </div>
        )}

        {/* Quick Emergency Types (Hide if Active) */}
        {!isSOSActive && (
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => triggerSOS(EmergencyType.MEDICAL)} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition border border-slate-700">
               <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><Icons.Medical /></div>
               <span className="font-semibold">Medical</span>
             </button>
             <button onClick={() => triggerSOS(EmergencyType.VIOLENCE)} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition border border-slate-700">
               <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400"><Icons.Shield /></div>
               <span className="font-semibold">Violence</span>
             </button>
             <button onClick={() => triggerSOS(EmergencyType.ACCIDENT)} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition border border-slate-700">
               <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400"><Icons.Siren /></div>
               <span className="font-semibold">Accident</span>
             </button>
             <button onClick={() => triggerSOS(EmergencyType.HARASSMENT)} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition border border-slate-700">
               <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Icons.Eye /></div>
               <span className="font-semibold">Harassment</span>
             </button>
          </div>
        )}

        {/* Live Map Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <Icons.MapPin />
                <span className="text-sm font-medium text-slate-300">
                  {location ? `${location.lat.toFixed(4)}, ${location.long.toFixed(4)}` : (locationError || 'Locating...')}
                </span>
             </div>
             <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
               {isOffline ? 'Offline Mode' : 'Live Map'}
             </span>
          </div>
          {/* Map Container */}
          <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-inner h-64 relative">
             <LiveMap userLocation={location} alerts={nearbyAlerts} />
             {/* Map Overlay Gradient */}
             <div className="absolute inset-0 pointer-events-none border-4 border-slate-800/20 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-10"></div>
          </div>
        </div>

        {/* Nearby Alerts Feed */}
        {settings.enableIncomingAlerts && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
            <div className="space-y-2">
              {nearbyAlerts.length === 0 ? (
                <p className="text-slate-600 text-sm italic">No nearby incidents reported.</p>
              ) : (
                nearbyAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center border-l-2 border-slate-600">
                     <div>
                       <span className="block text-sm font-bold text-white">{alert.type}</span>
                       <span className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()} • {alert.distance ? `${alert.distance}m` : 'Nearby'}</span>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* Floating Info */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-slate-950/80 backdrop-blur text-center text-[10px] text-slate-500 flex flex-col justify-center">
         <span>QuickySOS • {settings.enableShake ? 'Shake Active' : 'Shake Off'} • Stealth Mode Available</span>
         <span className="opacity-60 mt-0.5">Credits: Denn Marc Beracis & Tom Aniban</span>
      </div>
    </div>
  );
};

export default App;