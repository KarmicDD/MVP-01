import React from 'react';
import { TutorialStep } from '../../context/TutorialContext';
import { FiExternalLink } from 'react-icons/fi';

interface TutorialContentProps {
  step: TutorialStep;
}

/**
 * TutorialContent component
 * Displays the content of a tutorial step, including text, images, videos, and links
 */
const TutorialContent: React.FC<TutorialContentProps> = ({ step }) => {
  // Function to render video content if provided
  const renderVideo = () => {
    if (!step.video) return null;

    // Handle YouTube videos
    if (step.video.includes('youtube.com') || step.video.includes('youtu.be')) {
      const videoId = step.video.includes('youtu.be')
        ? step.video.split('/').pop()
        : new URLSearchParams(new URL(step.video).search).get('v');

      return (
        <div className="mb-4 rounded-lg overflow-hidden shadow-md aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Tutorial video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Handle direct video files
    return (
      <div className="mb-4 rounded-lg overflow-hidden shadow-md">
        <video
          controls
          className="w-full h-auto"
          src={step.video}
          onError={(e) => {
            // Fallback if video fails to load
            e.currentTarget.style.display = 'none';
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Image (if provided) */}
      {step.image && (
        <div className="mb-4 rounded-lg overflow-hidden shadow-md">
          <img
            src={step.image}
            alt={`${step.title} illustration`}
            className="w-full h-auto object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Video (if provided) */}
      {renderVideo()}

      {/* Content */}
      <div className="text-gray-700">
        {typeof step.content === 'string' ? (
          <p className="text-base leading-relaxed">{step.content}</p>
        ) : (
          step.content
        )}
      </div>

      {/* External link (if provided) */}
      {step.link && (
        <div className="mt-4">
          <a
            href={step.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
          >
            {step.link.text || 'Learn more'}
            <FiExternalLink className="ml-1" />
          </a>
        </div>
      )}
    </div>
  );
};

export default TutorialContent;
