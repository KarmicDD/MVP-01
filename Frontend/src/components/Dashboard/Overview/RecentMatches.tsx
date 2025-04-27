import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiMessageSquare } from 'react-icons/fi';
import { colours } from '../../../utils/colours';

interface RecentMatchesProps {
  role: string;
}

const RecentMatches: React.FC<RecentMatchesProps> = ({ role }) => {
  // Mock data for recent matches
  const recentMatches = [
    {
      id: '1',
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
  
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Matches</h2>
          <a 
            href="#view-all" 
            className="text-sm font-medium flex items-center"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </a>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {recentMatches.map((match, index) => (
          <motion.div 
            key={match.id}
            className="p-5 hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img src={match.logo} alt={match.name} className="w-full h-full object-cover" />
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
                  <span>{match.location}</span>
                  <span>•</span>
                  <span>{match.industry}</span>
                </div>
              </div>
              
              <div className="ml-4 flex flex-col items-end">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ 
                      background: `conic-gradient(${primaryColor} ${match.compatibilityScore}%, #e5e7eb ${match.compatibilityScore}% 100%)` 
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                      <span style={{ color: primaryColor }}>{match.compatibilityScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <FiStar size={16} className="text-gray-400 hover:text-yellow-500" />
                  </button>
                  <button 
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <FiMessageSquare size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <button 
          className="text-sm font-medium"
          style={{ color: primaryColor }}
        >
          Load more matches
        </button>
      </div>
    </div>
  );
};

export default RecentMatches;
