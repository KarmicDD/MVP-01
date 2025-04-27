import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiStar, FiMessageSquare, FiShare2, FiMapPin, FiTag, FiBarChart2, FiUsers, FiCalendar, FiGlobe, FiFileText, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Match {
  id: string;
  name: string;
  description: string;
  compatibilityScore: number;
  location: string;
  industry: string;
  stage: string;
  logo: string;
  isNew: boolean;
}

interface MatchDetailsProps {
  match: Match;
  onClose: () => void;
  isBookmarked: boolean;
  toggleBookmark: (id: string) => void;
  role: string;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({
  match,
  onClose,
  isBookmarked,
  toggleBookmark,
  role
}) => {
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';

  // Handle bookmark click
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(match.id);
  };

  // Mock data for compatibility radar chart
  const radarData = {
    labels: [
      'Mission Alignment',
      'Investment Philosophy',
      'Sector Focus',
      'Stage Alignment',
      'Value Add',
      'Cultural Fit'
    ],
    datasets: [
      {
        label: 'Compatibility',
        data: [85, 90, 95, 80, 88, 92],
        backgroundColor: `${primaryColor}20`,
        borderColor: primaryColor,
        borderWidth: 2,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: primaryColor
      }
    ]
  };

  // Radar chart options
  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent', font: { size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Mock data for key strengths and potential concerns
  const strengths = [
    'Strong track record in the industry',
    'Complementary expertise to your team',
    'Extensive network of connections',
    'Aligned on growth strategy'
  ];

  const concerns = [
    'Different perspectives on exit timeline',
    'Limited experience in your specific market segment'
  ];

  // Mock data for recommended next steps
  const nextSteps = [
    'Schedule an initial meeting',
    'Share your detailed business plan',
    'Discuss specific partnership opportunities',
    'Explore potential synergies'
  ];

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Match Details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiX size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Profile header */}
        <div className="flex items-start">
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
            <img src={match.logo} alt={match.name} className="w-full h-full object-cover" />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{match.name}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500 space-x-2">
                  <span className="flex items-center"><FiMapPin size={14} className="mr-1" />{match.location}</span>
                  <span>•</span>
                  <span className="flex items-center"><FiTag size={14} className="mr-1" />{match.industry}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBookmarkClick}
                >
                  <FiStar
                    size={18}
                    className={isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                  />
                </motion.button>
                <motion.button
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <FiShare2 size={18} className="text-gray-500" />
                </motion.button>
              </div>
            </div>

            <div className="mt-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {match.stage}
              </span>
              <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                {match.compatibilityScore}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-2">About</h4>
          <p className="text-gray-600">{match.description}</p>
        </div>

        {/* Compatibility breakdown */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Compatibility Breakdown</h4>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="h-64">
              <Radar data={radarData} options={radarOptions} />
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>{match.compatibilityScore}%</div>
              <div className="text-sm text-gray-500">Overall Compatibility Score</div>
            </div>
          </div>
        </div>

        {/* Key information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Key Strengths</h4>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-1 rounded-full bg-green-100 text-green-600 mt-0.5">
                    <FiCheckCircle size={14} />
                  </div>
                  <p className="ml-2 text-gray-600 text-sm">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Potential Concerns</h4>
            <div className="space-y-2">
              {concerns.map((concern, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-1 rounded-full bg-yellow-100 text-yellow-600 mt-0.5">
                    <FiAlertTriangle size={14} />
                  </div>
                  <p className="ml-2 text-gray-600 text-sm">{concern}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Additional Information</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <FiUsers size={16} />
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Team Size</div>
                  <div className="font-medium text-gray-800">25-50 employees</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <FiCalendar size={16} />
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Founded</div>
                  <div className="font-medium text-gray-800">2018</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <FiGlobe size={16} />
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Website</div>
                  <div className="font-medium text-gray-800 truncate">www.example.com</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <FiFileText size={16} />
                </div>
                <div className="ml-3">
                  <div className="text-xs text-gray-500">Documents</div>
                  <div className="font-medium text-gray-800">5 available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended next steps */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Recommended Next Steps</h4>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-white border border-blue-200 flex items-center justify-center text-xs font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <p className="ml-3 text-blue-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
          View Full Profile
        </button>
        <button
          className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md flex items-center"
          style={{
            background: role === 'startup'
              ? colours.primaryGradient
              : 'linear-gradient(135deg, #10B981, #059669)'
          }}
        >
          <FiMessageSquare size={16} className="mr-2" />
          Connect
        </button>
      </div>
    </motion.div>
  );
};

export default MatchDetails;
