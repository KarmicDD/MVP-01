// src/context/active-section-context-types.ts
import React, { createContext } from 'react';
import { links } from '../data/data';

// Types
export type SectionName = typeof links[number]['name'];

export type ActiveSectionContextType = {
    activeSection: SectionName;
    setActiveSection: React.Dispatch<React.SetStateAction<SectionName>>;
    timeOfLastClick: number;
    setTimeOfLastClick: React.Dispatch<React.SetStateAction<number>>;
}

// Context
export const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null);