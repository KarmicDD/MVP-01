import React from 'react';
import { motion } from 'framer-motion';
import CompatibilityBreakdown from '../MatchesPage/CompatibilityBreakdown';
import AIRecommendations from '../MatchesPage/AIRecomendations';
import { LoadingSpinner } from '../../Loading';

interface CompatibilityData {
  breakdown: {
    missionAlignment: number;
    investmentPhilosophy: number;
    sectorFocus: number;
    fundingStageAlignment: number;
    valueAddMatch: number;
  };
  overallScore: number;
  insights: string[];
  isOldData?: boolean;
  message?: string;
  createdAt?: string;
}

interface CompatibilitySectionProps {
  selectedMatchId: string | null;
  loadingCompatibility: boolean;
  compatibilityData: CompatibilityData;
  itemVariants: any;
  userProfile?: {
    userId: string;
    role: string;
  } | null;
}

const CompatibilitySection: React.FC<CompatibilitySectionProps> = ({
  selectedMatchId,
  loadingCompatibility,
  compatibilityData,
  itemVariants,
  userProfile
}) => {
  if (!selectedMatchId) {
    return (
      <motion.section
        className="mb-8"
        variants={itemVariants}
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a match to view compatibility</h3>
            <p className="text-gray-500">Click on any match card to see detailed compatibility analysis.</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mb-8"
      variants={itemVariants}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Compatibility Analysis</h3>

        {/* Show notification for old data */}
        {compatibilityData.isOldData && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  {compatibilityData.message || 'Daily request limit reached. Showing previously generated data.'}
                  {compatibilityData.createdAt && (
                    <span className="ml-1 font-medium">
                      (Generated on {new Date(compatibilityData.createdAt).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loadingCompatibility ? (
            <div className="col-span-2 flex justify-center py-12">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-5">
                <CompatibilityBreakdown
                  breakdown={compatibilityData.breakdown}
                  overallScore={compatibilityData.overallScore}
                  insights={compatibilityData.insights}
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <AIRecommendations
                  startupId={userProfile?.role?.toLowerCase() === 'startup' ? userProfile.userId : selectedMatchId}
                  investorId={userProfile?.role?.toLowerCase() === 'investor' ? userProfile.userId : selectedMatchId}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CompatibilitySection;
