import { useState, useEffect, useRef } from 'react';
import { beliefSystemService } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';

export interface BeliefSystemReportType {
    generatedDate: string;
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
        growthExpectations?: number;
        innovation?: number;
        riskApproach?: number;
        communication?: number;
        leadershipStyle?: number;
        [key: string]: number | undefined;
    };
    executiveSummary: {
        headline: string;
        keyFindings: string;
        recommendedActions: string;
        successProbability: number;
        keyNumbers: Array<{ label: string; value: string | number; color: string }>;
    };
    scoringBreakdown: Array<{ label: string; score: number; description: string }>;
    strengths: Array<{ area: string; score: number; description: string }>;
    weaknesses: Array<{ area: string; score: number; description: string }>;
    risks: {
        marketFitRisk: {
            level: string;
            description: string;
            impactAreas?: string[];
            factors?: Array<{ factor: string; score: number }>;
        };
        operationalRisk: {
            level: string;
            description: string;
            impactAreas?: string[];
            factors?: Array<{ factor: string; score: number }>;
        };
        riskHeatmap?: Array<{ risk: string; severity: string; probability: number; impact: number }>;
    };
    riskFactors?: {
        marketFit: Array<{ factor: string; score: number }>;
        operational: Array<{ factor: string; score: number }>;
    };
    riskMitigationRecommendations: Array<{
        text: string;
        priority: 'High' | 'Medium' | 'Low';
        timeline: 'Immediate' | 'Short-term' | 'Medium-term' | 'Long-term';
    }>;
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
        actions?: {
            strategicFocus: string[];
            communication: string[];
            growthMetrics: string[];
        };
    };
    perspective: string;
    isOldData?: boolean;
    message?: string;
}

export function useBeliefSystemReport(startupId: string | null, investorId: string | null) {
    const [report, setReport] = useState<BeliefSystemReportType | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);

    // Add questionnaire status states
    const [questionnaireStatus, setQuestionnaireStatus] = useState<'not_started' | 'in_progress' | 'submitted' | 'pending' | null>(null);
    const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState<boolean | null>(null);
    const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);

    // First check if questionnaire is complete
    useEffect(() => {
        const checkQuestionnaireStatus = async () => {
            try {
                setCheckingQuestionnaire(true);
                console.log('Checking questionnaire status in report hook...');

                const response = await api.get('/questionnaire/status');
                console.log('Questionnaire status response in report hook:', response.data);

                const status = response.data.status || 'not_started';
                const isComplete = Boolean(response.data.isComplete);

                setQuestionnaireStatus(status);
                setIsQuestionnaireComplete(isComplete);

                if (!isComplete) {
                    setLoading(false); // Stop loading since we won't fetch the report
                }

            } catch (err) {
                console.error('Error checking questionnaire status in report hook:', err);
                // Don't set error here as we still want to try fetching the report
            } finally {
                setCheckingQuestionnaire(false);
            }
        };

        checkQuestionnaireStatus();
    }, []);

    // Only fetch report if questionnaire is complete
    useEffect(() => {
        // Skip if still checking questionnaire or if questionnaire is not complete
        if (checkingQuestionnaire || isQuestionnaireComplete === null) {
            return;
        }

        // If questionnaire is not complete, don't fetch report
        if (!isQuestionnaireComplete) {
            console.log('Questionnaire not complete, skipping report fetch');
            return;
        }

        // If we're here, questionnaire is complete, so fetch report if IDs are provided
        const fetchReport = async () => {
            if (!startupId || !investorId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log(`Fetching belief system report for startup ${startupId} and investor ${investorId}`);
                const data = await beliefSystemService.getReport(startupId, investorId);
                setReport(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    const errorObj = err as { response?: { data?: { message?: string } } };
                    setError(errorObj.response?.data?.message || err.message || 'Failed to load belief system report');
                } else {
                    setError('Failed to load belief system report');
                }
                console.error('Error fetching belief system report:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [startupId, investorId, isQuestionnaireComplete, checkingQuestionnaire]);

    const handleExportPDF = async () => {
        if (!reportRef.current) {
            toast.error('Report content not found');
            return;
        }

        try {
            // Set loading state
            setLoading(true);

            // Capture the report component as an image
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher quality
                logging: false,
                useCORS: true
            });

            // Calculate PDF dimensions (A4)
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

            // Handle multi-page if content is long
            let position = 0;
            let remainingHeight = imgHeight;

            while (remainingHeight > pageHeight) {
                // Add new page
                pdf.addPage();
                // Add image and adjust position
                position -= pageHeight;
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                remainingHeight -= pageHeight;
            }

            // Save PDF file
            pdf.save(`belief-system-report-${startupId}-${investorId}.pdf`);

            // Show success notification
            toast.success('Report downloaded successfully!');
        } catch (err: unknown) {
            console.error('Error generating PDF:', err);
            if (err instanceof Error) {
                toast.error(`Failed to generate PDF: ${err.message || 'Unknown error'}`);
            } else {
                toast.error('Failed to generate PDF: Unknown error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShareReport = async () => {
        if (!startupId || !investorId) return;

        const emailInput = window.prompt('Enter email addresses separated by commas:');
        if (!emailInput) return;

        const emails = emailInput.split(',').map(email => email.trim());

        try {
            await beliefSystemService.shareReport(startupId, investorId, emails);
            toast.success('Report shared successfully!');
        } catch (err: unknown) {
            console.error('Error sharing report:', err);
            if (err instanceof Error) {
                const errorObj = err as { response?: { data?: { message?: string } } };
                toast.error('Failed to share report: ' + (errorObj.response?.data?.message || err.message || 'Unknown error'));
            } else {
                toast.error('Failed to share report: Unknown error');
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return {
        report,
        loading,
        error,
        questionnaireStatus,
        isQuestionnaireComplete,
        checkingQuestionnaire,
        handleExportPDF,
        handleShareReport,
        formatDate,
        reportRef
    };
}