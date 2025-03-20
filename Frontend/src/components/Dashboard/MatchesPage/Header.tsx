import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, StartupProfile, InvestorProfile } from '../../../types/Dashboard.types';
import { colours } from '../../../utils/colours';
import { FiUser, FiBell, FiChevronDown, FiSettings, FiLogOut, FiGrid, FiBarChart2, FiMessageCircle, FiCalendar } from 'react-icons/fi';
import { Logo } from '../../Auth/Logo';
import { profileService } from '../../../services/api';

interface HeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
    userProfile: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, handleLogout, userProfile }) => {
    const role = userProfile?.role || 'startup';
    const [, setProfileCompleteFromAPI] = useState<boolean | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications, setNotifications] = useState<{ id: number, text: string, read: boolean }[]>([
        { id: 1, text: "New match available!", read: false },
        { id: 2, text: "Profile 85% complete", read: false }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const [profileData, setProfileData] = useState<StartupProfile | InvestorProfile | null>(null);
    const [, setLoading] = useState(false);


    // Role-specific styling
    const primaryColor = role === 'startup' ? colours.primaryBlue : '#16a34a';
    const hoverBgColor = role === 'startup' ? 'hover:bg-blue-50' : 'hover:bg-green-50';
    const activeTextColor = role === 'startup' ? 'text-blue-600' : 'text-green-600';
    const activeBgColor = role === 'startup' ? 'bg-blue-50' : 'bg-green-50';
    const primaryBgColor = role === 'startup' ? 'bg-blue-600' : 'bg-green-600';

    // Fetch profile data based on user role
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userProfile || !role) return;

            setLoading(true);
            try {
                // 1. Fetch the profile data using the service
                const profileDataResponse = role === 'startup'
                    ? await profileService.getStartupProfile()
                    : await profileService.getInvestorProfile();

                setProfileData(profileDataResponse);

                // 2. Check profile completeness from API
                const profileCompleteness = await profileService.checkProfileCompleteness();

                // 3. Store the API's assessment of profile completeness
                setProfileCompleteFromAPI(profileCompleteness.isComplete);

                // 4. Update notifications based on profile completeness
                if (!profileCompleteness.isComplete) {
                    // Determine missing fields manually since the API doesn't provide them
                    const missingFields = getMissingProfileFields(profileDataResponse, role);

                    if (missingFields.length > 0) {
                        // Create a detailed notification about missing fields
                        setNotifications(prev => {
                            // Remove any existing profile completion notifications
                            const filteredNotifications = prev.filter(n =>
                                !n.text.includes("Complete your profile") &&
                                !n.text.includes("missing")
                            );

                            // Add the new notification with specific missing fields
                            return [...filteredNotifications, {
                                id: Date.now(),
                                text: `Complete your profile: ${missingFields.join(', ')} missing`,
                                read: false
                            }];
                        });
                    } else {
                        // Create a general notification if specific fields aren't identified
                        setNotifications(prev => {
                            // Check if we already have a profile completion notification
                            const hasProfileNotification = prev.some(n =>
                                n.text.includes("Complete your profile")
                            );

                            if (hasProfileNotification) return prev;

                            return [...prev, {
                                id: Date.now(),
                                text: `Complete your profile to improve matches`,
                                read: false
                            }];
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                // Show error notification
                setNotifications(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: "Failed to load profile data. Please try again later.",
                        read: false
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userProfile, role]);

    const getMissingProfileFields = (profileData: StartupProfile | InvestorProfile | null, role: string): string[] => {
        if (!profileData) return [];

        // Debug - log the actual profile data structure
        console.log("Profile data structure:", JSON.stringify(profileData, null, 2));

        let missingFields: string[] = [];

        if (role === 'startup') {
            const requiredFields = [
                { key: 'companyName', label: 'Company name' },      // Changed from company_name to companyName
                { key: 'industry', label: 'Industry' },
                { key: 'fundingStage', label: 'Funding stage' },    // Changed from funding_stage to fundingStage
                { key: 'employeeCount', label: 'Employee count' },  // Changed from employee_count to employeeCount
                { key: 'location', label: 'Location' },
                { key: 'pitch', label: 'Pitch' }
            ];

            missingFields = requiredFields
                .filter(field => !(profileData as any)[field.key])
                .map(field => field.label);
        } else {
            const requiredFields = [
                { key: 'industriesOfInterest', label: 'Industries of interest' },  // Changed from industries_of_interest to industriesOfInterest
                { key: 'preferredStages', label: 'Preferred stages' },            // Changed from preferred_stages to preferredStages
                { key: 'ticketSize', label: 'Ticket size' },                      // Changed from ticket_size to ticketSize
                { key: 'investmentCriteria', label: 'Investment criteria' },      // Changed from investment_criteria to investmentCriteria
                { key: 'pastInvestments', label: 'Past investments' }             // Changed from past_investments to pastInvestments
            ];

            missingFields = requiredFields.filter(field => {
                const value = (profileData as any)[field.key];
                return Array.isArray(value) ? value.length === 0 : !value;
            }).map(field => field.label);
        }

        return missingFields;
    };

    // Replace the getProfileCompleteness function with this corrected version
    const getProfileCompleteness = () => {
        // Skip DOM element check as it doesn't exist

        // If no profile data, return 0
        if (!profileData) return 0;

        let totalFields = 0;
        let completedFields = 0;

        if (role === 'startup') {
            // Updated property names to match API camelCase
            const fields = ['companyName', 'industry', 'fundingStage', 'employeeCount', 'location', 'pitch'];
            totalFields = fields.length;
            completedFields = fields.filter(field =>
                !!(profileData as any)[field]
            ).length;
        } else {
            // Updated property names to match API camelCase
            const fields = ['industriesOfInterest', 'preferredStages', 'ticketSize', 'investmentCriteria', 'pastInvestments'];
            totalFields = fields.length;
            completedFields = fields.filter(field => {
                const value = (profileData as any)[field];
                return Array.isArray(value) ? value.length > 0 : !!value;
            }).length;
        }

        // Debug logging
        console.log(`Profile completeness: ${completedFields}/${totalFields} fields completed`);

        return Math.round((completedFields / totalFields) * 100);
    };

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProfileMenu || showNotifications) {
                const target = event.target as HTMLElement;
                if (!target.closest('.profile-menu') && !target.closest('.notification-menu')) {
                    setShowProfileMenu(false);
                    setShowNotifications(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu, showNotifications]);

    // Handle notifications click
    const handleNotificationClick = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const tabs = [
        { id: 'matches', label: 'Matches', icon: <FiGrid />, disabled: false },
        { id: 'analytics', label: 'Analytics', icon: <FiBarChart2 />, disabled: false },
        { id: 'messages', label: 'Messages', icon: <FiMessageCircle />, disabled: true },
        { id: 'calendar', label: 'Calendar', icon: <FiCalendar />, disabled: true },
    ];

    // Get display name for profile menu
    const getDisplayName = () => {
        if (role === 'startup' && profileData) {
            return (profileData as any).companyName || userProfile?.email; // Changed from company_name
        } else if (role === 'investor' && profileData) {
            return (profileData as any).companyName || userProfile?.email; // Changed from company_name
        }
        return userProfile?.email;
    };

    const profileCompleteness = getProfileCompleteness();

    return (
        <motion.header
            className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 25 }} // Smoother animation
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Logo Title={role === 'startup' ? "StartupMatch" : "InvestorMatch"} />
                        <motion.div
                            className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${primaryBgColor} text-white`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </motion.div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <nav className="hidden lg:flex">
                        <div className="bg-gray-100 rounded-xl p-1.5 flex">
                            {tabs.map(tab => (
                                <motion.button
                                    key={tab.id}
                                    className={`relative px-5 py-2.5 font-medium text-sm rounded-lg transition-colors mx-1
                                        ${tab.disabled ? 'text-gray-400 cursor-not-allowed' :
                                            activeTab === tab.id ?
                                                `${activeTextColor} ${activeBgColor}` :
                                                `text-gray-600 ${hoverBgColor}`}`}
                                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                    whileHover={!tab.disabled ? { scale: 1.03 } : {}}
                                    whileTap={!tab.disabled ? { scale: 0.98 } : {}}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <div className="flex items-center justify-center">
                                        <span className="mr-1.5">{tab.icon}</span>
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded"
                                            style={{ backgroundColor: primaryColor }}
                                            layoutId="underline"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </nav>

                    {/* User Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Notifications */}
                        <div className="relative notification-menu">
                            <motion.button
                                className={`p-2 rounded-full relative ${hoverBgColor}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowProfileMenu(false);
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                <FiBell size={20} />
                                {unreadCount > 0 && (
                                    <motion.div
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                                        style={{ backgroundColor: role === 'startup' ? '#3b82f6' : '#16a34a' }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        {unreadCount}
                                    </motion.div>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    >
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-medium text-gray-800">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    className="text-xs hover:underline text-gray-600"
                                                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-5 text-center text-gray-500">
                                                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                                        <FiBell className="text-gray-400" size={20} />
                                                    </div>
                                                    <p>No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <motion.div
                                                        key={notification.id}
                                                        className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start ${!notification.read ? 'bg-gray-50' : ''}`}
                                                        onClick={() => handleNotificationClick(notification.id)}
                                                        whileHover={{ x: 2 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                    >
                                                        <div
                                                            className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${!notification.read ? (role === 'startup' ? 'bg-blue-500' : 'bg-green-500') : 'bg-transparent'}`}
                                                        />
                                                        <div className="text-sm text-gray-700">{notification.text}</div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-gray-100 text-center">
                                            <button className="text-xs text-gray-500 hover:underline">View all notifications</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Settings */}
                        <motion.button
                            className={`p-2 rounded-full ${hoverBgColor} hidden sm:flex`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <FiSettings size={20} />
                        </motion.button>

                        {/* User Profile */}
                        <div className="relative profile-menu">
                            <motion.button
                                className="flex items-center space-x-1"
                                onClick={() => {
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowNotifications(false);
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                <motion.div
                                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold relative overflow-hidden"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                    style={{
                                        background: role === 'startup' ?
                                            'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' :
                                            'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
                                    }}
                                >
                                    {getDisplayName()?.charAt(0).toUpperCase() || 'U'}
                                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity" />
                                </motion.div>
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: showProfileMenu ? 180 : 0 }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                >
                                    <FiChevronDown className="text-gray-500" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    >
                                        <div className="border-b border-gray-100 p-4">
                                            <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                                            <p className="text-xs text-gray-500 mt-1">{userProfile?.email}</p>
                                            <div className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${primaryBgColor} text-white`}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)} Account
                                            </div>

                                            {/* Profile Completeness */}
                                            {profileData && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-medium">Profile Completion</span>
                                                        <span className={profileCompleteness === 100 ? "font-bold" : ""}>
                                                            {profileCompleteness}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            className="h-2 rounded-full"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: `${profileCompleteness}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            style={{
                                                                backgroundColor: role === 'startup' ? '#3b82f6' : '#16a34a'
                                                            }}
                                                        />
                                                    </div>
                                                    {profileCompleteness < 100 && (
                                                        <p className="text-xs mt-1 text-gray-500">
                                                            Complete your profile to improve matches
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="py-1">
                                            <motion.a
                                                href="#profile"
                                                className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50"
                                                whileHover={{ x: 3 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            >
                                                <FiUser className="mr-2.5 text-gray-500" />
                                                <span>My Profile</span>
                                            </motion.a>
                                            <motion.a
                                                href="#settings"
                                                className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50"
                                                whileHover={{ x: 3 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            >
                                                <FiSettings className="mr-2.5 text-gray-500" />
                                                <span>Settings & Privacy</span>
                                            </motion.a>
                                            <motion.button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600"
                                                whileHover={{ x: 3, backgroundColor: "#FEF2F2" }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            >
                                                <FiLogOut className="mr-2.5" />
                                                <span>Logout</span>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="lg:hidden mt-4">
                    <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-xl p-1.5">
                        {tabs.map(tab => (
                            <motion.button
                                key={tab.id}
                                className={`relative py-2 text-xs font-medium rounded-lg transition-colors flex flex-col items-center
                                    ${tab.disabled ? 'text-gray-400 cursor-not-allowed' :
                                        activeTab === tab.id ?
                                            `${activeTextColor} ${activeBgColor}` :
                                            `text-gray-600 ${hoverBgColor}`}`}
                                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                whileTap={!tab.disabled ? { scale: 0.96 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                <div className="mb-0.5">{tab.icon}</div>
                                <div className="text-[10px]">{tab.label}</div>

                                {activeTab === tab.id && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded"
                                        style={{ backgroundColor: primaryColor }}
                                        layoutId="mobileUnderline"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;