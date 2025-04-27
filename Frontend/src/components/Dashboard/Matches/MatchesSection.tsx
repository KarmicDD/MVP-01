import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiRefreshCw, FiGrid, FiList, FiStar, FiMessageSquare, FiEye } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import MatchCard from './MatchCard';
import MatchDetails from './MatchDetails';
import MatchFilters from './MatchFilters';

interface MatchesSectionProps {
  userProfile?: {
    role: string;
    userId?: string;
  } | null;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({ userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [bookmarkedMatches, setBookmarkedMatches] = useState<Set<string>>(new Set());
  
  const role = userProfile?.role || 'startup';
  
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  
  // Mock data for matches
  const matches = [
    {
      id: '1',
      name: role === 'startup' ? 'Venture Capital Partners' : 'TechNova Solutions',
      description: role === 'startup' 
        ? 'Early-stage VC firm focusing on B2B SaaS and fintech startups with a strong emphasis on sustainable growth and product-market fit.' 
        : 'AI-powered fintech platform for small businesses that streamlines accounting, invoicing, and financial forecasting.',
      compatibilityScore: 92,
      location: 'San Francisco, CA',
      industry: role === 'startup' ? 'Venture Capital' : 'Fintech',
      stage: role === 'startup' ? 'Series A-C' : 'Series A',
      logo: 'https://via.placeholder.com/80',
      isNew: true
    },
    {
      id: '2',
      name: role === 'startup' ? 'Angel Investors Network' : 'GreenTech Innovations',
      description: role === 'startup' 
        ? 'Network of angel investors focused on early-stage technology startups with innovative solutions to real-world problems.' 
        : 'Sustainable energy solutions for commercial buildings that reduce carbon footprint and operational costs.',
      compatibilityScore: 87,
      location: 'New York, NY',
      industry: role === 'startup' ? 'Angel Investment' : 'CleanTech',
      stage: role === 'startup' ? 'Seed-Series A' : 'Seed',
      logo: 'https://via.placeholder.com/80',
      isNew: false
    },
    {
      id: '3',
      name: role === 'startup' ? 'Growth Capital Fund' : 'HealthAI',
      description: role === 'startup' 
        ? 'Growth-stage investment fund specializing in healthcare and biotech with a focus on companies with proven traction.' 
        : 'AI-driven healthcare diagnostics platform that helps doctors identify diseases earlier and with greater accuracy.',
      compatibilityScore: 78,
      location: 'Boston, MA',
      industry: role === 'startup' ? 'Private Equity' : 'HealthTech',
      stage: role === 'startup' ? 'Series B-D' : 'Series B',
      logo: 'https://via.placeholder.com/80',
      isNew: true
    },
    {
      id: '4',
      name: role === 'startup' ? 'Tech Accelerator Fund' : 'EduLearn Platform',
      description: role === 'startup' 
        ? 'Accelerator program providing funding, mentorship, and resources to early-stage tech startups.' 
        : 'Online education platform offering personalized learning experiences through AI-driven content delivery.',
      compatibilityScore: 85,
      location: 'Austin, TX',
      industry: role === 'startup' ? 'Accelerator' : 'EdTech',
      stage: role === 'startup' ? 'Pre-seed to Seed' : 'Seed',
      logo: 'https://via.placeholder.com/80',
      isNew: false
    },
    {
      id: '5',
      name: role === 'startup' ? 'Impact Ventures' : 'Logistics Optimizer',
      description: role === 'startup' 
        ? 'Impact investment firm focused on startups addressing social and environmental challenges.' 
        : 'Supply chain optimization platform using AI to reduce costs and improve delivery times.',
      compatibilityScore: 73,
      location: 'Chicago, IL',
      industry: role === 'startup' ? 'Impact Investing' : 'LogisticsTech',
      stage: role === 'startup' ? 'Seed-Series B' : 'Series A',
      logo: 'https://via.placeholder.com/80',
      isNew: false
    },
    {
      id: '6',
      name: role === 'startup' ? 'Strategic Investors Group' : 'CyberShield Security',
      description: role === 'startup' 
        ? 'Corporate venture capital arm providing strategic investments and partnership opportunities.' 
        : 'Advanced cybersecurity platform protecting businesses from emerging threats using behavioral analysis.',
      compatibilityScore: 81,
      location: 'Seattle, WA',
      industry: role === 'startup' ? 'Corporate VC' : 'Cybersecurity',
      stage: role === 'startup' ? 'Series A-C' : 'Series B',
      logo: 'https://via.placeholder.com/80',
      isNew: true
    }
  ];
  
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
  
  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle bookmark toggle
  const toggleBookmark = (matchId: string) => {
    setBookmarkedMatches(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(matchId)) {
        newBookmarks.delete(matchId);
      } else {
        newBookmarks.add(matchId);
      }
      return newBookmarks;
    });
  };
  
  // Filter matches based on search query
  const filteredMatches = matches.filter(match => 
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search and filters header */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${role === 'startup' ? 'investors' : 'startups'}...`}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-4 py-2.5 rounded-lg border flex items-center transition-colors ${
                filtersOpen 
                  ? 'border-blue-300 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FiFilter size={16} className="mr-2" />
              Filters
              <FiChevronDown size={16} className={`ml-2 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <FiGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <FiList size={16} />
              </button>
            </div>
            
            <button className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>
        
        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-gray-200">
                <MatchFilters role={role} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Matches grid/list */}
        <motion.div variants={itemVariants} className={`${selectedMatchId ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {filteredMatches.length} {role === 'startup' ? 'Investors' : 'Startups'} Found
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {filteredMatches.length} of {matches.length}
                </div>
              </div>
            </div>
            
            <div className={`p-5 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
              {filteredMatches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No matches found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredMatches.map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isBookmarked={bookmarkedMatches.has(match.id)}
                    toggleBookmark={toggleBookmark}
                    isSelected={selectedMatchId === match.id}
                    onClick={() => setSelectedMatchId(match.id === selectedMatchId ? null : match.id)}
                    viewMode={viewMode}
                    role={role}
                    index={index}
                  />
                ))
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
                Previous
              </button>
              <div className="flex items-center space-x-1">
                <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-medium flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 font-medium flex items-center justify-center">2</button>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 font-medium flex items-center justify-center">3</button>
                <span className="text-gray-500">...</span>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 font-medium flex items-center justify-center">12</button>
              </div>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium text-sm shadow-sm transition-all hover:shadow-md"
                style={{ 
                  background: role === 'startup' 
                    ? colours.primaryGradient
                    : 'linear-gradient(135deg, #10B981, #059669)'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Match details */}
        <AnimatePresence>
          {selectedMatchId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="lg:w-1/2"
            >
              <MatchDetails
                match={matches.find(m => m.id === selectedMatchId)!}
                onClose={() => setSelectedMatchId(null)}
                isBookmarked={bookmarkedMatches.has(selectedMatchId)}
                toggleBookmark={toggleBookmark}
                role={role}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MatchesSection;
