// src/components/Auth/OAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import { colours } from '../../utils/colours';
import { FaArrowLeft } from "react-icons/fa";
import { motion } from 'framer-motion';
import RoleSelection from './RoleSelector';

const OAuthCallback: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [needsRole, setNeedsRole] = useState(false);
    const [userId, setUserId] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const userId = params.get('userId');

                if (token) {
                    // Store token
                    localStorage.setItem('token', token);

                    // Check if we need to select role
                    if (userId) {
                        setNeedsRole(true);
                        setUserId(userId);
                        setLoading(false);
                        return;
                    }

                    try {
                        // Decode token to check role
                        const tokenParts = token.split('.');
                        if (tokenParts.length === 3) {
                            const payload = JSON.parse(atob(tokenParts[1]));

                            // Store userId and userRole in localStorage
                            if (payload.userId) {
                                localStorage.setItem('userId', payload.userId);
                            }
                            if (payload.role) {
                                localStorage.setItem('userRole', payload.role);
                            }

                            // If role is pending, show role selection
                            if (payload.role === 'pending') {
                                setNeedsRole(true);
                                setUserId(payload.userId);
                                setLoading(false);
                                return;
                            }
                        }

                        // Token has role, fetch user profile
                        const response = await api.get('/users/profile');

                        if (response.data) {
                            localStorage.setItem('user', JSON.stringify(response.data));

                            // Store userId and userRole separately
                            if (response.data.userId) {
                                localStorage.setItem('userId', response.data.userId);
                            }
                            if (response.data.role) {
                                localStorage.setItem('userRole', response.data.role);
                            }

                            navigate('/dashboard');
                        } else {
                            throw new Error('No profile data returned');
                        }
                    } catch (err) {
                        console.error("Error processing authentication:", err);
                        setError('Failed to retrieve user data. Please try again.');
                        setLoading(false);
                    }
                } else {
                    throw new Error('No authentication token received');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Authentication failed. Please try again.');
                setLoading(false);
            }
        };

        handleCallback();
    }, [location, navigate]);

    const handleRoleSelection = async (role: 'startup' | 'investor') => {
        try {
            setLoading(true);

            await authService.updateRole(userId, role);

            navigate('/dashboard');
        } catch (err) {
            console.error('Role selection error:', err);
            setError('Failed to update role. Please try again.');
            setLoading(false);
        }
    };

    const handleBackToAuth = () => {
        navigate('/auth');
    };

    if (loading && !needsRole) {
        return (
            <motion.div
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5
                        }}
                    >
                        <h2 className="text-xl font-bold mb-4">Completing Authentication</h2>
                    </motion.div>
                    <p>Please wait while we finish setting up your account...</p>
                    <div className="mt-6 flex justify-center">
                        <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>

                        <motion.button
                            className="px-4 py-2 rounded-md text-white flex items-center mx-auto"
                            style={{ backgroundColor: colours.primaryBlue }}
                            onClick={handleBackToAuth}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaArrowLeft className="mr-2" />
                            Return to Login
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    if (needsRole) {
        return (
            <motion.div
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-full max-w-md">
                    <motion.div
                        className="flex justify-center mb-8"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold" style={{ color: colours.primaryBlue }}>KarmicDD</h1>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-center">Complete Your Profile</h2>
                        </div>

                        {/* Use the same RoleSelector component as in the main Auth flow */}
                        <RoleSelection handleRoleSelection={handleRoleSelection} />

                        <div className="px-8 pb-6 text-center">
                            <motion.button
                                className="text-gray-600 hover:text-gray-900 flex items-center mx-auto text-sm"
                                onClick={handleBackToAuth}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaArrowLeft className="mr-1" />
                                Back to sign in
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return null;
};

export default OAuthCallback;
