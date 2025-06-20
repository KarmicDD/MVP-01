import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBarChart2, FiShield, FiFileText, FiUser, FiInfo, FiTrendingUp, FiEye, FiTarget, FiZap } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import NewFinancialDueDiligence from './NewFinancialDueDiligence';
import LegalDueDiligence from './LegalDueDiligence';

interface SelfAnalysisSectionProps {
  userProfile?: {
    role: string;
    userId?: string;
  } | null;
}

const SelfAnalysisSection: React.FC<SelfAnalysisSectionProps> = ({ userProfile }) => {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('financial');
  const role = userProfile?.role || 'startup';

  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';

  // Define gradient backgrounds based on role
  const cardGradient = role === 'startup'
    ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(238, 242, 255, 0.8))'
    : 'linear-gradient(135deg, rgba(240, 253, 244, 0.8), rgba(236, 253, 245, 0.8))';

  const borderColor = role === 'startup' ? 'rgba(191, 219, 254, 0.5)' : 'rgba(167, 243, 208, 0.5)';

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Analysis tabs for self-analysis
  const analysisTabs = [
    {
      id: 'financial',
      label: 'Financial Due Diligence',
      icon: <FiBarChart2 />,
      description: 'Comprehensive financial analysis of your own company',
      color: '#3B82F6'
    },
    {
      id: 'legal',
      label: 'Legal Due Diligence',
      icon: <FiShield />,
      description: 'Legal compliance and risk assessment for your company',
      color: '#10B981'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header section */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-6 shadow-sm border"
        style={{
          background: cardGradient,
          borderColor: borderColor,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: `${primaryColor}E0` }}>
              Self-Analysis Dashboard
            </h1>            <p className="text-gray-600 mt-1">
              Run comprehensive due diligence analysis on your own company to identify strengths, address potential issues, and prepare for investor reviews.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="flex items-center bg-white bg-opacity-60 rounded-lg px-3 py-2 text-sm">
              <FiUser className="mr-2" style={{ color: primaryColor }} />
              <span className="font-medium" style={{ color: primaryColor }}>
                {role === 'startup' ? 'Startup' : 'Investor'} Self-Analysis
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-4 border border-blue-200 bg-blue-50"
      >
        <div className="flex items-start">
          <FiInfo className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Self-Assessment Benefits</h3>            <p className="text-blue-700 text-sm leading-relaxed">
              Use these tools to analyze your own company's documents before sharing with potential {role === 'startup' ? 'investors' : 'startups'}.
              Identify potential issues, ensure compliance, and prepare comprehensive reports that demonstrate transparency and professionalism.
              This proactive approach helps you address concerns early and present a stronger case to stakeholders.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Analysis Type Selection */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-6 shadow-sm border"
        style={{
          background: cardGradient,
          borderColor: borderColor,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveAnalysisTab(tab.id)}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${activeAnalysisTab === tab.id
                  ? 'border-opacity-100 shadow-lg'
                  : 'border-opacity-30 hover:border-opacity-60'
                }`}
              style={{
                borderColor: tab.color,
                backgroundColor: activeAnalysisTab === tab.id
                  ? `${tab.color}08`
                  : 'rgba(255, 255, 255, 0.7)',
                boxShadow: activeAnalysisTab === tab.id
                  ? `0 8px 25px ${tab.color}20`
                  : '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start">
                <div
                  className="p-3 rounded-lg mr-4"
                  style={{ backgroundColor: `${tab.color}15` }}
                >
                  <span style={{ color: tab.color }} className="text-xl">
                    {tab.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{ color: tab.color }}
                  >
                    {tab.label}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tab.description}
                  </p>
                  <div className="flex items-center mt-3 text-sm">
                    <FiEye className="mr-1" style={{ color: tab.color }} />
                    <span style={{ color: tab.color }}>
                      {activeAnalysisTab === tab.id ? 'Active' : 'Click to activate'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Analysis Content */}
      <AnimatePresence mode="wait">
        {activeAnalysisTab === 'financial' && (
          <motion.div
            key="financial-self-analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl shadow-sm border bg-white p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FiBarChart2 className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Financial Self-Analysis</h2>
                  <p className="text-gray-600 text-sm">
                    Analyze your own financial documents to identify strengths and areas for improvement
                  </p>
                </div>
              </div>
              {/* Pass the user's own ID as both userProfile and selectedMatchId */}
              <NewFinancialDueDiligence
                userProfile={userProfile as any}
                selectedMatchId={userProfile?.userId || null}
                isSelfAnalysis={true}
              />
            </div>
          </motion.div>
        )}

        {activeAnalysisTab === 'legal' && (
          <motion.div
            key="legal-self-analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl shadow-sm border bg-white p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FiShield className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Legal Self-Analysis</h2>
                  <p className="text-gray-600 text-sm">
                    Assess your legal compliance and identify potential risks in your documentation
                  </p>
                </div>
              </div>
              {/* Pass the user's own ID as both userProfile and selectedMatchId */}
              <LegalDueDiligence
                userProfile={userProfile as any}
                selectedMatchId={userProfile?.userId || null}
                isSelfAnalysis={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benefits Section */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
      >
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
          <FiTrendingUp className="mr-2" />
          Why Self-Analysis Matters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">            <div className="bg-white bg-opacity-60 rounded-lg p-4">
          <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <FiTarget className="text-purple-600" />
          </div><h4 className="font-medium text-purple-800 mb-2">Preparation & Risk Mitigation</h4>
          <p className="text-purple-700 text-sm">
            Identify and address potential issues, gaps, or compliance concerns before external due diligence processes begin.
          </p>
        </div>          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <FiZap className="text-purple-600" />
            </div><h4 className="font-medium text-purple-800 mb-2">Market Confidence</h4>
            <p className="text-purple-700 text-sm">
              Build confidence in your compliance status, financial health, and operational readiness with objective assessments.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <FiTrendingUp className="text-purple-600" />
            </div>            <h4 className="font-medium text-purple-800 mb-2">Strategic Improvement</h4>
            <p className="text-purple-700 text-sm">
              Get actionable AI-powered recommendations to strengthen your company's position and enhance investor appeal.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SelfAnalysisSection;
