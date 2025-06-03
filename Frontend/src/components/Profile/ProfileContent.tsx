import React from 'react';
import { motion } from 'framer-motion';
// import { colours } from '../../utils/colours'; // Imported but not used
import ProfileTabs from './ProfileTabs';
import StartupProfileForm from '../Profile/StartupProfileForm';
import InvestorProfileForm from '../Profile/InvestorProfileForm';
import SocialMediaLinks from './SocialMediaLinks';
import TeamMembers from './TeamMembers';
import InvestmentHistory from './InvestmentHistory';
import DocumentUpload from './DocumentUpload';
import NewDocumentUploadSystem from './NewDocumentUploadSystem';
// import { FiSave } from 'react-icons/fi'; // Imported but not used
// import LoadingSpinner from '../Loading'; // Imported but not used

interface ProfileContentProps {
  activeTab: string;
  tabs: Array<{ id: string; label: string; icon: React.ReactNode }>;
  onTabChange: (tabId: string) => void;
  userType: 'startup' | 'investor' | null;
  formData: any;
  isEditing: boolean;
  saving: boolean;
  extendedData: {
    socialLinks: any[];
    teamMembers?: any[];
    investmentHistory?: any[];
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelect: (e: React.ChangeEvent<HTMLSelectElement>, fieldName: string) => void;
  handleSocialLinkChange: (index: number, field: 'platform' | 'url', value: string) => void;
  handleAddSocialLink: () => void;
  handleRemoveSocialLink: (index: number) => void;
  handleTeamMemberChange: (index: number, field: any, value: string) => void;
  handleAddTeamMember: () => void;
  handleRemoveTeamMember: (index: number) => void;
  handleInvestmentChange: (index: number, field: any, value: string) => void;
  handleAddInvestment: () => void;
  handleRemoveInvestment: (index: number) => void;
  handleSave: () => void;
  isViewOnly?: boolean;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  activeTab,
  tabs,
  onTabChange,
  userType,
  formData,
  isEditing,
  // saving, // Passed from parent but not used in this component
  extendedData,
  handleInputChange,
  handleMultiSelect,
  handleSocialLinkChange,
  handleAddSocialLink,
  handleRemoveSocialLink,
  handleTeamMemberChange,
  handleAddTeamMember,
  handleRemoveTeamMember,
  handleInvestmentChange,
  handleAddInvestment,
  handleRemoveInvestment,
  // handleSave, // Passed from parent but not used in this component
  isViewOnly = false
}) => {
  return (
    <motion.div
      className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="px-3 sm:px-6 bg-gray-50 border-b border-gray-100">
        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          userType={userType}
        />
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full opacity-20 transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gray-50 rounded-full opacity-20 transform -translate-x-20 translate-y-20"></div>
        <div className="relative z-10">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SocialMediaLinks
                links={extendedData.socialLinks}
                isEditing={isEditing}
                onAddLink={handleAddSocialLink}
                onRemoveLink={handleRemoveSocialLink}
                onLinkChange={handleSocialLinkChange}
              />
            </motion.div>
          )}

          {/* Team Tab (Startups only) */}
          {activeTab === 'team' && userType === 'startup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TeamMembers
                members={extendedData.teamMembers || []}
                isEditing={isEditing}
                onAddMember={handleAddTeamMember}
                onRemoveMember={handleRemoveTeamMember}
                onMemberChange={handleTeamMemberChange}
              />
            </motion.div>
          )}

          {/* Investments Tab (Investors only) */}
          {activeTab === 'investments' && userType === 'investor' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <InvestmentHistory
                investments={extendedData.investmentHistory || []}
                isEditing={isEditing}
                onAddInvestment={handleAddInvestment}
                onRemoveInvestment={handleRemoveInvestment}
                onInvestmentChange={handleInvestmentChange}
              />
            </motion.div>
          )}          {/* Documents Tab */}
          {activeTab === 'documents' && !isViewOnly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <NewDocumentUploadSystem />
            </motion.div>
          )}

          {activeTab === 'documents' && isViewOnly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 text-center text-gray-600">
                <p>Only public documents are visible. Private documents are only available to the profile owner.</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Save button is now only in the header component */}
      </div>
    </motion.div>
  );
};

export default ProfileContent;
