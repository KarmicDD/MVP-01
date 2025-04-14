import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLink, FiUsers, FiBriefcase, FiInfo, FiFile } from 'react-icons/fi';
import { profileService } from '../services/api';
import { StartupProfile, InvestorProfile } from '../types/Dashboard.types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/Loading';
import { colours } from '../utils/colours';
import EnhancedProfileCompleteness from '../components/Profile/EnhancedProfileCompleteness';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileContent from '../components/Profile/ProfileContent';

// Define interfaces for new profile data
interface SocialLink {
    platform: string;
    url: string;
}

interface TeamMember {
    name: string;
    role: string;
    bio?: string;
}

interface Investment {
    companyName: string;
    amount?: string;
    date?: string;
    stage?: string;
    outcome?: string;
}

interface ExtendedProfileData {
    avatar?: File | null;
    avatarUrl?: string;
    socialLinks: SocialLink[];
    teamMembers?: TeamMember[];
    investmentHistory?: Investment[];
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<'startup' | 'investor' | null>(null);
    const [profileData, setProfileData] = useState<StartupProfile | InvestorProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('profile');

    // Extended profile data
    const [extendedData, setExtendedData] = useState<ExtendedProfileData>({
        avatar: null,
        avatarUrl: '',
        socialLinks: [],
        teamMembers: [],
        investmentHistory: []
    });

    // Form state
    const [formData, setFormData] = useState<any>({});

    // In ProfilePage.tsx, update the useEffect to call the right endpoints:

    // Update the fetchUserData function inside useEffect to correctly handle API responses

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setError(null);

                // Fetch user type from the correct endpoint
                const userResponse = await profileService.getUserProfile();

                // Note: userResponse directly contains userId, email, role
                const role = userResponse.role as 'startup' | 'investor';

                setUserType(role);

                // Fetch profile data based on role
                let profileResponse;
                if (role === 'startup') {
                    profileResponse = await profileService.getStartupProfile();
                    console.log('Startup profile response:', profileResponse);
                } else if (role === 'investor') {
                    profileResponse = await profileService.getInvestorProfile();
                    console.log('Investor profile response:', profileResponse);
                }

                if (profileResponse) {
                    // Check if profile exists in the response
                    if (profileResponse.profile) {
                        console.log('Setting profile data:', profileResponse.profile);
                        setProfileData(profileResponse.profile);
                        setFormData(profileResponse.profile);
                    } else {
                        console.warn('No profile data found in response');
                        // Initialize with defaults if no profile exists
                        const defaultProfile = role === 'startup'
                            ? { companyName: '', industry: '', fundingStage: '', employeeCount: '', location: '', pitch: '' }
                            : { companyName: '', industriesOfInterest: [], preferredStages: [], ticketSize: '', investmentCriteria: [], pastInvestments: '' };

                        setFormData(defaultProfile);
                    }

                    // Set extended profile data if available
                    if (profileResponse.extendedProfile) {
                        console.log('Setting extended profile data:', profileResponse.extendedProfile);
                        setExtendedData({
                            avatar: null,
                            avatarUrl: profileResponse.extendedProfile.avatarUrl || '',
                            socialLinks: profileResponse.extendedProfile.socialLinks || [],
                            teamMembers: profileResponse.extendedProfile.teamMembers || [],
                            investmentHistory: profileResponse.extendedProfile.investmentHistory || []
                        });
                    } else {
                        console.warn('No extended profile data found in response');
                    }
                } else {
                    console.warn('No profile response received');
                    // Initialize with defaults if no profile response
                    const defaultProfile = role === 'startup'
                        ? { companyName: '', industry: '', fundingStage: '', employeeCount: '', location: '', pitch: '' }
                        : { companyName: '', industriesOfInterest: [], preferredStages: [], ticketSize: '', investmentCriteria: [], pastInvestments: '' };

                    setFormData(defaultProfile);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to load profile data. Please try again later.');
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleArrayInputChange = (name: string, value: string[]) => {
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, fieldName: string) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        handleArrayInputChange(fieldName, options);
    };

    // Handle avatar change
    const handleAvatarChange = (file: File | null) => {
        setExtendedData(prev => ({
            ...prev,
            avatar: file
        }));
    };

