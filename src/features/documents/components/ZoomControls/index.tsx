import { Minus, Plus, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ZOOM_LEVELS, type ZoomLevel } from '../../types';

interface ZoomControlsProps {
  zoom: ZoomLevel;
  onChange: (zoom: ZoomLevel) => void;
}

const ZOOM_LABELS: Record<ZoomLevel, string> = {
  0.5: '50%',
  0.75: '75%',
  1.0: '100%',
  1.25: '125%',
  1.5: '150%',
  2.0: '200%',
};

export function ZoomControls({ zoom, onChange }: ZoomControlsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const currentIndex = ZOOM_LEVELS.indexOf(zoom);

  const zoomOut = () => {
    if (currentIndex > 0) onChange(ZOOM_LEVELS[currentIndex - 1]);
  };

  const zoomIn = () => {
    if (currentIndex < ZOOM_LEVELS.length - 1)
      onChange(ZOOM_LEVELS[currentIndex + 1]);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={zoomOut}
        disabled={currentIndex === 0}
        aria-label="Zoom out"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 min-w-[4.5rem] items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {ZOOM_LABELS[zoom]}
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {ZOOM_LEVELS.map((level) => (
              <li key={level}>
                <button
                  role="option"
                  aria-selected={level === zoom}
                  onClick={() => {
                    onChange(level);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-1.5 text-left text-xs transition-colors hover:bg-gray-50',
                    level === zoom
                      ? 'bg-brand-50 font-semibold text-brand-700'
                      : 'text-gray-700',
                  )}
                >
                  {ZOOM_LABELS[level]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={zoomIn}
        disabled={currentIndex === ZOOM_LEVELS.length - 1}
        aria-label="Zoom in"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
