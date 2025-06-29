import React, { useState, useEffect } from 'react';
import SessionExpiredNotification from './SessionExpiredNotification';

interface SessionExpiredData {
  title: string;
  message: string;
  reason?: string;
}

const GlobalNotificationManager: React.FC = () => {
  const [sessionExpiredData, setSessionExpiredData] = useState<SessionExpiredData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Global function for showing session expired notifications
    (window as any).showSessionExpiredNotification = (data: SessionExpiredData) => {
      setSessionExpiredData(data);
      setIsVisible(true);
    };

    // Cleanup
    return () => {
      delete (window as any).showSessionExpiredNotification;
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Clear data after animation completes
    setTimeout(() => {
      setSessionExpiredData(null);
    }, 300);
  };

  return (
    <>
      {sessionExpiredData && (
        <SessionExpiredNotification
          isVisible={isVisible}
          title={sessionExpiredData.title}
          message={sessionExpiredData.message}
          reason={sessionExpiredData.reason}
          onClose={handleClose}
          autoClose={true}
          duration={2500}
        />
      )}
    </>
  );
};

export default GlobalNotificationManager;
