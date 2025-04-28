import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLink, FiMail, FiCopy, FiCheck, FiShare2 } from 'react-icons/fi';
import {
  LinkedinShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
  EmailShareButton,
  LinkedinIcon,
  WhatsappIcon,
  TwitterIcon,
  FacebookIcon,
  EmailIcon
} from 'react-share';
import SimpleSpinner from '../SimpleSpinner';
import { toast } from 'react-hot-toast';
import { colours } from '../../utils/colours';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  title: string;
  description: string;
  onEmailShare: (emails: string[], shareMethod?: string) => Promise<void>;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  profileUrl,
  title,
  description,
  onEmailShare
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [isSharingViaEmail, setIsSharingViaEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'social' | 'email'>('social');

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Profile link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Share profile via email
  const handleShareViaEmail = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    try {
      setIsSharingViaEmail(true);
      const emails = emailInput.split(',').map(email => email.trim());
      await onEmailShare(emails, 'email-form');
      toast.success(`Profile shared with ${emails.length} recipient(s)`);
      setEmailInput('');
      onClose();
    } catch (error) {
      toast.error('Failed to share profile via email');
      console.error('Error sharing via email:', error);
    } finally {
      setIsSharingViaEmail(false);
    }
  };

  // Track social media shares
  const trackSocialShare = (platform: string) => {
    // We'll just track this client-side for now
    // In a real app, you might want to send this to the server
    console.log(`Profile shared via ${platform}`);
    toast.success(`Profile shared via ${platform}`);

    // Close the modal after a short delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                  <FiShare2 className="mr-1.5 sm:mr-2 text-indigo-600" />
                  Share Your Profile
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'social'
                    ? `text-${colours.indigo600} border-b-2 border-${colours.indigo600}`
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('social')}
                >
                  Social Media
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'email'
                    ? `text-${colours.indigo600} border-b-2 border-${colours.indigo600}`
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('email')}
                >
                  Email
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {activeTab === 'social' ? (
                  <>
                    {/* Social Share Section */}
                    <div className="space-y-4">
                      {/* Direct Profile Link Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                          <FiLink className="mr-1.5 sm:mr-2 text-indigo-500" />
                          Profile Link
                        </h4>

                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={profileUrl}
                            readOnly
                            className="flex-1 p-1.5 sm:p-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50"
                          />
                          <motion.button
                            onClick={handleCopyLink}
                            className={`p-1.5 sm:p-2 rounded-lg ${copied ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'} hover:bg-opacity-80`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {copied ? <FiCheck className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiCopy className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </motion.button>
                        </div>
                      </div>

                      {/* Social Media Sharing Buttons */}
                      <div className="space-y-3">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700">
                          Share via Social Media
                        </h4>
                        <div className="flex flex-wrap justify-center gap-3">
                          <WhatsappShareButton
                            url={profileUrl}
                            title={title}
                            onClick={() => trackSocialShare('whatsapp')}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-full overflow-hidden shadow-md"
                            >
                              <WhatsappIcon size={40} round />
                            </motion.div>
                          </WhatsappShareButton>

                          <LinkedinShareButton
                            url={profileUrl}
                            title={title}
                            summary={description}
                            onClick={() => trackSocialShare('linkedin')}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-full overflow-hidden shadow-md"
                            >
                              <LinkedinIcon size={40} round />
                            </motion.div>
                          </LinkedinShareButton>

                          <TwitterShareButton
                            url={profileUrl}
                            title={title}
                            onClick={() => trackSocialShare('twitter')}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-full overflow-hidden shadow-md"
                            >
                              <TwitterIcon size={40} round />
                            </motion.div>
                          </TwitterShareButton>

                          <FacebookShareButton
                            url={profileUrl}
                            quote={title}
                            onClick={() => trackSocialShare('facebook')}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-full overflow-hidden shadow-md"
                            >
                              <FacebookIcon size={40} round />
                            </motion.div>
                          </FacebookShareButton>

                          <EmailShareButton
                            url={profileUrl}
                            subject={title}
                            body={description}
                            onClick={() => trackSocialShare('email-direct')}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-full overflow-hidden shadow-md"
                            >
                              <EmailIcon size={40} round />
                            </motion.div>
                          </EmailShareButton>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-3">
                          Click on an icon to share your profile on that platform
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Share via Email Section */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                        <FiMail className="mr-1.5 sm:mr-2 text-indigo-500" />
                        Share via Email
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <textarea
                          placeholder="Enter email addresses separated by commas"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                        />
                        <motion.button
                          onClick={handleShareViaEmail}
                          className="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2 text-xs sm:text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSharingViaEmail || !emailInput.trim()}
                        >
                          {isSharingViaEmail ? (
                            <>
                              <SimpleSpinner size="sm" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <FiMail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>Share</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialShareModal;
