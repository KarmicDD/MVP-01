import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTarget, FiUsers, FiBarChart2, FiAward, FiLayers, FiGlobe } from 'react-icons/fi';
import ReportCard from './ReportCard';
import ChartRenderer from './ChartRenderer';

interface ForwardLookingMetric {
  name: string;
  value: string | number;
  description?: string;
  trend?: string;
  status?: string;
  chartData?: any;
}

interface ForwardLookingDimension {
  name: string;
  score: number;
  description: string;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
}

interface ImplementationStep {
  recommendation: string;
  implementationSteps: string[];
  timeline: string;
  resourceRequirements: string;
  expectedOutcome: string;
}

interface HiringPriority {
  role: string;
  responsibilities: string[];
  impact: string;
  timeline: string;
}

interface OrganizationalImprovement {
  area: string;
  recommendation: string;
  implementationSteps: string[];
  expectedOutcome: string;
}

interface ScalingStrategy {
  strategy: string;
  implementationSteps: string[];
  resourceRequirements: string;
  timeline: string;
  expectedOutcome: string;
}

interface Assumption {
  scenario: 'conservative' | 'moderate' | 'aggressive';
  assumptions: string[];
}

interface RDRoadmapItem {
  priority: string;
  initiative: string;
  timeline: string;
  resourceRequirements: string;
  expectedOutcome: string;
}

interface ForwardLookingAnalysisProps {
  marketPotential?: {
    tamSize?: string | number;
    growthRate?: string | number;
    adoptionStage?: string;
    targetSegments?: string[];
    entryStrategy?: string;
    competitiveLandscape?: string;
    historicalComparisons?: string[];
    goToMarketRecommendations?: ImplementationStep[];
    metrics?: ForwardLookingMetric[];
  };
  innovationAssessment?: {
    uniquenessScore?: number;
    ipStrength?: string;
    competitiveAdvantage?: string;
    keyDifferentiators?: string[];
    protectionStrategies?: string[];
    innovationGaps?: string[];
    rdRoadmap?: RDRoadmapItem[];
    historicalComparisons?: string[];
    metrics?: ForwardLookingMetric[];
  };
  teamCapability?: {
    executionScore?: number;
    experienceLevel?: string;
    trackRecord?: string;
    founderAchievements?: string[];
    identifiedSkillGaps?: string[];
    hiringPriorities?: HiringPriority[];
    organizationalImprovements?: OrganizationalImprovement[];
    historicalComparisons?: string[];
    metrics?: ForwardLookingMetric[];
  };
  growthTrajectory?: {
    scenarios?: {
      conservative?: number;
      moderate?: number;
      aggressive?: number;
    };
    assumptions?: Assumption[];
    unitEconomics?: {
      currentCac?: number;
      projectedCac?: number;
      currentLtv?: number;
      projectedLtv?: number;
    };
    scalingStrategies?: ScalingStrategy[];
    growthLevers?: string[];
    optimizationTactics?: string[];
    historicalComparisons?: string[];
    metrics?: ForwardLookingMetric[];
  };
  dimensions?: ForwardLookingDimension[];
  chartData?: any;
}

