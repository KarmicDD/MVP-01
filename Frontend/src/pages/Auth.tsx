import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RoleSelection from '../components/Auth/RoleSelector';
import SignUp from '../components/Auth/SignUp';
import SignIn from '../components/Auth/SignIn';
import { Logo } from '../components/Auth/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const AuthPage: React.FC = () => {
    const [activeView, setActiveView] = useState<'chooseRole' | 'signIn' | 'createAccount'>('chooseRole');
    const [selectedRole, setSelectedRole] = useState<'startup' | 'investor' | null>(null);
    const [pageTitle, setPageTitle] = useState<string>('Choose Your Role');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    useEffect(() => {
        // Update page title based on active view
        switch (activeView) {
            case 'chooseRole':
                setPageTitle('Choose Your Role');
                break;
            case 'signIn':
                setPageTitle(`Sign In as ${selectedRole === 'startup' ? 'Startup' : 'Investor'}`);
                break;
            case 'createAccount':
                setPageTitle(`Create ${selectedRole === 'startup' ? 'Startup' : 'Investor'} Account`);
                break;
        }

        // Scroll to top when view changes
        window.scrollTo(0, 0);
    }, [activeView, selectedRole]);

    const handleRoleSelection = (role: 'startup' | 'investor') => {
        setSelectedRole(role);
        setActiveView('signIn');
    };

    const handleBackNavigation = () => {
        if (activeView === 'signIn') {
            setActiveView('chooseRole');
            setSelectedRole(null);
        } else if (activeView === 'createAccount') {
            setActiveView('signIn');
        } else {
            navigate(from);
        }
    };

    const renderView = () => {
        switch (activeView) {
            case 'chooseRole':
                return <RoleSelection handleRoleSelection={handleRoleSelection} />;
            case 'signIn':
                return (
                    <SignIn
                        setActiveView={setActiveView}
                        setSelectedRole={setSelectedRole}
                        selectedRole={selectedRole}
                    />
                );
            case 'createAccount':
                return (
                    <SignUp
                        setActiveView={setActiveView}
                        selectedRole={selectedRole}
                    />
                );
            default:
                return <RoleSelection handleRoleSelection={handleRoleSelection} />;
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-md relative">
                {/* Logo Section (stays fixed) */}
                <Logo Title="KarmicDD" />

                {/* Auth Card with absolute back button */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 relative"
                    whileHover={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Back button - absolute positioned to not displace content */}
                    <motion.button
                        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 flex items-center text-sm z-10"
                        onClick={handleBackNavigation}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <FaArrowLeft className="mr-1" size={14} />
                        <span>{activeView === 'chooseRole' ? 'Home' : 'Back'}</span>
                    </motion.button>

                    <div className="pt-6 pb-4 px-6 border-b border-gray-100 flex justify-center">
                        <motion.h2
                            className="text-xl font-bold"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            key={pageTitle}
                        >
                            {pageTitle}
                        </motion.h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Bottom text */}
                <motion.p
                    className="text-center text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5 }}
                >
                    © {new Date().getFullYear()} KarmicDD. All rights reserved.
                </motion.p>
            </div>
        </motion.div>
    );
};

export default AuthPage;