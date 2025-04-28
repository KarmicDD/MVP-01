import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLink, FiUsers, FiBriefcase, FiInfo, FiFile, FiAlertCircle } from 'react-icons/fi';
import { profileService } from '../services/api';
import { StartupProfile, InvestorProfile } from '../types/Dashboard.types';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/Loading';
import { colours } from '../utils/colours';
import EnhancedProfileCompleteness from '../components/Profile/EnhancedProfileCompleteness';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileContent from '../components/Profile/ProfileContent';

const ProfileByUsername: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [extendedData, setExtendedData] = useState<any>({
        socialLinks: [],
        teamMembers: [],
        investmentHistory: []
    });
    const [userType, setUserType] = useState<'startup' | 'investor' | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const fetchProfileByUsername = async () => {
            if (!username) {
                setError('Invalid username');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log(`Fetching profile for username: ${username}`);

                // Try to fetch the profile by username
                const response = await profileService.getProfileByUsername(username);
                console.log('Profile response:', response);

                if (response && response.profile) {
                    setProfileData(response.profile);
                    setExtendedData(response.extendedProfile || {
                        socialLinks: [],
                        teamMembers: [],
                        investmentHistory: []
                    });
                    setUserType(response.userType);
                    setFormData(response.profile);
                } else {
                    throw new Error('Profile data is incomplete or missing');
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile by username:', error);

                // Provide a more helpful error message
                setError(
                    `Profile not found. The company name "${decodeURIComponent(username)}" ` +
                    `could not be found in our system. Please check the spelling or try using the profile ID instead.`
                );
                setLoading(false);
            }
        };

        fetchProfileByUsername();
    }, [username]);

    // Define tabs based on user type
    const getTabs = () => {
        const commonTabs = [
            { id: 'profile', label: 'Profile', icon: <FiUser /> },
            { id: 'social', label: 'Social & Links', icon: <FiLink /> },
            { id: 'documents', label: 'Documents', icon: <FiFile /> }
        ];

        if (userType === 'startup') {
            return [
                ...commonTabs,
                { id: 'team', label: 'Team', icon: <FiUsers /> }
            ];
        } else {
            return [
                ...commonTabs,
                { id: 'investments', label: 'Investments', icon: <FiBriefcase /> }
            ];
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <motion.div
                    className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center">
                        <motion.div
                            className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <FiAlertCircle className="text-red-500 text-2xl" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                The profile you're looking for might be private or may not exist.
                                Try searching for the company in the dashboard instead.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <motion.button
                                    onClick={() => navigate('/')}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Go to Home
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Go to Dashboard
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <motion.button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FiArrowLeft className="mr-2" />
                    <span>Back</span>
                </motion.button>

                {profileData && (
                    <>
                        {/* Profile Header */}
                        <ProfileHeader
                            userType={userType}
                            profileData={profileData}
                            isEditing={false}
                            onEditToggle={() => { }}
                            onCancelEdit={() => { }}
                            isViewOnly={true}
                            isOwnProfile={false}
                        />

                        {/* Profile Content */}
                        <ProfileContent
                            activeTab={activeTab}
                            tabs={getTabs()}
                            onTabChange={setActiveTab}
                            userType={userType}
                            formData={formData}
                            isEditing={false}
                            saving={false}
                            extendedData={extendedData}
                            handleInputChange={() => { }}
                            handleMultiSelect={() => { }}
                            handleSocialLinkChange={() => { }}
                            handleAddSocialLink={() => { }}
                            handleRemoveSocialLink={() => { }}
                            handleTeamMemberChange={() => { }}
                            handleAddTeamMember={() => { }}
                            handleRemoveTeamMember={() => { }}
                            handleInvestmentChange={() => { }}
                            handleAddInvestment={() => { }}
                            handleRemoveInvestment={() => { }}
                            handleSave={() => { }}
                            isViewOnly={true}
                        />

                        {/* Enhanced Profile completeness indicator */}
                        {profileData && (
                            <motion.div
                                className="mt-4 sm:mt-6 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 p-4 sm:p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <h3 className={`text-base sm:text-lg font-medium text-${colours.indigo600} mb-3 sm:mb-4 flex items-center`}>
                                    <FiInfo className="mr-1 sm:mr-2" />
                                    Profile Completeness
                                </h3>
                                <EnhancedProfileCompleteness
                                    profile={profileData}
                                    userType={userType}
                                    socialLinks={extendedData.socialLinks}
                                    teamMembers={extendedData.teamMembers}
                                    investmentHistory={extendedData.investmentHistory}
                                />
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileByUsername;
