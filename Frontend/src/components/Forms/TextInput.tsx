import React from 'react';
import { motion } from 'framer-motion';

interface TextInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea';
    required?: boolean;
    className?: string;
    description?: string;
    rows?: number;
}

const TextInput: React.FC<TextInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    required = false,
    className = '',
    description,
    rows = 4
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
                <p className="text-sm text-gray-500 mb-2">{description}</p>
            )}

            {type === 'text' ? (
                <motion.input
                    type="text"
                    placeholder={placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    required={required}
                />
            ) : (
                <motion.textarea
                    placeholder={placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    rows={rows}
                    required={required}
                />
            )}
        </div>
    );
};

export default TextInput;