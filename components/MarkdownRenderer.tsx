import React, { useMemo, useEffect, useRef, useState, useId } from 'react';
import { SpinnerIcon, ZoomInIcon, RestartIcon } from './Icons';
import { ImageModal } from './ImageModal';

declare global {
  interface Window {
    mermaid?: {
      render: (id: string, source: string) => Promise<{ svg: string, bindFunctions?: (element: Element) => void }>;
      run: (config: { nodes: Element[] }) => Promise<void>;
    };
  }
}

// Sub-component specifically for rendering Mermaid diagrams
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const processedCode = useMemo(() => {
    return code.trim().replace(/(graph\s+(?:TD|LR|TB|BT))\s+(.+)/, '$1\n$2');
  }, [code]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!window.mermaid) {
        setError('Mermaid library not loaded.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const uniqueId = `mermaid-${id.replace(/:/g, '')}`;
        const { svg, bindFunctions } = await window.mermaid.render(uniqueId, processedCode);
        setRenderedSvg(svg);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }
        }
      } catch (e: any) {
        console.error("Mermaid render error:", e?.str || e?.message);
        setError(e?.str || e?.message || 'Failed to render diagram.');
      } finally {
        setIsLoading(false);
      }
    };
    renderDiagram();
  }, [processedCode, id, retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <>
      <div className="relative group my-6 bg-[#1a202c] rounded-lg p-4 flex justify-center overflow-x-auto max-w-5xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-4 min-h-[150px] text-gray-400">
            <SpinnerIcon className="w-8 h-8" />
            <span className="ml-3">Rendering Diagram...</span>
          </div>
        )}
        {error && (
          <div className="p-4 text-red-300 bg-red-900/50 rounded-md w-full">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold">Diagram Rendering Error</p>
              <button
                onClick={handleRetry}
                className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RestartIcon className="mr-1.5 h-3 w-3" />
                Retry
              </button>
            </div>
            <p className="text-sm font-mono p-2 bg-black/20 rounded break-all">{error}</p>
            <p className="text-xs text-gray-400 mt-3">Raw Code:</p>
            <pre className="text-xs bg-gray-900 p-2 rounded mt-1 whitespace-pre-wrap">{processedCode}</pre>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          style={{ display: isLoading || error ? 'none' : 'flex' }} 
        />
        {!isLoading && !error && renderedSvg && (
            <div
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-zoom-in"
                role="button"
                aria-label="Zoom in on diagram"
            >
                <ZoomInIcon className="w-16 h-16 text-white" />
            </div>
        )}
      </div>
      {isModalOpen && renderedSvg && (
        <ImageModal svgContent={renderedSvg} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

// Sub-component for rendering standard markdown text
const MarkdownPart: React.FC<{ markdown: string }> = ({ markdown }) => {
  const html = useMemo(() => processMarkdown(markdown), [markdown]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// Main Renderer Component
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parts = useMemo(() => {
    return content.split(/(```mermaid[\s\S]*?```)/g).map((part, index) => {
      if (part.startsWith('```mermaid')) {
        const mermaidCode = part.replace(/```mermaid|```/g, '').trim();
        return { type: 'mermaid' as const, value: mermaidCode, key: `part-${index}` };
      }
      return { type: 'markdown' as const, value: part, key: `part-${index}` };
    });
  }, [content]);

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {parts.map(part => {
        if (!part.value.trim()) return null; 
        if (part.type === 'mermaid') {
          return <MermaidDiagram key={part.key} code={part.value} />;
        }
        return <MarkdownPart key={part.key} markdown={part.value} />;
      })}
    </div>
  );
};

function processMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let listOpen = false;

  lines.forEach(line => {
    if (line.trim() === '') {
      if (listOpen) {
        html += '</ul>';
        listOpen = false;
      }
      return;
    }
    
    if (line.startsWith('## ')) {
      if (listOpen) { html += '</ul>'; listOpen = false; }
      html += `<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-gray-600 pb-2">${line.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (listOpen) { html += '</ul>'; listOpen = false; }
      html += `<h3 class="text-xl font-semibold mt-6 mb-3">${line.substring(4)}</h3>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!listOpen) {
        html += '<ul class="list-disc pl-8 my-4 space-y-2">';
        listOpen = true;
      }
      html += `<li>${parseInlineFormatting(line.substring(2))}</li>`;
    } else {
      if (listOpen) { html += '</ul>'; listOpen = false; }
      html += `<p class="my-4">${parseInlineFormatting(line)}</p>`;
    }
  });

  if (listOpen) {
    html += '</ul>';
  }
  return html;
}

function parseInlineFormatting(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}