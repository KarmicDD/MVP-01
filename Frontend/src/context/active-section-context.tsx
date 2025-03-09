// src/context/active-section-context.tsx
import React, { useState } from 'react';
import { ActiveSectionContext, SectionName, } from './active-section-context-types';

type SectionContextProviderProps = {
    children: React.ReactNode;
};

// Only export the component
export default function ActiveSectionContextProvider({ children }: SectionContextProviderProps) {
    const [activeSection, setActiveSection] = useState<SectionName>('Home');
    const [timeOfLastClick, setTimeOfLastClick] = useState(0);

    return (
        <ActiveSectionContext.Provider value={{
            activeSection,
            setActiveSection,
            timeOfLastClick,
            setTimeOfLastClick
        }}>
            {children}
        </ActiveSectionContext.Provider>
    );
}