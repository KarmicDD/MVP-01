import React, { useState } from 'react';
import { FiAlertTriangle, FiX, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorDisplayProps {
  error: {
    message: string;
    errorCode?: string;
    error?: string;
    validationDetails?: Record<string, any>;
    suggestedAction?: string;
    timestamp?: string;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  const hasValidationDetails = error.validationDetails && Object.keys(error.validationDetails).length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md mb-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              {error.message}
            </h3>
            {error.errorCode && (
              <p className="text-sm text-red-700 mt-1">
                Error Code: {error.errorCode}
              </p>
            )}
            {error.suggestedAction && (
              <p className="text-sm text-red-700 mt-2">
                {error.suggestedAction}
              </p>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {(hasValidationDetails || error.error) && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm text-red-700 hover:text-red-900 focus:outline-none"
          >
            {showDetails ? (
              <>
                <FiChevronUp className="mr-1" /> Hide technical details
              </>
            ) : (
              <>
                <FiChevronDown className="mr-1" /> Show technical details
              </>
            )}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                {error.error && (
                  <div className="bg-white p-3 rounded border border-red-200 text-sm text-red-800 font-mono mb-3">
                    {error.error}
                  </div>
                )}

                {hasValidationDetails && (
                  <div className="bg-white p-3 rounded border border-red-200 overflow-auto max-h-60">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                    <ul className="text-xs space-y-2">
                      {Object.entries(error.validationDetails).map(([key, details]) => (
                        <li key={key} className="pb-2 border-b border-red-100">
                          <span className="font-medium">{key}:</span>
                          <div className="ml-2 mt-1">
                            <div><span className="font-medium">Message:</span> {details.message}</div>
                            {details.value && <div><span className="font-medium">Value:</span> {details.value.toString()}</div>}
                            {details.path && <div><span className="font-medium">Path:</span> {details.path}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error.timestamp && (
                  <div className="mt-2 text-xs text-red-600">
                    Error occurred at: {new Date(error.timestamp).toLocaleString()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:border-red-400 focus:shadow-outline-red active:bg-red-100 transition ease-in-out duration-150"
          >
            <FiRefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ErrorDisplay;
