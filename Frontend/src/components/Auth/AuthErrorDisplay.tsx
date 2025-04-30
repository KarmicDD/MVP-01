import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaExclamationCircle, 
    FaInfoCircle, 
    FaLock, 
    FaEnvelope, 
    FaUserAlt, 
    FaTimes 
} from 'react-icons/fa';
import { colours } from '../../utils/colours';

interface AuthErrorDisplayProps {
    error: string;
    title?: string;
    onDismiss?: () => void;
    type?: 'signin' | 'signup' | 'general';
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ 
    error, 
    title, 
    onDismiss,
    type = 'general'
}) => {
    // Determine if we should show specific help messages
    const showCredentialsHelp = error.toLowerCase().includes('credentials') || 
                               error.toLowerCase().includes('invalid') || 
                               error.toLowerCase().includes('password');
                               
    const showEmailHelp = error.toLowerCase().includes('email') && 
                         !error.toLowerCase().includes('already exists');
                         
    const showAccountExistsHelp = error.toLowerCase().includes('already exists') || 
                                 error.toLowerCase().includes('already registered');
                                 
    const showSocialLoginHelp = error.toLowerCase().includes('social login') || 
                               error.toLowerCase().includes('google') || 
                               error.toLowerCase().includes('linkedin');

    // Get the appropriate icon based on the error content
    const getErrorIcon = () => {
        if (error.toLowerCase().includes('password')) return <FaLock />;
        if (error.toLowerCase().includes('email')) return <FaEnvelope />;
        if (error.toLowerCase().includes('account')) return <FaUserAlt />;
        return <FaExclamationCircle />;
    };

    // Get the appropriate title if not provided
    const errorTitle = title || (
        type === 'signin' ? 'Sign In Failed' : 
        type === 'signup' ? 'Sign Up Failed' : 
        'Authentication Error'
    );

    return (
        <AnimatePresence>
            <motion.div
                className="mb-6 overflow-hidden rounded-xl shadow-sm"
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Main error container with gradient background */}
                <div className="relative bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl overflow-hidden">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-500"></div>
                    
                    {/* Error content */}
                    <div className="p-4 pt-5">
                        <div className="flex items-start">
                            {/* Icon container with gradient background */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm mr-3">
                                <span className="text-white text-lg">
                                    {getErrorIcon()}
                                </span>
                            </div>
                            
                            {/* Error message content */}
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-red-800">
                                    {errorTitle}
                                </h3>
                                <p className="mt-1 text-sm text-red-700">
                                    {error}
                                </p>
                                
                                {/* Conditional help messages */}
                                <div className="mt-3 space-y-2">
                                    {showCredentialsHelp && (
                                        <div className="flex items-start p-2.5 bg-white rounded-lg border border-red-100 shadow-sm">
                                            <FaInfoCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                Please check that your email and password are correct. Make sure caps lock is off and try again.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {showEmailHelp && (
                                        <div className="flex items-start p-2.5 bg-white rounded-lg border border-red-100 shadow-sm">
                                            <FaInfoCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                Please enter a valid email address format (e.g., name@example.com).
                                            </p>
                                        </div>
                                    )}
                                    
                                    {showAccountExistsHelp && (
                                        <div className="flex items-start p-2.5 bg-white rounded-lg border border-red-100 shadow-sm">
                                            <FaInfoCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                This email is already registered. Try signing in instead or use a different email address.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {showSocialLoginHelp && (
                                        <div className="flex items-start p-2.5 bg-white rounded-lg border border-red-100 shadow-sm">
                                            <FaInfoCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                This account was created with a social login. Please use the Google or LinkedIn buttons below.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Dismiss button */}
                            {onDismiss && (
                                <button 
                                    onClick={onDismiss}
                                    className="ml-2 p-1 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthErrorDisplay;
