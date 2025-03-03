import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Rocket, TrendingUp, HelpCircle, LogOut, Loader } from 'lucide-react';
import { fundingStages, industries, investmentCriteria, ticketSizes, employeeOptions } from '../../libs/questions';
import api from '../../services/api';
import { Navigate, useNavigate } from 'react-router-dom';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// The main VentureMatch application component
const VentureMatch = () => {
  // Authentication and API state
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [animateSelection, setAnimateSelection] = useState(false);
  const navigate = useNavigate();

  // State to track current step, user type, and form data
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'startup' | 'investor' | null>(null);
  const [formData, setFormData] = useState<{
    companyName: string;
    industry: string;
    fundingStage: string;
    employeeCount: string;
    location: string;
    pitch: string;
    industriesOfInterest: string[];
    preferredStages: string[];
    ticketSize: string;
    investmentCriteria: string[];
    pastInvestments: string;
  }>({
    // Keep the rest of the initial state as it was
    companyName: '',
    industry: '',
    fundingStage: '',
    employeeCount: '',
    location: '',
    pitch: '',
    industriesOfInterest: [],
    preferredStages: [],
    ticketSize: '',
    investmentCriteria: [],
    pastInvestments: ''
  });

  // Update the useEffect for checking authentication
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Get user profile - single API call to fetch all needed data
        const profileResponse = await api.get(`${API_BASE_URL}/api/users/profile`, {
          withCredentials: true
        });

        const userData = profileResponse.data.user || profileResponse.data;
        setUserData(userData);
        setIsAuthenticated(true);

        // Check if user already has a role defined
        if (userData.role) {
          const existingUserType = userData.role === 'startup' ? 'startup' : 'investor';
          setUserType(existingUserType);

          // Trigger the animation for the appropriate tile
          setTimeout(() => {
            setAnimateSelection(true);
            setTimeout(() => {
              setAnimateSelection(false);
              setCurrentStep(2);
            }, 1000);
          }, 1500);

          // Fetch profile data in single call based on user type
          try {
            const profileEndpoint = `${API_BASE_URL}/api/profile/${existingUserType}`;
            const profileData = await api.get(profileEndpoint, {
              withCredentials: true
            });

            if (profileData.data) {
              setFormData(prev => ({
                ...prev,
                ...profileData.data
              }));
            }
          } catch (profileError) {
            console.log(`No existing ${existingUserType} profile found or error fetching, starting fresh.`);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setApiError('Failed to authenticate. Please log in again.');
        setIsAuthenticated(false);
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Transition animations
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  // Function to handle form data changes
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Function to handle multi-select changes
  const handleMultiSelectChange = (field: keyof typeof formData, value: string) => {
    if (formData[field].includes(value)) {
      setFormData({
        ...formData,
        [field]: (formData[field] as string[]).filter(item => item !== value)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...formData[field], value]
      });
    }
  };

  // Function to navigate between steps
  const navigateStep = (direction: number) => {
    setCurrentStep(prev => prev + direction);
  };

  // Progress calculation for progress bar
  const calculateProgress = () => {
    const totalSteps = 4;
    return (currentStep / totalSteps) * 100;
  };

  // Helper function to check if we can proceed to next step
  const canProceedToNextStep = () => {
    if (currentStep === 1 && !userType) return false;

    if (userType === 'startup' && currentStep === 2) {
      return formData.companyName && formData.industry && formData.fundingStage;
    }

    if (userType === 'investor' && currentStep === 3) {
      return formData.industriesOfInterest.length > 0 && formData.preferredStages.length > 0;
    }

    return true;
  };


  // Render user type selection step with improved animations
  const renderUserTypeSelection = () => (
    <motion.div
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
          initial={{ backgroundPosition: "0%" }}
          animate={{ backgroundPosition: "100%" }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          Welcome to VentureMatch
        </motion.h2>
        <motion.p
          className="text-gray-600 text-center max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Connect startups with the right investors and help great ideas find the capital they need to grow.
        </motion.p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Startup Tile */}
        <motion.div
          className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'startup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          onClick={() => {
            if (!animateSelection && !userType) {
              setUserType('startup');
              setAnimateSelection(true);

              // Only save user type to backend if authenticated and type not already set
              if (isAuthenticated && userData && !userData.role) {
                api.post(`${API_BASE_URL}/api/auth/update-role`, {
                  role: 'startup'
                }, { withCredentials: true }).catch(err => {
                  console.error("Failed to update role:", err);
                });
              }

              setTimeout(() => {
                setAnimateSelection(false);
                navigateStep(1);
              }, 900);
            }
          }}
          whileHover={{
            scale: !userType ? 1.03 : 1,
            boxShadow: !userType ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "none"
          }}
          whileTap={{ scale: !userType ? 0.98 : 1 }}
          animate={animateSelection && userType === 'startup' ? {
            scale: [1, 1.05, 1.1],
            y: [0, -10, -20],
            opacity: [1, 1, 0],
            boxShadow: [
              "0px 0px 0px rgba(59, 130, 246, 0)",
              "0px 10px 25px rgba(59, 130, 246, 0.2)",
              "0px 20px 35px rgba(59, 130, 246, 0.4)"
            ]
          } : {}}
          transition={animateSelection && userType === 'startup' ? {
            duration: 0.9,
            ease: "easeOut"
          } : {
            duration: 0.2
          }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 1 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
              whileHover={{
                backgroundColor: !userType ? "#bfdbfe" : "#dbeafe",
                scale: !userType ? 1.1 : 1
              }}
            >
              <motion.div
                whileHover={{ rotate: !userType ? 10 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Rocket size={28} className="text-blue-600" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">I'm a Startup</h3>
            <p className="text-gray-600 text-sm">Looking for investment and growth opportunities</p>
          </motion.div>
        </motion.div>

        {/* Investor Tile */}
        <motion.div
          className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'investor' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          onClick={() => {
            if (!animateSelection && !userType) {
              setUserType('investor');
              setAnimateSelection(true);

              // Save user type to backend if not already set
              if (isAuthenticated && userData && !userData.role) {
                api.post(`${API_BASE_URL}/api/auth/update-role`, {
                  role: 'investor'
                }, { withCredentials: true }).catch(err => {
                  console.error("Failed to update role:", err);
                });
              }

              setTimeout(() => {
                setAnimateSelection(false);
                navigateStep(1);
              }, 900);
            }
          }}
          whileHover={{
            scale: !userType ? 1.03 : 1,
            boxShadow: !userType ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "none"
          }}
          whileTap={{ scale: !userType ? 0.98 : 1 }}
          animate={animateSelection && userType === 'investor' ? {
            scale: [1, 1.05, 1.1],
            y: [0, -10, -20],
            opacity: [1, 1, 0],
            boxShadow: [
              "0px 0px 0px rgba(59, 130, 246, 0)",
              "0px 10px 25px rgba(59, 130, 246, 0.2)",
              "0px 20px 35px rgba(59, 130, 246, 0.4)"
            ]
          } : {}}
          transition={animateSelection && userType === 'investor' ? {
            duration: 0.9,
            ease: "easeOut"
          } : {
            duration: 0.2
          }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 1 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
              whileHover={{
                backgroundColor: !userType ? "#bfdbfe" : "#dbeafe",
                scale: !userType ? 1.1 : 1
              }}
            >
              <motion.div
                whileHover={{ rotate: !userType ? 10 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <TrendingUp size={28} className="text-blue-600" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">I'm an Investor</h3>
            <p className="text-gray-600 text-sm">Seeking promising startups to invest in</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Animation indicator message */}
      <AnimatePresence>
        {animateSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex items-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
              className="mr-2"
            >
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            </motion.div>
            <p className="text-blue-600 font-medium">
              Setting up your {userType} profile...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial choice prompt - appears only when no selection made */}
      <AnimatePresence>
        {!userType && !animateSelection && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-gray-500 text-sm"
          >
            Select the option that best describes you
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
  // Add this inside the VentureMatch component, replacing the existing animating loading state
  const renderAnimatingTransition = () => (
    <motion.div
      className="flex flex-col items-center justify-center p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute w-4 h-4 bg-blue-600 rounded-full"
          style={{ top: 0, left: '50%', marginLeft: '-8px' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-blue-500 rounded-full"
          style={{ top: '25%', right: 0, marginRight: '-8px' }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-blue-400 rounded-full"
          style={{ bottom: 0, left: '50%', marginLeft: '-8px' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-blue-300 rounded-full"
          style={{ top: '25%', left: 0, marginLeft: '-8px' }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {userType === 'startup' ? (
            <Rocket size={32} className="text-blue-600" />
          ) : (
            <TrendingUp size={32} className="text-blue-600" />
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.p className="text-xl font-medium text-blue-600 mb-2">
          Preparing your {userType} journey
        </motion.p>
        <motion.p className="text-gray-500">
          Setting up the perfect environment for your needs
        </motion.p>
      </motion.div>
    </motion.div>
  );

  // Render startup information step
  const renderStartupInformation = () => (
    <motion.div
      className="w-full max-w-3xl"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <h3 className="text-xl font-semibold mb-6">Basic Information</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <motion.input
            type="text"
            placeholder="Enter your company name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Funding Stage</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
              value={formData.fundingStage}
              onChange={(e) => handleChange('fundingStage', e.target.value)}
            >
              <option value="">Select funding stage</option>
              {fundingStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                value={formData.employeeCount}
                onChange={(e) => handleChange('employeeCount', e.target.value)}
              >
                <option value="">Select team size</option>
                {employeeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <motion.input
              type="text"
              placeholder="City, Country"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              whileFocus={{ scale: 1.01 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render startup pitch step
  const renderStartupPitch = () => (
    <motion.div
      className="w-full max-w-3xl"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <h3 className="text-xl font-semibold mb-6">Tell Investors About Your Startup</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elevator Pitch</label>
          <p className="text-sm text-gray-500 mb-2">Briefly describe what your company does, your target market, and your unique value proposition.</p>
          <motion.textarea
            placeholder="We are developing a revolutionary AI platform that helps small businesses automate customer service interactions, reducing costs by 40% while improving customer satisfaction scores..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-40"
            value={formData.pitch}
            onChange={(e) => handleChange('pitch', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-medium flex items-center text-blue-700 mb-2">
            <HelpCircle size={16} className="mr-2" />
            Pro Tip
          </h4>
          <p className="text-sm text-blue-700">
            A great elevator pitch clearly articulates the problem you're solving, how you solve it, and why your solution is better than alternatives. Be concise, specific, and avoid jargon.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Render investor preferences step
  const renderInvestorPreferences = () => (
    <motion.div
      className="w-full max-w-3xl"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <h3 className="text-xl font-semibold mb-6">Investment Preferences</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industries of Interest</label>
          <p className="text-sm text-gray-500 mb-2">Hold Ctrl/Cmd to select multiple industries</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {industries.map(industry => (
              <motion.div
                key={industry}
                className={`p-3 border rounded-lg cursor-pointer flex items-center ${formData.industriesOfInterest.includes(industry) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => handleMultiSelectChange('industriesOfInterest', industry)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${formData.industriesOfInterest.includes(industry) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                  {formData.industriesOfInterest.includes(industry) && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm">{industry}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Startup Stage</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fundingStages.slice(0, 4).map(stage => (
              <motion.div
                key={stage}
                className={`p-3 border rounded-lg cursor-pointer flex items-center ${formData.preferredStages.includes(stage) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => handleMultiSelectChange('preferredStages', stage)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${formData.preferredStages.includes(stage) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                  {formData.preferredStages.includes(stage) && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm">{stage}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Size Range</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
              value={formData.ticketSize}
              onChange={(e) => handleChange('ticketSize', e.target.value)}
            >
              <option value="">Select ticket size</option>
              {ticketSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Investment Criteria</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {investmentCriteria.map(criterion => (
              <motion.div
                key={criterion}
                className={`p-3 border rounded-lg cursor-pointer flex items-center ${formData.investmentCriteria.includes(criterion) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => handleMultiSelectChange('investmentCriteria', criterion)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${formData.investmentCriteria.includes(criterion) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                  {formData.investmentCriteria.includes(criterion) && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm">{criterion}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Past Successful Investments</label>
          <motion.textarea
            placeholder="List your notable investments and exits"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24"
            value={formData.pastInvestments}
            onChange={(e) => handleChange('pastInvestments', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </div>
      </div>
    </motion.div>
  );

  // Render review step
  const renderReview = () => (
    <motion.div
      className="w-full max-w-3xl"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <h3 className="text-xl font-semibold mb-6">Review Your Information</h3>

      {userType === 'startup' ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-4">Company Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{formData.companyName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{formData.industry || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Funding Stage</p>
                <p className="font-medium">{formData.fundingStage || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="font-medium">{formData.employeeCount || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{formData.location || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-4">Elevator Pitch</h4>
            <p>{formData.pitch || "No pitch provided"}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-4">Investment Preferences</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Industries of Interest</p>
                {formData.industriesOfInterest.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.industriesOfInterest.map(industry => (
                      <span key={industry} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {industry}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-gray-700">None selected</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Preferred Startup Stages</p>
                {formData.preferredStages.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.preferredStages.map(stage => (
                      <span key={stage} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {stage}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-gray-700">None selected</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Ticket Size Range</p>
                <p className="font-medium">{formData.ticketSize || "Not provided"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Key Investment Criteria</p>
                {formData.investmentCriteria.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.investmentCriteria.map(criterion => (
                      <span key={criterion} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {criterion}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-gray-700">None selected</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-lg mb-4">Past Investments</h4>
            <p>{formData.pastInvestments || "No past investments provided"}</p>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>What happens next?</strong> After submitting your profile, our algorithm will analyze your information and match you with {userType === 'startup' ? 'potential investors' : 'promising startups'} based on compatibility. You'll receive notifications when there's a match.
        </p>
      </div>
    </motion.div>
  );

  // Determine which step content to render
  const renderStepContent = () => {
    if (animateSelection) {
      return renderAnimatingTransition();
    }

    // Regular step rendering
    if (currentStep === 1) {
      return renderUserTypeSelection();
    }

    // Rest of the step rendering logic remains the same
    if (userType === 'startup') {
      if (currentStep === 2) return renderStartupInformation();
      if (currentStep === 3) return renderStartupPitch();
      if (currentStep === 4) return renderReview();
    } else {
      if (currentStep === 2) return renderStartupInformation(); // This could be investor basic info
      if (currentStep === 3) return renderInvestorPreferences();
      if (currentStep === 4) return renderReview();
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Only update role if not already set (avoid redundant API call)
      if (isAuthenticated && userData && !userData.role) {
        await api.post('/auth/update-role', {
          role: userType
        });
      }

      // Submit profile data based on user type - single API call with all data
      const endpoint = userType === 'startup' ? '/profile/startup' : '/profile/investor';
      let profileData;

      if (userType === 'startup') {
        profileData = {
          companyName: formData.companyName,
          industry: formData.industry,
          fundingStage: formData.fundingStage,
          employeeCount: formData.employeeCount,
          location: formData.location,
          pitch: formData.pitch
        };
      } else {
        profileData = {
          industriesOfInterest: formData.industriesOfInterest,
          preferredStages: formData.preferredStages,
          ticketSize: formData.ticketSize,
          investmentCriteria: formData.investmentCriteria,
          pastInvestments: formData.pastInvestments
        };
      }

      await api.post(endpoint, profileData);

      // Show success message
      setApiError(null);

      // Success notification
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-lg rounded z-50" role="alert">
          <p class="font-bold">Success!</p>
          <p>Profile successfully created! Redirecting to dashboard...</p>
        </div>
      `;
      document.body.appendChild(successMessage);

      // Remove after 3 seconds
      setTimeout(() => {
        successMessage.remove();
        // Redirect to dashboard correctly based on user type
        navigate(userType === 'startup' ? '/startup/dashboard' : '/investor/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting profile:', error);
      setApiError('Failed to save your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await api.get('/api/auth/logout', { withCredentials: true });
      navigate('/auth');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center text-blue-600 font-bold text-xl">
              <Rocket size={20} className="mr-2" />
              VentureMatch
            </div>
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
            <HelpCircle size={16} className="mr-1" />
            Help
          </button>
          <button
            className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-1" />
            Exit
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
        {/* Loading state */}
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-white/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center">
              <Loader size={32} className="text-blue-600 animate-spin mb-4" />
              <p className="text-gray-700">Loading your profile...</p>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {apiError && (
          <motion.div
            className="w-full max-w-3xl mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{apiError}</p>
          </motion.div>
        )}

        {/* Authentication check */}
        {!isAuthenticated && !isLoading ? (
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-6">Please log in to continue with your profile setup.</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            {userType && (
              <motion.div
                className="w-full max-w-3xl mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Step {currentStep} of 4
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {currentStep === 2 ? 'Basic Information' :
                      currentStep === 3 ? (userType === 'startup' ? 'Company Pitch' : 'Investment Preferences') :
                        currentStep === 4 ? 'Review' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Form content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="w-full flex justify-center"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Footer with navigation buttons */}
      {!isLoading && isAuthenticated && (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="max-w-3xl mx-auto flex justify-between">
            {currentStep > 1 && (
              <motion.button
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50"
                onClick={() => navigateStep(-1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                <ChevronLeft size={18} className="mr-1" />
                Back
              </motion.button>
            )}
            {currentStep === 1 && (
              <div /> // Empty div to maintain layout when back button is hidden
            )}

            {/* Footer component for navigation */}
            {currentStep < 4 ? (
              <motion.button
                className={`px-6 py-2 rounded-lg flex items-center text-white ${canProceedToNextStep() && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                onClick={() => canProceedToNextStep() && !isLoading && navigateStep(1)}
                whileHover={canProceedToNextStep() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={canProceedToNextStep() && !isLoading ? { scale: 0.95 } : {}}
                disabled={!canProceedToNextStep() || isLoading}
              >
                Continue
                <ChevronRight size={18} className="ml-1" />
              </motion.button>
            ) : (
              <motion.button
                className={`px-6 py-2 rounded-lg flex items-center text-white ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={handleSubmit}
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                disabled={isLoading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Submit Profile
                  </>
                )}
              </motion.button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default VentureMatch;