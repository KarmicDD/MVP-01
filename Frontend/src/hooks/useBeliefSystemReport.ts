import { useState, useEffect, useRef } from 'react';
import { beliefSystemService } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface BeliefSystemReportType {
    generatedDate: string;
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
    };
    risks: {
        marketFitRisk: {
            level: string;
            description: string;
        };
        operationalRisk: {
            level: string;
            description: string;
        };
    };
    riskMitigationRecommendations: string[];
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
    };
    perspective: string;
}

export function useBeliefSystemReport(startupId: string | null, investorId: string | null) {
    const [report, setReport] = useState<BeliefSystemReportType | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!startupId || !investorId) return;

            try {
                setLoading(true);
                setError(null);
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
    }, [startupId, investorId]);

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
            alert('Report shared successfully!');
        } catch (err: unknown) {
            console.error('Error sharing report:', err);
            if (err instanceof Error) {
                const errorObj = err as { response?: { data?: { message?: string } } };
                alert('Failed to share report: ' + (errorObj.response?.data?.message || err.message || 'Unknown error'));
            } else {
                alert('Failed to share report: Unknown error');
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
        handleExportPDF,
        handleShareReport,
        formatDate,
        reportRef
    };
}