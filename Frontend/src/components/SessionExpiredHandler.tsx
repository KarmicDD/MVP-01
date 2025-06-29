import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiAlertTriangle, FiShield, FiRefreshCw, FiX } from 'react-icons/fi';

interface SessionExpiredHandlerProps {
  onSessionExpired?: () => void;
}

const SessionExpiredHandler: React.FC<SessionExpiredHandlerProps> = ({ onSessionExpired }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const expiredReason = urlParams.get('reason');
    const redirectPath = urlParams.get('redirect');

    if (error === 'session_expired') {
      // Store redirect path for after login
      if (redirectPath) {
        localStorage.setItem('pendingRedirect', redirectPath);
      }

      // Set appropriate message based on reason
      const messages: Record<string, string> = {
        'csrf_invalid': 'Your session expired for security reasons. Please log in again to continue.',
        'session_expired': 'Your login session timed out. Please sign in to continue where you left off.',
        'session_corrupted': 'There was an issue with your session. Please log in again.',
        'token_expired': 'Your authentication token has expired. Please log in again.',
        'csrf_retry_failed': 'Unable to refresh your session. Please log in again for security.',
        'security_reset': 'Your session was reset for security purposes. Please log in again.'
      };

      setExpiredMessage(messages[expiredReason || 'csrf_invalid'] || 'Your session has expired. Please log in to continue.');
      setReason(expiredReason || 'session_expired');
      setShowMessage(true);

      // Call onSessionExpired callback if provided
      onSessionExpired?.();

      // Auto-hide message after 6 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [location.search, onSessionExpired]);

  const getIcon = () => {
    switch (reason) {
      case 'csrf_invalid':
        return <FiShield className="w-5 h-5 text-amber-500" />;
      case 'session_expired':
        return <FiRefreshCw className="w-5 h-5 text-blue-500" />;
      case 'token_expired':
        return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'csrf_retry_failed':
        return <FiShield className="w-5 h-5 text-red-500" />;
      case 'security_reset':
        return <FiShield className="w-5 h-5 text-purple-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (reason) {
      case 'csrf_invalid':
        return 'border-amber-200 bg-amber-50';
      case 'session_expired':
        return 'border-blue-200 bg-blue-50';
      case 'token_expired':
        return 'border-orange-200 bg-orange-50';
      case 'csrf_retry_failed':
        return 'border-red-200 bg-red-50';
      case 'security_reset':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTextColorClass = () => {
    switch (reason) {
      case 'csrf_invalid':
        return 'text-amber-800';
      case 'session_expired':
        return 'text-blue-800';
      case 'token_expired':
        return 'text-orange-800';
      case 'csrf_retry_failed':
        return 'text-red-800';
      case 'security_reset':
        return 'text-purple-800';
      default:
        return 'text-blue-800';
    }
  };

  const handleDismiss = () => {
    setShowMessage(false);
    // Clean up URL parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className={`
            p-5 rounded-xl border-2 shadow-lg backdrop-blur-sm
            ${getColorClasses()}
          `}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${getTextColorClass()}`}>
                  Session Information
                </h3>
                <p className={`text-sm mt-1 leading-relaxed ${getTextColorClass()}`}>
                  {expiredMessage}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors duration-200"
                aria-label="Close notification"
              >
                <FiX className={`w-4 h-4 ${getTextColorClass()} opacity-60`} />
              </button>
            </div>

            {/* Security badge */}
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <div className={`flex items-center space-x-2 text-xs ${getTextColorClass()} opacity-75`}>
                <FiShield className="w-3 h-3" />
                <span>This is a security measure to protect your account</span>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1 overflow-hidden">
              <motion.div
                className={`h-full ${getTextColorClass().replace('text-', 'bg-')}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredHandler;
