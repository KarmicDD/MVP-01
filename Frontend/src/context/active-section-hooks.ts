// src/context/active-section-hooks.ts
import { useContext } from 'react';
import { ActiveSectionContext } from './active-section-context-types';

export function useActiveSectionContext() {
    const context = useContext(ActiveSectionContext);

    if (context === null) {
        throw new Error(
            'useActiveSectionContext must be used within an ActiveSectionContextProvider'
        );
    }

    return context;
}