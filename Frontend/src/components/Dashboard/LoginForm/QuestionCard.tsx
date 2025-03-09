import React from 'react';
import { motion } from 'framer-motion';
import { Question, QuestionOption } from '../../../types/questionnaire.types';

interface QuestionCardProps {
    question: Question;
    value: string | number | string[] | null;
    onChange: (value: string | number | string[] | null) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, value, onChange }) => {
    // Render appropriate input based on question type
    const renderInput = () => {
        switch (question.type) {
            case 'radio':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {question.options?.map((option: QuestionOption) => (
                            <motion.div
                                key={option.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${value === option.value
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-300'}
                `}
                                onClick={() => onChange(option.value)}
                            >
                                <div className="flex items-center">
                                    <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center mr-3
                    ${value === option.value
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'}
                  `}>
                                        {value === option.value && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{option.label}</p>
                                        {option.description && (
                                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                );

            case 'slider':
                return (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            {question.options?.map((option: QuestionOption) => (
                                <span key={option.value}>{option.label}</span>
                            ))}
                        </div>
                        <input
                            type="range"
                            min="1"
                            max={question.options?.length || 5}
                            value={value || 3}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="mt-2 text-center font-medium">
                            {value && question.options?.[Number(value) - 1]?.label}
                        </div>
                    </div>
                );

            case 'select':
                return (
                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        <option value="" disabled>Select an option</option>
                        {question.options?.map((option: QuestionOption) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'multi-select':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                        {question.options?.map((option: QuestionOption) => {
                            const isSelected = Array.isArray(value) && value.includes(String(option.value));
                            return (
                                <motion.div
                                    key={option.value}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`
                    p-3 rounded-lg border cursor-pointer transition-all text-center
                    ${isSelected
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-blue-200'}
                  `}
                                    onClick={() => {
                                        const currentValues = Array.isArray(value) ? [...value] : [];
                                        if (isSelected) {
                                            onChange(currentValues.filter(v => v !== option.value));
                                        } else {
                                            onChange([...currentValues, String(option.value)]);
                                        }
                                    }}
                                >
                                    {option.label}
                                </motion.div>
                            );
                        })}
                    </div>
                );

            case 'text':
            default:
                return (
                    <motion.textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder || ''}
                        whileFocus={{ scale: 1.01 }}
                    />
                );
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start mb-3">
                <h3 className="text-lg font-medium text-gray-800 flex-1">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.helpText && (
                    <div className="group relative">
                        <button className="ml-2 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </button>
                        <div className="absolute right-0 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {question.helpText}
                        </div>
                    </div>
                )}
            </div>

            {question.description && (
                <p className="text-gray-500 text-sm mb-4">{question.description}</p>
            )}

            {renderInput()}
        </div>
    );
};

export default QuestionCard;