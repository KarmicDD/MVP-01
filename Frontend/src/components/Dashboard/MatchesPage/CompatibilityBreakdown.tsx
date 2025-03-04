import { motion } from "framer-motion";
import { colours } from "../../../utils/colours";

interface CompatibilityBreakdownProps {
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

// Compatibility breakdown component
const CompatibilityBreakdown: React.FC<CompatibilityBreakdownProps> = ({
    breakdown,
    overallScore,
    insights
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold">Compatibility Score</h3>
                <div className="ml-auto bg-blue-100 text-blue-800 font-bold rounded-full px-3 py-1">
                    {overallScore}%
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Mission Alignment</span>
                    <span>{breakdown.missionAlignment}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colours.primaryBlue, width: `${breakdown.missionAlignment}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${breakdown.missionAlignment}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Investment Philosophy</span>
                    <span>{breakdown.investmentPhilosophy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colours.primaryBlue, width: `${breakdown.investmentPhilosophy}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${breakdown.investmentPhilosophy}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Sector Focus</span>
                    <span>{breakdown.sectorFocus}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colours.primaryBlue, width: `${breakdown.sectorFocus}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${breakdown.sectorFocus}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Funding Stage Alignment</span>
                    <span>{breakdown.fundingStageAlignment}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colours.primaryBlue, width: `${breakdown.fundingStageAlignment}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${breakdown.fundingStageAlignment}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span>Value Add Match</span>
                    <span>{breakdown.valueAddMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colours.primaryBlue, width: `${breakdown.valueAddMatch}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${breakdown.valueAddMatch}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Key Insights</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CompatibilityBreakdown;