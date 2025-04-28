import React from 'react';
import { colours } from '../../../utils/colours';

interface BackgroundPatternProps {
  role?: string;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ role = 'startup' }) => {
  // Define colors based on role
  const primaryColor = role === 'startup'
    ? colours.startup.primary
    : colours.investor.primary;
  const secondaryColor = role === 'startup'
    ? colours.startup.secondary
    : colours.investor.secondary;
  const tertiaryColor = role === 'startup'
    ? colours.indigo200
    : '#9AE6B4'; // Softer green for investor

  // Define gradients - softer, more comforting for investor
  const bgGradient = role === 'startup'
    ? 'linear-gradient(135deg, rgba(62, 96, 233, 0.03), rgba(90, 66, 227, 0.05))'
    : 'linear-gradient(135deg, rgba(56, 161, 105, 0.04), rgba(47, 133, 90, 0.06))';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: bgGradient }}>
      {/* Abstract pattern */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={primaryColor} strokeWidth="0.5" opacity={role === 'investor' ? 0.15 : 0.2} />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke={secondaryColor} strokeWidth="1" opacity={role === 'investor' ? 0.12 : 0.15} />
          </pattern>
          <radialGradient id="radialGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={role === 'investor' ? 0.08 : 0.07} />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity={role === 'investor' ? 0.03 : 0.02} />
          </radialGradient>
          <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={role === 'investor' ? 0.06 : 0.05} />
            <stop offset="100%" stopColor={tertiaryColor} stopOpacity={role === 'investor' ? 0.04 : 0.03} />
          </linearGradient>

          {/* Soft glow for investor */}
          {role === 'investor' && (
            <radialGradient id="comfortGlow" cx="50%" cy="30%" r="70%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#68D391" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#38A169" stopOpacity="0.01" />
            </radialGradient>
          )}
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#radialGradient)" />
        <rect width="100%" height="30%" fill="url(#topGradient)" />

        {/* Comfort glow for investor */}
        {role === 'investor' && (
          <rect width="100%" height="60%" fill="url(#comfortGlow)" />
        )}

        {/* Abstract shapes - softer, more organic for investor */}
        {role === 'investor' ? (
          <>
            {/* Softer, more organic shapes for investor */}
            <circle cx="15%" cy="15%" r="18%" fill={primaryColor} opacity="0.035" />
            <circle cx="85%" cy="85%" r="22%" fill={secondaryColor} opacity="0.025" />
            <circle cx="75%" cy="25%" r="12%" fill={tertiaryColor} opacity="0.025" />
            <path d="M0,60 Q60,20 120,60 T240,60" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.03" />
            <path d="M0,80 Q40,100 80,80 T160,80" stroke={secondaryColor} strokeWidth="2" fill="none" opacity="0.025" />

            {/* Gentle wave patterns */}
            <path d="M0,40 Q20,35 40,40 T80,40 T120,40 T160,40 T200,40" stroke={primaryColor} strokeWidth="1.5" fill="none" opacity="0.025" />
            <path d="M0,45 Q20,50 40,45 T80,45 T120,45 T160,45 T200,45" stroke={tertiaryColor} strokeWidth="1.5" fill="none" opacity="0.02" />
          </>
        ) : (
          <>
            {/* Original shapes for startup */}
            <circle cx="10%" cy="10%" r="15%" fill={primaryColor} opacity="0.04" />
            <circle cx="90%" cy="90%" r="20%" fill={secondaryColor} opacity="0.03" />
            <circle cx="80%" cy="20%" r="10%" fill={tertiaryColor} opacity="0.03" />
            <path d="M0,50 Q50,0 100,50 T200,50" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.04" />
            <path d="M0,70 Q30,90 60,70 T120,70" stroke={secondaryColor} strokeWidth="2" fill="none" opacity="0.03" />
          </>
        )}

        {/* Floating dots - fewer, softer for investor */}
        {Array.from({ length: role === 'investor' ? 15 : 20 }).map((_, i) => (
          <circle
            key={i}
            cx={`${Math.random() * 100}%`}
            cy={`${Math.random() * 100}%`}
            r={Math.random() * (role === 'investor' ? 2.5 : 3) + 1}
            fill={i % 2 === 0 ? primaryColor : secondaryColor}
            opacity={Math.random() * (role === 'investor' ? 0.04 : 0.05) + (role === 'investor' ? 0.01 : 0.02)}
          />
        ))}
      </svg>
    </div>
  );
};

export default BackgroundPattern;
