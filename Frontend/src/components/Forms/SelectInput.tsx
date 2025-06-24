import React from 'react';
import { ChevronRight } from 'lucide-react';
import { sanitizeUserInput } from '../../utils/security';

interface SelectInputProps {
    label: string;
    placeholder: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    required?: boolean;
    description?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    placeholder,
    options,
    value,
    onChange,
    className = '',
    required = false,
    description
}) => {
    // Handle select changes with validation
    const handleSelectChange = (selectedValue: string) => {
        // Validate that the selected value is in the allowed options
        if (selectedValue === '' || options.includes(selectedValue)) {
            const sanitizedValue = sanitizeUserInput(selectedValue);
            onChange(sanitizedValue);
        }
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
                <p className="text-sm text-gray-500 mb-2">{description}</p>
            )}
            <div className="relative">
                <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                    value={value}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    required={required}
                >
                    <option value="">{placeholder}</option>
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronRight size={16} className="text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default SelectInput;