import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiBookOpen,
  FiTrendingUp,
  FiInfo,
  FiDownload,
  FiShare2,
  FiActivity,
  FiTarget,
  FiBarChart,
  FiCalendar,
  FiAward,
  FiBriefcase,
  FiStar,
  FiList,
  FiFileMinus,
  FiCpu,
  FiAlertOctagon,
  FiArchive,
  FiLayers,
  FiDatabase,
  FiZoomIn,
  FiCheckSquare,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiDollarSign,
  FiGitMerge,
  FiClipboard,
  FiThumbsUp,
  FiThumbsDown,
  FiHelpCircle,
  FiChevronDown,
  FiZap,
  FiLayout,
  FiChevronsRight
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
      if (initialReport.recommendations || initialReport.legalAnalysis?.recommendations) initialActiveSections['Consolidated Recommendations'] = true;
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
        className="mb-10"
      >        <div
        className="shadow-lg border overflow-hidden rounded-lg"
        style={{
          backgroundColor: 'white',
          borderColor: colours.legalDD.border.medium,
          boxShadow: colours.legalDD.shadow.md
        }}
      >
          <div
            className="px-6 py-4 cursor-pointer transition-all duration-200"
            style={{
              background: colours.legalDD.background.header
            }}
            onClick={toggleOpen}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {icon && (
                  <span className="text-xl mr-3" style={{ color: colours.legalDD.quaternary }}>
                    {icon}
                  </span>
                )}
                <h3 className="text-xl font-bold tracking-wide uppercase" style={{ color: colours.legalDD.text.white }}>{title}</h3>
              </div>
              <FiChevronDown
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                style={{ color: colours.legalDD.quaternary }}
              />
            </div>
          </div>
          {isOpen && (
            <div
              className="p-8 transition-all duration-200"
              style={{
                background: colours.legalDD.background.secondary
              }}
            >
              <div
                className="prose max-w-none leading-relaxed"
                style={{ color: colours.legalDD.text.primary }}
              >
                {children}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }; const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number; color?: string }> = ({ icon, label, value, color }) => (
    <div
      className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${value || value === 0 ? '' : 'opacity-70'}`}
      style={{
        background: colours.legalDD.background.card,
        borderColor: colours.legalDD.border.light,
        boxShadow: colours.legalDD.shadow.sm
      }}
    >
      <div className="flex items-center mb-2" style={{ color: colours.legalDD.text.secondary }}>
        <span className="text-lg mr-2" style={{ color: colours.legalDD.tertiary }}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <p className={`font-bold text-lg ${color || ''}`} style={{ color: colours.legalDD.text.primary }}>
        {value?.toString() || 'N/A'}
      </p>
    </div>
  ); return (
    <div
      className="min-h-screen"
      style={{
        background: colours.legalDD.background.primary
      }}
    >      {/* Professional Report Header */}
      <div
        className="text-white shadow-2xl"
        style={{
          background: colours.legalDD.background.header,
          boxShadow: colours.legalDD.shadow.xl
        }}
      >
        <div className="px-8 py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <FiShield
                  className="text-3xl mr-4"
                  style={{ color: colours.legalDD.quaternary }}
                />
                <div>
                  <span className="text-sm font-medium tracking-wider uppercase block" style={{ color: colours.legalDD.quaternary }}>
                    Professional Assessment
                  </span>
                  <span className="text-xs opacity-80" style={{ color: colours.legalDD.text.white }}>
                    Due Diligence Report
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: colours.legalDD.text.white }}>
                Legal Assessment
              </h1>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: colours.legalDD.quaternary }}>
                {report.clientName || report.entityProfile?.companyName || entityName}
              </h2>
              {report.reportDate && (
                <div
                  className="flex items-center px-4 py-2 rounded-lg w-fit"
                  style={{
                    color: colours.legalDD.text.white,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${colours.legalDD.border.light}`
                  }}
                >
                  <FiCalendar className="mr-2" style={{ color: colours.legalDD.quaternary }} />
                  <span>Generated on {formatDate(report.reportDate)}</span>
                </div>
              )}
            </div><div className="flex flex-col space-y-3">              <button
              onClick={handleExportPDF}
              className="flex items-center px-6 py-3 text-white border transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-lg"
              style={{
                backgroundColor: colours.legalDD.primary,
                borderColor: colours.legalDD.secondary,
                boxShadow: colours.legalDD.shadow.md
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colours.legalDD.hover.primary;
                e.currentTarget.style.boxShadow = colours.legalDD.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colours.legalDD.primary;
                e.currentTarget.style.boxShadow = colours.legalDD.shadow.md;
              }}
            >
              <FiDownload className="mr-2" /> Export PDF
            </button>
              <button
                onClick={handleShareReport}
                className="flex items-center px-6 py-3 text-white border transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-lg"
                style={{
                  backgroundColor: colours.legalDD.secondary,
                  borderColor: colours.legalDD.tertiary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colours.legalDD.hover.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colours.legalDD.secondary;
                }}
              >
                <FiShare2 className="mr-2" /> Share Report
              </button>
            </div>
          </div>
        </div>
        <div
          className="h-1"
          style={{
            background: `linear-gradient(to right, ${colours.legalDD.primary}, ${colours.legalDD.tertiary}, ${colours.legalDD.secondary})`
          }}
        ></div>
      </div>

      <div className="px-8 py-8" ref={reportRef}>      {introductionContent && (
        <SectionCard
          title="Introduction"
          icon={<FiInfo />}
          delay={0.2}
          isOpen={activeSections['Introduction']}
          toggleOpen={() => toggleSection('Introduction')}
        >
          <div className="prose max-w-none text-slate-700 leading-relaxed">
            {introductionContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-lg">{formatTextWithBold(paragraph)}</p>
            ))}
          </div>
        </SectionCard>
      )}      {legalAnalysis?.executiveSummary && (
        <SectionCard
          title="Executive Summary"
          icon={<FiFileText />}
          delay={0.25}
          isOpen={activeSections['Executive Summary']}
          toggleOpen={() => toggleSection('Executive Summary')}
        >
          <div className="space-y-6">
            <InfoItem icon={<FiZap />} label="Headline" value={legalAnalysis.executiveSummary.headline} />

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
              <h4 className="text-lg font-bold text-slate-700 mb-3">Summary</h4>
              <p className="text-slate-600 leading-relaxed text-lg">{formatTextWithBold(legalAnalysis.executiveSummary.summary)}</p>
            </div>

            {legalAnalysis.executiveSummary.keyFindings && legalAnalysis.executiveSummary.keyFindings.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                <div className="flex items-center mb-4">
                  <FiTarget className="text-emerald-600 mr-2" />
                  <h4 className="text-lg font-bold text-slate-700">Key Findings</h4>
                </div>
                <ul className="space-y-3">
                  {legalAnalysis.executiveSummary.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-slate-600 leading-relaxed">{formatTextWithBold(finding)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {legalAnalysis.executiveSummary.recommendedActions && legalAnalysis.executiveSummary.recommendedActions.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                <div className="flex items-center mb-4">
                  <FiTrendingUp className="text-emerald-600 mr-2" />
                  <h4 className="text-lg font-bold text-slate-700">Recommended Actions</h4>
                </div>
                <ul className="space-y-3">
                  {legalAnalysis.executiveSummary.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-slate-600 leading-relaxed">{formatTextWithBold(action)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SectionCard>
      )}

        {reportItems && reportItems.length > 0 && (
          <SectionCard
            title="Detailed Analysis"
            icon={<FiLayout />}
            delay={0.3}
            isOpen={activeSections['Detailed Analysis']}
            toggleOpen={() => toggleSection('Detailed Analysis')}        >          {reportItems.map((item: LegalReportItem, index: number) => (
              <motion.div
                key={index}
                className="mb-8 bg-white shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 border-b border-slate-200">
                  <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                </div>

                <div className="p-6 space-y-6">
                  {/* Facts Section */}
                  {item.facts && item.facts.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                      <div className="flex items-center mb-4">
                        <FiTarget className="text-blue-600 mr-2" />
                        <h5 className="font-bold text-slate-700 text-lg">Facts</h5>
                      </div>
                      <ul className="space-y-3">
                        {item.facts.map((fact, factIndex) => (
                          <li key={factIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-600 leading-relaxed">{formatTextWithBold(fact)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Findings Section */}
                  {item.keyFindings && item.keyFindings.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                      <div className="flex items-center mb-4">
                        <FiZap className="text-emerald-600 mr-2" />
                        <h5 className="font-bold text-slate-700 text-lg">Key Findings</h5>
                      </div>
                      <ul className="space-y-3">
                        {item.keyFindings.map((finding, findingIndex) => (
                          <li key={findingIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-600 leading-relaxed">{formatTextWithBold(finding)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Actions Section */}
                  {item.recommendedActions && item.recommendedActions.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                      <div className="flex items-center mb-4">
                        <FiTrendingUp className="text-amber-600 mr-2" />
                        <h5 className="font-bold text-slate-700 text-lg">Recommended Actions</h5>
                      </div>
                      <ul className="space-y-3">
                        {item.recommendedActions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-600 leading-relaxed">{formatTextWithBold(action)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary Section */}
                  {item.summary && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">                      <div className="flex items-center mb-4">
                      <FiClipboard style={{ color: colours.legalDD.tertiary }} className="mr-2" />
                      <h5 className="font-bold text-slate-700 text-lg">Summary</h5>
                    </div>
                      <p className="text-slate-600 leading-relaxed">{formatTextWithBold(item.summary)}</p>
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
              };

              return (
                <div className="space-y-6">                {/* Score Visualization */}
                  <div
                    className="bg-white p-6 rounded-lg border shadow-md"
                    style={{
                      borderColor: colours.legalDD.border.medium,
                      boxShadow: colours.legalDD.shadow.md
                    }}
                  >                  <div className="text-center mb-6">
                      <div
                        className="inline-flex items-center justify-center w-32 h-32 rounded-full text-white shadow-lg mb-4"
                        style={{
                          background: colours.legalDD.background.header,
                          boxShadow: colours.legalDD.shadow.lg
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl font-bold" style={{ color: colours.legalDD.text.white }}>
                            {score}
                          </div>
                          <div className="text-sm opacity-90" style={{ color: colours.legalDD.quaternary }}>/ {maxScore}</div>
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold mb-2" style={{ color: colours.legalDD.text.primary }}>
                        Legal Compliance Score
                      </h4>
                    </div>
                    {/* Progress Bar */}
                    <div
                      className="w-full rounded-full h-4 mb-6"
                      style={{
                        backgroundColor: colours.legalDD.border.light
                      }}
                    >
                      <div
                        className="h-4 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: getScoreBgGradient(score)
                        }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        className="p-6 rounded-lg border"
                        style={{
                          background: colours.legalDD.background.card,
                          borderColor: colours.legalDD.border.light
                        }}
                      >
                        <div className="flex items-center mb-3" style={{ color: colours.legalDD.text.secondary }}>
                          <FiStar className="mr-2 text-xl" />
                          <span className="font-bold text-lg">Rating</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: colours.legalDD.text.primary }}>
                          {scoreData?.rating || 'N/A'}
                        </p>
                      </div>
                      <div
                        className="p-6 rounded-lg border"
                        style={{
                          background: colours.legalDD.background.card,
                          borderColor: colours.legalDD.border.light
                        }}
                      >
                        <div className="flex items-center mb-3" style={{ color: colours.legalDD.text.secondary }}>
                          <FiInfo className="mr-2 text-xl" />
                          <span className="font-bold text-lg">Assessment</span>
                        </div>
                        <p className="leading-relaxed" style={{ color: colours.legalDD.text.primary }}>
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
                <div className="space-y-6">                {/* Main Recommendation Card */}
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div
                      className="p-6 rounded-lg shadow-md border"
                      style={{
                        backgroundColor: 'white',
                        borderColor: colours.legalDD.border.medium
                      }}
                    >
                      <h4 className="text-lg font-bold mb-3" style={{ color: colours.legalDD.text.primary }}>
                        Recommendation
                      </h4>
                      <div
                        className="flex items-center px-4 py-3 rounded-lg border"
                        style={getRecommendationColor()}
                      >
                        <span style={{ color: getRecommendationTextColor() }}>
                          {getRecommendationIcon()}
                        </span>
                        <span
                          className="text-xl font-bold ml-3"
                          style={{ color: getRecommendationTextColor() }}
                        >
                          {decisionData?.recommendation || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {decisionData?.successProbability && (
                      <div
                        className="p-6 rounded-lg shadow-md border"
                        style={{
                          backgroundColor: 'white',
                          borderColor: colours.legalDD.border.medium
                        }}
                      >
                        <h4 className="text-lg font-bold mb-3" style={{ color: colours.legalDD.text.primary }}>
                          Success Probability
                        </h4>
                        <div className="text-center">
                          <div className="text-4xl font-bold" style={{ color: colours.legalDD.primary }}>
                            {decisionData.successProbability}%
                          </div>
                          <div className="text-sm" style={{ color: colours.legalDD.text.secondary }}>
                            Likelihood of Success
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Justification */}
                  {decisionData?.justification && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                      <h4 className="text-lg font-bold text-slate-700 mb-3">Justification</h4>
                      <p className="text-slate-600 leading-relaxed">{formatTextWithBold(decisionData.justification)}</p>
                    </div>
                  )}

                  {/* Key Considerations */}
                  {decisionData?.keyConsiderations && decisionData.keyConsiderations.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                      <div className="flex items-center mb-4">
                        <FiList className="text-emerald-600 mr-2" />
                        <h4 className="text-lg font-bold text-slate-700">Key Considerations</h4>
                      </div>
                      <ul className="space-y-3">
                        {decisionData.keyConsiderations.map((consideration, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-600 leading-relaxed">{formatTextWithBold(consideration)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}                {/* Suggested Terms */}
                  {decisionData?.suggestedTerms && decisionData.suggestedTerms.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                      <div className="flex items-center mb-4">
                        <FiCheckCircle className="text-blue-600 mr-2" />
                        <h4 className="text-lg font-bold text-slate-700">Suggested Terms</h4>
                      </div>
                      <ul className="space-y-3">
                        {decisionData.suggestedTerms.map((term, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-slate-600 leading-relaxed">{formatTextWithBold(term)}</span>
                          </li>
                        ))}
                      </ul>
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
                <div className="space-y-6">
                  {/* Impact Assessment */}
                  {missingDocsData?.note && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                      <div className="flex items-start">
                        <FiInfo className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-xl" />
                        <div>
                          <h4 className="text-lg font-bold text-slate-700 mb-3">Impact Assessment</h4>
                          <p className="text-slate-600 leading-relaxed">{formatTextWithBold(missingDocsData.note)}</p>
                        </div>
                      </div>
                    </div>
                  )}                  {/* Missing Documents List */}
                  {missingDocsData?.documentList && missingDocsData.documentList.length > 0 && (
                    <div
                      className="p-6 rounded-lg shadow-md border"
                      style={{
                        backgroundColor: 'white',
                        borderColor: colours.legalDD.border.medium,
                        boxShadow: colours.legalDD.shadow.md
                      }}
                    >
                      <div className="flex items-center mb-6">
                        <FiFileText className="mr-2 text-xl" style={{ color: colours.legalDD.status.error }} />
                        <h4 className="text-lg font-bold" style={{ color: colours.legalDD.text.primary }}>Missing Documents ({missingDocsData.documentList.length})</h4>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead
                            className="border-b"
                            style={{
                              background: colours.legalDD.background.accent,
                              borderColor: colours.legalDD.border.light
                            }}
                          >
                            <tr>
                              <th className="py-4 px-6 text-left text-sm font-bold text-slate-700">Document Category</th>
                              <th className="py-4 px-6 text-left text-sm font-bold text-slate-700">Specific Document</th>
                              <th className="py-4 px-6 text-left text-sm font-bold text-slate-700">Requirement Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {missingDocsData.documentList.map((doc, index) => (<tr
                              key={index}
                              className="transition-colors duration-150 hover:bg-slate-50"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colours.legalDD.hover.background;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <td className="py-4 px-6 border-b border-slate-200 text-slate-600">{formatTextWithBold(doc.documentCategory)}</td>
                              <td className="py-4 px-6 border-b border-slate-200 text-slate-600">{formatTextWithBold(doc.specificDocument)}</td>
                              <td className="py-4 px-6 border-b border-slate-200 text-slate-600">{formatTextWithBold(doc.requirementReference)}</td>
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
        )}      {/* Consolidated Recommendations Section */}
        {(report.recommendations || legalAnalysis?.recommendations) && (
          <SectionCard
            title="Consolidated Recommendations"
            icon={<FiCheckSquare />}
            delay={0.55}
            isOpen={activeSections['Consolidated Recommendations']}
            toggleOpen={() => toggleSection('Consolidated Recommendations')}
          >
            {(() => {
              const recommendationsData = report.recommendations || legalAnalysis?.recommendations;
              return (
                <div className="space-y-6">
                  {recommendationsData?.map((recommendation, index) => (
                    <div key={index} className="bg-white shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 border-b border-slate-200">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-bold text-slate-800">{`Recommendation ${index + 1}`}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${recommendation.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              recommendation.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {recommendation.priority}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-sm font-semibold text-slate-700">
                            <span className="font-bold">Action:</span> <span className="text-slate-600">{formatTextWithBold(recommendation.action)}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <InfoItem icon={<FiClock />} label="Timeline" value={recommendation.timeline} />
                          <InfoItem icon={<FiUser />} label="Responsible Party" value={recommendation.responsibility} />
                          {recommendation.cost && (
                            <InfoItem icon={<FiDollarSign />} label="Cost" value={recommendation.cost} />
                          )}
                        </div>

                        {recommendation.rationale && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-sm font-semibold text-slate-700">
                              <span className="font-bold">Rationale:</span> <span className="text-slate-600">{formatTextWithBold(recommendation.rationale)}</span>
                            </p>
                          </div>
                        )}

                        {recommendation.expectedOutcome && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-sm font-semibold text-slate-700">
                              <span className="font-bold">Expected Outcome:</span> <span className="text-slate-600">{formatTextWithBold(recommendation.expectedOutcome)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </SectionCard>
        )}      {/* Report Metadata Section */}
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
        )}

        {/* Disclaimer Section */}
        {(report.disclaimer || legalAnalysis?.disclaimer) && (
          <SectionCard
            title="Disclaimer"
            icon={<FiHelpCircle />}
            delay={0.65}
            isOpen={activeSections['Disclaimer']}
            toggleOpen={() => toggleSection('Disclaimer')}
          >
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
              <div className="flex items-start">
                <FiAlertTriangle className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-xl" />
                <p className="text-slate-600 leading-relaxed italic text-lg">{formatTextWithBold(report.disclaimer || legalAnalysis?.disclaimer)}</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Professional Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-lg shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <FiBriefcase className="text-slate-300 text-3xl mx-auto mb-2" />
                <h4 className="text-xl font-bold text-slate-100">KarmicDD Legal Due Diligence</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-300">
                <div>
                  <p className="font-semibold mb-1">Report Generated:</p>
                  <p>{new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">System Version:</p>
                  <p>KarmicDD Legal v2.1</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Compliance Standards:</p>
                  <p>Indian Corporate Law</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">
                  This report is generated by KarmicDD's AI-powered legal due diligence system and complies with applicable Indian legal standards.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalDueDiligenceReportContent;