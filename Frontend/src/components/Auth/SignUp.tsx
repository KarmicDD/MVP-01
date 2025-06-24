import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { colours } from '../../utils/colours';
import { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AuthErrorDisplay from './AuthErrorDisplay';
import { validateRegistration, sanitizeAndValidateInput } from '../../utils/validation';
import { validatePassword } from '../../utils/validation';

interface SignUpProps {
    setActiveView: (view: 'signIn') => void;
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

// Helper function to validate email format
const isValidEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const SignUp: React.FC<SignUpProps> = ({ setActiveView, selectedRole }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form validation states
    const [isNameTouched, setIsNameTouched] = useState(false);
    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Form validation checks
    const isNameValid = name.trim().length >= 2;
    const isEmailValid = isValidEmail(email);
    const isFormValid = isNameValid && isEmailValid && passwordStrength >= 2;

    const checkPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[0-9]/.test(pass)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
        setPasswordStrength(strength);
    }; const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Comprehensive validation using our security utilities
        const validationResult = validateRegistration({
            fullName: name,
            email: email,
            password: password,
            role: selectedRole || ''
        });

        if (!validationResult.isValid) {
            setError(validationResult.errors.map(err => err.message).join('. '));
            return;
        }

        if (!selectedRole) {
            setError('Please select a role first');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Sanitize input data before sending
            const sanitizedData = sanitizeAndValidateInput({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: selectedRole
            });

            // Register with email/password
            const response = await authService.register(sanitizedData);

            // Success animation before redirect
            setTimeout(() => {
                // Redirect based on user role
                if (response.user.role === 'startup') {
                    navigate('/dashboard');
                } else if (response.user.role === 'investor') {
                    navigate('/dashboard');
                }
            }, 1000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignup = (provider: string) => {
        // Store selected role in localStorage for potential later use
        if (selectedRole) {
            localStorage.setItem('selectedRole', selectedRole);
        }

        // Redirect to OAuth endpoint with role parameter
        const redirectUrl = `https://mvp-01.onrender.com/api/auth/${provider}` +
            (selectedRole ? `?role=${selectedRole}` : '');
        window.location.href = redirectUrl;
    };

    const getPasswordStrengthText = () => {
        if (password.length === 0) return "Password Required";
        if (passwordStrength === 0) return "Very Weak";
        if (passwordStrength === 1) return "Weak";
        if (passwordStrength === 2) return "Medium";
        if (passwordStrength === 3) return "Strong";
        return "Very Strong";
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return "#ef4444";
        if (passwordStrength === 1) return "#f97316";
        if (passwordStrength === 2) return "#eab308";
        if (passwordStrength === 3) return "#22c55e";
        return "#16a34a";
    };

    return (
        <div className="p-6">
            {error && (
                <AuthErrorDisplay
                    error={error}
                    type="signup"
                    onDismiss={() => setError('')}
                />
            )}

            <motion.form
                className="space-y-5"
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={itemVariants} className="space-y-1">
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FaUser />
                        </div>
                        <input
                            id="fullname"
                            type="text"
                            placeholder="John Doe"
                            className={`w-full px-10 py-3 border ${isNameTouched && !isNameValid
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } rounded-lg focus:outline-none focus:ring-1 transition-colors text-gray-800`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setIsNameTouched(true)}
                            required
                        />
                        {isNameTouched && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isNameValid ? (
                                    <FaCheck className="text-green-500" />
                                ) : (
                                    <FaTimes className="text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    {isNameTouched && !isNameValid && (
                        <motion.p
                            className="text-xs text-red-500 mt-1 pl-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                        >
                            Please enter a valid name (at least 2 characters)
                        </motion.p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FaEnvelope />
                        </div>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            className={`w-full px-10 py-3 border ${isEmailTouched && !isEmailValid
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                } rounded-lg focus:outline-none focus:ring-1 transition-colors text-gray-800`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setIsEmailTouched(true)}
                            required
                        />
                        {isEmailTouched && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isEmailValid ? (
                                    <FaCheck className="text-green-500" />
                                ) : (
                                    <FaTimes className="text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    {isEmailTouched && !isEmailValid && (
                        <motion.p
                            className="text-xs text-red-500 mt-1 pl-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                        >
                            Please enter a valid email address
                        </motion.p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FaLock />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-gray-800"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                checkPasswordStrength(e.target.value);
                            }}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {password && (
                        <motion.div
                            className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium">Password Strength:</span>
                                <span
                                    className="font-medium px-2 py-0.5 rounded-full text-xs"
                                    style={{
                                        color: 'white',
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                >
                                    {getPasswordStrengthText()}
                                </span>
                            </div>

                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full"
                                    style={{
                                        width: `${(passwordStrength / 4) * 100}%`,
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                                    {password.length >= 8 ? <FaCheck /> : <FaTimes />}
                                    <span>8+ characters</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {/[A-Z]/.test(password) ? <FaCheck /> : <FaTimes />}
                                    <span>Uppercase letter</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {/[0-9]/.test(password) ? <FaCheck /> : <FaTimes />}
                                    <span>Number</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {/[^A-Za-z0-9]/.test(password) ? <FaCheck /> : <FaTimes />}
                                    <span>Special character</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    className="pt-2"
                    variants={itemVariants}
                >
                    <motion.button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-lg text-white font-medium shadow-md flex items-center justify-center"
                        style={{
                            backgroundColor: isFormValid ? colours.primaryBlue : '#9CA3AF',
                            opacity: isFormValid ? 1 : 0.8
                        }}
                        disabled={loading || !isFormValid}
                        whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                        whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <motion.div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <span className="ml-2">Creating Account...</span>
                            </div>
                        ) : (
                            <span>Create {selectedRole === 'startup' ? 'Startup' : 'Investor'} Account</span>
                        )}
                    </motion.button>
                </motion.div>
            </motion.form>

            <motion.div
                className="my-6 flex items-center justify-center"
                variants={itemVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
            >
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="mx-4 text-gray-500 text-sm font-medium">or sign up with</div>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 gap-4"
                variants={formVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.7 }}
            >
                <motion.button
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 bg-white shadow-sm rounded-lg hover:shadow-md transition-all duration-300"
                    onClick={() => handleOAuthSignup('google')}
                    disabled={loading}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                >
                    <FcGoogle className="mr-2 text-xl" />
                    <span className="font-medium">Google</span>
                </motion.button>

                <motion.button
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 bg-white shadow-sm rounded-lg hover:shadow-md transition-all duration-300"
                    onClick={() => handleOAuthSignup('linkedin')}
                    disabled={loading}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                >
                    <FaLinkedin className="mr-2 text-xl text-blue-700" />
                    <span className="font-medium">LinkedIn</span>
                </motion.button>
            </motion.div>

            <motion.div
                className="mt-8 py-4 border-t border-gray-100 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                <p className="text-gray-600 mb-2">Already have an account?</p>
                <motion.button
                    className="text-primaryBlue font-medium inline-flex items-center hover:underline"
                    onClick={() => setActiveView('signIn')}
                    style={{ color: colours.primaryBlue }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Sign in to your account
                </motion.button>
            </motion.div>
        </div>
    );
};

export default SignUp;