import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { colours } from '../../utils/colours';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

interface SignInProps {
    setActiveView: (view: 'signIn' | 'createAccount' | 'chooseRole') => void;
    // setSelectedRole: (role: 'startup' | 'investor' | null) => void;
    selectedRole: 'startup' | 'investor' | null;
}

const formVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
};

const buttonVariants = {
    hover: {
        scale: 1.03,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 }
    },
    tap: { scale: 0.97 }
};

const SignIn: React.FC<SignInProps> = ({ setActiveView, selectedRole }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    console.log('selectedRole:', selectedRole);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            setError('Please select a role first');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // Show success state briefly before redirect
            setTimeout(() => setShowSuccess(true), 400);

            // Login with email/password
            const response = await authService.login({
                email,
                password,
                role: selectedRole
            });

            // Show success message before redirect
            setTimeout(() => {
                // Redirect based on user role
                if (response.user.role === 'startup') {
                    navigate('/dashboard');
                } else if (response.user.role === 'investor') {
                    navigate('/dashboard');
                }
            }, 800);

        } catch (err: Error | unknown) {
            setShowSuccess(false);
            setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider: string) => {
        // Redirect to OAuth endpoint
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };

    return (
        <div className="p-8">
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FaLock className="mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.form
                className="space-y-5"
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={itemVariants} className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        style={{ backgroundColor: colours.formBackground }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || showSuccess}
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaLock />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        style={{ backgroundColor: colours.formBackground }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || showSuccess}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || showSuccess}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end">
                    <button
                        type="button"
                        className="text-sm text-blue-500 hover:text-blue-700 hover:underline font-medium"
                        disabled={loading || showSuccess}
                    >
                        Forgot Password?
                    </button>
                </motion.div>

                <motion.button
                    type="submit"
                    className="w-full py-3.5 rounded-lg text-white font-medium relative overflow-hidden"
                    style={{
                        backgroundColor: showSuccess ? '#10b981' : colours.primaryBlue,
                        boxShadow: "0 4px 12px rgba(62, 96, 233, 0.25)"
                    }}
                    disabled={loading || showSuccess}
                    variants={itemVariants}
                    whileHover={buttonVariants.hover}
                    whileTap={buttonVariants.tap}
                    transition={{ duration: 0.2 }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <motion.div
                                className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                            Signing In...
                        </div>
                    ) : showSuccess ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Success!
                        </motion.div>
                    ) : 'Sign In'}
                </motion.button>
            </motion.form>

            <motion.div
                className="my-6 flex items-center justify-center"
                variants={itemVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
            >
                <div className="flex-grow border-t border-gray-200"></div>
                <div className="mx-4 text-gray-500 text-sm">or continue with</div>
                <div className="flex-grow border-t border-gray-200"></div>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 gap-4"
                variants={formVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.7 }}
            >
                <motion.button
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={loading || showSuccess}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                >
                    <FcGoogle className="mr-2 text-xl" />
                    Google
                </motion.button>

                <motion.button
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => handleOAuthLogin('linkedin')}
                    disabled={loading || showSuccess}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                >
                    <FaLinkedin className="mr-2 text-xl text-blue-700" />
                    LinkedIn
                </motion.button>
            </motion.div>

            <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                <p className="text-gray-600 mb-2">Don't have an account?</p>
                <motion.button
                    className="text-blue-500 font-medium hover:text-blue-700 hover:underline"
                    onClick={() => setActiveView('createAccount')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || showSuccess}
                >
                    Create New Account
                </motion.button>
            </motion.div>
        </div>
    );
};

export default SignIn;