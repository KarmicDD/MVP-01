import React from 'react';
import { motion } from 'framer-motion';
import CompatibilityBreakdown from '../MatchesPage/CompatibilityBreakdown';
import AIRecommendations from '../MatchesPage/AIRecomendations';
import LoadingSpinner from '../../Loading';

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
}

interface CompatibilitySectionProps {
  selectedMatchId: string | null;
  loadingCompatibility: boolean;
  compatibilityData: CompatibilityData;
  itemVariants: any;
}

const CompatibilitySection: React.FC<CompatibilitySectionProps> = ({
  selectedMatchId,
  loadingCompatibility,
  compatibilityData,
  itemVariants
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
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Compatibility Analysis</h3>

        {/* Remove error display and always show compatibility data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loadingCompatibility ? (
            <div className="col-span-2 flex justify-center py-12">
              <LoadingSpinner />
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
                <AIRecommendations />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CompatibilitySection;
