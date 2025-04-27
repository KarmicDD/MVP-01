import React from 'react';
import { colours } from '../../../utils/colours';

interface BackgroundPatternProps {
  role?: string;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ role = 'startup' }) => {
  // Define colors based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  const secondaryColor = role === 'startup' ? colours.indigo400 : '#34D399';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
      {/* Abstract pattern */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke={secondaryColor} strokeWidth="1" opacity="0.2" />
          </pattern>
          <radialGradient id="radialGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#radialGradient)" />

        {/* Abstract shapes */}
        <circle cx="10%" cy="10%" r="15%" fill={primaryColor} opacity="0.03" />
        <circle cx="90%" cy="90%" r="20%" fill={secondaryColor} opacity="0.02" />
        <path d="M0,50 Q50,0 100,50 T200,50" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.03" />
      </svg>
    </div>
  );
};

export default BackgroundPattern;
