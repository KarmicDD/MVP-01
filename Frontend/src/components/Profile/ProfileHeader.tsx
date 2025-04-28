import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiSave, FiX, FiMapPin, FiUsers, FiShare2 } from 'react-icons/fi';
import { colours } from '../../utils/colours';
import AvatarUpload from './AvatarUpload';
import { profileService } from '../../services/api';
import { toast } from 'react-hot-toast';
import SocialShareModal from './SocialShareModal';

interface ProfileHeaderProps {
  userType: 'startup' | 'investor' | null;
  profileData: any;
  isEditing: boolean;
  onEditToggle?: () => void;
  onCancelEdit?: () => void;
  isViewOnly?: boolean;
  saving?: boolean;
  avatarUrl?: string;
  onAvatarChange?: (file: File | null) => void;
  onSave?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  userType,
  isEditing,
  saving = false,
  avatarUrl = '',
  onAvatarChange = () => { },
  onEditToggle = () => { },
  onSave = () => { },
  onCancelEdit = () => { },
  isViewOnly = false
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Get direct profile URL (with underscores instead of spaces)
  const getProfileUrl = () => {
    if (!profileData?.companyName) return '';

    // Replace spaces with underscores and remove special characters
    const formattedName = profileData.companyName.replace(/\s+/g, '_').replace(/[^\w_]/g, '');

    // Get the base URL from the window location
    const baseUrl = window.location.origin;
    return `${baseUrl}/${formattedName}`;
  };

  // Share profile via email
  const handleShareViaEmail = async (emails: string[], shareMethod = 'email') => {
    try {
      await profileService.shareProfileViaEmail(emails, shareMethod);
      return Promise.resolve();
    } catch (error) {
      console.error('Error sharing via email:', error);
      return Promise.reject(error);
    }
  };
  return (
    <motion.div
      className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced gradient header background with animated particles and patterns */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: userType === 'startup'
              ? `linear-gradient(135deg, ${colours.indigo600} 0%, ${colours.indigo400} 100%)`
              : `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)'
          }}
        />

        {/* Modern abstract background pattern */}
        <svg className="absolute inset-0 w-full h-full z-0 opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="modernGrid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" />
            </pattern>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#modernGrid)" />
          <rect width="100%" height="100%" fill="url(#dots)" opacity="0.5" />
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </svg>

        {/* Refined animated elements - more subtle and professional */}
        {useMemo(() => Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 2 === 0 ? 12 : 8,
              height: i % 2 === 0 ? 12 : 8,
              top: `${15 + Math.random() * 70}%`,
              left: `${15 + Math.random() * 70}%`,
              opacity: 0.1,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [0, Math.random() * 15 - 7.5],
              x: [0, Math.random() * 15 - 7.5],
              opacity: [0.1, 0.05, 0.1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 5 + i % 4,
              ease: "easeInOut"
            }}
          />
        )), [])}

        {/* Simplified decorative shapes for a cleaner professional look */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 150,
            height: 150,
            top: -30,
            right: -20,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />


        <motion.div
          className="absolute rounded-full"
          style={{
            width: 90,
            height: 90,
            top: '40%',
            left: '15%',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 15, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut"
          }}
        />

        {/* Simplified wave pattern for cleaner look */}
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white"></path>
          <motion.path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            fill="white"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          ></motion.path>
        </svg>
      </div>

      {/* Enhanced profile info section with better positioning */}
      <div className="px-4 sm:px-6 md:px-8 -mt-20 sm:-mt-24 md:-mt-28 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
          <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
            <div className="mb-4 sm:mb-0 z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="relative"
              >
                {/* Enhanced avatar container with better shadows and effects */}
                <div className="absolute inset-0 bg-white rounded-full shadow-xl transform -translate-x-1.5 -translate-y-1.5 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg z-0"></div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-200 rounded-full z-0 opacity-50"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                ></motion.div>
                <div className="relative z-10">
                  <AvatarUpload
                    currentAvatar={avatarUrl}
                    onAvatarChange={onAvatarChange}
                    size="lg"
                    userType={userType}
                  />
                </div>
              </motion.div>
            </div>
            <motion.div
              className="text-center sm:text-left mt-2 sm:mt-0 z-20 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profileData?.companyName || (userType === 'startup' ? 'Your Startup' : 'Your Firm')}
              </h2>
              <p className="text-gray-500 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                <FiMapPin className="mr-1" />
                {profileData?.location || 'Location not specified'}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {!profileData?.companyName && !isViewOnly && 'Click Edit Profile to add your company information'}
              </p>

              {/* Role badge */}
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
                <motion.span
                  className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-sm"
                  style={{
                    backgroundColor: userType === 'startup' ? '#EBF5FF' : '#ECFDF5',
                    color: userType === 'startup' ? '#1E40AF' : '#047857'
                  }}
                  whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {userType === 'startup' ? 'Startup' : 'Investor'}
                </motion.span>

                {profileData.industry && (
                  <motion.span
                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-800"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {profileData.industry}
                  </motion.span>
                )}

                {profileData.fundingStage && userType === 'startup' && (
                  <motion.span
                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-sm bg-purple-100 text-purple-800"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {profileData.fundingStage}
                  </motion.span>
                )}

                {profileData.employeeCount && (
                  <motion.span
                    className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-sm bg-amber-100 text-amber-800"
                    whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiUsers className="mr-1" />
                    {profileData.employeeCount}
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>

          <div className="mt-4 sm:mt-0">
            {isViewOnly ? (
              <div className="flex space-x-2 sm:space-x-3">
                <motion.button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  whileHover={{ scale: 1.05, backgroundColor: '#F9FAFB', boxShadow: '0 6px 10px -1px rgba(0, 0, 0, 0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <FiShare2 className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Share Profile</span>
                </motion.button>
              </div>
            ) : isEditing ? (
              <div className="flex space-x-2 sm:space-x-3">
                <motion.button
                  onClick={onCancelEdit}
                  className="inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  whileHover={{ scale: 1.03, backgroundColor: '#F9FAFB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <FiX className="mr-1 sm:mr-2 -ml-0.5 sm:-ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onSave}
                  disabled={saving}
                  className={`inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2.5 border border-transparent rounded-lg sm:rounded-xl shadow-md sm:shadow-lg text-xs sm:text-sm font-medium text-white ${userType === 'startup' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none disabled:opacity-50 transition-colors`}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
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
                      <FiSave className="mr-1 sm:mr-2 -ml-0.5 sm:-ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="flex space-x-2 sm:space-x-3">
                <motion.button
                  onClick={onEditToggle}
                  className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl text-xs sm:text-sm font-medium text-white ${userType === 'startup' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none transition-colors`}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FiEdit2 className="mr-1 sm:mr-2 -ml-0.5 sm:-ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-semibold">Edit Profile</span>
                </motion.button>

                {/* Share Profile Button */}
                <motion.button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl shadow-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  whileHover={{ scale: 1.05, backgroundColor: '#F9FAFB', boxShadow: '0 6px 10px -1px rgba(0, 0, 0, 0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <FiShare2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profileUrl={getProfileUrl()}
        title={`Check out ${profileData?.companyName || 'this profile'} on KarmicDD`}
        description={`${profileData?.companyName || 'This company'} is a ${profileData?.industry || ''} ${userType === 'startup' ? 'startup' : 'investor'} on KarmicDD. View their profile to learn more.`}
        onEmailShare={handleShareViaEmail}
      />
    </motion.div>
  );
};

export default React.memo(ProfileHeader);
