// ../src/components/Auth/RoleSelector.tsx
import React from 'react';
import { FaRocket, FaChartLine } from "react-icons/fa";
import { colours } from '../../utils/colours';

interface RoleSelectionProps {
    handleRoleSelection: (role: 'startup' | 'investor') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ handleRoleSelection }) => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-center mb-6">Choose Your Role</h2>
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
                            <p className="text-sm text-gray-600">Perfect for entrepreneurs seeking funding and resources to grow their business</p>
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
                            <p className="text-sm text-gray-600">Ideal for investors looking to discover and fund promising startups</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default RoleSelection;
