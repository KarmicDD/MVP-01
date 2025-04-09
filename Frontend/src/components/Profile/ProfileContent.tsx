import React from 'react';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';
import ProfileTabs from './ProfileTabs';
import StartupProfileForm from '../Profile/StartupProfileForm';
import InvestorProfileForm from '../Profile/InvestorProfileForm';
import SocialMediaLinks from './SocialMediaLinks';
import TeamMembers from './TeamMembers';
import InvestmentHistory from './InvestmentHistory';
import DocumentUpload from './DocumentUpload';
import { FiSave } from 'react-icons/fi';
import LoadingSpinner from '../Loading';

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
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  activeTab,
  tabs,
  onTabChange,
  userType,
  formData,
  isEditing,
  saving,
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
  handleSave
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
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DocumentUpload />
            </motion.div>
          )}
        </div>

        <motion.div
          className="px-4 sm:px-6 py-3 sm:py-4 bg-indigo-50 border-t border-gray-200 flex justify-end mt-4 sm:mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isEditing ? (
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="w-4 h-4 animate-spin">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <FiSave className="mr-1.5 sm:mr-2 -ml-0.5 sm:-ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={() => handleSave()}
              className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiSave className="mr-1.5 sm:mr-2 -ml-0.5 sm:-ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Save Profile
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileContent;
