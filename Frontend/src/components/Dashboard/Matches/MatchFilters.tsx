import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { colours } from '../../../utils/colours';

interface MatchFiltersProps {
  role: string;
}

const MatchFilters: React.FC<MatchFiltersProps> = ({ role }) => {
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  
  // Mock filter options
  const industries = role === 'startup' 
    ? ['Venture Capital', 'Angel Investment', 'Private Equity', 'Corporate VC', 'Accelerator', 'Impact Investing'] 
    : ['Fintech', 'HealthTech', 'EdTech', 'CleanTech', 'AI/ML', 'SaaS', 'E-commerce', 'Cybersecurity'];
  
  const stages = role === 'startup'
    ? ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Late Stage']
    : ['Idea Stage', 'MVP', 'Pre-revenue', 'Early Revenue', 'Growth', 'Scaling', 'Profitable'];
  
  const locations = ['San Francisco, CA', 'New York, NY', 'Boston, MA', 'Austin, TX', 'Chicago, IL', 'Seattle, WA', 'Los Angeles, CA', 'Remote'];
  
  const compatibilityRanges = ['90%+', '80-89%', '70-79%', '60-69%', 'Below 60%'];
  
  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Industry filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Industry</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
          {industries.map((industry) => (
            <div key={industry} className="flex items-center">
              <input
                type="checkbox"
                id={`industry-${industry}`}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`industry-${industry}`} className="ml-2 text-sm text-gray-600">
                {industry}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stage filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Stage</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
          {stages.map((stage) => (
            <div key={stage} className="flex items-center">
              <input
                type="checkbox"
                id={`stage-${stage}`}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`stage-${stage}`} className="ml-2 text-sm text-gray-600">
                {stage}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Location filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
          {locations.map((location) => (
            <div key={location} className="flex items-center">
              <input
                type="checkbox"
                id={`location-${location}`}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-600">
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Compatibility filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Compatibility</h3>
        <div className="space-y-2">
          {compatibilityRanges.map((range) => (
            <div key={range} className="flex items-center">
              <input
                type="checkbox"
                id={`compatibility-${range}`}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`compatibility-${range}`} className="ml-2 text-sm text-gray-600">
                {range}
              </label>
            </div>
          ))}
        </div>
        
        {/* Additional filters */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Filters</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-matches"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="new-matches" className="ml-2 text-sm text-gray-600">
                New matches only
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bookmarked"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="bookmarked" className="ml-2 text-sm text-gray-600">
                Bookmarked
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter actions */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          <div className="ml-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Fintech
              <button className="ml-1 text-blue-600 hover:text-blue-800">
                <FiX size={14} />
              </button>
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
              Series A
              <button className="ml-1 text-blue-600 hover:text-blue-800">
                <FiX size={14} />
              </button>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
            Clear All
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition-all hover:shadow-md"
            style={{ 
              background: role === 'startup' 
                ? colours.primaryGradient
                : 'linear-gradient(135deg, #10B981, #059669)'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchFilters;
