import React from 'react';
import LoadingSpinner from '../../Loading';
import { useBeliefSystemReport } from '../../../hooks/useBeliefSystemReport';
import BeliefSystemReportContent from './BeliefSystemReportContent';

interface UserProfile {
    userId: string;
    role: 'startup' | 'investor';
}

interface BeliefSystemAnalyticsProps {
    userProfile: UserProfile;
    selectedMatchId: string | null;
}

const BeliefSystemAnalytics: React.FC<BeliefSystemAnalyticsProps> = ({ userProfile, selectedMatchId }) => {
    let startupId = null;
    let investorId = null;

    if (selectedMatchId && userProfile) {
        if (userProfile.role === 'startup') {
            startupId = userProfile.userId;
            investorId = selectedMatchId;
        } else {
            investorId = userProfile.userId;
            startupId = selectedMatchId;
        }
    }

    const { report, loading, error, handleExportPDF, handleShareReport, formatDate } =
        useBeliefSystemReport(startupId, investorId);

    if (!selectedMatchId) {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a match to view belief system analysis</h3>
                <p className="text-gray-500">Click on any match card to see compatibility analysis</p>
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <BeliefSystemReportContent
            report={report}
            formatDate={formatDate}
            handleExportPDF={handleExportPDF}
            handleShareReport={handleShareReport}
            isCompact={true}
        />
    );
};

export default BeliefSystemAnalytics;