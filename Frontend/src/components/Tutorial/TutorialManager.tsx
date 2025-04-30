import React, { useEffect } from 'react';
import { Tutorial } from '../../context/TutorialContext';
import TutorialOverlay from './TutorialOverlay';
import { useTutorialContext } from '../../context/TutorialContext';

interface TutorialManagerProps {
  tutorials: Record<string, Tutorial>;
}

/**
 * TutorialManager component
 * Registers tutorials and provides the overlay for displaying them
 */
const TutorialManager: React.FC<TutorialManagerProps> = ({ tutorials }) => {
  const { registerTutorials } = useTutorialContext();

  // Use a ref to track if we've already registered tutorials
  const tutorialsRegistered = React.useRef(false);

  // Register tutorials only once on mount to prevent unnecessary re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tutorialsRegistered.current) {
      registerTutorials(tutorials);
      console.log('Tutorials registered once:', Object.keys(tutorials));

      // Log the tutorial details for debugging
      Object.entries(tutorials).forEach(([id, tutorial]) => {
        console.log(`Tutorial ${id}: ${tutorial.title} - ${tutorial.steps.length} steps`);
      });

      tutorialsRegistered.current = true;
    }
  }, []); // Empty dependency array ensures this runs only once

  return <TutorialOverlay />;
};

export default TutorialManager;
