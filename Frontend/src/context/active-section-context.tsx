// src/context/active-section-context.tsx
import React, { createContext, useContext, useState } from 'react'
import { links } from '../libs/data';

export type SectionName = typeof links[number]['name'];

type ActiveSectionContextType = {
    activeSection: SectionName;
    setActiveSection: React.Dispatch<React.SetStateAction<SectionName>>;
    timeOfLastClick: number;
    setTimeOfLastClick: React.Dispatch<React.SetStateAction<number>>;
}

export const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null);

type SectionContextProviderProps = {
    children: React.ReactNode;
};

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
    )
};

export function useActiveSectionContext() {
    const context = useContext(ActiveSectionContext);

    if (context === null) {
        throw new Error(
            'useActiveSectionContext must be used within an ActiveSectionContextProvider'
        );
    }

    return context;
}