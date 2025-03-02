// ../src/components/Auth/SignIn.tsx
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { colours } from '../../utils/colours';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

interface SignInProps {
    setActiveView: (view: 'signIn' | 'createAccount' | 'chooseRole') => void;
    setSelectedRole: (role: 'startup' | 'investor' | null) => void;
    selectedRole: 'startup' | 'investor' | null;
}

const SignIn: React.FC<SignInProps> = ({ setActiveView, setSelectedRole, selectedRole }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            setError('Please select a role first');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // Login with email/password
            const response = await authService.login({
                email,
                password,
                role: selectedRole
            });

            // Redirect based on user role
            if (response.user.role === 'startup') {
                navigate('/startup/dashboard');
            } else if (response.user.role === 'investor') {
                navigate('/investor/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider: string) => {
        // Redirect to OAuth endpoint with hardcoded URL
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Sign In</h2>
            {error && <div className="mb-4 text-red-500">{error}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-2 border rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full px-3 py-2 border rounded-md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 rounded-md text-white"
                    style={{ backgroundColor: colours.primaryBlue }}
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="my-4 text-center">or continue with</div>
            <div className="grid grid-cols-2 gap-4">
                <button
                    className="flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading}
                >
                    <FcGoogle className="mr-2" />
                    Google
                </button>

                <button
                    className="flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => handleOAuthLogin('linkedin')}
                    disabled={loading}
                >
                    <FaLinkedin className="mr-2 text-blue-700" />
                    LinkedIn
                </button>
            </div>

            <div className="mt-6 text-center">
                <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setActiveView('createAccount')}
                >
                    Create New Account
                </button>
            </div>
            <div className="mt-4 text-center">
                <button
                    className="text-sm text-gray-500 hover:underline"
                    onClick={() => {
                        setActiveView('chooseRole');
                        setSelectedRole(null);
                    }}
                >
                    Back to role selection
                </button>
            </div>
        </div>
    );
};

export default SignIn;