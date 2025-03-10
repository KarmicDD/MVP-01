import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFillLightbulbFill } from "react-icons/bs";
import { FiTarget, FiUsers, FiChevronDown, FiTrendingUp } from "react-icons/fi";
import { Sparkles } from "lucide-react";

const AIRecommendations = () => {
    const [expanded, setExpanded] = useState<string | null>(null);

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

    const recommendations = [
        {
            id: "alignment",
            icon: <BsFillLightbulbFill className="text-amber-500" size={18} />,
            title: "Strategic Alignment",
            summary: "Strong alignment in AI and machine learning focus areas",
            details: "Your startup's focus on AI-driven analytics aligns perfectly with this investor's portfolio strategy. They've previously invested in 3 AI companies at similar stages."
        },
        {
            id: "growth",
            icon: <FiTrendingUp className="text-emerald-500" size={18} />,
            title: "Growth Trajectory",
            summary: "Growth trajectory matches investor's portfolio preferences",
            details: "Your current 18% MoM growth rate and scaling strategy closely matches what this investor looks for in Series A companies."
        },
        {
            id: "team",
            icon: <FiUsers className="text-blue-500" size={18} />,
            title: "Team Compatibility",
            summary: "Team composition indicates strong execution capability",
            details: "Your founding team's technical expertise complements this investor's operational approach. They typically provide hands-off support for technical teams with proven domain expertise."
        }
    ];

    const toggleExpand = (id: string) => {
        setExpanded(expanded === id ? null : id);
    };

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
                    Precision: 94%
                </span>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => (
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
                                    {rec.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
                                    <p className="text-sm text-gray-600">{rec.summary}</p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: expanded === rec.id ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <FiChevronDown className="text-gray-400" />
                            </motion.div>
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
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="mt-5 flex justify-center"
                variants={itemVariants}
            >
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                    <FiTarget className="mr-1" size={14} />
                    View all recommendations
                </button>
            </motion.div>
        </motion.div>
    );
};

export default AIRecommendations;