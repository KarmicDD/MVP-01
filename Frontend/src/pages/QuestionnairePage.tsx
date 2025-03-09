import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import QuestionnaireForm from '../components/Dashboard/LoginForm/QuestionnaireForm';

const QuestionnairePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'startup' | 'investor' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user type info (updated to match API docs)
        const userResponse = await api.get('/profile/user-type', {
          withCredentials: true
        });

        if (userResponse.data && userResponse.data.userId && userResponse.data.role) {
          setUserRole(userResponse.data.role);
          setUserId(userResponse.data.userId);

          // Check if profile is complete
          const profileResponse = await api.get('/profile/check-profile', {
            withCredentials: true
          });

          setProfileComplete(profileResponse.data.profileComplete);

          // If profile isn't complete, redirect to form
          if (!profileResponse.data.profileComplete) {
            navigate('/form');
          }
        } else {
          // User needs to complete role selection
          navigate('/auth/select-role');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // Only show questionnaire if both user role exists and profile is complete
  return (
    <div className="min-h-screen bg-gray-50">
      {userRole && profileComplete && (
        <QuestionnaireForm userRole={userRole} userId={userId} />
      )}
    </div>
  );
};

export default QuestionnairePage;