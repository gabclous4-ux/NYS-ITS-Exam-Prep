import React, { useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface ImageModalProps {
  svgContent: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ svgContent, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Style the SVG to be visible in the modal.
  const styledSvg = svgContent.replace(
    /<svg(.*?)>/, 
    `<svg$1 style="max-width: none; background-color: #2d3748;" class="h-auto">`
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl relative w-full max-w-5xl h-full max-h-[90vh] overflow-auto p-4"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking content
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors z-10"
          aria-label="Close diagram viewer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div 
          className="w-full h-full flex items-center justify-center min-w-[800px] min-h-[600px]"
          dangerouslySetInnerHTML={{ __html: styledSvg }}
        />
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in-fast {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
  }
`;
document.head.append(style);
