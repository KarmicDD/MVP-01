// ../src/components/Auth/SignIn.tsx
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { colours } from '../../utils/colours';

interface SignInProps {
    setActiveView: (view: 'signIn' | 'createAccount' | 'chooseRole') => void;
    setSelectedRole: (role: null) => void;
}

const SignIn: React.FC<SignInProps> = ({ setActiveView, setSelectedRole }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Sign In</h2>
            <form className="space-y-4">
                <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded-md" />
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password"
                        className="w-full px-3 py-2 border rounded-md" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <button type="submit" className="w-full py-2 rounded-md text-white" style={{ backgroundColor: colours.primaryBlue }}>
                    Sign In
                </button>
            </form>

            <div className="my-4 text-center">or continue with</div>
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors duration-300">
                    <FcGoogle className="mr-2" />
                    Google
                </button>

                <button className="flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors duration-300">
                    <FaLinkedin className="mr-2 text-blue-700" />
                    LinkedIn
                </button>
            </div>

            <div className="mt-6 text-center">
                <button className="text-blue-500 hover:underline" onClick={() => setActiveView('createAccount')}>
                    Create New Account
                </button>
            </div>
            <div className="mt-4 text-center">
                <button className="text-sm text-gray-500 hover:underline" onClick={() => {
                    setActiveView('chooseRole');
                    setSelectedRole(null);
                }}>
                    Back to role selection
                </button>
            </div>
        </div>
    );
};

export default SignIn;
