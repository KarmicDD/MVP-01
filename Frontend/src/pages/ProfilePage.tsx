import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiSave, FiX, FiArrowLeft, FiUser, FiMapPin, FiUsers, FiDollarSign, FiTarget, FiGrid, FiLayers, FiBriefcase, FiInfo, FiLink } from 'react-icons/fi';
import { profileService } from '../services/api';
import { StartupProfile, InvestorProfile } from '../types/Dashboard.types';
import { toast } from 'react-hot-toast';
import { employeeOptions, fundingStages, industries, investmentCriteria, ticketSizes } from '../constants/questions';
import LoadingSpinner from '../components/Loading';
import { colours } from '../utils/colours';
import AvatarUpload from '../components/Profile/AvatarUpload';
import SocialMediaLinks from '../components/Profile/SocialMediaLinks';
import ProfileTabs from '../components/Profile/ProfileTabs';
import TeamMembers from '../components/Profile/TeamMembers';
import InvestmentHistory from '../components/Profile/InvestmentHistory';
import EnhancedProfileCompleteness from '../components/Profile/EnhancedProfileCompleteness';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24
        }
    }
};

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
                } else if (role === 'investor') {
                    profileResponse = await profileService.getInvestorProfile();
                }

                if (profileResponse && profileResponse.profile) {
                    setProfileData(profileResponse.profile);
                    setFormData(profileResponse.profile);

                    // Set extended profile data if it exists
                    if (profileResponse.extendedProfile) {
                        setExtendedData({
                            avatar: null,
                            avatarUrl: profileResponse.extendedProfile.avatarUrl || '',
                            socialLinks: profileResponse.extendedProfile.socialLinks || [],
                            teamMembers: profileResponse.extendedProfile.teamMembers || [],
                            investmentHistory: profileResponse.extendedProfile.investmentHistory || []
                        });
                    }
                } else {
                    // Initialize with defaults if no profile exists
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
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Loading your profile...</p>
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
            { id: 'social', label: 'Social & Links', icon: <FiLink /> }
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
        <div className={`min-h-screen bg-${colours.mainBackground} pt-16 pb-12`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center text-${colours.indigo600} hover:text-${colours.indigo700} transition-colors`}
                    >
                        <FiArrowLeft className="mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Profile Header with Avatar */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-6"
                    >
                        <div className={`h-32 bg-gradient-to-r from-${colours.indigo600} to-${colours.indigo400}`}></div>
                        <div className="px-6 -mt-16 pb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
                                <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-4">
                                    <div className="mb-3 sm:mb-0">
                                        <AvatarUpload
                                            currentAvatar={extendedData.avatarUrl}
                                            onAvatarChange={handleAvatarChange}
                                            size="lg"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left mt-2 sm:mt-0">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {formData.companyName || (userType === 'startup' ? 'Your Startup' : 'Your Firm')}
                                        </h2>
                                        <p className="text-gray-500 flex items-center justify-center sm:justify-start mt-1">
                                            <FiMapPin className="mr-1" />
                                            {formData.location || 'Location not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-0">
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleCancel}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                                            >
                                                <FiX className="mr-2 -ml-1" />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-${colours.white} bg-${colours.indigo600} hover:bg-${colours.indigo700} focus:outline-none disabled:opacity-50 transition-colors`}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span className="mr-2">Saving...</span>
                                                        <LoadingSpinner />
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSave className="mr-2 -ml-1" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-${colours.white} bg-${colours.indigo600} hover:bg-${colours.indigo700} focus:outline-none transition-colors`}
                                        >
                                            <FiEdit2 className="mr-2 -ml-1" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Content with Tabs */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
                    >
                        <div className="px-6">
                            <ProfileTabs
                                tabs={getTabs()}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>

                        <div className="px-6 py-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    {userType === 'startup' ? (
                                        <StartupProfileForm
                                            formData={formData}
                                            isEditing={isEditing}
                                            handleInputChange={handleInputChange}
                                        />
                                    ) : (
                                        <InvestorProfileForm
                                            formData={formData}
                                            isEditing={isEditing}
                                            handleInputChange={handleInputChange}
                                            handleMultiSelect={handleMultiSelect}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Social Links Tab */}
                            {activeTab === 'social' && (
                                <SocialMediaLinks
                                    links={extendedData.socialLinks}
                                    isEditing={isEditing}
                                    onAddLink={handleAddSocialLink}
                                    onRemoveLink={handleRemoveSocialLink}
                                    onLinkChange={handleSocialLinkChange}
                                />
                            )}

                            {/* Team Tab (Startups only) */}
                            {activeTab === 'team' && userType === 'startup' && (
                                <TeamMembers
                                    members={extendedData.teamMembers || []}
                                    isEditing={isEditing}
                                    onAddMember={handleAddTeamMember}
                                    onRemoveMember={handleRemoveTeamMember}
                                    onMemberChange={handleTeamMemberChange}
                                />
                            )}

                            {/* Investments Tab (Investors only) */}
                            {activeTab === 'investments' && userType === 'investor' && (
                                <InvestmentHistory
                                    investments={extendedData.investmentHistory || []}
                                    isEditing={isEditing}
                                    onAddInvestment={handleAddInvestment}
                                    onRemoveInvestment={handleRemoveInvestment}
                                    onInvestmentChange={handleInvestmentChange}
                                />
                            )}
                        </div>

                        {isEditing && (
                            <div className={`px-6 py-4 bg-${colours.indigo50} border-t border-${colours.gray200} flex justify-end`}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`inline-flex items-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-${colours.white} bg-${colours.indigo600} hover:bg-${colours.indigo700} focus:outline-none disabled:opacity-50 transition-colors`}
                                >
                                    {saving ? (
                                        <>
                                            <span className="mr-2">Saving...</span>
                                            <LoadingSpinner />
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 -ml-1" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Enhanced Profile completeness indicator */}
                    {!isEditing && profileData && (
                        <motion.div
                            variants={itemVariants}
                            className="mt-6 bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 p-6"
                        >
                            <h3 className={`text-lg font-medium text-${colours.indigo600} mb-4 flex items-center`}>
                                <FiInfo className="mr-2" />
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
                </motion.div>
            </div>
        </div>
    );
};

// Note: The old ProfileCompleteness component has been replaced by EnhancedProfileCompleteness

interface ProfileFormProps {
    formData: any;
    isEditing: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

interface InvestorProfileFormProps extends ProfileFormProps {
    handleMultiSelect: (e: React.ChangeEvent<HTMLSelectElement>, fieldName: string) => void;
}

const StartupProfileForm: React.FC<ProfileFormProps> = ({ formData, isEditing, handleInputChange }) => {
    // These fields exactly match the backend model
    const formFields = [
        {
            id: 'companyName',
            label: 'Company Name',
            type: 'text',
            icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
            required: true,
            placeholder: 'Enter your company name',
            description: 'The official name of your startup'
        },
        {
            id: 'industry',
            label: 'Industry',
            type: 'select',
            icon: <FiGrid className={`text-${colours.indigo600}`} />,
            options: industries,
            required: true,
            placeholder: 'Select Industry',
            description: 'The primary industry your startup operates in'
        },
        {
            id: 'fundingStage',
            label: 'Current Funding Stage',
            type: 'select',
            icon: <FiLayers className={`text-${colours.indigo600}`} />,
            options: fundingStages,
            required: true,
            placeholder: 'Select Funding Stage',
            description: 'Your startup\'s current stage of funding'
        },
        {
            id: 'employeeCount',
            label: 'Team Size',
            type: 'select',
            icon: <FiUsers className={`text-${colours.indigo600}`} />,
            options: employeeOptions,
            required: false,
            placeholder: 'Select Team Size',
            description: 'Number of employees in your company'
        },
        {
            id: 'location',
            label: 'Headquarters Location',
            type: 'text',
            icon: <FiMapPin className={`text-${colours.indigo600}`} />,
            required: false,
            placeholder: 'City, Country',
            description: 'Primary location of your company'
        },
        {
            id: 'pitch',
            label: 'Elevator Pitch',
            type: 'textarea',
            icon: <FiTarget className={`text-${colours.indigo600}`} />,
            required: false,
            placeholder: 'Briefly describe your startup, product, and market opportunity...',
            description: 'A compelling summary of your startup (max 500 characters)',
            maxLength: 500,
            rows: 4
        }
    ];

    // Rest of component remains the same
    return (
        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
            {formFields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? "sm:col-span-6" : "sm:col-span-3"}>
                    <div className="flex items-center mb-2">
                        <span className="mr-2">{field.icon}</span>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                    </div>

                    {isEditing ? (
                        <>
                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    name={field.id}
                                    id={field.id}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    maxLength={field.maxLength}
                                    className={`mt-1 focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full shadow-sm sm:text-sm border-gray-300 rounded-md`}
                                />
                            )}

                            {field.type === 'select' && (
                                <select
                                    id={field.id}
                                    name={field.id}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    required={field.required}
                                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${colours.indigo600} focus:border-${colours.indigo600} sm:text-sm rounded-md`}
                                >
                                    <option value="">{field.placeholder}</option>
                                    {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {field.type === 'textarea' && (
                                <textarea
                                    id={field.id}
                                    name={field.id}
                                    rows={field.rows || 3}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    maxLength={field.maxLength}
                                    className={`mt-1 shadow-sm focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full sm:text-sm border border-gray-300 rounded-md`}
                                />
                            )}

                            {field.description && (
                                <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                            )}

                            {field.maxLength && field.type === 'textarea' && (
                                <div className="mt-1 text-xs text-right text-gray-500">
                                    {formData[field.id]?.length || 0}/{field.maxLength} characters
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`mt-1 text-sm ${formData[field.id] ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {formData[field.id] ? (
                                field.type === 'textarea' ? (
                                    <div className="whitespace-pre-wrap">{formData[field.id]}</div>
                                ) : (
                                    formData[field.id]
                                )
                            ) : (
                                'Not provided'
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const InvestorProfileForm: React.FC<InvestorProfileFormProps> = ({
    formData,
    isEditing,
    handleInputChange,
    handleMultiSelect
}) => {
    // These fields exactly match the backend model
    const formFields = [
        {
            id: 'companyName',
            label: 'Firm Name',
            type: 'text',
            icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
            required: true,
            placeholder: 'Enter your investment firm name',
            description: 'The name of your investment firm or fund'
        },
        {
            id: 'industriesOfInterest',
            label: 'Industries of Interest',
            type: 'multiselect',
            icon: <FiGrid className={`text-${colours.indigo600}`} />,
            options: industries,
            required: true,
            placeholder: 'Select Industries',
            description: 'Industries you are interested in investing in',
            multiSelectFieldName: 'industriesOfInterest'
        },
        {
            id: 'preferredStages',
            label: 'Preferred Funding Stages',
            type: 'multiselect',
            icon: <FiLayers className={`text-${colours.indigo600}`} />,
            options: fundingStages,
            required: true,
            placeholder: 'Select Funding Stages',
            description: 'Funding stages you typically invest in',
            multiSelectFieldName: 'preferredStages'
        },
        {
            id: 'ticketSize',
            label: 'Typical Ticket Size',
            type: 'select',
            icon: <FiDollarSign className={`text-${colours.indigo600}`} />,
            options: ticketSizes,
            required: false,
            placeholder: 'Select Ticket Size',
            description: 'Your typical investment amount'
        },
        {
            id: 'investmentCriteria',
            label: 'Investment Criteria',
            type: 'multiselect',
            icon: <FiTarget className={`text-${colours.indigo600}`} />,
            options: investmentCriteria,
            required: false,
            placeholder: 'Select Investment Criteria',
            description: 'Key factors you consider when investing',
            multiSelectFieldName: 'investmentCriteria'
        },
        {
            id: 'pastInvestments',
            label: 'Notable Investments',
            type: 'textarea',
            icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
            required: false,
            placeholder: 'List some of your past investments or portfolio companies...',
            description: 'Highlight some of your key investments',
            rows: 4
        }
    ];


    return (
        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
            {formFields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? "sm:col-span-6" : "sm:col-span-3"}>
                    <div className="flex items-center mb-2">
                        <span className="mr-2">{field.icon}</span>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                    </div>

                    {isEditing ? (
                        <>
                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    name={field.id}
                                    id={field.id}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className={`mt-1 focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full shadow-sm sm:text-sm border-gray-300 rounded-md`}
                                />
                            )}

                            {field.type === 'select' && (
                                <select
                                    id={field.id}
                                    name={field.id}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    required={field.required}
                                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${colours.indigo600} focus:border-${colours.indigo600} sm:text-sm rounded-md`}
                                >
                                    <option value="">{field.placeholder}</option>
                                    {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {field.type === 'multiselect' && (
                                <>
                                    <select
                                        multiple
                                        id={field.id}
                                        name={field.id}
                                        value={formData[field.id] || []}
                                        onChange={(e) => handleMultiSelect(e, field.multiSelectFieldName || field.id)}
                                        required={field.required}
                                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${colours.indigo600} focus:border-${colours.indigo600} sm:text-sm rounded-md`}
                                        size={Math.min(5, field.options?.length || 5)}
                                    >
                                        {field.options?.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple options</p>
                                </>
                            )}

                            {field.type === 'textarea' && (
                                <textarea
                                    id={field.id}
                                    name={field.id}
                                    rows={field.rows || 3}
                                    value={formData[field.id] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className={`mt-1 shadow-sm focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full sm:text-sm border border-gray-300 rounded-md`}
                                />
                            )}

                            {field.description && (
                                <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                            )}
                        </>
                    ) : (
                        <div className={`mt-1 text-sm ${field.type === 'multiselect'
                            ? (formData[field.id]?.length ? 'text-gray-900' : 'text-gray-400 italic')
                            : (formData[field.id] ? 'text-gray-900' : 'text-gray-400 italic')
                            }`}>
                            {field.type === 'multiselect' ? (
                                formData[field.id]?.length ? (
                                    formData[field.id].join(', ')
                                ) : (
                                    'Not provided'
                                )
                            ) : field.type === 'textarea' ? (
                                formData[field.id] ? (
                                    <div className="whitespace-pre-wrap">{formData[field.id]}</div>
                                ) : (
                                    'Not provided'
                                )
                            ) : (
                                formData[field.id] || 'Not provided'
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProfilePage;