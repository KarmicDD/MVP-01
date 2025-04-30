import React from 'react';
import FinancialDueDiligence from './FinancialDueDiligence';

interface FinancialAnalyticsProps {
  userProfile: {
    userId: string;
    role: 'startup' | 'investor';
  };
  selectedMatchId: string | null;
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({ userProfile, selectedMatchId }) => {
  return (
    <FinancialDueDiligence 
      userProfile={userProfile} 
      selectedMatchId={selectedMatchId} 
    />
  );
};

export default FinancialAnalytics;
