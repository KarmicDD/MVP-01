export interface QuestionOption {
    value: string | number;
    label: string;
    description?: string;
}

export interface Question {
    id: string;
    text: string;
    type: 'radio' | 'select' | 'multi-select' | 'slider' | 'text';
    category: string;
    required: boolean;
    options?: QuestionOption[];
    placeholder?: string;
    helpText?: string;
    description?: string;
}

export interface QuestionnaireSubmission {
    userId: string;
    userRole: 'startup' | 'investor';
    responses: Record<string, any>;
    status: 'draft' | 'submitted';
    createdAt: Date;
    updatedAt: Date;
}