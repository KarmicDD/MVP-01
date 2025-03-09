// src/hooks/useQuestionnaireCheck.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function useQuestionnaireCheck() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkQuestionnaire = async () => {
            try {
                const response = await api.get('/api/questionnaire/check-status');

                if (!response.data.isCompleted) {
                    navigate('/question', { replace: true });
                }
            } catch (error) {
                console.error('Failed to check questionnaire status', error);
                // On error, redirect to questionnaire to be safe
                navigate('/question', { replace: true });
            }
        };

        checkQuestionnaire();
    }, [navigate]);
}