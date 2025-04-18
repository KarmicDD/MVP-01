import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiGrid, FiLayers, FiUsers, FiMapPin, FiTarget } from 'react-icons/fi';
import { colours } from '../../utils/colours';
import { employeeOptions, fundingStages, industries } from '../../constants/questions';

interface ProfileFormProps {
  formData: any;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const StartupProfileForm: React.FC<ProfileFormProps> = ({ formData, isEditing, handleInputChange }) => {
  // Memoize form fields (static) to avoid re-creating array
  const formFields = useMemo(() => [
    {
      id: 'companyName',
      label: 'Company Name',
      type: 'text',
      icon: <FiBriefcase className={`text-${colours.indigo600}`} />,
      required: true,
      placeholder: 'Enter your company name',
      description: 'The official name of your startup'
    },
    {
      id: 'industry',
      label: 'Industry',
      type: 'select',
      icon: <FiGrid className={`text-${colours.indigo600}`} />,
      options: industries,
      required: true,
      placeholder: 'Select Industry',
      description: 'The primary industry your startup operates in'
    },
    {
      id: 'fundingStage',
      label: 'Current Funding Stage',
      type: 'select',
      icon: <FiLayers className={`text-${colours.indigo600}`} />,
      options: fundingStages,
      required: true,
      placeholder: 'Select Funding Stage',
      description: 'Your startup\'s current stage of funding'
    },
    {
      id: 'employeeCount',
      label: 'Team Size',
      type: 'select',
      icon: <FiUsers className={`text-${colours.indigo600}`} />,
      options: employeeOptions,
      required: false,
      placeholder: 'Select Team Size',
      description: 'Number of employees in your company'
    },
    {
      id: 'location',
      label: 'Headquarters Location',
      type: 'text',
      icon: <FiMapPin className={`text-${colours.indigo600}`} />,
      required: false,
      placeholder: 'City, Country',
      description: 'Primary location of your company'
    },
    {
      id: 'pitch',
      label: 'Elevator Pitch',
      type: 'textarea',
      icon: <FiTarget className={`text-${colours.indigo600}`} />,
      required: false,
      placeholder: 'Briefly describe your startup, product, and market opportunity...',
      description: 'A compelling summary of your startup (max 500 characters)',
      maxLength: 500,
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
                  maxLength={field.maxLength}
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

              {field.type === 'textarea' && (
                <textarea
                  id={field.id}
                  name={field.id}
                  rows={field.rows || 3}
                  value={formData[field.id] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.maxLength}
                  className={`mt-1 shadow-sm focus:ring-${colours.indigo600} focus:border-${colours.indigo600} block w-full sm:text-sm border border-gray-300 rounded-md`}
                />
              )}

              {field.description && (
                <p className="mt-1 text-xs text-gray-500">{field.description}</p>
              )}

              {field.maxLength && field.type === 'textarea' && (
                <div className="mt-1 text-xs text-right text-gray-500">
                  {formData[field.id]?.length || 0}/{field.maxLength} characters
                </div>
              )}
            </>
          ) : (
            <div className={`mt-1 text-sm ${formData[field.id] ? 'text-gray-900' : 'text-gray-400 italic'}`}>
              {formData[field.id] ? (
                field.type === 'textarea' ? (
                  <div className="whitespace-pre-wrap">{formData[field.id]}</div>
                ) : (
                  formData[field.id]
                )
              ) : (
                'Not provided'
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default React.memo(StartupProfileForm);
