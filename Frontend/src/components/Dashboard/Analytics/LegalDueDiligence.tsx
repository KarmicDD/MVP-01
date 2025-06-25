import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiShield, FiList, FiClipboard, FiInfo, FiX, FiUpload } from 'react-icons/fi';
import SimpleSpinner from '../../SimpleSpinner';
import { profileService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useLegalDueDiligence } from '../../../hooks/useLegalDueDiligence';
import LegalDueDiligenceReportContent from './LegalDueDiligenceReportContent';
import { LoadingSpinner } from '../../Loading';
import TutorialButton from '../../Tutorial/TutorialButton';
import { useTutorial } from '../../../hooks/useTutorial';
import ErrorDisplay from '../../common/ErrorDisplay';

interface LegalDueDiligenceProps {
    userProfile: {
        userId: string;
        role: 'startup' | 'investor';
    };
    selectedMatchId: string | null;
    isSelfAnalysis?: boolean; // Flag to indicate if this is self-analysis
}

const LegalDueDiligence: React.FC<LegalDueDiligenceProps> = ({ userProfile, selectedMatchId, isSelfAnalysis = false }) => {
    const [entityName, setEntityName] = useState<string>('the entity');

    // Determine which entity to analyze based on the selected match and user role
    let entityId = '';
    let entityType: 'startup' | 'investor' = 'startup';

    if (selectedMatchId && userProfile) {
        if (isSelfAnalysis) {
            // For self-analysis, analyze the user's own entity
            entityId = userProfile.userId;
            entityType = userProfile.role; // Same as user's role
        } else {
            // We want to analyze the selected entity (the counterparty), not the logged-in user
            entityId = selectedMatchId;

            // If user is a startup, we want to analyze the investor
            // If user is an investor, we want to analyze the startup
            entityType = userProfile.role === 'startup' ? 'investor' : 'startup';
        }
    }

    useTutorial('legal-dd-tutorial');

    // Use the legal due diligence hook with the correct entity type
    const {
        report,
        loading,
        error,
        documentsAvailable,
        checkingDocuments,
        availableDocuments,
        missingDocumentTypes,
        entityInfo,
        handleExportPDF,
        handleShareReport,
        generateReport,
        formatDate,
        reportRef
    } = useLegalDueDiligence(entityId, entityType);    // Update entity name when entity info changes
    useEffect(() => {
        if (entityInfo && entityInfo.companyName) {
            setEntityName(entityInfo.companyName);
        } else if (selectedMatchId) {
            // Fetch entity name if not provided by the hook
            const fetchEntityName = async () => {
                try {
                    if (isSelfAnalysis) {
                        // For self-analysis, get the user's own profile
                        const profile = await profileService.getProfile(userProfile.userId, userProfile.role);
                        if (profile && profile.companyName) {
                            setEntityName(profile.companyName);
                        } else {
                            setEntityName('Your Company');
                        }
                    } else {
                        // Use getProfile method instead of getProfileByUserId
                        // The entityType is the opposite of the user's role
                        const profile = await profileService.getProfile(selectedMatchId, entityType);
                        if (profile && profile.companyName) {
                            setEntityName(profile.companyName);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching entity name:', error);
                    if (isSelfAnalysis) {
                        setEntityName('Your Company');
                    }
                }
            };

            fetchEntityName();
        }
    }, [entityInfo, selectedMatchId, entityType, isSelfAnalysis, userProfile.userId, userProfile.role]);

    // Get formatted document type for display
    const getFormattedDocumentType = (docType: string) => {
        return docType
            .replace('legal_', '')
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }; if (!selectedMatchId) {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                    {isSelfAnalysis ? 'Self-Analysis Ready' : 'Select a match to view legal due diligence'}
                </h3>
                <p className="text-gray-500">
                    {isSelfAnalysis ? 'Review your own legal compliance and documents' : 'Click on any match card to see legal analysis'}
                </p>
            </div>
        );
    }// Show loading state while checking documents or loading report
    if (checkingDocuments || loading) {
        return <LoadingSpinner message="Preparing Legal Analysis" submessage="Loading legal due diligence data..." />;
    }

    // Show error state if there's an error
    if (error) {
        // Check if error is a string or an object
        const errorObj = typeof error === 'string'
            ? { message: error }
            : error;

        // Show processing error UI with ErrorDisplay component
        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal Due Diligence</h3>

                <ErrorDisplay
                    error={errorObj}
                    onRetry={generateReport}
                    onDismiss={() => window.location.reload()}
                />

                {availableDocuments && availableDocuments.length > 0 && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3">Available Documents</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center p-2 hover:bg-white rounded-md">
                                    <FiFileText className="text-indigo-500 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{getFormattedDocumentType(doc.documentType)}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.documentName} •
                                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Display report if available
    if (report) {
        return (
            <div className="space-y-6">                {/* Header with help button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isSelfAnalysis ? 'Legal Self-Analysis Report' : 'Legal Due Diligence Report'}
                    </h2>
                    <TutorialButton tutorialId="legal-dd-tutorial" />
                </div>

                {/* Analysis Instructions - Only show if no report is displayed */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                    <div className="bg-blue-500 text-white rounded-full p-1 mr-3 flex-shrink-0">
                        <FiInfo size={18} />
                    </div>
                    <div>
                        <h3 className="font-medium text-blue-800 mb-1">
                            {isSelfAnalysis ? 'Legal Self-Analysis Instructions' : 'Legal Analysis Instructions'}
                        </h3>
                        <p className="text-blue-700 text-sm">
                            This comprehensive legal due diligence report analyzes corporate structure, compliance status,
                            regulatory adherence, and legal risks for {isSelfAnalysis ? 'your company' : entityName}.
                            {isSelfAnalysis && ' Use this to identify and address potential legal issues before external due diligence.'}
                        </p>
                    </div>
                </div>{/* Main content */}
                <div ref={reportRef}>
                    <LegalDueDiligenceReportContent
                        report={report}
                        userProfile={userProfile}
                        entityName={entityName}
                        formatDate={formatDate}
                        handleExportPDF={handleExportPDF}
                        handleShareReport={handleShareReport}
                    />
                </div>
            </div>
        );
    }

    // Pre-report generation state
    if (documentsAvailable === false) {
        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-red-50 p-6 border-b border-red-100">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mr-4 border border-red-200">
                            <FiFileText className="text-red-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Legal Documents Required</h3>
                            <p className="text-red-600 text-sm font-medium">No legal documents available for analysis</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <FiInfo className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-gray-700 mb-2">
                                {isSelfAnalysis ? 'You haven\'t uploaded any legal or other documents yet' : `${entityName} hasn't uploaded any legal or other documents yet`}. Legal documents and documents from the "other" category are required to generate a comprehensive legal due diligence report.
                            </p>
                            <p className="text-sm text-gray-600">
                                Legal due diligence analyzes legal documents and other category documents (excluding financial documents). This may include incorporation certificates, shareholder agreements, contracts, regulatory filings, intellectual property documents, presentations, reports, and other relevant business documents.
                            </p>
                        </div>
                    </div>
                </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Required Documents:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['Incorporation Certificate', 'Shareholder Agreement', 'Corporate Bylaws', 'Regulatory Filings', 'IP Registration Documents'].map((doc, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                        <FiX className="text-red-500 text-sm" />
                                    </div>
                                    <span className="text-sm text-gray-700">{doc}</span>
                                </div>
                            ))}
                        </div>                        <div className="mt-6 text-center">
                            <p className="text-gray-600 mb-4">
                                {isSelfAnalysis ? 'Please upload the required legal documents in your profile to enable self-analysis.' : `Please ask ${entityName} to upload the required legal documents in their profile.`}
                            </p>
                            <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
                                <motion.button
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => window.open('/profile', '_blank')}
                                >
                                    <FiUpload className="mr-2" />
                                    Go to Profile Documents
                                </motion.button>
                                {!isSelfAnalysis && (
                                    <motion.button
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg shadow-sm hover:bg-amber-700 transition-colors flex items-center mx-auto"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toast("Document request feature will be implemented soon")}
                                    >
                                        <FiFileText className="mr-2" />
                                        Request Documents from {entityName}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show document availability and generate option
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">            {/* Header with help button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isSelfAnalysis ? 'Legal Self-Analysis' : 'Legal Due Diligence'}
                </h2>
                <TutorialButton tutorialId="legal-dd-tutorial" />
            </div>

            {/* Analysis Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                <div className="bg-blue-500 text-white rounded-full p-1 mr-3 flex-shrink-0">
                    <FiInfo size={18} />
                </div>
                <div>
                    <h3 className="font-medium text-blue-800 mb-1">Analysis Instructions</h3>
                    <p className="text-blue-700 text-sm">
                        Select a match from the Matches tab to view legal due diligence analysis and reports.
                    </p>
                </div>
            </div>            {/* Entity Documents List */}
            {availableDocuments && availableDocuments.length > 0 ? (
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                        The following legal documents {isSelfAnalysis ? 'you have uploaded' : `were uploaded by ${entityName}`} and will be used for analysis:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center p-2 hover:bg-white rounded-md">
                                    <FiFileText className="text-indigo-500 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{getFormattedDocumentType(doc.documentType)}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.documentName} •
                                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
                    <p className="text-amber-700 mb-2">No legal documents found for {entityName}.</p>
                    <p className="text-sm text-amber-600">Legal documents need to be uploaded to perform due diligence analysis.</p>
                </div>
            )}      {/* Missing Documents Alert */}
            {missingDocumentTypes && missingDocumentTypes.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
                    <div className="flex items-start">
                        <FiInfo className="text-amber-600 mr-2 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-800 mb-2">Improve Analysis Accuracy</h4>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <p className="text-amber-700 mb-2">The following document types would improve the analysis:</p>
                                <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                                    {missingDocumentTypes.map((docType, index) => (
                                        <li key={index}>{getFormattedDocumentType(docType)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}            {/* Generate Report Button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => generateReport()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                    disabled={!availableDocuments || availableDocuments.length === 0}
                >
                    <FiShield className="mr-2" />
                    {isSelfAnalysis ? 'Generate Legal Self-Analysis Report' : 'Generate Legal Due Diligence Report'}
                </button>
            </div>

            {/* What to Expect Section */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                    What to Expect in Your {isSelfAnalysis ? 'Legal Self-Analysis' : 'Legal Due Diligence'} Report
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Corporate Structure Analysis</h5>
                        <ul className="space-y-1 list-disc pl-4">
                            <li>Incorporation and registration compliance</li>
                            <li>Board composition and governance</li>
                            <li>Shareholder structure review</li>
                            <li>Corporate resolutions and approvals</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Compliance Assessment</h5>
                        <ul className="space-y-1 list-disc pl-4">
                            <li>Regulatory compliance status</li>
                            <li>Legal risk identification</li>
                            <li>Material agreement review</li>
                            <li>Intellectual property assessment</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalDueDiligence;