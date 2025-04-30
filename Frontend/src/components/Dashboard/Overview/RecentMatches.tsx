import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { RecentMatch } from '../../../types/Dashboard.types';
import { useNavigate } from 'react-router-dom';

interface RecentMatchesProps {
  role: string;
  matches: RecentMatch[];
}

const RecentMatches: React.FC<RecentMatchesProps> = ({ role, matches }) => {
  const navigate = useNavigate();

  // Use provided matches or fallback to empty array
  const recentMatches = matches.length > 0 ? matches : [
    {
      id: '1',
      entityId: 'mock-id-1',
      name: role === 'startup' ? 'Venture Capital Partners' : 'TechNova Solutions',
      description: role === 'startup'
        ? 'Early-stage VC firm focusing on B2B SaaS and fintech startups.'
        : 'AI-powered fintech platform for small businesses.',
      compatibilityScore: 92,
      location: 'San Francisco, CA',
      industry: role === 'startup' ? 'Venture Capital' : 'Fintech',
      logo: 'https://via.placeholder.com/50',
      isNew: true
    },
    {
      id: '2',
      entityId: 'mock-id-2',
      name: role === 'startup' ? 'Angel Investors Network' : 'GreenTech Innovations',
      description: role === 'startup'
        ? 'Network of angel investors focused on early-stage technology startups.'
        : 'Sustainable energy solutions for commercial buildings.',
      compatibilityScore: 87,
      location: 'New York, NY',
      industry: role === 'startup' ? 'Angel Investment' : 'CleanTech',
      logo: 'https://via.placeholder.com/50',
      isNew: false
    },
    {
      id: '3',
      entityId: 'mock-id-3',
      name: role === 'startup' ? 'Growth Capital Fund' : 'HealthAI',
      description: role === 'startup'
        ? 'Growth-stage investment fund specializing in healthcare and biotech.'
        : 'AI-driven healthcare diagnostics platform.',
      compatibilityScore: 78,
      location: 'Boston, MA',
      industry: role === 'startup' ? 'Private Equity' : 'HealthTech',
      logo: 'https://via.placeholder.com/50',
      isNew: true
    }
  ];

  // Function to navigate to matches tab
  const navigateToMatches = () => {
    navigate('/dashboard', { state: { activeTab: 'matches' } });
  };

  // Define colors based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;
  const borderColor = role === 'startup' ? colours.startup.border : colours.investor.border;

  // Function to view match details
  const viewMatchDetails = (matchId: string, entityId: string) => {
    // Store the selected entity ID in localStorage
    localStorage.setItem('selectedEntityId', entityId);
    localStorage.setItem('selectedEntityType', role === 'startup' ? 'investor' : 'startup');

    // Navigate to matches tab with the selected match
    navigate('/dashboard', {
      state: {
        activeTab: 'matches',
        selectedMatchId: matchId
      }
    });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor }}
    >
      <div className="p-5 border-b" style={{ borderColor }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Matches</h2>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={navigateToMatches}
            className="text-sm font-medium flex items-center"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </motion.button>
        </div>
      </div>

      {recentMatches.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No matches found yet.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md"
            style={{ background: primaryGradient }}
            onClick={navigateToMatches}
          >
            Find matches
          </motion.button>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor }}>
          {recentMatches.map((match, index) => (
            <motion.div
              key={match.id}
              className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              onClick={() => viewMatchDetails(match.id, match.entityId)}
            >
              <div className="flex items-start">
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-xl"
                  style={{
                    background: primaryGradient,
                    boxShadow: `0 3px 10px ${primaryColor}25`
                  }}
                >
                  {match.logo ? (
                    <img src={match.logo} alt={match.name} className="w-full h-full object-cover" />
                  ) : (
                    match.name.charAt(0)
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800">{match.name}</h3>
                    {match.isNew && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">New</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{match.description}</p>

                  <div className="mt-2 flex items-center text-xs text-gray-500 space-x-3">
                    <span>{match.location || 'Location not specified'}</span>
                    <span>•</span>
                    <span>{match.industry}</span>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end">
                  <motion.div
                    className="flex items-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: `conic-gradient(${primaryColor} ${match.compatibilityScore}%, #e5e7eb ${match.compatibilityScore}% 100%)`,
                        boxShadow: `0 3px 10px ${primaryColor}25`
                      }}
                    >
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                        <span style={{ color: primaryColor }}>{match.compatibilityScore}</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="mt-3 flex space-x-2">
                    <motion.button
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiStar size={16} className="text-gray-400 hover:text-yellow-500" />
                    </motion.button>
                    <motion.button
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      style={{ color: primaryColor }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiExternalLink size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 border-t text-center" style={{ borderColor }}>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm"
          style={{ background: primaryGradient }}
          onClick={navigateToMatches}
        >
          Explore all matches
        </motion.button>
      </div>
    </div>
  );
};

export default RecentMatches;
