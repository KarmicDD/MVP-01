import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface MultiSelectTileProps {
    label: string;
    description?: string;
    options: string[];
    selectedValues: string[];
    onChange: (value: string) => void;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
}

const MultiSelectTile: React.FC<MultiSelectTileProps> = ({
    label,
    description,
    options,
    selectedValues,
    onChange,
    className = '',
    columns = 2
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            {description && (
                <p className="text-sm text-gray-500 mb-2">{description}</p>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-2`}>
                {options.map(option => (
                    <motion.div
                        key={option}
                        className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedValues.includes(option)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                        onClick={() => onChange(option)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${selectedValues.includes(option)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                            {selectedValues.includes(option) && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm">{option}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MultiSelectTile;