import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiGrid, FiLayers, FiDollarSign, FiTarget } from 'react-icons/fi';
import { colours } from '../../utils/colours';
import { fundingStages, industries, investmentCriteria, ticketSizes } from '../../constants/questions';

interface InvestorProfileFormProps {
  formData: any;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelect: (e: React.ChangeEvent<HTMLSelectElement>, fieldName: string) => void;
}

const InvestorProfileForm: React.FC<InvestorProfileFormProps> = ({
  formData,
  isEditing,
  handleInputChange,
  handleMultiSelect
}) => {
  // Memoize form fields (static) to avoid re-creation each render
  const formFields = useMemo(() => [
    {
      id: 'companyName',
      label: 'Firm Name',
      type: 'text',
      icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
      required: true,
      placeholder: 'Enter your investment firm name',
      description: 'The name of your investment firm or fund'
    },
    {
      id: 'industriesOfInterest',
      label: 'Industries of Interest',
      type: 'multiselect',
      icon: <FiGrid className={`text-${colours.indigo600}`} />,
      options: industries,
      required: true,
      placeholder: 'Select Industries',
      description: 'Industries you are interested in investing in',
      multiSelectFieldName: 'industriesOfInterest'
    },
    {
      id: 'preferredStages',
      label: 'Preferred Funding Stages',
      type: 'multiselect',
      icon: <FiLayers className={`text-${colours.indigo600}`} />,
      options: fundingStages,
      required: true,
      placeholder: 'Select Funding Stages',
      description: 'Funding stages you typically invest in',
      multiSelectFieldName: 'preferredStages'
    },
    {
      id: 'ticketSize',
      label: 'Typical Ticket Size',
      type: 'select',
      icon: <FiDollarSign className={`text-${colours.indigo600}`} />,
      options: ticketSizes,
      required: false,
      placeholder: 'Select Ticket Size',
      description: 'Your typical investment amount'
    },
    {
      id: 'investmentCriteria',
      label: 'Investment Criteria',
      type: 'multiselect',
      icon: <FiTarget className={`text-${colours.indigo600}`} />,
      options: investmentCriteria,
      required: false,
      placeholder: 'Select Investment Criteria',
      description: 'Key factors you consider when investing',
      multiSelectFieldName: 'investmentCriteria'
    },
    {
      id: 'pastInvestments',
      label: 'Notable Investments',
      type: 'textarea',
      icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
      required: false,
      placeholder: 'List some of your past investments or portfolio companies...',
      description: 'Highlight some of your key investments',
      rows: 4
    }
  ], []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {formFields.map((field) => (
        <motion.div
          key={field.id}
          className={field.type === 'textarea' ? "sm:col-span-6" : "sm:col-span-3"}
          variants={itemVariants}
        >
          <div className="flex items-center mb-2">
            <span className="mr-2">{field.icon}</span>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>

          {isEditing ? (
            <>
              {field.type === 'text' && (
                <input
                  type="text"
                  name={field.id}
                  id={field.id}
                  value={formData[field.id] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`mt-1 focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full shadow-sm sm:text-sm border-gray-300 rounded-md`}
                />
              )}

              {field.type === 'select' && (
                <select
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${colours.indigo600} focus:border-${colours.indigo600} sm:text-sm rounded-md`}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'multiselect' && (
                <>
                  <select
                    multiple
                    id={field.id}
                    name={field.id}
                    value={formData[field.id] || []}
                    onChange={(e) => handleMultiSelect(e, field.multiSelectFieldName || field.id)}
                    required={field.required}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${colours.indigo600} focus:border-${colours.indigo600} sm:text-sm rounded-md`}
                    size={Math.min(5, field.options?.length || 5)}
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple options</p>
                </>
              )}

              {field.type === 'textarea' && (
                <textarea
                  id={field.id}
                  name={field.id}
                  rows={field.rows || 3}
                  value={formData[field.id] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`mt-1 shadow-sm focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full sm:text-sm border border-gray-300 rounded-md`}
                />
              )}

              {field.description && (
                <p className="mt-1 text-xs text-gray-500">{field.description}</p>
              )}
            </>
          ) : (
            <div className={`mt-1 text-sm ${field.type === 'multiselect'
              ? (formData[field.id]?.length ? 'text-gray-900' : 'text-gray-400 italic')
              : (formData[field.id] ? 'text-gray-900' : 'text-gray-400 italic')
              }`}>
              {field.type === 'multiselect' ? (
                formData[field.id]?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {formData[field.id].map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  'Not provided'
                )
              ) : field.type === 'textarea' ? (
                formData[field.id] ? (
                  <div className="whitespace-pre-wrap">{formData[field.id]}</div>
                ) : (
                  'Not provided'
                )
              ) : (
                formData[field.id] || 'Not provided'
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default React.memo(InvestorProfileForm);