    // Handle social links
    const handleAddSocialLink = () => {
        setExtendedData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
        }));
    };

    const handleRemoveSocialLink = (index: number) => {
        setExtendedData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        setExtendedData(prev => {
            const updatedLinks = [...prev.socialLinks];
            updatedLinks[index] = { ...updatedLinks[index], [field]: value };
            return { ...prev, socialLinks: updatedLinks };
        });
    };

    // Handle team members (for startups)
    const handleAddTeamMember = () => {
        setExtendedData(prev => ({
            ...prev,
            teamMembers: [...(prev.teamMembers || []), { name: '', role: '' }]
        }));
    };

    const handleRemoveTeamMember = (index: number) => {
        setExtendedData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers?.filter((_, i) => i !== index) || []
        }));
    };

    const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
        setExtendedData(prev => {
            const updatedMembers = [...(prev.teamMembers || [])];
            updatedMembers[index] = { ...updatedMembers[index], [field]: value };
            return { ...prev, teamMembers: updatedMembers };
        });
    };

    // Handle investment history (for investors)
    const handleAddInvestment = () => {
        setExtendedData(prev => ({
            ...prev,
            investmentHistory: [...(prev.investmentHistory || []), { companyName: '' }]
        }));
    };

    const handleRemoveInvestment = (index: number) => {
        setExtendedData(prev => ({
            ...prev,
            investmentHistory: prev.investmentHistory?.filter((_, i) => i !== index) || []
        }));
    };

    const handleInvestmentChange = (index: number, field: keyof Investment, value: string) => {
        setExtendedData(prev => {
            const updatedInvestments = [...(prev.investmentHistory || [])];
            updatedInvestments[index] = { ...updatedInvestments[index], [field]: value };
            return { ...prev, investmentHistory: updatedInvestments };
        });
    };

    const handleCancel = () => {
        setFormData(profileData || {});
        setIsEditing(false);
        toast.error('Changes discarded');
    };

    // Within ProfilePage.tsx, update the validateForm function

    const validateForm = () => {
        if (!formData.companyName?.trim()) {
            toast.error('Company name is required');
            return false;
        }

        if (userType === 'startup') {
            if (!formData.industry) {
                toast.error('Industry is required');
                return false;
            }
            if (!formData.fundingStage) {
                toast.error('Funding stage is required');
                return false;
            }
        } else if (userType === 'investor') {
            if (!formData.industriesOfInterest?.length) {
                toast.error('At least one industry of interest is required');
                return false;
            }
            if (!formData.preferredStages?.length) {
                toast.error('At least one preferred funding stage is required');
                return false;
            }
        }

        return true;
    };

    // And update the handleSave function to use validation
    const handleSave = async () => {
        if (!userType) return;

        // Validate required fields based on backend model requirements
        if (!validateForm()) return;

        setSaving(true);
        try {
            setError(null);

            // Save main profile data
            let profileResponse;
            if (userType === 'startup') {
                profileResponse = await profileService.updateStartupProfile(formData);
            } else {
                profileResponse = await profileService.updateInvestorProfile(formData);
            }

            // Save extended profile data
            const extendedProfileData = {
                avatarUrl: extendedData.avatarUrl,
                socialLinks: extendedData.socialLinks,
                teamMembers: userType === 'startup' ? extendedData.teamMembers : [],
                investmentHistory: userType === 'investor' ? extendedData.investmentHistory : []
            };

            await profileService.updateExtendedProfile(extendedProfileData);

            if (profileResponse && profileResponse.profile) {
                setProfileData(profileResponse.profile);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner
                    message="Loading Profile"
                    submessage="Please wait while we retrieve your information"
                    size="medium"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 pb-12 flex flex-col items-center justify-center">
                <div className="text-center p-6 bg-white shadow-md rounded-lg max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className={`px-4 py-2 bg-${colours.indigo600} text-white rounded-md hover:bg-${colours.indigo700} transition-colors`}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
                {/* Simplified, more abstract background */}
                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full filter blur-3xl opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full filter blur-3xl opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full filter blur-3xl opacity-5 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 relative z-10">
                <div className="mb-4 sm:mb-8">
                    <motion.button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border border-gray-200 text-sm sm:text-base"
                        whileHover={{ x: -3 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <FiArrowLeft className="mr-1 sm:mr-2" />
                        Back to Dashboard
                    </motion.button>
                </div>

                {loading ? (
                    <motion.div
                        className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LoadingSpinner
                            message="Loading Profile"
                            submessage="Please wait while we retrieve your information"
                            size="medium"
                        />
                    </motion.div>
                ) : error ? (
                    <motion.div
                        className="min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] bg-white pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 flex flex-col items-center justify-center rounded-xl shadow-md border border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm md:max-w-md">
                            <motion.div
                                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-500 text-xl sm:text-2xl mb-4 sm:mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                            >
                                ⚠️
                            </motion.div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Something went wrong</h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 bg-red-50 p-3 sm:p-4 rounded-lg border border-red-100">{error}</p>
                            <motion.button
                                onClick={() => window.location.reload()}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Try again
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <ProfileHeader
                            formData={formData}
                            userType={userType}
                            isEditing={isEditing}
                            saving={saving}
                            avatarUrl={extendedData.avatarUrl || ''}
                            onAvatarChange={handleAvatarChange}
                            onEdit={() => setIsEditing(true)}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />

                        {/* Profile Content */}
                        <ProfileContent
                            activeTab={activeTab}
                            tabs={getTabs()}
                            onTabChange={setActiveTab}
                            userType={userType}
                            formData={formData}
                            isEditing={isEditing}
                            saving={saving}
                            extendedData={extendedData}
                            handleInputChange={handleInputChange}
                            handleMultiSelect={handleMultiSelect}
                            handleSocialLinkChange={handleSocialLinkChange}
                            handleAddSocialLink={handleAddSocialLink}
                            handleRemoveSocialLink={handleRemoveSocialLink}
                            handleTeamMemberChange={handleTeamMemberChange}
                            handleAddTeamMember={handleAddTeamMember}
                            handleRemoveTeamMember={handleRemoveTeamMember}
                            handleInvestmentChange={handleInvestmentChange}
                            handleAddInvestment={handleAddInvestment}
                            handleRemoveInvestment={handleRemoveInvestment}
                            handleSave={handleSave}
                        />

                        {/* Enhanced Profile completeness indicator */}
                        {!isEditing && profileData && (
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

// Note: The old ProfileCompleteness component has been replaced by EnhancedProfileCompleteness

export default ProfilePage;