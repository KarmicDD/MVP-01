import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaChartLine } from "react-icons/fa";
import { colours } from '../../utils/colours';

interface RoleSelectionProps {
    handleRoleSelection: (role: 'startup' | 'investor') => void;
}

const roleCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: custom * 0.2
        }
    }),
    hover: {
        scale: 1.03,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        y: -5,
        transition: { duration: 0.3 }
    },
    tap: {
        scale: 0.97
    }
};

const RoleSelection: React.FC<RoleSelectionProps> = ({ handleRoleSelection }) => {
    return (
        <div className="p-8">
            <motion.p
                className="text-center text-gray-600 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Select your role to continue to your personalized dashboard
            </motion.p>

            <div className="space-y-5">
                <motion.div
                    className="border border-gray-100 rounded-xl p-6 cursor-pointer transition-shadow bg-white hover:bg-blue-50"
                    onClick={() => handleRoleSelection('startup')}
                    variants={roleCardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    custom={0}
                >
                    <div className="flex items-center">
                        <div className="rounded-full p-4 mr-5" style={{ background: 'linear-gradient(135deg, #e6edff 0%, #d4e0ff 100%)' }}>
                            <FaRocket className="text-2xl" style={{ color: colours.primaryBlue }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Startup</h3>
                            <p className="text-gray-600">Perfect for entrepreneurs seeking funding and resources</p>
                        </div>
                    </div>
                    <motion.div
                        className="w-0 h-0.5 mt-4 rounded-full"
                        style={{ background: `linear-gradient(to right, ${colours.primaryBlue}, #a5b4fc)` }}
                        whileHover={{ width: "100%", transition: { duration: 0.3 } }}
                    />
                </motion.div>

                <motion.div
                    className="border border-gray-100 rounded-xl p-6 cursor-pointer transition-shadow bg-white hover:bg-green-50"
                    onClick={() => handleRoleSelection('investor')}
                    variants={roleCardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    custom={1}
                >
                    <div className="flex items-center">
                        <div className="rounded-full p-4 mr-5" style={{ background: 'linear-gradient(135deg, #e6f9ef 0%, #d1f2e4 100%)' }}>
                            <FaChartLine className="text-2xl" style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Investor</h3>
                            <p className="text-gray-600">Ideal for investors looking to discover promising startups</p>
                        </div>
                    </div>
                    <motion.div
                        className="w-0 h-0.5 mt-4 rounded-full"
                        style={{ background: 'linear-gradient(to right, #10b981, #6ee7b7)' }}
                        whileHover={{ width: "100%", transition: { duration: 0.3 } }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default RoleSelection;