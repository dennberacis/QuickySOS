import React, { useRef, useState, useEffect } from 'react';
import GestureManager from './GestureManager';
import { GestureShape } from '../types';

interface StealthOverlayProps {
  onExit: () => void;
  onSOS: () => void;
  enableShake: boolean;
  enableSwipeS: boolean;
  gestureShape: GestureShape;
}

const StealthOverlay: React.FC<StealthOverlayProps> = ({ onExit, onSOS, enableShake, enableSwipeS, gestureShape }) => {
  const [gestureStatus, setGestureStatus] = useState<string>('');
  const points = useRef<{x: number, y: number}[]>([]);
  
  // 10-Click SOS Logic
  const tapCount = useRef<number>(0);
  const tapTimeout = useRef<number | null>(null);

  // 5-Swipe Exit Logic
  const swipeExitCount = useRef<number>(0);
  const swipeExitTimeout = useRef<number | null>(null);

  // Long Press Exit Logic
  const longPressTimeout = useRef<number | null>(null);
  const isLongPress = useRef<boolean>(false);

  // Auto-clear gesture status to restore full black screen
  useEffect(() => {
    if (gestureStatus) {
      const timer = setTimeout(() => {
        setGestureStatus('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gestureStatus]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // --- 1. Long Press to Exit (Hold 2s) ---
    isLongPress.current = true;
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    
    longPressTimeout.current = window.setTimeout(() => {
      if (isLongPress.current) {
        if (navigator.vibrate) navigator.vibrate(100);
        onExit();
      }
    }, 2000); 

    // --- 2. Tap Counting for SOS (10 taps) ---
    tapCount.current += 1;
    
    // Clear existing reset timer
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    
    // Set new reset timer (reset count if no tap within 600ms)
    tapTimeout.current = window.setTimeout(() => {
      tapCount.current = 0;
    }, 600);

    if (tapCount.current >= 10) {
      setGestureStatus('10-Click SOS Activated!');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
      onSOS();
      tapCount.current = 0;
      // Cancel exit if we just triggered SOS
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
      isLongPress.current = false;
    }

    // --- 3. Gesture Trace Start ---
    points.current = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }];
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If finger moves significantly, cancel long press
    if (isLongPress.current && points.current.length > 0) {
        const start = points.current[0];
        const current = e.touches[0];
        const moveDist = Math.hypot(current.clientX - start.x, current.clientY - start.y);
        
        // Threshold to consider it a move (gesture) rather than a held tap
        if (moveDist > 20) {
            isLongPress.current = false;
            if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
        }
    }
    
    points.current.push({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    // Cancel long press on release
    isLongPress.current = false;
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);

    // Analyze Trace
    if (points.current.length > 0) {
      const start = points.current[0];
      const end = points.current[points.current.length - 1];
      const distance = Math.hypot(end.x - start.x, end.y - start.y);

      // --- 5-Swipe Exit Logic ---
      // If movement is significant (>50px), count as a swipe
      if (distance > 50) {
        swipeExitCount.current += 1;

        // Reset swipe counter if no subsequent swipe within 1 second
        if (swipeExitTimeout.current) clearTimeout(swipeExitTimeout.current);
        swipeExitTimeout.current = window.setTimeout(() => {
          swipeExitCount.current = 0;
        }, 1000);

        if (swipeExitCount.current >= 5) {
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          onExit();
          swipeExitCount.current = 0;
          points.current = [];
          return;
        }
      }
    }

    // Detect Configured Gesture
    if (enableSwipeS && points.current.length > 20) {
      if (gestureShape === 'Circle') {
        detectCircleGesture(points.current);
      } else if (gestureShape === 'Z') {
        detectZGesture(points.current);
      } else {
        detectSGesture(points.current);
      }
    } else {
      // If not a gesture, clear points
      points.current = [];
    }
  };

  // --- Geometry Helpers ---
  const getBoundingBox = (trace: {x: number, y: number}[]) => {
    const xs = trace.map(p => p.x);
    const ys = trace.map(p => p.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  };

  // --- Gesture: S ---
  const detectSGesture = (trace: {x: number, y: number}[]) => {
    const box = getBoundingBox(trace);
    if (box.height < 100 || box.width < 50) { points.current = []; return; }

    let directionChanges = 0;
    let currentDir = 0; // -1 left, 1 right
    
    const sampleStep = Math.floor(trace.length / 10);
    const simplified = [];
    for(let i=0; i<trace.length; i+=sampleStep) simplified.push(trace[i]);
    
    for (let i = 1; i < simplified.length; i++) {
        const dx = simplified[i].x - simplified[i-1].x;
        if (Math.abs(dx) > 10) { 
            const newDir = dx > 0 ? 1 : -1;
            if (currentDir !== 0 && newDir !== currentDir) {
                directionChanges++;
            }
            currentDir = newDir;
        }
    }

    if (directionChanges >= 2) {
      activateSOS('S-Gesture Detected!');
    }
    points.current = [];
  };

  // --- Gesture: Circle ---
  const detectCircleGesture = (trace: {x: number, y: number}[]) => {
     const start = trace[0];
     const end = trace[trace.length - 1];
     const distanceStartEnd = Math.hypot(end.x - start.x, end.y - start.y);
     const box = getBoundingBox(trace);

     // Conditions: Start and End close together (closed loop), decent size
     if (distanceStartEnd < 100 && box.width > 100 && box.height > 100) {
        // Also check if we traveled a significant distance (perimeter)
        let totalPath = 0;
        for(let i=1; i<trace.length; i++) {
           totalPath += Math.hypot(trace[i].x - trace[i-1].x, trace[i].y - trace[i-1].y);
        }
        
        // Perimeter should be much larger than the gap between start/end
        if (totalPath > box.width * 2) {
           activateSOS('Circle Gesture Detected!');
        }
     }
     points.current = [];
  };

  // --- Gesture: Z ---
  const detectZGesture = (trace: {x: number, y: number}[]) => {
    const box = getBoundingBox(trace);
    if (box.width < 100 || box.height < 80) { points.current = []; return; }

    // Simplify trace into 3 segments? 
    // Z is: Right, then Down-Left, then Right
    // We check general flow.
    const segmentSize = Math.floor(trace.length / 3);
    const seg1 = trace.slice(0, segmentSize);
    const seg2 = trace.slice(segmentSize, segmentSize * 2);
    const seg3 = trace.slice(segmentSize * 2);

    const getDirection = (seg: {x: number, y: number}[]) => {
        const start = seg[0];
        const end = seg[seg.length - 1];
        return { dx: end.x - start.x, dy: end.y - start.y };
    };

    const d1 = getDirection(seg1); // Should be right (dx > 0)
    const d2 = getDirection(seg2); // Should be down-left (dx < 0, dy > 0)
    const d3 = getDirection(seg3); // Should be right (dx > 0)

    if (d1.dx > 20 && d2.dx < -20 && d2.dy > 20 && d3.dx > 20) {
        activateSOS('Z-Gesture Detected!');
    }
    points.current = [];
  };

  const activateSOS = (msg: string) => {
    setGestureStatus(msg);
    if (navigator.vibrate) navigator.vibrate(200);
    onSOS();
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] cursor-pointer touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <GestureManager isActive={enableShake} onShake={onSOS} />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-800 text-center pointer-events-none select-none">
        <p className="text-xs mb-2 font-mono font-bold text-neutral-900">Hold 2s or Swipe 5x to Wake</p>
        <div className="space-y-1">
          <p className="text-[10px] text-neutral-900 opacity-60">Tap 10x for SOS</p>
          {enableSwipeS && (
            <p className="text-[10px] text-neutral-900 opacity-60">
               Draw '{gestureShape}' for SOS
            </p>
          )}
        </div>
        
        {gestureStatus && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
            <p className="text-red-600 font-bold text-lg animate-pulse">{gestureStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StealthOverlay;