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
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`${step.image ? 'md:w-1/2' : 'w-full'}`}>
          {/* Content */}
          <div className="text-gray-700 mb-4">
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
                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                {step.link.text || 'Learn more'}
                <FiExternalLink className="ml-2" />
              </a>
            </div>
          )}

          {/* Video (if provided) */}
          {!step.image && renderVideo()}
        </div>

        {/* Image (if provided) */}
        {step.image && (
          <div className="md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-100">
              <img
                src={step.image}
                alt={`${step.title} illustration`}
                className="w-full h-auto object-cover" onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  // Show a message safely without innerHTML
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.classList.add('flex', 'items-center', 'justify-center', 'h-48', 'bg-gray-100');
                    // Create safe text element instead of using innerHTML
                    const messageElement = document.createElement('p');
                    messageElement.className = 'text-gray-500';
                    messageElement.textContent = 'Image not available';
                    parent.appendChild(messageElement);
                  }
                }}
              />
            </div>

            {/* Video below image if both are provided */}
            {step.video && renderVideo()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialContent;