const ForwardLookingAnalysisSection: React.FC<ForwardLookingAnalysisProps> = ({
  marketPotential,
  innovationAssessment,
  teamCapability,
  growthTrajectory,
  dimensions,
  chartData
}) => {
  // Chart colors
  const CHART_COLORS = {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    accent1: '#06B6D4',
    accent2: '#8B5CF6',
    accent3: '#0EA5E9',
    accent4: '#14B8A6',
    accent5: '#F97316',
  };

  return (
    <ReportCard
      title="Forward-Looking Analysis"
      icon={<FiTrendingUp />}
      iconBgColor="bg-emerald-100"
      iconColor="text-emerald-600"
      delay={0.2}
    >
      <div className="mb-6">
        <p className="text-gray-700 leading-relaxed">
          This analysis evaluates future potential beyond current financial performance,
          considering market opportunity, innovation strength, team capability, and growth trajectory.
        </p>
      </div>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Potential Section */}
        {marketPotential && (
          <motion.div
            className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
              <FiGlobe className="mr-2 text-blue-500" /> Market Potential
            </h4>
            <div className="space-y-4">
              {marketPotential.tamSize && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Addressable Market:</span>
                  <span className="font-medium text-gray-800">{marketPotential.tamSize}</span>
                </div>
              )}
              {marketPotential.growthRate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Growth Rate:</span>
                  <span className="font-medium text-gray-800">{marketPotential.growthRate}</span>
                </div>
              )}
              {marketPotential.adoptionStage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Adoption Stage:</span>
                  <span className="font-medium text-gray-800">{marketPotential.adoptionStage}</span>
                </div>
              )}

              {/* Target Segments */}
              {marketPotential.targetSegments && marketPotential.targetSegments.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Target Market Segments</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {marketPotential.targetSegments.map((segment, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{segment}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Entry Strategy */}
              {marketPotential.entryStrategy && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Market Entry Strategy</h5>
                  <p className="text-sm text-gray-700">{marketPotential.entryStrategy}</p>
                </div>
              )}

              {/* Competitive Landscape */}
              {marketPotential.competitiveLandscape && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Competitive Landscape</h5>
                  <p className="text-sm text-gray-700">{marketPotential.competitiveLandscape}</p>
                </div>
              )}

              {/* Historical Comparisons */}
              {marketPotential.historicalComparisons && marketPotential.historicalComparisons.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Historical Market Comparisons</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {marketPotential.historicalComparisons.map((comparison, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{comparison}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Go-to-Market Recommendations */}
              {marketPotential.goToMarketRecommendations && marketPotential.goToMarketRecommendations.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Go-to-Market Recommendations</h5>
                  <div className="space-y-3">
                    {marketPotential.goToMarketRecommendations.map((rec, idx) => (
                      <div key={idx} className="border-l-2 border-blue-300 pl-3">
                        <p className="text-sm font-medium text-gray-700">{rec.recommendation}</p>
                        <p className="text-xs text-gray-600 mt-1">Timeline: {rec.timeline}</p>
                        <p className="text-xs text-gray-600">Resources: {rec.resourceRequirements}</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700">Implementation Steps:</p>
                          <ol className="list-decimal pl-5 text-xs text-gray-700">
                            {rec.implementationSteps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <p className="text-xs text-gray-700 mt-2">
                          <span className="font-medium">Expected Outcome:</span> {rec.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {marketPotential.metrics && marketPotential.metrics.map((metric, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold">{metric.value}</span>
                  </div>
                  {metric.description && (
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Innovation Assessment Section */}
        {innovationAssessment && (
          <motion.div
            className="bg-white p-5 rounded-lg border border-purple-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
              <FiAward className="mr-2 text-purple-500" /> Innovation Assessment
            </h4>
            <div className="space-y-4">
              {innovationAssessment.uniquenessScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Uniqueness Score:</span>
                    <span className="font-medium text-gray-800">{innovationAssessment.uniquenessScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      className="h-2.5 rounded-full bg-purple-500"
                      style={{ width: '0%' }}
                      animate={{ width: `${innovationAssessment.uniquenessScore}%` }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
              )}
              {innovationAssessment.ipStrength && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Strength:</span>
                  <span className="font-medium text-gray-800">{innovationAssessment.ipStrength}</span>
                </div>
              )}
              {innovationAssessment.competitiveAdvantage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Competitive Advantage:</span>
                  <span className="font-medium text-gray-800">{innovationAssessment.competitiveAdvantage}</span>
                </div>
              )}

              {/* Key Differentiators */}
              {innovationAssessment.keyDifferentiators && innovationAssessment.keyDifferentiators.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Key Differentiators</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {innovationAssessment.keyDifferentiators.map((diff, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{diff}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Protection Strategies */}
              {innovationAssessment.protectionStrategies && innovationAssessment.protectionStrategies.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">IP Protection Strategies</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {innovationAssessment.protectionStrategies.map((strategy, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Innovation Gaps */}
              {innovationAssessment.innovationGaps && innovationAssessment.innovationGaps.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Innovation Gaps</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {innovationAssessment.innovationGaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* R&D Roadmap */}
              {innovationAssessment.rdRoadmap && innovationAssessment.rdRoadmap.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">R&D Roadmap</h5>
                  <div className="space-y-3">
                    {innovationAssessment.rdRoadmap.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-purple-300 pl-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-700">{item.initiative}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'High' ? 'bg-red-100 text-red-800' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Timeline: {item.timeline}</p>
                        <p className="text-xs text-gray-600">Resources: {item.resourceRequirements}</p>
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-medium">Expected Outcome:</span> {item.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Comparisons */}
              {innovationAssessment.historicalComparisons && innovationAssessment.historicalComparisons.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Historical Innovation Comparisons</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {innovationAssessment.historicalComparisons.map((comparison, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{comparison}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              {innovationAssessment.metrics && innovationAssessment.metrics.map((metric, index) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold">{metric.value}</span>
                  </div>
                  {metric.description && (
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Team Capability Section */}
        {teamCapability && (
          <motion.div
            className="bg-white p-5 rounded-lg border border-green-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
              <FiUsers className="mr-2 text-green-500" /> Team Capability
            </h4>
            <div className="space-y-4">
              {teamCapability.executionScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Execution Score:</span>
                    <span className="font-medium text-gray-800">{teamCapability.executionScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      className="h-2.5 rounded-full bg-green-500"
                      style={{ width: '0%' }}
                      animate={{ width: `${teamCapability.executionScore}%` }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
              )}
              {teamCapability.experienceLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience Level:</span>
                  <span className="font-medium text-gray-800">{teamCapability.experienceLevel}</span>
                </div>
              )}
              {teamCapability.trackRecord && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Track Record:</span>
                  <span className="font-medium text-gray-800">{teamCapability.trackRecord}</span>
                </div>
              )}

              {/* Founder Achievements */}
              {teamCapability.founderAchievements && teamCapability.founderAchievements.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Founder Achievements</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {teamCapability.founderAchievements.map((achievement, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Identified Skill Gaps */}
              {teamCapability.identifiedSkillGaps && teamCapability.identifiedSkillGaps.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Identified Skill Gaps</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {teamCapability.identifiedSkillGaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hiring Priorities */}
              {teamCapability.hiringPriorities && teamCapability.hiringPriorities.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Hiring Priorities</h5>
                  <div className="space-y-3">
                    {teamCapability.hiringPriorities.map((priority, idx) => (
                      <div key={idx} className="border-l-2 border-green-300 pl-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-700">{priority.role}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            {priority.timeline}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700">Key Responsibilities:</p>
                          <ul className="list-disc pl-5 text-xs text-gray-700">
                            {priority.responsibilities.map((resp, respIdx) => (
                              <li key={respIdx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-medium">Expected Impact:</span> {priority.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizational Improvements */}
              {teamCapability.organizationalImprovements && teamCapability.organizationalImprovements.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Organizational Improvements</h5>
                  <div className="space-y-3">
                    {teamCapability.organizationalImprovements.map((improvement, idx) => (
                      <div key={idx} className="border-l-2 border-green-300 pl-3">
                        <p className="text-sm font-medium text-gray-700">{improvement.area}</p>
                        <p className="text-xs text-gray-700 mt-1">{improvement.recommendation}</p>
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700">Implementation Steps:</p>
                          <ol className="list-decimal pl-5 text-xs text-gray-700">
                            {improvement.implementationSteps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-medium">Expected Outcome:</span> {improvement.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Comparisons */}
              {teamCapability.historicalComparisons && teamCapability.historicalComparisons.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Historical Team Comparisons</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {teamCapability.historicalComparisons.map((comparison, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{comparison}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              {teamCapability.metrics && teamCapability.metrics.map((metric, index) => (
                <div key={index} className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold">{metric.value}</span>
                  </div>
                  {metric.description && (
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Growth Trajectory Section */}
        {growthTrajectory && (
          <motion.div
            className="bg-white p-5 rounded-lg border border-amber-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
              <FiBarChart2 className="mr-2 text-amber-500" /> Growth Trajectory
            </h4>
            <div className="space-y-4">
              {/* Growth Scenarios */}
              {growthTrajectory.scenarios && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Growth Scenarios</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {growthTrajectory.scenarios.conservative !== undefined && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Conservative</div>
                        <div className="font-semibold text-gray-800">{growthTrajectory.scenarios.conservative}%</div>
                      </div>
                    )}
                    {growthTrajectory.scenarios.moderate !== undefined && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Moderate</div>
                        <div className="font-semibold text-gray-800">{growthTrajectory.scenarios.moderate}%</div>
                      </div>
                    )}
                    {growthTrajectory.scenarios.aggressive !== undefined && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Aggressive</div>
                        <div className="font-semibold text-gray-800">{growthTrajectory.scenarios.aggressive}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scenario Assumptions */}
              {growthTrajectory.assumptions && growthTrajectory.assumptions.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Scenario Assumptions</h5>
                  <div className="space-y-3">
                    {growthTrajectory.assumptions.map((assumption, idx) => (
                      <div key={idx} className="border-l-2 border-amber-300 pl-3">
                        <p className="text-sm font-medium text-gray-700 capitalize">{assumption.scenario} Scenario</p>
                        <ul className="list-disc pl-5 text-xs text-gray-700 mt-1">
                          {assumption.assumptions.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Economics */}
              {growthTrajectory.unitEconomics && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Unit Economics</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-600">Current CAC</div>
                      <div className="font-semibold text-gray-800">{growthTrajectory.unitEconomics.currentCac}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Projected CAC</div>
                      <div className="font-semibold text-gray-800">{growthTrajectory.unitEconomics.projectedCac}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Current LTV</div>
                      <div className="font-semibold text-gray-800">{growthTrajectory.unitEconomics.currentLtv}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Projected LTV</div>
                      <div className="font-semibold text-gray-800">{growthTrajectory.unitEconomics.projectedLtv}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scaling Strategies */}
              {growthTrajectory.scalingStrategies && growthTrajectory.scalingStrategies.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Scaling Strategies</h5>
                  <div className="space-y-3">
                    {growthTrajectory.scalingStrategies.map((strategy, idx) => (
                      <div key={idx} className="border-l-2 border-amber-300 pl-3">
                        <p className="text-sm font-medium text-gray-700">{strategy.strategy}</p>
                        <p className="text-xs text-gray-600 mt-1">Timeline: {strategy.timeline}</p>
                        <p className="text-xs text-gray-600">Resources: {strategy.resourceRequirements}</p>
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700">Implementation Steps:</p>
                          <ol className="list-decimal pl-5 text-xs text-gray-700">
                            {strategy.implementationSteps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-medium">Expected Outcome:</span> {strategy.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth Levers */}
              {growthTrajectory.growthLevers && growthTrajectory.growthLevers.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Growth Levers</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {growthTrajectory.growthLevers.map((lever, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{lever}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optimization Tactics */}
              {growthTrajectory.optimizationTactics && growthTrajectory.optimizationTactics.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Optimization Tactics</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {growthTrajectory.optimizationTactics.map((tactic, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{tactic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Historical Comparisons */}
              {growthTrajectory.historicalComparisons && growthTrajectory.historicalComparisons.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Historical Growth Comparisons</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {growthTrajectory.historicalComparisons.map((comparison, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{comparison}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              {growthTrajectory.metrics && growthTrajectory.metrics.map((metric, index) => (
                <div key={index} className="bg-amber-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold">{metric.value}</span>
                  </div>
                  {metric.description && (
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Dimensions Section */}
      {dimensions && dimensions.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
            <FiLayers className="mr-2 text-indigo-600" /> Forward-Looking Dimensions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensions.map((dimension, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{dimension.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${dimension.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    dimension.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      dimension.status === 'moderate' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {dimension.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div
                    className="h-3 rounded-full"
                    style={{
                      width: '0%',
                      backgroundColor: dimension.status === 'excellent' ? CHART_COLORS.success :
                        dimension.status === 'good' ? CHART_COLORS.primary :
                          dimension.status === 'moderate' ? CHART_COLORS.warning :
                            CHART_COLORS.danger
                    }}
                    animate={{ width: `${dimension.score}%` }}
                    transition={{ duration: 1, delay: 0.3 + (index * 0.1) }}
                  ></motion.div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{dimension.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chart Section */}
      {chartData && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h4 className="font-semibold mb-4 text-gray-800 text-center">Forward-Looking Analysis</h4>
          <ChartRenderer
            chartData={chartData}
            height={300}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
          />
        </motion.div>
      )}
    </ReportCard>
  );
};

export default ForwardLookingAnalysisSection;
