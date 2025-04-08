import React from 'react';
import { FiPlus, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';

interface Investment {
  companyName: string;
  amount?: string;
  date?: string;
  stage?: string;
  outcome?: string;
}

interface InvestmentHistoryProps {
  investments: Investment[];
  isEditing: boolean;
  onAddInvestment: () => void;
  onRemoveInvestment: (index: number) => void;
  onInvestmentChange: (index: number, field: keyof Investment, value: string) => void;
}

const InvestmentHistory: React.FC<InvestmentHistoryProps> = ({
  investments,
  isEditing,
  onAddInvestment,
  onRemoveInvestment,
  onInvestmentChange
}) => {
  // Stage options
  const stageOptions = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B+',
    'Growth',
    'Late Stage'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">Investment History</h3>
        {isEditing && (
          <button
            type="button"
            onClick={onAddInvestment}
            className={`inline-flex items-center px-2 py-1 text-sm font-medium text-${colours.indigo600} hover:text-${colours.indigo700} focus:outline-none`}
          >
            <FiPlus className="mr-1" />
            Add Investment
          </button>
        )}
      </div>

      {investments.length === 0 && !isEditing ? (
        <p className="text-gray-500 italic text-sm">No investment history provided</p>
      ) : (
        <div className="space-y-4">
          {investments.map((investment, index) => (
            <motion.div
              key={index}
              className={`border rounded-lg p-4 ${isEditing ? 'border-gray-300' : 'border-gray-200'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex-1 mr-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={investment.companyName}
                        onChange={(e) => onInvestmentChange(index, 'companyName', e.target.value)}
                        placeholder="Company Name"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveInvestment(index)}
                      className="text-red-500 hover:text-red-700 self-start mt-6"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Investment Amount (optional)
                      </label>
                      <input
                        type="text"
                        value={investment.amount || ''}
                        onChange={(e) => onInvestmentChange(index, 'amount', e.target.value)}
                        placeholder="e.g. $500K"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date (optional)
                      </label>
                      <input
                        type="text"
                        value={investment.date || ''}
                        onChange={(e) => onInvestmentChange(index, 'date', e.target.value)}
                        placeholder="e.g. Jan 2023"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stage (optional)
                      </label>
                      <select
                        value={investment.stage || ''}
                        onChange={(e) => onInvestmentChange(index, 'stage', e.target.value)}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                      >
                        <option value="">Select Stage</option>
                        {stageOptions.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Outcome (optional)
                      </label>
                      <input
                        type="text"
                        value={investment.outcome || ''}
                        onChange={(e) => onInvestmentChange(index, 'outcome', e.target.value)}
                        placeholder="e.g. Active, Exited"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiBriefcase className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{investment.companyName}</h4>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {investment.amount && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Amount:</span> {investment.amount}
                        </p>
                      )}
                      {investment.date && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Date:</span> {investment.date}
                        </p>
                      )}
                      {investment.stage && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Stage:</span> {investment.stage}
                        </p>
                      )}
                      {investment.outcome && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Outcome:</span> {investment.outcome}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentHistory;
