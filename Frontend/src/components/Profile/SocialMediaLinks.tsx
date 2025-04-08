import React from 'react';
import { FiGlobe, FiLinkedin, FiTwitter, FiInstagram, FiFacebook, FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialMediaLinksProps {
  links: SocialLink[];
  isEditing: boolean;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onLinkChange: (index: number, field: 'platform' | 'url', value: string) => void;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  links,
  isEditing,
  onAddLink,
  onRemoveLink,
  onLinkChange
}) => {
  // Get icon based on platform
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FiLinkedin />;
      case 'twitter':
        return <FiTwitter />;
      case 'instagram':
        return <FiInstagram />;
      case 'facebook':
        return <FiFacebook />;
      default:
        return <FiGlobe />;
    }
  };

  // Platform options
  const platformOptions = [
    'Website',
    'LinkedIn',
    'Twitter',
    'Instagram',
    'Facebook',
    'Other'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">Social Media & Links</h3>
        {isEditing && (
          <button
            type="button"
            onClick={onAddLink}
            className={`inline-flex items-center px-2 py-1 text-sm font-medium text-${colours.indigo600} hover:text-${colours.indigo700} focus:outline-none`}
          >
            <FiPlus className="mr-1" />
            Add Link
          </button>
        )}
      </div>

      {links.length === 0 && !isEditing ? (
        <p className="text-gray-500 italic text-sm">No social media links provided</p>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <motion.div
              key={index}
              className={`flex items-center ${isEditing ? 'space-x-3' : 'space-x-2'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isEditing ? (
                <>
                  <div className="w-1/3">
                    <select
                      value={link.platform}
                      onChange={(e) => onLinkChange(index, 'platform', e.target.value)}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                    >
                      <option value="">Select Platform</option>
                      {platformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => onLinkChange(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </>
              ) : (
                link.url && (
                  <a
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-${colours.indigo600} hover:text-${colours.indigo700} hover:underline`}
                  >
                    <span className="mr-2">{getPlatformIcon(link.platform)}</span>
                    {link.platform || 'Website'}
                  </a>
                )
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaLinks;
