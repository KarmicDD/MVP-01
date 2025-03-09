import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, HelpCircle, LogOut } from 'lucide-react';

interface AppHeaderProps {
    onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onLogout }) => {
    return (
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center text-blue-600 font-bold text-xl">
                        <Rocket size={20} className="mr-2" />
                        VentureMatch
                    </div>
                </motion.div>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
                    <HelpCircle size={16} className="mr-1" />
                    Help
                </button>
                <button
                    className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
                    onClick={onLogout}
                >
                    <LogOut size={16} className="mr-1" />
                    Exit
                </button>
            </div>
        </header>
    );
};

export default AppHeader;