import React, { useEffect, useRef, useState } from 'react';

interface GestureManagerProps {
  isActive: boolean;
  onShake: () => void;
}

const GestureManager: React.FC<GestureManagerProps> = ({ isActive, onShake }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const lastZ = useRef<number>(0);
  const lastTime = useRef<number>(0);

  const SHAKE_THRESHOLD = 15; // m/s^2 diff
  const TIME_THRESHOLD = 200; // ms

  // Request Wake Lock to keep screen active
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isActive && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.warn(`Wake Lock error: ${err}`);
        }
      } else if (!isActive && wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    requestWakeLock();

    // Re-acquire lock if visibility changes (e.g. user minimized then returned)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isActive) {
            requestWakeLock();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        if (wakeLockRef.current) wakeLockRef.current.release();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);


  const requestMotionPermission = async () => {
    // @ts-ignore - DeviceMotionEvent.requestPermission is an iOS specific API
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Non-iOS devices usually allow by default
      setHasPermission(true);
    }
  };

  useEffect(() => {
    if (!isActive || !hasPermission) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime.current) > TIME_THRESHOLD) {
        const diff = Math.abs((current.x || 0) - lastX.current) + 
                     Math.abs((current.y || 0) - lastY.current) + 
                     Math.abs((current.z || 0) - lastZ.current);

        if (diff > SHAKE_THRESHOLD) {
          onShake();
        }

        lastTime.current = currentTime;
        lastX.current = current.x || 0;
        lastY.current = current.y || 0;
        lastZ.current = current.z || 0;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive, hasPermission, onShake]);

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col items-end">
      {!hasPermission && (
         <button 
           onClick={requestMotionPermission}
           className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-pulse border border-blue-400 font-semibold"
         >
           Enable Shake Gesture
         </button>
      )}
      {hasPermission && (
          <div className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/50 backdrop-blur-md">
              Gestures Active
          </div>
      )}
    </div>
  );
};

export default GestureManager;