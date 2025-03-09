import React from 'react';
import { Question } from '../../../types/questionnaire.types';
import QuestionCard from './QuestionCard';

interface QuestionGroupProps {
    questions: Question[];
    responses: Record<string, string | number | string[] | null>;
    onChange: (questionId: string, value: string | number | string[] | null) => void;
}

const QuestionGroup: React.FC<QuestionGroupProps> = ({ questions, responses, onChange }) => {
    return (
        <div className="space-y-8">
            {questions.map(question => (
                <QuestionCard
                    key={question.id}
                    question={question}
                    value={responses[question.id]}
                    onChange={(value: string | number | string[] | null) => onChange(question.id, value)}
                />
            ))}
        </div>
    );
};

export default QuestionGroup;