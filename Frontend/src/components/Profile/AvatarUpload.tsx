import React, { useState, useRef } from 'react';
import { FiUpload, FiUser, FiX, FiCamera } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (file: File | null) => void;
  size?: 'sm' | 'md' | 'lg';
  userType?: 'startup' | 'investor' | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'md',
  userType = 'startup'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced size classes
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl'
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
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white flex items-center justify-center bg-gray-50 relative group shadow-xl`}
          whileHover={{ scale: 1.05, boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="avatar-image"
                className="w-full h-full relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  onClick={triggerFileInput}
                  whileHover={{ opacity: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiCamera className="text-white text-2xl" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="avatar-placeholder"
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                onClick={triggerFileInput}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ backgroundColor: '#f3f4f6' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <FiUser className={`text-gray-400 ${iconSizeClasses[size]}`} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {previewUrl && (
            <motion.button
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg z-10"
              onClick={handleRemoveAvatar}
              whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <FiX className="text-xs" />
            </motion.button>
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

      <motion.button
        type="button"
        onClick={triggerFileInput}
        className={`mt-4 text-sm font-medium flex items-center px-3 py-1.5 rounded-full ${userType === 'startup' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} transition-colors`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <FiUpload className="mr-1.5" />
        {previewUrl ? 'Change Photo' : 'Upload Photo'}
      </motion.button>
    </div>
  );
};

export default AvatarUpload;
