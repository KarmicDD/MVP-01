import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Loader } from 'lucide-react';
import { fundingStages, industries, investmentCriteria, ticketSizes, employeeOptions } from '../../constants/questions';
import api, { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MultiSelectTile from './MultiSelectTile';
import SelectInput from './SelectInput';
import UserTypeSelection from '../Dashboard/MatchesPage/UserTypeSelection';
import AnimatingTransition from '../Dashboard/MatchesPage/AnimatingTransition';
import AppHeader from '../Dashboard/AppHeader ';
import FormProgress from '../Dashboard/MatchesPage/FormProgress';
import FormNavigationFooter from '../Dashboard/MatchesPage/FormNavigationFooter';
import { toast } from 'react-toastify';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// The main VentureMatch application component
const VentureMatch = () => {
  // Define interface for user data
  interface UserData {
    role?: string;
    // Add other potential properties used in the application
    [key: string]: unknown;
  }

  // Authentication and API state
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
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

        // Check if profile is complete
        try {
          const profileCheckResponse = await api.get(`${API_BASE_URL}/api/profile/check-profile`, {
            withCredentials: true
          });

          if (profileCheckResponse.data.profileComplete === true) {
            // Profile is complete, redirect to dashboard
            console.log("Profile is complete, redirecting to dashboard");

            // alert("Profile is complete, redirecting to dashboard");
            toast.success('Profile is complete, redirecting to dashboard');
            navigate('/dashboard');
            return; // Exit early to prevent further processing
          }
        } catch (profileCheckError) {
          console.error("Error checking profile completion:", profileCheckError);
          // Continue with form if profile check fails
        }

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
            const profileEndpoint = `/profile/${existingUserType}`;
            const profileData = await api.get(profileEndpoint, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (profileData.data) {
              setFormData(prev => ({
                ...prev,
                ...profileData.data
              }));
            }
          } catch (profileError) {
            console.log(`No existing ${existingUserType} profile found or error fetching, starting fresh.`, profileError);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setApiError('Failed to authenticate. Please log in again.');
        setIsAuthenticated(false);
        setTimeout(() => {
          authService.logout();
          navigate('/auth');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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


  // Helper function to check if we can proceed to next step
  const canProceedToNextStep = () => {
    if (currentStep === 1 && !userType) return false;

    if (userType === 'startup' && currentStep === 2) {
      return !!(formData.companyName && formData.industry && formData.fundingStage);
    }

    if (userType === 'investor' && currentStep === 3) {
      return formData.industriesOfInterest.length > 0 && formData.preferredStages.length > 0;
    }

    return true;
  };


  // Render user type selection step with improved animations
  const renderUserTypeSelection = () => (
    <UserTypeSelection
      userType={userType}
      animateSelection={animateSelection}
      isAuthenticated={isAuthenticated}
      userData={userData}
      API_BASE_URL={API_BASE_URL}
      setUserType={setUserType}
      setAnimateSelection={setAnimateSelection}
      navigateStep={navigateStep}
    />
  );
  // Add this inside the VentureMatch component, replacing the existing animating loading state
  const renderAnimatingTransition = () => (
    <AnimatingTransition userType={userType} />
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

        <SelectInput
          label="Industry"
          placeholder="Select industry"
          options={industries}
          value={formData.industry}
          onChange={(value) => handleChange('industry', value)}
          required={true}
        />

        <SelectInput
          label="Funding Stage"
          placeholder="Select funding stage"
          options={fundingStages}
          value={formData.fundingStage}
          onChange={(value) => handleChange('fundingStage', value)}
          required={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Number of Employees"
            placeholder="Select team size"
            options={employeeOptions}
            value={formData.employeeCount}
            onChange={(value) => handleChange('employeeCount', value)}
          />

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
          <MultiSelectTile
            label="Industries of Interest"
            description="Hold Ctrl/Cmd to select multiple industries"
            options={industries}
            selectedValues={formData.industriesOfInterest}
            onChange={(industry) => handleMultiSelectChange('industriesOfInterest', industry)}
          />
        </div>

        <MultiSelectTile
          label="Preferred Startup Stage"
          options={fundingStages.slice(0, 4)}
          selectedValues={formData.preferredStages}
          onChange={(stage) => handleMultiSelectChange('preferredStages', stage)}
        />

        <SelectInput
          label="Ticket Size Range"
          placeholder="Select ticket size"
          options={ticketSizes}
          value={formData.ticketSize}
          onChange={(value) => handleChange('ticketSize', value)}
        />

        <MultiSelectTile
          label="Key Investment Criteria"
          options={investmentCriteria}
          selectedValues={formData.investmentCriteria}
          onChange={(criterion) => handleMultiSelectChange('investmentCriteria', criterion)}
        />

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
    setIsSubmitting(true);
    try {
      // Only update role if not already set (avoid redundant API call)
      if (isAuthenticated && userData && !userData.role) {
        await api.post('/api/auth/update-role', {
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
        // Added companyName field for investor profile
        profileData = {
          companyName: formData.companyName,
          industriesOfInterest: formData.industriesOfInterest,
          preferredStages: formData.preferredStages,
          ticketSize: formData.ticketSize,
          investmentCriteria: formData.investmentCriteria,
          pastInvestments: formData.pastInvestments
        };
      }

      // Log for debugging
      console.log(`Submitting ${userType} profile:`, profileData);

      // Submit the profile data first
      const response = await api.post(endpoint, profileData);
      console.log('Profile submission response:', response.data);

      // Show success message
      setApiError(null);

      // Show toast and then navigate
      toast.success('Profile successfully created! Redirecting to dashboard...', {
        position: "top-right",
        autoClose: 2500, // Slightly shorter time
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        onClose: () => {
          // Navigate only after the toast is closed or its time expires
          window.location.href = '/dashboard';
        }
      });

      // Wait for toast and any background operations to complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

      // DO NOT return navigate() directly - that can cause issues
      return;

    } catch (error: unknown) {
      console.error('Error submitting profile:', error);

      // Improved error handling with type safety
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = (error as { response?: { data?: { message?: string } } }).response;
        console.error('Error details:', errorResponse?.data);
        setApiError(`Failed to save your profile: ${errorResponse?.data?.message || 'Unknown error'}`);
      } else {
        setApiError('Failed to save your profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleLogout = async () => {
    try {
      await api.get('/api/auth/logout', { withCredentials: true });
      navigate('/dashboard');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AppHeader onLogout={handleLogout} />

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
            {userType && currentStep > 1 && (
              <FormProgress
                currentStep={currentStep}
                totalSteps={4}
                userType={userType}
              />
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
        <FormNavigationFooter
          currentStep={currentStep}
          isLoading={isSubmitting} // Use this instead of isLoading for the submission state
          canProceed={canProceedToNextStep()}
          onBack={() => navigateStep(-1)}
          onNext={() => navigateStep(1)}
          onSubmit={handleSubmit}
          isLastStep={currentStep === 4}
        />
      )}
    </div>
  );
};

export default VentureMatch;