// src/pages/BeliefSystemReport.tsx
import { useParams } from 'react-router-dom';
import { useBeliefSystemReport } from '../hooks/useBeliefSystemReport';
import BeliefSystemReportContent from '../components/Dashboard/Analytics/BeliefSystemReportContent';


const BeliefSystemReport = () => {

    const { startupId, investorId } = useParams();

    const {
        report,
        loading,
        error,
        handleExportPDF,
        handleShareReport,
        formatDate,
        reportRef  // Make sure this is coming from the hook
    } = useBeliefSystemReport(startupId || "", investorId || "");


    const handleBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <button
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleBack}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <BeliefSystemReportContent
            ref={reportRef} // This line is missing!
            report={report}
            formatDate={formatDate}
            handleExportPDF={handleExportPDF}
            handleShareReport={handleShareReport}
            onBack={handleBack}
        />
    );
};

export default BeliefSystemReport;