import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Rocket, TrendingUp, HelpCircle, LogOut } from 'lucide-react';
import { fundingStages, industries, investmentCriteria, ticketSizes, employeeOptions } from '../../libs/questions';

// The main VentureMatch application component
const VentureMatch = () => {
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
    // Startup data
    companyName: '',
    industry: '',
    fundingStage: '',
    employeeCount: '',
    location: '',
    pitch: '',

    // Investor data
    industriesOfInterest: [],
    preferredStages: [],
    ticketSize: '',
    investmentCriteria: [],
    pastInvestments: ''
  });

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


  // Render user type selection step
  const renderUserTypeSelection = () => (
    <motion.div
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-8 text-center">Welcome to VentureMatch</h2>
      <p className="text-gray-600 mb-10 text-center max-w-lg">
        Connect startups with the right investors and help great ideas find the capital they need to grow.
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        <motion.div
          className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'startup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          onClick={() => setUserType('startup')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Rocket size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Startup</h3>
            <p className="text-gray-600 text-sm">Looking for investment and growth opportunities</p>
          </div>
        </motion.div>

        <motion.div
          className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'investor' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
          onClick={() => setUserType('investor')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm an Investor</h3>
            <p className="text-gray-600 text-sm">Seeking promising startups to invest in</p>
          </div>
        </motion.div>
      </div>
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
    if (currentStep === 1) {
      return renderUserTypeSelection();
    }

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

  // Submit the form
  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Form data submitted:', formData);

    // Show success message
    alert('Profile successfully created! You will be notified of potential matches soon.');
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
          <button className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
            <LogOut size={16} className="mr-1" />
            Exit
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
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
      </main>

      {/* Footer with navigation buttons */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex justify-between">
          {currentStep > 1 && (
            <motion.button
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50"
              onClick={() => navigateStep(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={18} className="mr-1" />
              Back
            </motion.button>
          )}
          {currentStep === 1 && (
            <div /> // Empty div to maintain layout when back button is hidden
          )}

          {/* Footer component for the final step */}
          {currentStep < 4 ? (
            <motion.button
              className={`px-6 py-2 rounded-lg flex items-center text-white ${canProceedToNextStep() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              onClick={() => canProceedToNextStep() && navigateStep(1)}
              whileHover={canProceedToNextStep() ? { scale: 1.05 } : {}}
              whileTap={canProceedToNextStep() ? { scale: 0.95 } : {}}
              disabled={!canProceedToNextStep()}
            >
              Continue
              <ChevronRight size={18} className="ml-1" />
            </motion.button>
          ) : (
            <motion.button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center text-white"
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Check size={18} className="mr-2" />
              Submit Profile
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default VentureMatch;