import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface QuestionnairePromptProps {
    message?: string;
    status?: 'not_started' | 'in_progress' | 'pending' | 'submitted';
}

const QuestionnairePrompt: React.FC<QuestionnairePromptProps> = ({
    message = "Please complete the belief system questionnaire to view this report.",
    status = 'not_started'
}) => {
    const navigate = useNavigate();

    const getStatusDetails = () => {
        switch (status) {
            case 'not_started':
                return {
                    message: "You haven't started the questionnaire yet.",
                    icon: <ClipboardCheck size={32} className="text-blue-600" />,
                    iconBg: "bg-blue-50 border-blue-200",
                    textColor: "text-blue-600",
                    progress: 0
                };
            case 'in_progress':
                return {
                    message: "You have an incomplete questionnaire.",
                    icon: <Clock size={32} className="text-amber-600" />,
                    iconBg: "bg-amber-50 border-amber-200",
                    textColor: "text-amber-600",
                    progress: 40
                };
            case 'pending':
                return {
                    message: "Your questionnaire submission is pending review.",
                    icon: <AlertCircle size={32} className="text-purple-600" />,
                    iconBg: "bg-purple-50 border-purple-200",
                    textColor: "text-purple-600",
                    progress: 80
                };
            default:
                return {
                    message: "Please complete the questionnaire to proceed.",
                    icon: <ClipboardCheck size={32} className="text-blue-600" />,
                    iconBg: "bg-blue-50 border-blue-200",
                    textColor: "text-blue-600",
                    progress: 0
                };
        }
    };

    const statusDetails = getStatusDetails();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden border border-gray-100"
                variants={itemVariants}
            >
                {/* Progress indicator */}
                <div className="h-1.5 bg-gray-100">
                    <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${statusDetails.progress}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    />
                </div>

                <div className="p-8">
                    <div className="flex items-start">
                        <motion.div
                            className={`w-16 h-16 rounded-xl flex items-center justify-center border ${statusDetails.iconBg} mr-5`}
                            animate={{
                                boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 15px rgba(0,0,0,0.08)", "0px 0px 0px rgba(0,0,0,0)"],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {statusDetails.icon}
                        </motion.div>

                        <div>
                            <motion.h2
                                className="text-xl font-bold text-gray-800 mb-2"
                                variants={itemVariants}
                            >
                                Questionnaire Required
                            </motion.h2>

                            <motion.p
                                className={`${statusDetails.textColor} font-medium text-sm mb-1`}
                                variants={itemVariants}
                            >
                                {statusDetails.message}
                            </motion.p>

                            <motion.p
                                className="text-gray-600 text-sm"
                                variants={itemVariants}
                            >
                                {message}
                            </motion.p>
                        </div>
                    </div>

                    <motion.div
                        className="mt-7"
                        variants={itemVariants}
                    >
                        <motion.button
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.02, boxShadow: "0px 3px 10px rgba(59, 130, 246, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/question')}
                        >
                            Go to Questionnaire <ArrowRight className="ml-2" size={18} />
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>

            <motion.p
                className="text-gray-500 text-xs mt-4 max-w-md text-center"
                variants={itemVariants}
            >
                Complete the questionnaire to unlock personalized insights and recommendations
            </motion.p>
        </motion.div>
    );
};

export default QuestionnairePrompt;