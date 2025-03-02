// src/hooks/useSectionInView.ts
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useActiveSectionContext } from '../context/active-section-context';
import { SectionName } from '../libs/data';

interface UseSectionInViewProps {
    sectionName: SectionName;
    threshold?: number;
}

export function useSectionInView({ sectionName, threshold = 0.55 }: UseSectionInViewProps) {
    const { setActiveSection, timeOfLastClick } = useActiveSectionContext();
    const { ref, inView } = useInView({
        threshold,
    });

    useEffect(() => {
        if (inView && Date.now() - timeOfLastClick > 1000) {
            setActiveSection(sectionName);
        }
    }, [inView, setActiveSection, timeOfLastClick, sectionName]);

    return ref;
}