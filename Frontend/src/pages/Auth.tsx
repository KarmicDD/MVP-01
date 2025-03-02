// ..src/pages/Auth.tsx
import React, { useState } from 'react';
import { colours } from '../utils/colours';
import RoleSelection from '../components/Auth/RoleSelector';
import SignIn from '../components/Auth/Sigin';
import SignUp from '../components/Auth/SignUp';

const AuthPage: React.FC = () => {
    const [activeView, setActiveView] = useState<'chooseRole' | 'signIn' | 'createAccount'>('chooseRole');
    const [selectedRole, setSelectedRole] = useState<'startup' | 'investor' | null>(null);

    const handleRoleSelection = (role: 'startup' | 'investor') => {
        setSelectedRole(role);
        setActiveView('signIn');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: colours.mainBackground }}>
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: colours.primaryBlue }}>KarmicDD</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    {activeView === 'chooseRole' && (
                        <RoleSelection handleRoleSelection={handleRoleSelection} />
                    )}
                    {activeView === 'signIn' && (
                        <SignIn setActiveView={setActiveView} setSelectedRole={setSelectedRole} />
                    )}
                    {activeView === 'createAccount' && (
                        <SignUp setActiveView={setActiveView} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
