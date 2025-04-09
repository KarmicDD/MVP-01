import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { profileService } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/Loading';
import { colours } from '../utils/colours';

const SharedProfilePage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [extendedData, setExtendedData] = useState<any>(null);
  const [userType, setUserType] = useState<'startup' | 'investor' | null>(null);

  useEffect(() => {
    const fetchSharedProfile = async () => {
      if (!shareToken) {
        setError('Invalid share token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await profileService.getSharedProfile(shareToken);
        
        setProfileData(response.profile);
        setExtendedData(response.extendedProfile);
        setUserType(response.userType);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shared profile:', error);
        setError('This shared profile link is invalid or has expired');
        setLoading(false);
      }
    };

    fetchSharedProfile();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading shared profile" submessage="Retrieving profile information" />
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Homepage
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </button>
        </motion.div>

        {/* Shared Profile Banner */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative h-48 overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{
                background: userType === 'startup'
                  ? `linear-gradient(135deg, ${colours.indigo600} 0%, ${colours.indigo400} 100%)`
                  : `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Decorative elements */}
            <svg className="absolute inset-0 w-full h-full z-0 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#circles)" />
            </svg>
            
            {/* Shared banner */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-md flex items-center">
              <span className="text-sm font-medium text-gray-700">Shared Profile</span>
            </div>
          </div>
          
          <div className="px-8 -mt-16 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
              <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
                <div className="mb-4 sm:mb-0 z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-white rounded-full shadow-xl transform -translate-x-1.5 -translate-y-1.5 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg z-0"></div>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-200 rounded-full z-0 opacity-50"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    ></motion.div>
                    <div className="relative z-10">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white">
                        {extendedData?.avatarUrl ? (
                          <img 
                            src={extendedData.avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  className="text-center sm:text-left mt-2 sm:mt-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userType === 'startup' ? profileData?.companyName : profileData?.companyName}
                  </h1>
                  
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    {profileData?.location && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        <FiMapPin className="mr-1 text-gray-500" size={14} />
                        {profileData.location}
                      </div>
                    )}
                    
                    {/* Role badge */}
                    <motion.span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                      style={{
                        backgroundColor: userType === 'startup' ? '#EBF5FF' : '#ECFDF5',
                        color: userType === 'startup' ? '#1E40AF' : '#047857'
                      }}
                      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {userType === 'startup' ? 'Startup' : 'Investor'}
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Profile description */}
            {userType === 'startup' && profileData?.pitch && (
              <motion.div
                className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
                <p className="text-gray-700">{profileData.pitch}</p>
              </motion.div>
            )}
            
            {/* Key information */}
            <motion.div
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {userType === 'startup' ? (
                <>
                  {profileData?.industry && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Industry</h3>
                      <p className="text-gray-700">{profileData.industry}</p>
                    </div>
                  )}
                  
                  {profileData?.fundingStage && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Funding Stage</h3>
                      <p className="text-gray-700">{profileData.fundingStage}</p>
                    </div>
                  )}
                  
                  {profileData?.employeeCount && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Team Size</h3>
                      <p className="text-gray-700">{profileData.employeeCount}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {profileData?.industriesOfInterest?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Industries of Interest</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.industriesOfInterest.map((industry: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileData?.preferredStages?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Preferred Stages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.preferredStages.map((stage: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200">
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileData?.ticketSize && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Ticket Size</h3>
                      <p className="text-gray-700">{profileData.ticketSize}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
            
            {/* Social links */}
            {extendedData?.socialLinks?.length > 0 && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-3">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {extendedData.socialLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Call to action */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">Interested in connecting?</h2>
          <p className="text-gray-600 mb-6">Sign up for KarmicDD to connect with this and other {userType === 'startup' ? 'startups' : 'investors'}.</p>
          <motion.button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.95 }}
          >
            Join KarmicDD
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedProfilePage;
