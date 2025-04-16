import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFillLightbulbFill } from "react-icons/bs";
import { FiTarget, FiUsers, FiChevronDown, FiTrendingUp, FiAlertCircle, FiDollarSign, FiMessageSquare } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { useRecommendations } from "../../../hooks/useRecommendations";
import { LoadingSpinner } from "../../Loading";

interface AIRecommendationsProps {
    startupId?: string | null;
    investorId?: string | null;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ startupId, investorId }) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    const { recommendations, loading, error } = useRecommendations(startupId || null, investorId || null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // Get icon based on recommendation category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'strategic':
                return <BsFillLightbulbFill className="text-amber-500" size={18} />;
            case 'operational':
                return <FiUsers className="text-blue-500" size={18} />;
            case 'financial':
                return <FiDollarSign className="text-emerald-500" size={18} />;
            case 'communication':
                return <FiMessageSquare className="text-purple-500" size={18} />;
            case 'growth':
                return <FiTrendingUp className="text-red-500" size={18} />;
            default:
                return <FiAlertCircle className="text-gray-500" size={18} />;
        }
    };

    // Get color based on priority
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'low':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    // Fallback recommendations if none are available
    const fallbackRecommendations = [
        {
            id: "alignment",
            title: "Strategic Alignment",
            summary: "Strong alignment in industry focus areas",
            details: "The startup's focus aligns well with this investor's portfolio strategy. Consider highlighting this alignment in your communications.",
            category: "strategic",
            priority: "high",
            confidence: 92
        },
        {
            id: "growth",
            title: "Growth Trajectory",
            summary: "Growth trajectory matches investor's portfolio preferences",
            details: "Your current growth rate and scaling strategy closely matches what this investor typically looks for in companies at your stage.",
            category: "growth",
            priority: "medium",
            confidence: 85
        },
        {
            id: "team",
            title: "Team Compatibility",
            summary: "Team composition indicates strong execution capability",
            details: "Your founding team's expertise complements this investor's operational approach. They typically provide hands-off support for teams with proven domain expertise.",
            category: "operational",
            priority: "medium",
            confidence: 88
        }
    ];

    const toggleExpand = (id: string) => {
        setExpanded(expanded === id ? null : id);
    };

    // If no startup or investor ID is provided, show a message
    if (!startupId && !investorId) {
        return (
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                <Sparkles className="text-blue-600 mx-auto mb-2" size={24} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Recommendations</h3>
                <p className="text-gray-500">Select a match to view personalized recommendations</p>
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex justify-center items-center" style={{ minHeight: '300px' }}>
                <LoadingSpinner size="medium" />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 text-center">
                <FiAlertCircle className="text-red-500 mx-auto mb-2" size={24} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to Load Recommendations</h3>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    // Use actual recommendations if available, otherwise use fallback
    const recs = recommendations?.recommendations || fallbackRecommendations;
    const precision = recommendations?.precision || 90;

    return (
        <motion.div
            className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-lg shadow-sm border border-blue-100"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                    <Sparkles className="text-blue-600 mr-2" size={20} />
                    <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        AI Recommendations
                    </h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Precision: {precision}%
                </span>
            </div>

            <div className="space-y-3">
                {recs.map((rec) => (
                    <motion.div
                        key={rec.id}
                        className="bg-white border border-gray-100 rounded-lg overflow-hidden"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            className="p-3 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleExpand(rec.id)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-md">
                                    {getCategoryIcon(rec.category)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
                                    <p className="text-sm text-gray-600">{rec.summary}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {rec.priority && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${getPriorityColor(rec.priority)}`}>
                                        {rec.priority}
                                    </span>
                                )}
                                <motion.div
                                    animate={{ rotate: expanded === rec.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FiChevronDown className="text-gray-400" />
                                </motion.div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expanded === rec.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3 pb-3 pt-1 border-t border-gray-100 text-sm text-gray-700">
                                        {rec.details}
                                        {rec.confidence && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Confidence: {rec.confidence}%
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {recs.length > 3 && (
                <motion.div
                    className="mt-5 flex justify-center"
                    variants={itemVariants}
                >
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                        <FiTarget className="mr-1" size={14} />
                        View all recommendations
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AIRecommendations;