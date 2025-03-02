// src/components/Auth/OAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { colours } from '../../utils/colours';
import { FaRocket, FaChartLine } from "react-icons/fa";

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

                    // Otherwise, get user info and redirect
                    const user = await authService.getCurrentUser();
                    if (user && user.role) {
                        if (user.role === 'startup') {
                            navigate('/startup/dashboard');
                        } else if (user.role === 'investor') {
                            navigate('/investor/dashboard');
                        }
                    } else {
                        // Default to home if no role
                        navigate('/');
                    }
                } else {
                    throw new Error('No authentication token received');
                }
            } catch (err: any) {
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

            // Update user role
            await authService.updateRole(userId, role);

            // Redirect based on selected role
            if (role === 'startup') {
                navigate('/startup/dashboard');
            } else {
                navigate('/investor/dashboard');
            }
        } catch (err: any) {
            console.error('Role selection error:', err);
            setError('Failed to update role. Please try again.');
            setLoading(false);
        }
    };

    if (loading && !needsRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: colours.mainBackground }}>
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Completing Authentication</h2>
                    <p>Please wait while we finish setting up your account...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: colours.mainBackground }}>
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        className="px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: colours.primaryBlue }}
                        onClick={() => navigate('/auth')}
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    if (needsRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: colours.mainBackground }}>
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <h1 className="text-2xl font-bold" style={{ color: colours.primaryBlue }}>KarmicDD</h1>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-center mb-6">Select Your Role</h2>
                            <p className="text-center mb-6">Please select your role to complete signup</p>

                            <div className="space-y-4">
                                <div
                                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleRoleSelection('startup')}
                                >
                                    <div className="flex items-center">
                                        <div className="rounded-full p-2 mr-3" style={{ backgroundColor: '#e6edff' }}>
                                            <FaRocket className="text-xl" style={{ color: colours.primaryBlue }} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Sign in as Startup</h3>
                                            <p className="text-sm text-gray-600">Perfect for entrepreneurs seeking funding and resources</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleRoleSelection('investor')}
                                >
                                    <div className="flex items-center">
                                        <div className="rounded-full p-2 mr-3" style={{ backgroundColor: '#e6f9ef' }}>
                                            <FaChartLine className="text-xl" style={{ color: '#10b981' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Sign in as Investor</h3>
                                            <p className="text-sm text-gray-600">Ideal for investors looking to discover promising startups</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default OAuthCallback;