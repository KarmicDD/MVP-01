// src/components/Auth/OAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import { colours } from '../../utils/colours';
import { FaRocket, FaChartLine, FaArrowLeft } from "react-icons/fa";
import { motion } from 'framer-motion';

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

                console.log("OAuth callback received:", {
                    token: token ? `${token.substring(0, 20)}...` : null,
                    userId
                });

                if (token) {
                    // Store token
                    localStorage.setItem('token', token);
                    console.log("Token stored in localStorage");

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
                            console.log("Token payload:", payload);

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
                        console.log("Profile response:", response.data);

                        if (response.data) {
                            localStorage.setItem('user', JSON.stringify(response.data));
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
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white"
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
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white"
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
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>

                        {/* Add the debug button here */}
                        <div className="mb-4">
                            <button
                                onClick={() => {
                                    console.log("localStorage contents:", {
                                        token: localStorage.getItem('token'),
                                        user: localStorage.getItem('user')
                                    });
                                    alert("Check browser console for localStorage data");
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
                            >
                                Debug: Check Storage
                            </button>
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
                className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white"
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
                        <div className="p-6">
                            <p className="text-center mb-6">Please select your role to complete signup</p>

                            <div className="space-y-4">
                                <motion.div
                                    className="border rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleRoleSelection('startup')}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        borderColor: colours.primaryBlue
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center">
                                        <div className="rounded-full p-3 mr-4" style={{ backgroundColor: '#e6edff' }}>
                                            <FaRocket className="text-2xl" style={{ color: colours.primaryBlue }} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg">Sign in as Startup</h3>
                                            <p className="text-gray-600">Perfect for entrepreneurs seeking funding and resources</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="border rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleRoleSelection('investor')}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        borderColor: '#10b981'
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center">
                                        <div className="rounded-full p-3 mr-4" style={{ backgroundColor: '#e6f9ef' }}>
                                            <FaChartLine className="text-2xl" style={{ color: '#10b981' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg">Sign in as Investor</h3>
                                            <p className="text-gray-600">Ideal for investors looking to discover promising startups</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="mt-6 text-center">
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
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return null;
};

export default OAuthCallback;
