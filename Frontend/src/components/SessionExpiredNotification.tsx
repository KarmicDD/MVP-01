import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiRefreshCw, FiShield, FiClock, FiLock } from 'react-icons/fi';
import { colours } from '../utils/colours';

interface SessionExpiredNotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  reason?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  redirectPath?: string;
}

const SessionExpiredNotification: React.FC<SessionExpiredNotificationProps> = ({
  isVisible,
  title,
  message,
  reason = 'session_expired',
  onClose,
  autoClose = true,
  duration = 3000,
  redirectPath
}) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isVisible || !autoClose) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const autoCloseTimer = setTimeout(() => {
      setIsRedirecting(true);
      onClose?.();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [isVisible, autoClose, duration, onClose]);

  const getReasonIcon = () => {
    switch (reason) {
      case 'csrf_invalid':
        return <FiShield className="w-6 h-6" style={{ color: colours.warningYellow }} />;
      case 'session_expired':
        return <FiClock className="w-6 h-6" style={{ color: colours.primaryBlue }} />;
      case 'security_violation':
        return <FiLock className="w-6 h-6" style={{ color: colours.errorRed }} />;
      default:
        return <FiAlertTriangle className="w-6 h-6" style={{ color: colours.warningYellow }} />;
    }
  };

  const getReasonColors = () => {
    switch (reason) {
      case 'csrf_invalid':
        return {
          border: 'rgba(234, 179, 8, 0.2)',
          background: 'rgba(254, 243, 199, 0.9)',
          accent: colours.warningYellow
        };
      case 'session_expired':
        return {
          border: 'rgba(62, 96, 233, 0.2)',
          background: 'rgba(239, 246, 255, 0.95)',
          accent: colours.primaryBlue
        };
      case 'security_violation':
        return {
          border: 'rgba(239, 68, 68, 0.2)',
          background: 'rgba(254, 242, 242, 0.9)',
          accent: colours.errorRed
        };
      default:
        return {
          border: 'rgba(234, 179, 8, 0.2)',
          background: 'rgba(254, 243, 199, 0.9)',
          accent: colours.warningYellow
        };
    }
  };

  const getReasonColorClasses = () => {
    switch (reason) {
      case 'csrf_invalid':
        return 'border-yellow-200 bg-yellow-50/90';
      case 'session_expired':
        return 'border-blue-200 bg-blue-50/95';
      case 'security_violation':
        return 'border-red-200 bg-red-50/90';
      default:
        return 'border-blue-200 bg-blue-50/95';
    }
  };

  const getProgressColor = () => {
    switch (reason) {
      case 'csrf_invalid':
        return 'bg-yellow-500';
      case 'session_expired':
        return 'bg-blue-500';
      case 'security_violation':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const reasonColors = getReasonColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Professional backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
          
          {/* Enhanced notification with your design system */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
          >
            <div className={`
              p-6 rounded-2xl border-2 shadow-2xl backdrop-blur-md
              ${getReasonColorClasses()}
            `}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getReasonIcon()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {title}
                    </h3>
                  </div>
                </div>
                
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Message */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {message}
              </p>

              {/* Auto-redirect info */}
              {autoClose && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Redirecting to login...</span>
                    <span className="font-medium">{Math.ceil(timeLeft)}s</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor()}`}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ 
                        duration: duration / 1000, 
                        ease: "linear" 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Security note */}
              <div className="mt-4 pt-3 border-t border-gray-200 border-opacity-50">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <FiShield className="w-3 h-3" />
                  <span>This is a security measure to protect your account</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredNotification;
