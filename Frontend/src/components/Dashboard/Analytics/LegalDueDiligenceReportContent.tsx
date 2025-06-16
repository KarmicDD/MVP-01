import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiInfo,
  FiDownload,
  FiShare2,
  FiActivity,
  FiTarget,
  FiAward,
  FiBriefcase,
  FiStar,
  FiList,
  FiFileMinus,
  FiDatabase,
  FiZoomIn,
  FiCheckSquare,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiDollarSign,
  FiClipboard,
  FiThumbsUp,
  FiThumbsDown,
  FiHelpCircle,
  FiChevronDown,
  FiZap,
  FiLayout,
} from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { LegalDueDiligenceReport, LegalReportItem, LegalDocumentItem, LegalDetailedFinding, LegalRecommendation, LegalAnalysis } from '../../../hooks/useLegalDueDiligence';

interface LegalDueDiligenceReportContentProps {
  report: LegalDueDiligenceReport;
  userProfile: {
    userId: string;
    role: 'startup' | 'investor';
  };
  entityName: string;
  formatDate: (date: string | Date) => string;
  handleExportPDF: () => void;
  handleShareReport: () => void;
  isCompact?: boolean;
}

const LegalDueDiligenceReportContent: React.FC<LegalDueDiligenceReportContentProps> = ({
  report: initialReport,
  userProfile,
  entityName,
  formatDate,
  handleExportPDF,
  handleShareReport,
  isCompact = false
}) => {
  const [report, setReport] = useState<LegalDueDiligenceReport>(initialReport);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});
  const reportRef = useRef<HTMLDivElement>(null); useEffect(() => {
    setReport(initialReport);
    console.log('LegalDueDiligenceReportContent - Initial Report:', initialReport);
    console.log('LegalDueDiligenceReportContent - Legal Analysis:', initialReport?.legalAnalysis);
    console.log('LegalDueDiligenceReportContent - Executive Summary:', initialReport?.executiveSummary || initialReport?.legalAnalysis?.executiveSummary);
    console.log('LegalDueDiligenceReportContent - Items:', initialReport?.items || initialReport?.legalAnalysis?.items);
    console.log('LegalDueDiligenceReportContent - Total Company Score:', initialReport?.totalCompanyScore || initialReport?.legalAnalysis?.totalCompanyScore);
    console.log('LegalDueDiligenceReportContent - Investment Decision:', initialReport?.investmentDecision || initialReport?.legalAnalysis?.investmentDecision);

    const initialActiveSections: Record<string, boolean> = {};
    if (initialReport) {
      if (initialReport.introduction || initialReport.legalAnalysis?.introduction) initialActiveSections['Introduction'] = true;
      if (initialReport.executiveSummary || initialReport.legalAnalysis?.executiveSummary) initialActiveSections['Executive Summary'] = true;
      if (initialReport.items || initialReport.legalAnalysis?.items) initialActiveSections['Detailed Analysis'] = true;
      if (initialReport.totalCompanyScore || initialReport.legalAnalysis?.totalCompanyScore) initialActiveSections['Overall Legal Score'] = true;
      if (initialReport.investmentDecision || initialReport.legalAnalysis?.investmentDecision) initialActiveSections['Investment Decision Perspective'] = true;
      if (initialReport.missingDocuments || initialReport.legalAnalysis?.missingDocuments) initialActiveSections['Missing Documents & Information Gaps'] = true;
      if (initialReport.detailedFindings || initialReport.legalAnalysis?.detailedFindings) initialActiveSections['Detailed Findings'] = true;
      if (initialReport.recommendations && initialReport.recommendations.length > 0) initialActiveSections['Consolidated Recommendations'] = true;
      if (initialReport.legalAnalysis?.reportMetadata) initialActiveSections['Report Metadata'] = true;
      if (initialReport.disclaimer || initialReport.legalAnalysis?.disclaimer) initialActiveSections['Disclaimer'] = true;
    }
    console.log('LegalDueDiligenceReportContent - Active Sections:', initialActiveSections);
    setActiveSections(initialActiveSections);
  }, [initialReport]);

  const toggleSection = (section: string) => {
    setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!report) {
    return <div className="p-6 text-center text-slate-500">Loading legal due diligence report...</div>;
  }

  const { legalAnalysis } = report;

  const introductionContent = report.introduction || legalAnalysis?.introduction;
  const reportItems: LegalReportItem[] | undefined = report.items || legalAnalysis?.items;

  const formatTextWithBold = (text: string | undefined): React.ReactNode => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold text-slate-800">
            {boldText}
          </span>
        );
      }
      if (part.includes('\n')) {
        return part.split('\n').map((line, lineIdx) => (
          <React.Fragment key={`${index}-${lineIdx}`}>
            {line}
            {lineIdx < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  }; const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; delay?: number; isOpen: boolean; toggleOpen: () => void }> = ({
    title,
    icon,
    children,
    delay = 0.1,
    isOpen,
    toggleOpen,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="mb-16 page-break-inside-avoid"
      >
        <div className="border-2 border-gray-400 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Section Header */}
          <div
            className="px-8 py-6 cursor-pointer border-b-2 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
              borderColor: '#374151'
            }}
            onClick={toggleOpen}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                {icon && (
                  <motion.span
                    className="text-2xl mr-4 text-white"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {icon}
                  </motion.span>
                )}
                <h2
                  className="text-2xl font-bold text-white uppercase tracking-wider"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    letterSpacing: '0.15em'
                  }}
                >
                  {title}
                </h2>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="text-xl text-white"
              >
                <FiChevronDown />
              </motion.div>
            </div>
          </div>

          {/* Section Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-gradient-to-br from-white to-gray-50"
              >
                <div className="px-12 py-10">
                  <div
                    className="prose max-w-none"
                    style={{
                      color: '#1a202c',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '16px',
                      lineHeight: '1.8'
                    }}
                  >
                    {children}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }; const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number; color?: string }> = ({ icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 border-2 border-gray-400 bg-white ${value || value === 0 ? '' : 'opacity-70'}`}
    >
      <div className="flex items-center mb-3 text-gray-700">
        <div className="p-2 border border-gray-400 mr-3 bg-gray-50">
          <span className="text-lg text-gray-600">{icon}</span>
        </div>
        <span
          className="font-bold text-sm uppercase tracking-wider"
          style={{ fontFamily: '"Times New Roman", serif' }}
        >
          {label}
        </span>
      </div>
      <p
        className={`font-bold text-xl ${color || ''}`}
        style={{
          color: '#1a202c',
          fontFamily: '"Times New Roman", serif'
        }}
      >
        {value?.toString() || 'N/A'}
      </p>
    </motion.div>
  );  // Enhanced bullet point component for different content types
  const EnhancedBulletPoint: React.FC<{
    children: React.ReactNode;
    type: 'action' | 'finding' | 'fact' | 'recommendation';
    index: number;
    priority?: 'critical' | 'high' | 'medium' | 'low';
  }> = ({ children, type, index, priority }) => {
    const getTypeConfig = () => {
      switch (type) {
        case 'action':
          return {
            icon: FiTrendingUp,
            gradient: 'from-emerald-500 to-emerald-600',
            borderColor: 'border-emerald-400',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-700'
          };
        case 'finding':
          return {
            icon: FiZap,
            gradient: 'from-amber-500 to-amber-600',
            borderColor: 'border-amber-400',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700'
          };
        case 'fact':
          return {
            icon: FiCheckCircle,
            gradient: 'from-blue-500 to-blue-600',
            borderColor: 'border-blue-400',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
          };
        case 'recommendation':
          return {
            icon: FiTarget,
            gradient: 'from-purple-500 to-purple-600',
            borderColor: 'border-purple-400',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
          };
        default:
          return {
            icon: FiInfo,
            gradient: 'from-gray-500 to-gray-600',
            borderColor: 'border-gray-400',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-700'
          };
      }
    };

    const getPriorityIndicator = () => {
      if (!priority) return null;
      const colors = {
        critical: 'bg-red-500',
        high: 'bg-orange-500',
        medium: 'bg-yellow-500',
        low: 'bg-green-500'
      };
      return (
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${colors[priority]} rounded-full border-2 border-white shadow-sm`} />
      );
    };

    const config = getTypeConfig();
    const IconComponent = config.icon;

    return (
      <motion.div
        className="flex items-start group hover:bg-white/60 p-4 rounded-xl transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-200/50"
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          delay: index * 0.08,
          duration: 0.4,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex-shrink-0 mt-1 mr-5 relative">
          <div className={`w-8 h-8 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg ${config.borderColor} border-2 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
            <IconComponent className="text-white text-sm font-bold z-10" />
            {getPriorityIndicator()}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Connecting line for visual flow */}
          <div className="absolute left-4 top-8 w-0.5 h-4 bg-gray-200 opacity-60" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-lg leading-relaxed font-medium"
            style={{
              fontFamily: '"Times New Roman", serif',
              textAlign: 'justify',
              color: '#1a202c',
              lineHeight: '1.7'
            }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    );
  };

  const formatRecommendedActions = (actionsText: string | string[] | undefined): React.ReactNode => {
    if (!actionsText) return '';

    // Handle array case
    if (Array.isArray(actionsText)) {
      return (
        <div className="space-y-2 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
              <FiTrendingUp className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-emerald-800">Action Items</span>
          </div>
          {actionsText.map((action, index) => (
            <EnhancedBulletPoint key={index} type="action" index={index}>
              {formatTextWithBold(action)}
            </EnhancedBulletPoint>
          ))}
        </div>
      );
    }

    // Handle string case - try to split by common delimiters
    const actionsList = actionsText
      .split(/(?:\d+\.|\-|\•|;|\n\n)/)
      .map(action => action.trim())
      .filter(action => action.length > 0 && action !== '');

    // If we have multiple actions, display as enhanced bullet points
    if (actionsList.length > 1) {
      return (
        <div className="space-y-2 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200/50 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
              <FiTrendingUp className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-emerald-800">Action Items</span>
          </div>
          {actionsList.map((action, index) => (
            <EnhancedBulletPoint key={index} type="action" index={index}>
              {formatTextWithBold(action)}
            </EnhancedBulletPoint>
          ))}
        </div>
      );
    }

    // If single action or can't parse, display as enhanced single block
    return (
      <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50 shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-green-600" />
        <div className="p-6 pl-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-emerald-800 mb-2 uppercase tracking-wider">Recommended Action</div>
              <span
                className="text-lg leading-relaxed block text-gray-800"
                style={{
                  fontFamily: '"Times New Roman", serif',
                  textAlign: 'justify',
                  lineHeight: '1.7'
                }}
              >
                {formatTextWithBold(actionsText)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: '"Times New Roman", serif',
        lineHeight: '1.6',
        color: '#1a202c'
      }}
    >
      {/* Formal Report Header */}
      <div
        className="border-b-4 pb-8 mb-12"
        style={{
          background: 'linear-gradient(to right, #1e293b, #0f172a)',
          borderColor: '#1e293b',
          color: 'white'
        }}
      >
        <div className="px-12 py-16">
          {/* Report Classification */}
          <div className="text-center mb-8">
            <div
              className="inline-block px-8 py-3 mb-6 border-2 rounded"
              style={{
                borderColor: '#64748b',
                background: 'rgba(100, 116, 139, 0.1)'
              }}
            >
              <span className="text-xl font-bold tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                CONFIDENTIAL
              </span>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-6" style={{ fontFamily: '"Times New Roman", serif' }}>
              LEGAL DUE DILIGENCE REPORT
            </h1>
            <div className="w-48 h-1 bg-white mx-auto mb-8"></div>
            <h2 className="text-4xl font-semibold mb-4">
              {report.clientName || report.entityProfile?.companyName || entityName}
            </h2>
            <p className="text-xl opacity-90">
              Comprehensive Legal Compliance Assessment
            </p>
          </div>

          {/* Report Details Table */}
          <div className="max-w-4xl mx-auto">
            <table className="w-full border-2 border-white/30">
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <th className="px-6 py-4 text-left border border-white/20 font-bold uppercase tracking-wider">
                    Report Information
                  </th>
                  <th className="px-6 py-4 text-left border border-white/20 font-bold uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr>
                  <td className="px-6 py-4 border border-white/20 font-semibold">Report Date:</td>
                  <td className="px-6 py-4 border border-white/20">
                    {report.reportDate ? formatDate(report.reportDate) : new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 border border-white/20 font-semibold">Report Type:</td>
                  <td className="px-6 py-4 border border-white/20">Legal Due Diligence Assessment</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 border border-white/20 font-semibold">Jurisdiction:</td>
                  <td className="px-6 py-4 border border-white/20">Republic of India</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 border border-white/20 font-semibold">Compliance Framework:</td>
                  <td className="px-6 py-4 border border-white/20">Indian Corporate Law & Regulations</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 border border-white/20 font-semibold">Report Version:</td>
                  <td className="px-6 py-4 border border-white/20">KarmicDD Legal v2.1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 mt-12">
            <button
              onClick={handleExportPDF}
              className="flex items-center px-8 py-4 border-2 border-white/50 rounded font-semibold text-lg transition-all duration-300 hover:bg-white/10"
            >
              <FiDownload className="mr-3 text-xl" />
              Export to PDF
            </button>
            <button
              onClick={handleShareReport}
              className="flex items-center px-8 py-4 border-2 border-white/50 rounded font-semibold text-lg transition-all duration-300 hover:bg-white/10"
            >
              <FiShare2 className="mr-3 text-xl" />
              Share Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-12 py-16 bg-white" ref={reportRef} style={{ fontFamily: '"Times New Roman", serif' }}>

        {/* Enhanced Overview Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h2
            className="text-4xl font-bold mb-8 text-center border-b-2 border-gray-400 pb-4"
            style={{ fontFamily: '"Times New Roman", serif' }}
          >
            LEGAL DUE DILIGENCE OVERVIEW
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiFileText className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-800">
                    {legalAnalysis?.reportMetadata?.documentsReviewed || 'N/A'}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">Documents Reviewed</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiCheckCircle className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-800">
                    {legalAnalysis?.reportMetadata?.complianceAreasChecked || 'N/A'}
                  </div>
                  <div className="text-green-600 text-sm font-medium">Compliance Areas</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-amber-50 to-yellow-100 p-6 rounded-2xl border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiAlertTriangle className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-800">
                    {legalAnalysis?.reportMetadata?.totalFindings || 'N/A'}
                  </div>
                  <div className="text-amber-600 text-sm font-medium">Total Findings</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <FiAward className="text-white text-xl" />
                </div>
                <div>                  <div className="text-2xl font-bold text-purple-800">
                  {(() => {
                    const score = report.totalCompanyScore || legalAnalysis?.totalCompanyScore;
                    if (typeof score === 'object' && score !== null && 'score' in score) {
                      return score.score;
                    }
                    return score?.toString() || 'N/A';
                  })()}
                </div>
                  <div className="text-purple-600 text-sm font-medium">Overall Score</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Status Indicators */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Compliance Status Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">
                    {legalAnalysis?.reportMetadata?.criticalIssuesCount || 0}
                  </span>
                </div>
                <div className="text-red-600 font-medium text-sm">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">
                    {legalAnalysis?.reportMetadata?.highPriorityIssuesCount || 0}
                  </span>
                </div>
                <div className="text-orange-600 font-medium text-sm">High Priority</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">
                    {legalAnalysis?.reportMetadata?.mediumPriorityIssuesCount || 0}
                  </span>
                </div>
                <div className="text-yellow-600 font-medium text-sm">Medium Priority</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">
                    {legalAnalysis?.reportMetadata?.lowPriorityIssuesCount || 0}
                  </span>
                </div>
                <div className="text-green-600 font-medium text-sm">Low Priority</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table of Contents */}
        <div className="mb-20 page-break-after">
          <h2
            className="text-4xl font-bold mb-8 text-center border-b-2 border-gray-400 pb-4"
            style={{ fontFamily: '"Times New Roman", serif' }}
          >
            TABLE OF CONTENTS
          </h2>
          <div className="max-w-4xl mx-auto">
            <table className="w-full border-2 border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-left border border-gray-400 font-bold uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-4 text-center border border-gray-400 font-bold uppercase tracking-wider">
                    Page
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(activeSections).map(([section, isActive], index) => (
                  isActive && (
                    <tr key={section}>
                      <td className="px-6 py-3 border border-gray-400 font-semibold">{section}</td>
                      <td className="px-6 py-3 border border-gray-400 text-center">{index + 1}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>      {introductionContent && (
          <SectionCard
            title="Introduction"
            icon={<FiInfo />}
            delay={0.2}
            isOpen={activeSections['Introduction']}
            toggleOpen={() => toggleSection('Introduction')}        >
            <div className="prose max-w-none leading-relaxed">
              {introductionContent.split('\n\n').map((paragraph, index) => (
                <div key={index} className="mb-8 p-8 border border-gray-300 bg-gray-50">
                  <p
                    className="text-lg leading-relaxed"
                    style={{
                      color: '#1a202c',
                      fontFamily: '"Times New Roman", serif',
                      textAlign: 'justify'
                    }}
                  >
                    {formatTextWithBold(paragraph)}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}      {legalAnalysis?.executiveSummary && (
          <SectionCard
            title="Executive Summary"
            icon={<FiFileText />}
            delay={0.25}
            isOpen={activeSections['Executive Summary']}
            toggleOpen={() => toggleSection('Executive Summary')}        >
            <div className="space-y-10">
              {/* Executive Summary Header */}
              <div className="text-center mb-12">
                <h3
                  className="text-3xl font-bold mb-4 uppercase tracking-wide"
                  style={{ fontFamily: '"Times New Roman", serif' }}
                >
                  Executive Summary
                </h3>
                <div className="w-32 h-1 bg-gray-800 mx-auto"></div>
              </div>

              {/* Executive Headline */}
              <div className="grid grid-cols-1 gap-6 mb-10">
                <InfoItem icon={<FiZap />} label="Executive Headline" value={legalAnalysis.executiveSummary.headline} />
              </div>

              {/* Summary Content */}
              <div className="p-10 border-2 border-gray-400 bg-white">
                <div className="flex items-center mb-8">
                  <div className="p-3 border-2 border-gray-400 mr-4 bg-gray-100">
                    <FiFileText className="text-xl text-gray-700" />
                  </div>
                  <h4
                    className="text-2xl font-bold uppercase tracking-wide"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    Summary
                  </h4>
                </div>
                <p
                  className="text-lg leading-relaxed"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    textAlign: 'justify',
                    color: '#1a202c'
                  }}
                >
                  {formatTextWithBold(legalAnalysis.executiveSummary.summary)}
                </p>
              </div>              {/* Key Findings */}
              {legalAnalysis.executiveSummary.keyFindings && legalAnalysis.executiveSummary.keyFindings.length > 0 && (
                <div className="p-10 border-2 border-gray-400 bg-white">
                  <div className="flex items-center mb-8">
                    <div className="p-3 border-2 border-gray-400 mr-4 bg-gray-100">
                      <FiTarget className="text-xl text-gray-700" />
                    </div>
                    <h4
                      className="text-2xl font-bold uppercase tracking-wide"
                      style={{ fontFamily: '"Times New Roman", serif' }}
                    >
                      Key Findings
                    </h4>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                        <FiTarget className="text-white text-lg" />
                      </div>
                      <span className="text-xl font-bold text-blue-800">Critical Findings</span>
                    </div>
                    <div className="space-y-2">
                      {legalAnalysis.executiveSummary.keyFindings.map((finding, index) => (
                        <EnhancedBulletPoint key={index} type="finding" index={index}>
                          {formatTextWithBold(finding)}
                        </EnhancedBulletPoint>
                      ))}
                    </div>
                  </div>
                </div>
              )}{/* Recommended Actions */}
              {legalAnalysis.executiveSummary.recommendedActions && (
                <div className="p-10 border-2 border-gray-400 bg-white">
                  <div className="flex items-center mb-8">
                    <div className="p-3 border-2 border-gray-400 mr-4 bg-gray-100">
                      <FiTrendingUp className="text-xl text-gray-700" />
                    </div>
                    <h4
                      className="text-2xl font-bold uppercase tracking-wide"
                      style={{ fontFamily: '"Times New Roman", serif' }}
                    >
                      Recommended Actions
                    </h4>
                  </div>                  <div className="space-y-6">
                    {formatRecommendedActions(legalAnalysis.executiveSummary.recommendedActions)}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}{reportItems && reportItems.length > 0 && (
          <SectionCard
            title="Detailed Analysis"
            icon={<FiLayout />}
            delay={0.3}
            isOpen={activeSections['Detailed Analysis']}
            toggleOpen={() => toggleSection('Detailed Analysis')}        >
            {reportItems.map((item: LegalReportItem, index: number) => (
              <motion.div
                key={index}
                className="mb-16 border-2 border-gray-400 bg-white page-break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                {/* Subsection Header */}
                <div className="px-8 py-6 border-b-2 border-gray-400 bg-gray-100">
                  <h3
                    className="text-2xl font-bold uppercase tracking-wide"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    {item.title}
                  </h3>
                </div>

                <div className="p-10 space-y-10">                  {/* Facts Section */}
                  {item.facts && item.facts.length > 0 && (
                    <div className="p-8 border border-gray-300 bg-gray-50">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-3 bg-white">
                          <FiTarget className="text-lg text-gray-600" />
                        </div>
                        <h4
                          className="font-bold text-xl uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Facts
                        </h4>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                            <FiCheckCircle className="text-white text-lg" />
                          </div>
                          <span className="text-xl font-bold text-green-800">Documented Facts</span>
                        </div>
                        <div className="space-y-2">
                          {item.facts.map((fact, factIndex) => (
                            <EnhancedBulletPoint key={factIndex} type="fact" index={factIndex}>
                              {formatTextWithBold(fact)}
                            </EnhancedBulletPoint>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}                  {/* Key Findings Section */}
                  {item.keyFindings && item.keyFindings.length > 0 && (
                    <div className="p-8 border border-gray-300 bg-white">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-3 bg-gray-50">
                          <FiZap className="text-lg text-gray-600" />
                        </div>
                        <h4
                          className="font-bold text-xl uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Key Findings
                        </h4>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200/50 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                            <FiZap className="text-white text-lg" />
                          </div>
                          <span className="text-xl font-bold text-amber-800">Analysis Results</span>
                        </div>
                        <div className="space-y-2">
                          {item.keyFindings.map((finding, findingIndex) => (
                            <EnhancedBulletPoint key={findingIndex} type="finding" index={findingIndex}>
                              {formatTextWithBold(finding)}
                            </EnhancedBulletPoint>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommended Actions Section */}
                  {item.recommendedActions && (
                    <div className="p-8 border border-gray-300 bg-white">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-3 bg-gray-50">
                          <FiTrendingUp className="text-lg text-gray-600" />
                        </div>
                        <h4
                          className="font-bold text-xl uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Recommended Actions
                        </h4>
                      </div>
                      <div className="space-y-6">
                        <div
                          className="leading-relaxed"
                          style={{
                            fontFamily: '"Times New Roman", serif',
                            textAlign: 'justify',
                            color: '#1a202c'
                          }}
                        >
                          {formatTextWithBold(item.recommendedActions)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Section */}
                  {item.summary && (
                    <div className="p-8 border border-gray-300 bg-gray-50">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-3 bg-white">
                          <FiClipboard className="text-lg text-gray-600" />
                        </div>
                        <h4
                          className="font-bold text-xl uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Summary
                        </h4>
                      </div>
                      <p
                        className="leading-relaxed"
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          textAlign: 'justify',
                          color: '#1a202c'
                        }}
                      >
                        {formatTextWithBold(item.summary)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </SectionCard>)}      {/* Overall Legal Score Section */}
        {(report.totalCompanyScore || legalAnalysis?.totalCompanyScore) && (
          <SectionCard
            title="Overall Legal Score"
            icon={<FiAward />}
            delay={0.35}
            isOpen={activeSections['Overall Legal Score']}
            toggleOpen={() => toggleSection('Overall Legal Score')}
          >
            {(() => {
              const scoreData = report.totalCompanyScore || legalAnalysis?.totalCompanyScore;
              const score = typeof scoreData?.score === 'number' ? scoreData.score :
                typeof scoreData?.score === 'string' ? parseFloat(scoreData.score) : 0;
              const maxScore = 10;
              const percentage = (score / maxScore) * 100;
              const getScoreColor = (score: number) => {
                if (score >= 8) return colours.legalDD.status.success;
                if (score >= 6) return colours.legalDD.status.warning;
                return colours.legalDD.status.error;
              };

              const getScoreBgGradient = (score: number) => {
                if (score >= 8) return colours.legalDD.score.excellent;
                if (score >= 6) return colours.legalDD.score.fair;
                return colours.legalDD.score.poor;
              }; return (
                <div className="space-y-10">
                  {/* Score Visualization */}
                  <div className="p-10 border-2 border-gray-400 bg-white">
                    <div className="text-center mb-10">
                      <div
                        className="inline-flex items-center justify-center w-40 h-40 border-4 border-gray-800 text-white shadow-lg mb-8"
                        style={{
                          background: 'linear-gradient(to right, #1e293b, #0f172a)',
                          borderRadius: '50%'
                        }}
                      >
                        <div className="text-center">
                          <div
                            className="text-5xl font-bold"
                            style={{
                              color: 'white',
                              fontFamily: '"Times New Roman", serif'
                            }}
                          >
                            {score}
                          </div>
                          <div
                            className="text-lg opacity-90"
                            style={{
                              color: '#94a3b8',
                              fontFamily: '"Times New Roman", serif'
                            }}
                          >
                            / {maxScore}
                          </div>
                        </div>
                      </div>
                      <h4
                        className="text-3xl font-bold mb-4 uppercase tracking-wide"
                        style={{ fontFamily: '"Times New Roman", serif' }}
                      >
                        Legal Compliance Score
                      </h4>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full border-2 border-gray-400 h-8 mb-10 bg-gray-100">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: getScoreBgGradient(score)
                        }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 border-2 border-gray-400 bg-gray-50">
                        <div className="flex items-center mb-6 text-gray-700">
                          <div className="p-2 border border-gray-400 mr-4 bg-white">
                            <FiStar className="text-xl text-gray-600" />
                          </div>
                          <span
                            className="font-bold text-xl uppercase tracking-wide"
                            style={{ fontFamily: '"Times New Roman", serif' }}
                          >
                            Rating
                          </span>
                        </div>
                        <p
                          className="text-3xl font-bold"
                          style={{
                            color: '#1a202c',
                            fontFamily: '"Times New Roman", serif'
                          }}
                        >
                          {scoreData?.rating || 'N/A'}
                        </p>
                      </div>
                      <div className="p-8 border-2 border-gray-400 bg-gray-50">
                        <div className="flex items-center mb-6 text-gray-700">
                          <div className="p-2 border border-gray-400 mr-4 bg-white">
                            <FiInfo className="text-xl text-gray-600" />
                          </div>
                          <span
                            className="font-bold text-xl uppercase tracking-wide"
                            style={{ fontFamily: '"Times New Roman", serif' }}
                          >
                            Assessment
                          </span>
                        </div>
                        <p
                          className="leading-relaxed text-lg"
                          style={{
                            color: '#1a202c',
                            fontFamily: '"Times New Roman", serif',
                            textAlign: 'justify'
                          }}
                        >
                          {scoreData?.description || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        )}      {/* Investment Decision Perspective Section */}
        {(report.investmentDecision || legalAnalysis?.investmentDecision) && (
          <SectionCard
            title="Investment Decision Perspective"
            icon={<FiBriefcase />}
            delay={0.4}
            isOpen={activeSections['Investment Decision Perspective']}
            toggleOpen={() => toggleSection('Investment Decision Perspective')}
          >
            {(() => {
              const decisionData = report.investmentDecision || legalAnalysis?.investmentDecision;
              const recommendation = decisionData?.recommendation?.toLowerCase();
              const isPositive = recommendation?.includes('recommend') || recommendation?.includes('proceed') || recommendation?.includes('approve');
              const isNegative = recommendation?.includes('not recommend') || recommendation?.includes('reject') || recommendation?.includes('decline');
              const getRecommendationColor = () => {
                if (isPositive) return { background: colours.legalDD.status.success + '15', borderColor: colours.legalDD.status.success + '30' };
                if (isNegative) return { background: colours.legalDD.status.error + '15', borderColor: colours.legalDD.status.error + '30' };
                return { background: colours.legalDD.status.warning + '15', borderColor: colours.legalDD.status.warning + '30' };
              };

              const getRecommendationTextColor = () => {
                if (isPositive) return colours.legalDD.status.success;
                if (isNegative) return colours.legalDD.status.error;
                return colours.legalDD.status.warning;
              };

              const getRecommendationIcon = () => {
                if (isPositive) return <FiThumbsUp className="text-2xl" />;
                if (isNegative) return <FiThumbsDown className="text-2xl" />;
                return <FiAlertTriangle className="text-2xl" />;
              };

              return (
                <div className="space-y-6">                  {/* Main Recommendation Card */}
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="p-8 border-2 border-gray-400 bg-white">
                      <h4
                        className="text-2xl font-bold mb-6 uppercase tracking-wide"
                        style={{ fontFamily: '"Times New Roman", serif' }}
                      >
                        Recommendation
                      </h4>
                      <div
                        className="flex items-center px-6 py-4 border-2"
                        style={{
                          backgroundColor: isPositive ? '#f0fdf4' : isNegative ? '#fef2f2' : '#fffbeb',
                          borderColor: isPositive ? '#22c55e' : isNegative ? '#ef4444' : '#f59e0b'
                        }}
                      >
                        <span style={{ color: getRecommendationTextColor() }}>
                          {getRecommendationIcon()}
                        </span>
                        <span
                          className="text-xl font-bold ml-4"
                          style={{
                            color: getRecommendationTextColor(),
                            fontFamily: '"Times New Roman", serif'
                          }}
                        >
                          {decisionData?.recommendation || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {decisionData?.successProbability && (
                      <div className="p-8 border-2 border-gray-400 bg-white">
                        <h4
                          className="text-2xl font-bold mb-6 uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Success Probability
                        </h4>
                        <div className="text-center">
                          <div
                            className="text-5xl font-bold mb-2"
                            style={{
                              color: '#1a202c',
                              fontFamily: '"Times New Roman", serif'
                            }}
                          >
                            {decisionData.successProbability}%
                          </div>
                          <div
                            className="text-lg"
                            style={{
                              color: '#4b5563',
                              fontFamily: '"Times New Roman", serif'
                            }}
                          >
                            Likelihood of Success
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Justification */}
                  {decisionData?.justification && (
                    <div className="p-8 border border-gray-300 bg-gray-50 mb-10">
                      <h4
                        className="text-2xl font-bold mb-6 uppercase tracking-wide"
                        style={{ fontFamily: '"Times New Roman", serif' }}
                      >
                        Justification
                      </h4>
                      <p
                        className="leading-relaxed"
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          textAlign: 'justify',
                          color: '#1a202c'
                        }}
                      >
                        {formatTextWithBold(decisionData.justification)}
                      </p>
                    </div>
                  )}                  {/* Key Considerations */}
                  {decisionData?.keyConsiderations && decisionData.keyConsiderations.length > 0 && (
                    <div className="p-8 border border-gray-300 bg-white mb-10">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-4 bg-gray-50">
                          <FiList className="text-xl text-gray-600" />
                        </div>
                        <h4
                          className="text-2xl font-bold uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Key Considerations
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {decisionData.keyConsiderations.map((consideration, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-all duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <div className="flex-shrink-0 mt-1 mr-4">
                              <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border-2 border-purple-500 group-hover:shadow-xl transition-all duration-200">
                                  <span className="text-white text-sm font-bold">{index + 1}</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full opacity-75"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <span
                                className="leading-relaxed block"
                                style={{
                                  fontFamily: '"Times New Roman", serif',
                                  textAlign: 'justify',
                                  color: '#1a202c'
                                }}
                              >
                                {formatTextWithBold(consideration)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}                  {/* Suggested Terms */}
                  {decisionData?.suggestedTerms && decisionData.suggestedTerms.length > 0 && (
                    <div className="p-8 border border-gray-300 bg-white">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-4 bg-gray-50">
                          <FiCheckCircle className="text-xl text-gray-600" />
                        </div>
                        <h4
                          className="text-2xl font-bold uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Suggested Terms
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {decisionData.suggestedTerms.map((term, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start group hover:bg-gray-50 p-4 rounded-lg transition-all duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <div className="flex-shrink-0 mt-1 mr-4">
                              <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg border-2 border-emerald-500 group-hover:shadow-xl transition-all duration-200">
                                  <FiCheckCircle className="text-white text-sm" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full opacity-75"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <span
                                className="leading-relaxed block"
                                style={{
                                  fontFamily: '"Times New Roman", serif',
                                  textAlign: 'justify',
                                  color: '#1a202c'
                                }}
                              >
                                {formatTextWithBold(term)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </SectionCard>
        )}      {/* Missing Documents Section */}
        {(report.missingDocuments || legalAnalysis?.missingDocuments) && (
          <SectionCard
            title="Missing Documents & Information Gaps"
            icon={<FiFileMinus />}
            delay={0.45}
            isOpen={activeSections['Missing Documents & Information Gaps']}
            toggleOpen={() => toggleSection('Missing Documents & Information Gaps')}
          >
            {(() => {
              const missingDocsData = report.missingDocuments || legalAnalysis?.missingDocuments;
              return (
                <div className="space-y-6">                  {/* Impact Assessment */}
                  {missingDocsData?.note && (
                    <div className="p-8 border border-gray-300 bg-white mb-10">
                      <div className="flex items-start">
                        <div className="p-2 border border-gray-400 mr-4 bg-gray-50 flex-shrink-0">
                          <FiInfo className="text-xl text-gray-600" />
                        </div>
                        <div>
                          <h4
                            className="text-2xl font-bold mb-6 uppercase tracking-wide"
                            style={{ fontFamily: '"Times New Roman", serif' }}
                          >
                            Impact Assessment
                          </h4>
                          <p
                            className="leading-relaxed"
                            style={{
                              fontFamily: '"Times New Roman", serif',
                              textAlign: 'justify',
                              color: '#1a202c'
                            }}
                          >
                            {formatTextWithBold(missingDocsData.note)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}                  {/* Missing Documents List */}
                  {missingDocsData?.documentList && missingDocsData.documentList.length > 0 && (
                    <div className="p-10 border-2 border-gray-400 bg-white">
                      <div className="flex items-center mb-8">
                        <div className="p-2 border border-gray-400 mr-4 bg-gray-50">
                          <FiFileText className="text-xl text-gray-600" />
                        </div>
                        <h4
                          className="text-2xl font-bold uppercase tracking-wide"
                          style={{ fontFamily: '"Times New Roman", serif' }}
                        >
                          Missing Documents ({missingDocsData.documentList.length})
                        </h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border-2 border-gray-400">
                          <thead className="bg-gray-100 border-b-2 border-gray-400">
                            <tr>
                              <th
                                className="py-6 px-8 text-left text-lg font-bold uppercase tracking-wider border border-gray-400"
                                style={{ fontFamily: '"Times New Roman", serif' }}
                              >
                                Document Category
                              </th>
                              <th
                                className="py-6 px-8 text-left text-lg font-bold uppercase tracking-wider border border-gray-400"
                                style={{ fontFamily: '"Times New Roman", serif' }}
                              >
                                Specific Document
                              </th>
                              <th
                                className="py-6 px-8 text-left text-lg font-bold uppercase tracking-wider border border-gray-400"
                                style={{ fontFamily: '"Times New Roman", serif' }}
                              >
                                Requirement Reference
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-400">
                            {missingDocsData.documentList.map((doc, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td
                                  className="py-6 px-8 border border-gray-400"
                                  style={{
                                    fontFamily: '"Times New Roman", serif',
                                    color: '#1a202c'
                                  }}
                                >
                                  {formatTextWithBold(doc.documentCategory)}
                                </td>
                                <td
                                  className="py-6 px-8 border border-gray-400"
                                  style={{
                                    fontFamily: '"Times New Roman", serif',
                                    color: '#1a202c'
                                  }}
                                >
                                  {formatTextWithBold(doc.specificDocument)}
                                </td>
                                <td
                                  className="py-6 px-8 border border-gray-400"
                                  style={{
                                    fontFamily: '"Times New Roman", serif',
                                    color: '#1a202c'
                                  }}
                                >
                                  {formatTextWithBold(doc.requirementReference)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </SectionCard>
        )}      {/* Detailed Findings Section */}
        {(report.detailedFindings || legalAnalysis?.detailedFindings) && (
          <SectionCard
            title="Detailed Findings"
            icon={<FiZoomIn />}
            delay={0.5}
            isOpen={activeSections['Detailed Findings']}
            toggleOpen={() => toggleSection('Detailed Findings')}
          >
            {(() => {
              const findingsData = report.detailedFindings || legalAnalysis?.detailedFindings;
              return (
                <div className="space-y-6">
                  {findingsData?.map((finding, index) => (
                    <div key={index} className="bg-white shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">                      <div
                      className="px-6 py-4 border-b"
                      style={{
                        background: colours.legalDD.background.accent,
                        borderColor: colours.legalDD.border.light
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold" style={{ color: colours.legalDD.text.primary }}>{finding.area}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${finding.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                          finding.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                            finding.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {finding.riskLevel}
                        </span>
                      </div>
                    </div>                      <div className="p-6 space-y-4">
                        {finding.document && (
                          <div
                            className="p-3 rounded-lg border"
                            style={{
                              background: colours.legalDD.background.accent,
                              borderColor: colours.legalDD.border.light
                            }}
                          >
                            <p className="text-sm font-semibold" style={{ color: colours.legalDD.text.primary }}>
                              <span className="font-bold">Document:</span> <span style={{ color: colours.legalDD.text.secondary }}>{formatTextWithBold(finding.document)}</span>
                            </p>
                          </div>
                        )}

                        <div
                          className="p-3 rounded-lg border"
                          style={{
                            background: colours.legalDD.background.accent,
                            borderColor: colours.legalDD.border.light
                          }}
                        >
                          <p className="text-sm font-semibold" style={{ color: colours.legalDD.text.primary }}>
                            <span className="font-bold">Finding:</span> <span style={{ color: colours.legalDD.text.secondary }}>{formatTextWithBold(finding.finding)}</span>
                          </p>                        </div>

                        <div
                          className="p-3 rounded-lg border"
                          style={{
                            background: colours.legalDD.background.accent,
                            borderColor: colours.legalDD.border.light
                          }}
                        >
                          <p className="text-sm font-semibold" style={{ color: colours.legalDD.text.primary }}>
                            <span className="font-bold">Recommendation:</span> <span style={{ color: colours.legalDD.text.secondary }}>{formatTextWithBold(finding.recommendation)}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {finding.timeline && (
                            <InfoItem icon={<FiClock />} label="Timeline" value={finding.timeline} />
                          )}
                          <InfoItem icon={<FiActivity />} label="Impact" value={finding.impact} />
                          {finding.responsibleParty && (
                            <InfoItem icon={<FiUser />} label="Responsible Party" value={finding.responsibleParty} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </SectionCard>
        )}        {/* Consolidated Recommendations Section - Always show for debugging */}
        <SectionCard
          title="Consolidated Recommendations"
          icon={<FiCheckSquare />}
          delay={0.55}
          isOpen={activeSections['Consolidated Recommendations'] ?? true}
          toggleOpen={() => toggleSection('Consolidated Recommendations')}
        >
          {(() => {
            const recommendationsData = report.recommendations || legalAnalysis?.recommendations;
            console.log('Frontend recommendations data:', recommendationsData);
            console.log('Recommendations length:', recommendationsData?.length || 0);
            console.log('Report object keys:', Object.keys(report || {}));
            console.log('LegalAnalysis object keys:', Object.keys(legalAnalysis || {})); if (!recommendationsData || recommendationsData.length === 0) {
              return (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInfo className="text-gray-500 text-2xl" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No Specific Recommendations</h4>
                  <p className="text-gray-600 mb-4">
                    The legal analysis did not identify any specific recommendations at this time.
                  </p>
                  <p className="text-gray-500 text-sm">
                    This may indicate good legal compliance, or additional documents may be needed for comprehensive analysis.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200/50 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <FiCheckSquare className="text-white text-xl" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-purple-800">Legal Recommendations</h4>
                      <p className="text-purple-600 text-sm">Structured action plan for legal compliance</p>
                    </div>
                  </div>
                </div>

                {recommendationsData?.map((recommendation, index) => {
                  const getPriorityColor = (priority: string) => {
                    switch (priority?.toLowerCase()) {
                      case 'critical': return 'from-red-500 to-red-600';
                      case 'high': return 'from-orange-500 to-orange-600';
                      case 'medium': return 'from-yellow-500 to-yellow-600';
                      case 'low': return 'from-green-500 to-green-600';
                      default: return 'from-gray-500 to-gray-600';
                    }
                  };

                  const getPriorityBadgeColor = (priority: string) => {
                    switch (priority?.toLowerCase()) {
                      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
                      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
                      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                      case 'low': return 'bg-green-100 text-green-800 border-green-200';
                      default: return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                  };

                  return (
                    <motion.div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Priority Header */}
                      <div className={`px-6 py-4 bg-gradient-to-r ${getPriorityColor(recommendation.priority)} text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="text-lg font-bold">{recommendation.area || 'Legal Area'}</span>
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-bold border ${getPriorityBadgeColor(recommendation.priority)} bg-white/90`}>
                                  {recommendation.priority?.toUpperCase() || 'MEDIUM'}
                                </span>
                              </div>
                              <div className="text-white/80 text-sm flex items-center">
                                <FiClock className="mr-2" />
                                {recommendation.timeline || 'Timeline not specified'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Action */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex items-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                              <FiTarget className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-700 mb-2">
                                <span className="font-bold">Recommended Action:</span>
                              </p>
                              <p className="text-slate-600 leading-relaxed">
                                {formatTextWithBold(recommendation.recommendation || recommendation.action || 'No action specified')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                              <FiClock className="text-gray-600 mr-2" />
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Timeline</span>
                            </div>
                            <p className="text-gray-800 font-medium">{recommendation.timeline || 'Not specified'}</p>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                              <FiUser className="text-gray-600 mr-2" />
                              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Responsible Party</span>
                            </div>
                            <p className="text-gray-800 font-medium">{recommendation.responsibleParty || recommendation.responsibility || 'Not assigned'}</p>
                          </div>

                          {recommendation.cost && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center mb-2">
                                <FiDollarSign className="text-gray-600 mr-2" />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Estimated Cost</span>
                              </div>
                              <p className="text-gray-800 font-medium">{recommendation.cost}</p>
                            </div>
                          )}
                        </div>

                        {/* Additional Details */}
                        {recommendation.rationale && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-start">
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                                <FiInfo className="text-blue-600 text-sm" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-700 mb-1">Rationale:</p>
                                <p className="text-blue-600 text-sm leading-relaxed">{formatTextWithBold(recommendation.rationale)}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {recommendation.expectedOutcome && (
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <div className="flex items-start">
                              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                                <FiTrendingUp className="text-green-600 text-sm" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-green-700 mb-1">Expected Outcome:</p>
                                <p className="text-green-600 text-sm leading-relaxed">{formatTextWithBold(recommendation.expectedOutcome)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </SectionCard>

        {/* Report Metadata Section */}
        {(report.legalAnalysis?.reportMetadata || legalAnalysis?.reportMetadata) && (
          <SectionCard
            title="Report Metadata"
            icon={<FiDatabase />}
            delay={0.6}
            isOpen={activeSections['Report Metadata']}
            toggleOpen={() => toggleSection('Report Metadata')}
          >
            {(() => {
              const metadataData = report.legalAnalysis?.reportMetadata || legalAnalysis?.reportMetadata;
              return (
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoItem icon={<FiFileText />} label="Documents Reviewed" value={metadataData?.documentsReviewed} />
                    <InfoItem icon={<FiCheckCircle />} label="Compliance Areas" value={metadataData?.complianceAreasChecked} />
                    <InfoItem icon={<FiList />} label="Total Findings" value={metadataData?.totalFindings} />
                    <InfoItem icon={<FiAlertCircle />} label="Critical Issues" value={metadataData?.criticalIssuesCount} />
                    <InfoItem icon={<FiAlertTriangle />} label="High Priority" value={metadataData?.highPriorityIssuesCount} />
                    <InfoItem icon={<FiActivity />} label="Medium Priority" value={metadataData?.mediumPriorityIssuesCount} />
                    <InfoItem icon={<FiInfo />} label="Low Priority" value={metadataData?.lowPriorityIssuesCount} />
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        )}        {/* Disclaimer Section */}
        {(report.disclaimer || legalAnalysis?.disclaimer) && (
          <SectionCard
            title="Disclaimer"
            icon={<FiHelpCircle />}
            delay={0.65}
            isOpen={activeSections['Disclaimer']}
            toggleOpen={() => toggleSection('Disclaimer')}
          >
            <div className="p-8 border-2 border-gray-400 bg-gray-50">
              <div className="flex items-start">
                <div className="p-2 border border-gray-400 mr-4 bg-white flex-shrink-0">
                  <FiAlertTriangle className="text-2xl text-gray-600" />
                </div>
                <div>
                  <h4
                    className="text-2xl font-bold mb-6 uppercase tracking-wide"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    Legal Disclaimer
                  </h4>
                  <p
                    className="leading-relaxed text-lg"
                    style={{
                      fontFamily: '"Times New Roman", serif',
                      textAlign: 'justify',
                      color: '#1a202c',
                      fontStyle: 'italic'
                    }}
                  >
                    {formatTextWithBold(report.disclaimer || legalAnalysis?.disclaimer)}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        )}{/* Professional Report Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-20 page-break-before"
        >
          <div
            className="border-t-4 border-gray-800 pt-12"
            style={{
              background: 'linear-gradient(to right, #1e293b, #0f172a)',
              color: 'white'
            }}
          >
            <div className="px-12 py-16">
              {/* Report Certification */}
              <div className="text-center mb-12">
                <div className="inline-block p-6 border-2 border-white/30 mb-8">
                  <FiBriefcase className="text-6xl text-white mx-auto mb-4" />
                  <h3
                    className="text-4xl font-bold mb-4"
                    style={{ fontFamily: '"Times New Roman", serif' }}
                  >
                    KARMICDD LEGAL DUE DILIGENCE
                  </h3>
                  <div className="w-48 h-1 bg-white mx-auto mb-4"></div>
                  <p className="text-xl font-semibold uppercase tracking-wider">
                    Confidential Assessment Report
                  </p>
                </div>
              </div>

              {/* Report Details Table */}
              <div className="max-w-6xl mx-auto mb-12">
                <table className="w-full border-2 border-white/30">
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                      <th className="px-6 py-4 text-left border border-white/20 font-bold uppercase tracking-wider">
                        Report Metadata
                      </th>
                      <th className="px-6 py-4 text-left border border-white/20 font-bold uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-4 text-left border border-white/20 font-bold uppercase tracking-wider">
                        Additional Information
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    <tr>
                      <td className="px-6 py-4 border border-white/20 font-semibold">Generated Date & Time:</td>
                      <td className="px-6 py-4 border border-white/20">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4 border border-white/20">System Auto-Generated</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border border-white/20 font-semibold">System Version:</td>
                      <td className="px-6 py-4 border border-white/20">KarmicDD Legal AI v2.1</td>
                      <td className="px-6 py-4 border border-white/20">Latest Stable Release</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border border-white/20 font-semibold">Compliance Standards:</td>
                      <td className="px-6 py-4 border border-white/20">Indian Corporate Law</td>
                      <td className="px-6 py-4 border border-white/20">Companies Act 2013 & Regulations</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border border-white/20 font-semibold">Report Classification:</td>
                      <td className="px-6 py-4 border border-white/20">CONFIDENTIAL</td>
                      <td className="px-6 py-4 border border-white/20">Internal Use Only</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border border-white/20 font-semibold">Document Security:</td>
                      <td className="px-6 py-4 border border-white/20">Enterprise Grade</td>
                      <td className="px-6 py-4 border border-white/20">End-to-End Encryption</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Disclaimer and Signatures */}
              <div className="border-t-2 border-white/30 pt-12">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Disclaimer */}
                  <div>
                    <h4
                      className="text-2xl font-bold mb-6 uppercase tracking-wider"
                      style={{ fontFamily: '"Times New Roman", serif' }}
                    >
                      Legal Disclaimer
                    </h4>
                    <p
                      className="text-sm leading-relaxed opacity-90"
                      style={{
                        fontFamily: '"Times New Roman", serif',
                        textAlign: 'justify'
                      }}
                    >
                      This report is generated by KarmicDD's proprietary AI-powered legal due diligence system.
                      The analysis is based on documents provided and complies with applicable Indian legal standards.
                      This assessment is for informational purposes only and should not be considered as legal advice.
                      Readers are advised to consult qualified legal professionals for specific legal matters.
                    </p>
                  </div>

                  {/* Certification */}
                  <div>
                    <h4
                      className="text-2xl font-bold mb-6 uppercase tracking-wider"
                      style={{ fontFamily: '"Times New Roman", serif' }}
                    >
                      System Certification
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FiCheckCircle className="text-green-400 mr-3 text-xl" />
                        <span className="font-semibold">AI Analysis Verified</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheckCircle className="text-green-400 mr-3 text-xl" />
                        <span className="font-semibold">Compliance Standards Met</span>
                      </div>
                      <div className="flex items-center">
                        <FiCheckCircle className="text-green-400 mr-3 text-xl" />
                        <span className="font-semibold">Quality Assurance Passed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Footer */}
                <div className="text-center pt-12 border-t border-white/20 mt-12">
                  <p
                    className="text-lg font-bold uppercase tracking-widest mb-2"
                    style={{ letterSpacing: '0.3em' }}
                  >
                    END OF REPORT
                  </p>
                  <p className="text-sm opacity-80">
                    © {new Date().getFullYear()} KarmicDD Technologies. All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalDueDiligenceReportContent;