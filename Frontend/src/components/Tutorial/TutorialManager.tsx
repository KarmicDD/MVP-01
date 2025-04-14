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

  // Register tutorials only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    registerTutorials(tutorials);
    console.log('Tutorials registered once:', Object.keys(tutorials));
  }, []);  // Empty dependency array ensures this runs only once

  return <TutorialOverlay />;
};

export default TutorialManager;
