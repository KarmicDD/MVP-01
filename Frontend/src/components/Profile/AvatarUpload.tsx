import React, { useState, useRef } from 'react';
import { FiUpload, FiUser, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { colours } from '../../utils/colours';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onAvatarChange, 
  size = 'md' 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size classes
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onAvatarChange(file);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50 relative group`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
              <div 
                className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={triggerFileInput}
              >
                <FiUpload className="text-white text-xl" />
              </div>
            </>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
              onClick={triggerFileInput}
            >
              <FiUser className={`text-gray-400 ${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-5xl'}`} />
            </div>
          )}
          
          {previewUrl && (
            <button 
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
              onClick={handleRemoveAvatar}
            >
              <FiX className="text-xs" />
            </button>
          )}
        </motion.div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        className={`mt-3 text-sm text-${colours.indigo600} hover:text-${colours.indigo700} font-medium flex items-center`}
      >
        <FiUpload className="mr-1" />
        {previewUrl ? 'Change Photo' : 'Upload Photo'}
      </button>
    </div>
  );
};

export default AvatarUpload;
