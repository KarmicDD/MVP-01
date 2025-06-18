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

// Define a more formal color palette
const FORMAL_PALETTE = {
  background: '#FFFFFF', // White background for a clean, document-like feel
  textPrimary: '#2D3748', // Dark slate grey for primary text (A700)
  textSecondary: '#4A5568', // Medium slate grey for secondary text (A400)
  textSubtle: '#718096', // Lighter slate grey for subtle text (A200)
  borderStrong: '#4A5568', // Medium slate for prominent borders
  borderDefault: '#CBD5E0', // Light slate for default borders (A100)
  borderSubtle: '#E2E8F0', // Very light slate for subtle borders (A50)
  accentPrimary: '#2C5282', // A deep, serious blue for accents (e.g., icons, specific highlights)
  accentSecondary: '#4A5568', // Medium slate, can be used for secondary accents or hover states
  headerBackground: '#1A202C', // Very dark slate/almost black for main report header
  headerText: '#F7FAFC', // Off-white for text on dark header
  confidentialBorder: '#718096', // Lighter slate for confidential stamp border
  confidentialBackground: 'rgba(74, 85, 104, 0.1)', // Subtle background for confidential stamp
  tableHeaderBackground: 'rgba(247, 250, 252, 0.1)', // Very light, almost transparent for table headers on dark bg
  sectionHeaderBorder: '#A0AEC0', // Medium-light slate for section header borders (A200)
  iconColor: '#4A5568', // Medium slate for icons
  proseText: '#1A202C', // Darkest slate for main prose content
};

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
    return <div className="p-6 text-center" style={{ color: FORMAL_PALETTE.textSecondary }}>Loading legal due diligence report...</div>;
  }

  const { legalAnalysis } = report;

  const introductionContent = report.introduction || legalAnalysis?.introduction;
  const reportItems: LegalReportItem[] | undefined = report.items || legalAnalysis?.items;

  const formatTextWithBold = (text: string | undefined): React.ReactNode => {
    if (!text) return '';
    const parts = text.split(/(\\*\\*[^*]+\\*\\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold" style={{ color: FORMAL_PALETTE.textPrimary }}>
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
        className="mb-6" // Adjusted margin, removed card-specific styling
      >
        {/* Section Header */}
        <div
          className="py-3 cursor-pointer flex items-center justify-between"
          style={{ borderBottom: `1px solid ${FORMAL_PALETTE.sectionHeaderBorder}` }}
          onClick={toggleOpen}
        >
          <div className="flex items-center">
            {icon && (
              <motion.span
                className="text-2xl mr-3"
                style={{ color: FORMAL_PALETTE.iconColor }}
                whileHover={{ scale: 1.1, rotate: 0 }} // Simplified hover
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.span>
            )}
            <h2
              className="text-lg font-semibold uppercase tracking-wider"
              style={{
                fontFamily: '"Georgia", serif', // More formal serif font
                color: FORMAL_PALETTE.textPrimary,
                letterSpacing: '0.025em'
              }}
            >
              {title}
            </h2>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="text-lg"
            style={{ color: FORMAL_PALETTE.iconColor }}
          >
            <FiChevronDown />
          </motion.div>
        </div>

        {/* Section Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="pt-4 pb-1"> {/* Adjusted padding */}
                <div
                  className="prose max-w-none"
                  style={{
                    color: FORMAL_PALETTE.proseText,
                    fontFamily: '"Georgia", serif',
                    fontSize: '1rem', // Standardized font size
                    lineHeight: '1.7'
                  }}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }; const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number; color?: string }> = ({ icon, label, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.01 }} // Subtle hover
      className={`p-4 border bg-white ${value || value === 0 ? '' : 'opacity-70'}`}
      style={{ borderColor: FORMAL_PALETTE.borderDefault }}
    >
      <div className="flex items-center mb-2" style={{ color: FORMAL_PALETTE.textSecondary }}>
        <div className="p-1.5 border mr-2 bg-slate-50" style={{ borderColor: FORMAL_PALETTE.borderSubtle }}>
          <span className="text-md" style={{ color: FORMAL_PALETTE.iconColor }}>{icon}</span>
        </div>
        <span
          className="font-semibold text-xs uppercase tracking-wider"
          style={{ fontFamily: '"Georgia", serif', color: FORMAL_PALETTE.textSecondary }}
        >
          {label}
        </span>
      </div>
      <p
        className={`font-semibold text-lg ${color || ''}`}
        style={{
          color: FORMAL_PALETTE.textPrimary,
          fontFamily: '"Georgia", serif'
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
            baseColor: FORMAL_PALETTE.accentPrimary, // Use accent for actions
            borderColor: FORMAL_PALETTE.accentPrimary,
            bgColor: 'bg-blue-50', // Lighter shade of accent
            textColor: FORMAL_PALETTE.accentPrimary
          };
        case 'finding':
          return {
            icon: FiZap,
            baseColor: '#D97706', // Amber for findings (keep some distinction)
            borderColor: 'border-amber-500',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700'
          };
        case 'fact':
          return {
            icon: FiCheckCircle,
            baseColor: FORMAL_PALETTE.textSecondary, // Neutral slate for facts
            borderColor: FORMAL_PALETTE.borderDefault,
            bgColor: 'bg-slate-50',
            textColor: FORMAL_PALETTE.textPrimary
          };
        case 'recommendation':
          return {
            icon: FiTarget,
            baseColor: '#5B21B6', // Purple for recommendations (keep some distinction)
            borderColor: 'border-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
          };
        default:
          return {
            icon: FiInfo,
            baseColor: FORMAL_PALETTE.textSubtle,
            borderColor: FORMAL_PALETTE.borderSubtle,
            bgColor: 'bg-gray-50',
            textColor: FORMAL_PALETTE.textSecondary
          };
      }
    };

    const getPriorityIndicator = () => {
      if (!priority) return null;
      const colors = {
        critical: 'bg-red-600', // Stronger red
        high: 'bg-orange-500',
        medium: 'bg-yellow-500',
        low: 'bg-green-500'
      };
      return (
        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${colors[priority]} rounded-full border-2 border-white shadow-sm`} />
      );
    };

    const config = getTypeConfig();
    const IconComponent = config.icon;

    return (
      <motion.div
        className="flex items-start group p-3 rounded-lg transition-all duration-300 border border-transparent hover:bg-slate-50 hover:border-slate-200" // Simplified hover
        initial={{ opacity: 0, x: -15, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          delay: index * 0.06,
          duration: 0.3,
          type: "spring",
          stiffness: 120
        }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex-shrink-0 mt-0.5 mr-3.5 relative">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md border-2 group-hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
            style={{ backgroundColor: config.baseColor, borderColor: config.borderColor, color: 'white' }}
          >
            <IconComponent className="text-xs font-bold z-10" />
            {getPriorityIndicator()}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Connecting line for visual flow - subtle */}
          <div className="absolute left-3.5 top-7 w-px h-3 bg-slate-300 opacity-50" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-base leading-relaxed" // Adjusted font size
            style={{
              fontFamily: '"Georgia", serif',
              textAlign: 'justify',
              color: FORMAL_PALETTE.proseText,
              lineHeight: '1.65'
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

    const renderActions = (actions: string[]) => {
      return (
        <div className="space-y-1.5 p-4 rounded-lg border" style={{ backgroundColor: '#F8FAFC', borderColor: FORMAL_PALETTE.borderDefault }}> {/* Light background for action items block */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm mr-2.5" style={{ backgroundColor: FORMAL_PALETTE.accentPrimary }}>
              <FiTrendingUp className="text-white text-md" />
            </div>
            <span className="text-lg font-semibold" style={{ color: FORMAL_PALETTE.accentPrimary, fontFamily: '"Georgia", serif' }}>Action Items</span>
          </div>
          {actions.map((action, index) => (
            <EnhancedBulletPoint key={index} type="action" index={index}>
              {formatTextWithBold(action)}
            </EnhancedBulletPoint>
          ))}
        </div>
      );
    };

    if (Array.isArray(actionsText)) {
      return renderActions(actionsText);
    }

    const actionsList = actionsText
      .split(/(?:\\d+\\.|\\-|\\•|;|\\n\\n)/)
      .map(action => action.trim())
      .filter(action => action.length > 0 && action !== '');

    if (actionsList.length > 1) {
      return renderActions(actionsList);
    }

    // Single action or unparsable
    return (
      <div className="relative rounded-lg border overflow-hidden" style={{ backgroundColor: '#F8FAFC', borderColor: FORMAL_PALETTE.borderDefault }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: FORMAL_PALETTE.accentPrimary }} />
        <div className="p-4 pl-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm" style={{ backgroundColor: FORMAL_PALETTE.accentPrimary }}>
                <FiTrendingUp className="text-white text-md" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: FORMAL_PALETTE.accentPrimary, fontFamily: '"Georgia", serif' }}>Recommended Action</div>
              <span
                className="text-base leading-relaxed block"
                style={{
                  fontFamily: '"Georgia", serif',
                  textAlign: 'justify',
                  color: FORMAL_PALETTE.proseText,
                  lineHeight: '1.65'
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
      className="min-h-screen" // Removed bg-white, will be set by FORMAL_PALETTE.background
      style={{
        fontFamily: '"Georgia", serif', // Changed to Georgia for a more classic legal feel
        lineHeight: '1.6',
        color: FORMAL_PALETTE.textPrimary,
        backgroundColor: FORMAL_PALETTE.background,
        padding: isCompact ? '1rem' : '2rem 3rem' // Add padding to the main container
      }}
      ref={reportRef} // Moved ref here
    >
      {/* Formal Report Header */}
      <div
        className="border-b-2 pb-6 mb-10" // Thinner border, adjusted margins
        style={{
          background: FORMAL_PALETTE.headerBackground,
          borderColor: FORMAL_PALETTE.borderStrong, // Use a strong border color from palette
          color: FORMAL_PALETTE.headerText
        }}
      >
        <div className="px-8 py-10"> {/* Adjusted padding */}
          {/* Report Classification */}
          <div className="text-center mb-6">
            <div
              className="inline-block px-6 py-2 mb-4 border rounded-sm" // Slightly smaller, less rounded
              style={{
                borderColor: FORMAL_PALETTE.confidentialBorder,
                background: FORMAL_PALETTE.confidentialBackground
              }}
            >
              <span className="text-lg font-semibold tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
                CONFIDENTIAL
              </span>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              LEGAL DUE DILIGENCE REPORT
            </h1>
            <div className="w-36 h-px mx-auto mb-6" style={{ backgroundColor: FORMAL_PALETTE.headerText }}></div> {/* Thinner line */}
            <h2 className="text-3xl font-semibold mb-3">
              {report.clientName || report.entityProfile?.companyName || entityName}
            </h2>
            <p className="text-lg opacity-80">
              Comprehensive Legal Compliance Assessment
            </p>
          </div>

          {/* Report Details Table */}
          <div className="max-w-3xl mx-auto"> {/* Slightly narrower table */}
            <table className="w-full border" style={{ borderColor: FORMAL_PALETTE.headerText + '40' }}> {/* Lighter border for table */}
              <thead>
                <tr style={{ background: FORMAL_PALETTE.tableHeaderBackground }}>
                  <th className="px-4 py-3 text-left border font-semibold uppercase tracking-wider text-sm" style={{ borderColor: FORMAL_PALETTE.headerText + '30' }}> {/* Adjusted padding and font size */}
                    Report Information
                  </th>
                  <th className="px-4 py-3 text-left border font-semibold uppercase tracking-wider text-sm" style={{ borderColor: FORMAL_PALETTE.headerText + '30' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="text-md"> {/* Adjusted font size */}
                <tr>
                  <td className="px-4 py-2.5 border font-medium" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Report Date:</td> {/* Adjusted padding */}
                  <td className="px-4 py-2.5 border" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>
                    {report.reportDate ? formatDate(report.reportDate) : new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 border font-medium" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Report Type:</td>
                  <td className="px-4 py-2.5 border" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Legal Due Diligence Assessment</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 border font-medium" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Jurisdiction:</td>
                  <td className="px-4 py-2.5 border" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Republic of India</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 border font-medium" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Compliance Framework:</td>
                  <td className="px-4 py-2.5 border" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Indian Corporate Law & Regulations</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 border font-medium" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>Report Version:</td>
                  <td className="px-4 py-2.5 border" style={{ borderColor: FORMAL_PALETTE.headerText + '20' }}>KarmicDD Legal v2.1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons - Styling will be inherited or can be customized if needed */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={handleExportPDF}
              className="px-6 py-2.5 font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center"
              style={{
                backgroundColor: FORMAL_PALETTE.accentPrimary,
                color: FORMAL_PALETTE.headerText,
                border: `1px solid ${FORMAL_PALETTE.accentPrimary}`
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = FORMAL_PALETTE.accentSecondary}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = FORMAL_PALETTE.accentPrimary}
            >
              <FiDownload className="mr-2" /> Export PDF
            </button>
            <button
              onClick={handleShareReport}
              className="px-6 py-2.5 font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center"
              style={{
                backgroundColor: 'transparent',
                color: FORMAL_PALETTE.headerText,
                border: `1px solid ${FORMAL_PALETTE.headerText}`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = FORMAL_PALETTE.tableHeaderBackground;
                e.currentTarget.style.color = FORMAL_PALETTE.headerText;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = FORMAL_PALETTE.headerText;
              }}
            >
              <FiShare2 className="mr-2" /> Share Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Content Area - Using a two-column layout for larger screens if not compact */}
      <div className={` ${!isCompact ? 'md:flex md:space-x-8' : ''}`}>
        {/* Left Column for Navigation/Overview (Optional or for future use) */}
        {/* {!isCompact && (
          <div className=\"md:w-1/4 mb-8 md:mb-0\">
            <div className=\"sticky top-8 p-4 border rounded-lg\" style={{borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: \'#F8FAFC\'}}>
              <h3 className=\"text-lg font-semibold mb-3\" style={{color: FORMAL_PALETTE.textPrimary, fontFamily: \'\"Georgia\", serif\'}}>Report Sections</h3>
              <ul className=\"space-y-1.5 text-sm\">
                {Object.keys(activeSections).map(sectionName => (
                  <li key={sectionName}>
                    <a 
                      href={`#section-${sectionName.replace(/\\s+/g, \'-\')}`} 
                      className=\"hover:underline\"
                      style={{color: FORMAL_PALETTE.accentPrimary}}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(`section-${sectionName.replace(/\\s+/g, \'-\')}`);
                        if (element) {
                          element.scrollIntoView({ behavior: \'smooth\' });
                          if (!activeSections[sectionName]) {
                            toggleSection(sectionName);
                          }
                        }
                      }}
                    >
                      {sectionName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )} */}

        {/* Right Column for Report Sections */}
        <div className={`${!isCompact ? 'md:flex-1' : 'w-full'}`}>
          {/* Introduction Section */}
          {introductionContent && (
            <SectionCard
              title="Introduction"
              icon={<FiFileText />}
              isOpen={activeSections['Introduction'] !== undefined ? activeSections['Introduction'] : true}
              toggleOpen={() => toggleSection('Introduction')}
              delay={0.1}
            >
              <p className="whitespace-pre-wrap text-justify">{formatTextWithBold(introductionContent)}</p>
            </SectionCard>
          )}

          {/* Executive Summary Section */}
          {(report.executiveSummary || legalAnalysis?.executiveSummary) && (
            <SectionCard
              title="Executive Summary"
              icon={<FiBriefcase />}
              isOpen={activeSections['Executive Summary'] !== undefined ? activeSections['Executive Summary'] : true}
              toggleOpen={() => toggleSection('Executive Summary')}
              delay={0.2}
            >
              <div className="space-y-5">
                {(report.executiveSummary?.headline || legalAnalysis?.executiveSummary?.headline) && (
                  <div>
                    <h4 className="font-semibold text-md mb-1.5" style={{ color: FORMAL_PALETTE.textPrimary }}>Headline:</h4>
                    <p className="whitespace-pre-wrap text-justify">
                      {formatTextWithBold(report.executiveSummary?.headline || legalAnalysis?.executiveSummary?.headline)}
                    </p>
                  </div>
                )}
                {(report.executiveSummary?.summary || legalAnalysis?.executiveSummary?.summary) && (
                  <div>
                    <h4 className="font-semibold text-md mb-1.5" style={{ color: FORMAL_PALETTE.textPrimary }}>Summary:</h4>
                    <p className="whitespace-pre-wrap text-justify">
                      {formatTextWithBold(report.executiveSummary?.summary || legalAnalysis?.executiveSummary?.summary)}
                    </p>
                  </div>
                )}
                {(report.executiveSummary?.keyFindings?.length || legalAnalysis?.executiveSummary?.keyFindings?.length) && (
                  <div>
                    <h4 className="font-semibold text-md mb-2" style={{ color: FORMAL_PALETTE.textPrimary }}>Key Findings:</h4>
                    <div className="space-y-2.5 pl-1">
                      {(report.executiveSummary?.keyFindings || legalAnalysis?.executiveSummary?.keyFindings)?.map((finding, index) => (
                        <EnhancedBulletPoint key={index} type="finding" index={index}>
                          {formatTextWithBold(finding)}
                        </EnhancedBulletPoint>
                      ))}
                    </div>
                  </div>
                )}
                {(report.executiveSummary?.recommendedActions || legalAnalysis?.executiveSummary?.recommendedActions) && (
                  <div>
                    <h4 className="font-semibold text-md mb-2" style={{ color: FORMAL_PALETTE.textPrimary }}>Recommended Actions:</h4>
                    {formatRecommendedActions(report.executiveSummary?.recommendedActions || legalAnalysis?.executiveSummary?.recommendedActions)}
                  </div>
                )}
                {/* NEW: Display overallRisk, legalStructureRating, complianceRating, transactionReadiness if available */}
                {(report.executiveSummary?.overallRisk || legalAnalysis?.executiveSummary?.overallRisk) && (
                  <InfoItem icon={<FiAlertTriangle />} label="Overall Risk Assessment" value={report.executiveSummary?.overallRisk || legalAnalysis?.executiveSummary?.overallRisk} />
                )}
                {(report.executiveSummary?.legalStructureRating || legalAnalysis?.executiveSummary?.legalStructureRating) && (
                  <InfoItem icon={<FiAward />} label="Legal Structure Rating" value={report.executiveSummary?.legalStructureRating || legalAnalysis?.executiveSummary?.legalStructureRating} />
                )}
                {(report.executiveSummary?.complianceRating || legalAnalysis?.executiveSummary?.complianceRating) && (
                  <InfoItem icon={<FiCheckSquare />} label="Compliance Rating" value={report.executiveSummary?.complianceRating || legalAnalysis?.executiveSummary?.complianceRating} />
                )}
                {(report.executiveSummary?.transactionReadiness || legalAnalysis?.executiveSummary?.transactionReadiness) && (
                  <InfoItem icon={<FiZap />} label="Transaction Readiness" value={report.executiveSummary?.transactionReadiness || legalAnalysis?.executiveSummary?.transactionReadiness} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Detailed Analysis (Items) Section */}
          {reportItems && reportItems.length > 0 && (
            <SectionCard
              title="Detailed Analysis"
              icon={<FiList />}
              isOpen={activeSections['Detailed Analysis'] !== undefined ? activeSections['Detailed Analysis'] : true}
              toggleOpen={() => toggleSection('Detailed Analysis')}
              delay={0.3}
            >
              <div className="space-y-8">
                {reportItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-5 rounded-lg border" // Add border to each item
                    style={{ borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: '#FDFDFD' }} // Slightly off-white bg for items
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h4 className="text-lg font-semibold mb-3" style={{ color: FORMAL_PALETTE.textPrimary, fontFamily: '"Georgia", serif' }}>
                      {item.title}
                    </h4>
                    {item.summary && (
                      <div className="mb-3 p-3 rounded-md" style={{ backgroundColor: '#F0F4F8' }}> {/* Subtle background for summary */}
                        <p className="italic text-sm" style={{ color: FORMAL_PALETTE.textSecondary }}>{formatTextWithBold(item.summary)}</p>
                      </div>
                    )}
                    {item.facts && item.facts.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-semibold text-sm mb-1.5" style={{ color: FORMAL_PALETTE.textSecondary }}>Relevant Facts:</h5>
                        <div className="space-y-1.5 pl-1">
                          {item.facts.map((fact, factIndex) => (
                            <EnhancedBulletPoint key={factIndex} type="fact" index={factIndex}>
                              {formatTextWithBold(fact)}
                            </EnhancedBulletPoint>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.keyFindings && item.keyFindings.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-semibold text-sm mb-1.5" style={{ color: FORMAL_PALETTE.textSecondary }}>Key Findings:</h5>
                        <div className="space-y-1.5 pl-1">
                          {item.keyFindings.map((finding, findingIndex) => (
                            <EnhancedBulletPoint key={findingIndex} type="finding" index={findingIndex}>
                              {formatTextWithBold(finding)}
                            </EnhancedBulletPoint>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.recommendedActions && (
                      <div>
                        <h5 className="font-semibold text-sm mb-1.5" style={{ color: FORMAL_PALETTE.textSecondary }}>Recommended Actions:</h5>
                        {formatRecommendedActions(item.recommendedActions)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Overall Legal Score Section */}
          {(report.totalCompanyScore || legalAnalysis?.totalCompanyScore) && (
            <SectionCard
              title="Overall Legal Score"
              icon={<FiStar />}
              isOpen={activeSections['Overall Legal Score'] !== undefined ? activeSections['Overall Legal Score'] : true}
              toggleOpen={() => toggleSection('Overall Legal Score')}
              delay={0.4}
            >
              <div className="p-5 rounded-lg border text-center" style={{ borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: '#F8FAFC' }}>
                <div className="mb-3">
                  <span className="text-5xl font-bold" style={{ color: FORMAL_PALETTE.accentPrimary }}>
                    {(report.totalCompanyScore?.score || legalAnalysis?.totalCompanyScore?.score)?.toFixed(1)} / 10
                  </span>
                </div>
                <div className="text-2xl font-semibold mb-2" style={{ color: FORMAL_PALETTE.textPrimary }}>
                  {report.totalCompanyScore?.rating || legalAnalysis?.totalCompanyScore?.rating}
                </div>
                <p className="text-md" style={{ color: FORMAL_PALETTE.textSecondary }}>
                  {formatTextWithBold(report.totalCompanyScore?.description || legalAnalysis?.totalCompanyScore?.description)}
                </p>
              </div>
            </SectionCard>
          )}

          {/* Investment Decision Perspective Section */}
          {(report.investmentDecision || legalAnalysis?.investmentDecision) && (
            <SectionCard
              title="Investment Decision Perspective"
              icon={<FiDollarSign />}
              isOpen={activeSections['Investment Decision Perspective'] !== undefined ? activeSections['Investment Decision Perspective'] : true}
              toggleOpen={() => toggleSection('Investment Decision Perspective')}
              delay={0.5}
            >
              <div className="space-y-4">
                <InfoItem
                  icon={<FiThumbsUp />}
                  label="Recommendation"
                  value={report.investmentDecision?.recommendation || legalAnalysis?.investmentDecision?.recommendation}
                  color={FORMAL_PALETTE.accentPrimary}
                />
                {(report.investmentDecision?.successProbability || legalAnalysis?.investmentDecision?.successProbability) && (
                  <InfoItem
                    icon={<FiTrendingUp />}
                    label="Success Probability"
                    value={`${(report.investmentDecision?.successProbability || legalAnalysis?.investmentDecision?.successProbability)?.toFixed(0)}%`}
                  />
                )}
                <div>
                  <h4 className="font-semibold text-md mb-1.5" style={{ color: FORMAL_PALETTE.textPrimary }}>Justification:</h4>
                  <p className="whitespace-pre-wrap text-justify">
                    {formatTextWithBold(report.investmentDecision?.justification || legalAnalysis?.investmentDecision?.justification)}
                  </p>
                </div>
                {(report.investmentDecision?.keyConsiderations?.length || legalAnalysis?.investmentDecision?.keyConsiderations?.length) && (
                  <div>
                    <h4 className="font-semibold text-md mb-2" style={{ color: FORMAL_PALETTE.textPrimary }}>Key Considerations:</h4>
                    <div className="space-y-2 pl-1">
                      {(report.investmentDecision?.keyConsiderations || legalAnalysis?.investmentDecision?.keyConsiderations)?.map((item, index) => (
                        <EnhancedBulletPoint key={index} type="fact" index={index}>
                          {formatTextWithBold(item)}
                        </EnhancedBulletPoint>
                      ))}
                    </div>
                  </div>
                )}
                {(report.investmentDecision?.suggestedTerms?.length || legalAnalysis?.investmentDecision?.suggestedTerms?.length) && (
                  <div>
                    <h4 className="font-semibold text-md mb-2" style={{ color: FORMAL_PALETTE.textPrimary }}>Suggested Terms / Clauses:</h4>
                    <div className="space-y-2 pl-1">
                      {(report.investmentDecision?.suggestedTerms || legalAnalysis?.investmentDecision?.suggestedTerms)?.map((item, index) => (
                        <EnhancedBulletPoint key={index} type="action" index={index}>
                          {formatTextWithBold(item)}
                        </EnhancedBulletPoint>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Missing Documents & Information Gaps Section */}
          {(report.missingDocuments || legalAnalysis?.missingDocuments) && (
            <SectionCard
              title="Missing Documents & Information Gaps"
              icon={<FiFileMinus />}
              isOpen={activeSections['Missing Documents & Information Gaps'] !== undefined ? activeSections['Missing Documents & Information Gaps'] : true}
              toggleOpen={() => toggleSection('Missing Documents & Information Gaps')}
              delay={0.6}
            >
              <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
                {/* Missing Documents List */}
                {(report.missingDocuments?.documentList?.length || legalAnalysis?.missingDocuments?.list?.length) ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', border: `1px solid ${FORMAL_PALETTE.borderDefault}` }}>
                    <thead style={{ backgroundColor: FORMAL_PALETTE.tableHeaderBackground || '#F0F4F8' }}>
                      <tr>
                        <th style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', color: FORMAL_PALETTE.textPrimary, fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>Document Category</th>
                        <th style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', color: FORMAL_PALETTE.textPrimary, fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>Specific Document</th>
                        <th style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', color: FORMAL_PALETTE.textPrimary, fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>Requirement Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(report.missingDocuments?.documentList || legalAnalysis?.missingDocuments?.list)?.map((doc, index) => (
                        <tr key={index}>
                          <td style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', fontFamily: "'Georgia', serif" }}>{doc.documentCategory}</td>
                          <td style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', fontFamily: "'Georgia', serif" }}>{doc.specificDocument}</td>
                          <td style={{ border: `1px solid ${FORMAL_PALETTE.borderDefault}`, padding: '0.75rem', textAlign: 'left', fontFamily: "'Georgia', serif" }}>{doc.requirementReference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontFamily: "'Georgia', serif", color: FORMAL_PALETTE.textSecondary, fontStyle: 'italic' }}>No missing documents identified or this section is not applicable.</p>
                )}

                {/* Impact of Missing Documents */}
                {((report.missingDocuments?.overallImpact || report.missingDocuments?.note) || legalAnalysis?.missingDocuments?.impact) && (
                  <InfoItem
                    icon={<FiAlertCircle />}
                    label="Impact of Missing Documents"
                    value={formatTextWithBold((report.missingDocuments?.overallImpact || report.missingDocuments?.note) || legalAnalysis?.missingDocuments?.impact) as string}
                  />
                )}
                {/* Priority to Address Gaps */}
                {(report.missingDocuments?.priority || legalAnalysis?.missingDocuments?.priorityLevel) && (
                  <InfoItem icon={<FiAlertTriangle />} label="Priority to Address Gaps" value={report.missingDocuments?.priority || legalAnalysis?.missingDocuments?.priorityLevel} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Detailed Findings Section */}
          {(report.detailedFindings?.length || legalAnalysis?.detailedFindings?.length) && (
            <SectionCard
              title="Detailed Findings"
              icon={<FiZoomIn />}
              isOpen={activeSections['Detailed Findings'] !== undefined ? activeSections['Detailed Findings'] : true}
              toggleOpen={() => toggleSection('Detailed Findings')}
              delay={0.7}
            >
              <div className="space-y-6">
                {(report.detailedFindings || legalAnalysis?.detailedFindings)?.map((finding, index) => (
                  <motion.div
                    key={index}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: '#FDFDFD' }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <h4 className="font-semibold text-md mb-2 capitalize" style={{ color: FORMAL_PALETTE.textPrimary }}>
                      {finding.area || 'General Finding'}
                      {finding.document && <span className="text-xs font-normal text-slate-500 ml-2">(Ref: {finding.document})</span>}
                    </h4>
                    <div className="mb-2">
                      <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: finding.riskLevel === 'Critical' || finding.riskLevel === 'High' ? '#FECACA' : finding.riskLevel === 'Medium' ? '#FDE68A' : '#DBEAFE',
                          color: finding.riskLevel === 'Critical' || finding.riskLevel === 'High' ? '#991B1B' : finding.riskLevel === 'Medium' ? '#92400E' : '#1E40AF'
                        }}
                      >
                        {finding.riskLevel} Risk
                      </span>
                      {finding.timeline && <span className="text-xs text-slate-500 ml-2">Timeline: {finding.timeline}</span>}
                    </div>
                    <p className="text-sm mb-1.5 text-justify" style={{ color: FORMAL_PALETTE.textSecondary }}>
                      <strong style={{ color: FORMAL_PALETTE.textPrimary }}>Finding:</strong> {formatTextWithBold(finding.finding)}
                    </p>
                    <p className="text-sm mb-1.5 text-justify" style={{ color: FORMAL_PALETTE.textSecondary }}>
                      <strong style={{ color: FORMAL_PALETTE.textPrimary }}>Impact:</strong> {formatTextWithBold(finding.impact)}
                    </p>
                    <div className="mt-2 p-3 rounded-md" style={{ backgroundColor: '#EFF6FF', borderLeft: `3px solid ${FORMAL_PALETTE.accentPrimary}` }}>
                      <p className="text-sm text-justify" style={{ color: FORMAL_PALETTE.accentPrimary }}>
                        <strong className="font-semibold">Recommendation:</strong> {formatTextWithBold(finding.recommendation)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Consolidated Recommendations Section */}
          {report.recommendations && report.recommendations.length > 0 && (
            <SectionCard
              title="Consolidated Recommendations"
              icon={<FiCheckSquare />}
              isOpen={activeSections['Consolidated Recommendations'] !== undefined ? activeSections['Consolidated Recommendations'] : true}
              toggleOpen={() => toggleSection('Consolidated Recommendations')}
              delay={0.8}
            >
              <div className="space-y-5">
                {report.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: '#F8FAFC' }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-semibold text-md capitalize" style={{ color: FORMAL_PALETTE.textPrimary }}>
                        {rec.area || 'General Recommendation'}
                      </h4>
                      <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full ${rec.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm mb-1 text-justify" style={{ color: FORMAL_PALETTE.textSecondary }}>
                      {formatTextWithBold(rec.recommendation || rec.action)}
                    </p>
                    <div className="text-xs grid grid-cols-2 gap-x-3 gap-y-1 mt-2 pt-2 border-t" style={{ borderColor: FORMAL_PALETTE.borderSubtle, color: FORMAL_PALETTE.textSubtle }}>
                      {rec.timeline && <span><strong>Timeline:</strong> {rec.timeline}</span>}
                      {(rec.responsibility || rec.responsibleParty) && <span><strong>Responsibility:</strong> {rec.responsibility || rec.responsibleParty}</span>}
                      {rec.cost && <span><strong>Est. Cost:</strong> {rec.cost}</span>}
                      {rec.expectedOutcome && <span className="col-span-2"><strong>Expected Outcome:</strong> {rec.expectedOutcome}</span>}
                      {rec.rationale && <span className="col-span-2 pt-1 mt-1 border-t" style={{ borderColor: FORMAL_PALETTE.borderSubtle }}><strong>Rationale:</strong> {rec.rationale}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Report Metadata Section */}
          {legalAnalysis?.reportMetadata && (
            <SectionCard
              title="Report Metadata & Scope"
              icon={<FiDatabase />}
              isOpen={activeSections['Report Metadata'] !== undefined ? activeSections['Report Metadata'] : true}
              toggleOpen={() => toggleSection('Report Metadata')}
              delay={0.9}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <InfoItem icon={<FiFileText />} label="Documents Reviewed" value={legalAnalysis.reportMetadata.documentsReviewed} />
                <InfoItem icon={<FiCheckSquare />} label="Compliance Areas Checked" value={legalAnalysis.reportMetadata.complianceAreasChecked} />
                <InfoItem icon={<FiList />} label="Total Findings" value={legalAnalysis.reportMetadata.totalFindings} />
                <InfoItem icon={<FiAlertTriangle />} label="Critical Issues" value={legalAnalysis.reportMetadata.criticalIssuesCount} />
                <InfoItem icon={<FiAlertCircle />} label="High Priority Issues" value={legalAnalysis.reportMetadata.highPriorityIssuesCount} />
                <InfoItem icon={<FiInfo />} label="Medium Priority Issues" value={legalAnalysis.reportMetadata.mediumPriorityIssuesCount} />
                <InfoItem icon={<FiHelpCircle />} label="Low Priority Issues" value={legalAnalysis.reportMetadata.lowPriorityIssuesCount} />
                {legalAnalysis.reportMetadata.reportVersion && <InfoItem icon={<FiAward />} label="Report Version" value={legalAnalysis.reportMetadata.reportVersion} />}
                {legalAnalysis.reportMetadata.assessmentDate && <InfoItem icon={<FiClock />} label="Assessment Date" value={formatDate(legalAnalysis.reportMetadata.assessmentDate)} />}
                {legalAnalysis.reportMetadata.assessorName && <InfoItem icon={<FiUser />} label="Assessor" value={legalAnalysis.reportMetadata.assessorName} />}
              </div>
            </SectionCard>
          )}

          {/* Disclaimer Section */}
          {(report.disclaimer || legalAnalysis?.disclaimer) && (
            <SectionCard
              title="Disclaimer"
              icon={<FiClipboard />}
              isOpen={activeSections['Disclaimer'] !== undefined ? activeSections['Disclaimer'] : true}
              toggleOpen={() => toggleSection('Disclaimer')}
              delay={1.0}
            >
              <div className="p-4 border rounded-md text-xs" style={{ borderColor: FORMAL_PALETTE.borderDefault, backgroundColor: '#F9FAFB', color: FORMAL_PALETTE.textSubtle }}>
                <p className="whitespace-pre-wrap text-justify italic">
                  {formatTextWithBold(report.disclaimer || legalAnalysis?.disclaimer)}
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDueDiligenceReportContent;