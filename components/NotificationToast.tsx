import React, { useEffect, useState } from 'react';

export type NotificationType = 'alert' | 'success' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss after 5 minutes (300,000 ms)
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for animation out to finish before removing from DOM
      setTimeout(() => onClose(notification.id), 300);
    }, 300000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const styles = {
    alert: 'bg-red-600/90 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]',
    success: 'bg-emerald-600/90 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]',
    info: 'bg-blue-600/90 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]',
  };

  const icons = {
    alert: (
      <svg className="w-6 h-6 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md mb-3 max-w-sm w-full transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
        ${styles[notification.type]}
      `}
      role="alert"
    >
      {icons[notification.type]}
      <p className="font-semibold text-sm leading-tight">{notification.message}</p>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(() => onClose(notification.id), 300); }}
        className="ml-auto opacity-70 hover:opacity-100 p-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default NotificationToast;
