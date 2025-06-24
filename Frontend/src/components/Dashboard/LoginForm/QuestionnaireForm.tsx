/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { investorQuestions, startupQuestions } from '../../../constants/questionsData';
import SummaryReview from './SummaryReview';
import QuestionGroup from './QuestionGroup';
import AppHeader from '../AppHeader ';
import FormProgress from '../MatchesPage/FormProgress';
import FormNavigationFooter from '../MatchesPage/FormNavigationFooter';
import { sanitizeFormData } from '../../../utils/security';
import { hasSuspiciousContent } from '../../../utils/validation';

// Number of questions to show per page
const QUESTIONS_PER_PAGE = 5;

interface QuestionnaireFormProps {
  userRole: 'startup' | 'investor';
  userId: string | null;
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ userRole, userId }) => {
  const navigate = useNavigate();
  const questions = userRole === 'startup' ? startupQuestions : investorQuestions;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE) + 1; // +1 for summary page

  const [currentPage, setCurrentPage] = useState(1);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResponses, setSavedResponses] = useState<Record<string, any>>({});
  const [_, setQuestionnaireStatus] = useState<string>('draft');
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Fetch existing responses if any
  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      try {
        // First check questionnaire status
        const statusResponse = await api.get('/questionnaire/status', {
          withCredentials: true
        });

        if (statusResponse.data.isComplete) {
          setQuestionnaireStatus(statusResponse.data.status);
        }

        // Then fetch responses if available
        const response = await api.get(`/questionnaire/${userRole}`, {
          withCredentials: true
        });

        if (response.data) {
          if (response.data.responses) {
            setResponses(response.data.responses);
            setSavedResponses(response.data.responses);
          }

          if (response.data.analysisResults) {
            setAnalysisResults(response.data.analysisResults);
          }

          if (response.data.status) {
            setQuestionnaireStatus(response.data.status);
          }
        }
      } catch (error) {
        console.log('No existing responses or error fetching:', error);
      }
    };

    if (userId) {
      fetchQuestionnaireData();
    }
  }, [userId, userRole]);

  // Calculate if current page is valid
  const canProceedToNextPage = useCallback(() => {
    if (currentPage === totalPages) return true; // Summary page

    const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, questions.length);
    const currentQuestions = questions.slice(startIdx, endIdx);

    // Check if all required questions on current page have responses
    return currentQuestions.every(q => !q.required || responses[q.id] !== undefined);
  }, [currentPage, questions, responses, totalPages]);
  // Handle response changes with validation and sanitization
  const handleResponseChange = (questionId: string, value: any) => {
    // Validate and sanitize the response
    let sanitizedValue = value;

    if (typeof value === 'string') {
      // Check for suspicious content
      if (hasSuspiciousContent(value)) {
        console.warn('Suspicious content detected in response');
        return; // Don't update if suspicious
      }

      // Check length limits
      if (value.length > 2000) {
        console.warn('Response too long, truncating');
        sanitizedValue = value.substring(0, 2000);
      } else {
        sanitizedValue = value.trim();
      }
    }

    setResponses(prev => ({
      ...prev,
      [questionId]: sanitizedValue
    }));
  };

  // Save responses function with sanitization
  const saveResponses = async () => {
    if (Object.keys(responses).length > 0 &&
      JSON.stringify(responses) !== JSON.stringify(savedResponses)) {
      try {
        // Sanitize responses before sending
        const sanitizedResponses = sanitizeFormData(responses);

        const saveResponse = await api.post(`/questionnaire/${userRole}/save`, {
          responses: sanitizedResponses
        }, {
          withCredentials: true
        });

        setSavedResponses({ ...responses });

        // Update status if returned
        if (saveResponse.data && saveResponse.data.status) {
          setQuestionnaireStatus(saveResponse.data.status);
        }
      } catch (error) {
        console.error('Error saving responses:', error);
      }
    }
  };

  // Navigate between pages
  const navigatePage = async (direction: number) => {
    // Save responses before changing page
    await saveResponses();

    // Update page
    setCurrentPage(prev => prev + direction);
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPage]);

  // Handle final submission with comprehensive validation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Sanitize responses before submission
      const sanitizedResponses = sanitizeFormData(responses);

      // Save one last time before submitting
      await saveResponses();

      const submitResponse = await api.post(`/questionnaire/${userRole}/submit`, {
        responses: sanitizedResponses
      }, {
        withCredentials: true
      });

      // Update status and analysis results
      if (submitResponse.data) {
        if (submitResponse.data.status) {
          setQuestionnaireStatus(submitResponse.data.status);
        }

        if (submitResponse.data.analysisResults) {
          setAnalysisResults(submitResponse.data.analysisResults);
        }
      }      // Show success message safely
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-lg rounded z-50';
      successMessage.setAttribute('role', 'alert');

      const titleElement = document.createElement('p');
      titleElement.className = 'font-bold';
      titleElement.textContent = 'Success!';

      const messageElement = document.createElement('p');
      messageElement.textContent = 'Your questionnaire has been submitted and analyzed!';

      successMessage.appendChild(titleElement);
      successMessage.appendChild(messageElement);
      document.body.appendChild(successMessage);

      // Navigate to the summary page instead of redirecting
      setCurrentPage(totalPages);

      // Remove notification after a delay
      setTimeout(() => {
        successMessage.remove();
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError('Failed to submit questionnaire. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Render current page content
  const renderPageContent = () => {
    // Final page is summary
    if (currentPage === totalPages) {
      return (
        <SummaryReview
          responses={responses}
          questions={questions}
          userRole={userRole}
          analysisResults={analysisResults}
        />
      );
    }

    // Calculate questions for this page
    const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, questions.length);
    const currentQuestions = questions.slice(startIdx, endIdx);

    return (
      <QuestionGroup
        questions={currentQuestions}
        responses={responses}
        onChange={handleResponseChange}
      />
    );
  };

  const handleDashboardRedirect = () => {
    navigate('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AppHeader onLogout={handleDashboardRedirect} />

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          {/* Page title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {userRole === 'startup' ? 'Startup Questionnaire' : 'Investor Questionnaire'}
          </h1>

          {/* Description */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <p className="text-blue-800">
              This questionnaire will help us understand your preferences and match you with
              {userRole === 'startup' ? ' investors' : ' startups'} that align with your goals and values.
              Please answer all questions as honestly as possible.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-red-700 mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Progress indicator */}
          <FormProgress
            currentStep={currentPage}
            totalSteps={totalPages}
            userType={userRole}
          />

          {/* Questions display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation footer */}
      <FormNavigationFooter
        currentStep={currentPage}
        isLoading={isSubmitting}
        canProceed={canProceedToNextPage()}
        onBack={() => navigatePage(-1)}
        onNext={() => navigatePage(1)}
        onSubmit={handleSubmit}
        isLastStep={currentPage === totalPages}
      />
    </div>
  );
};

export default QuestionnaireForm;