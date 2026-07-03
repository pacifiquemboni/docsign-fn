import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SigningProgressProps {
  required: number;
  completed: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function SigningProgress({
  required,
  completed,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: SigningProgressProps) {
  const pct = required === 0 ? 100 : Math.round((completed / required) * 100);
  const allDone = completed === required;

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-2.5">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          aria-label="Previous required field"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          aria-label="Next required field"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar + label */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${allDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={required}
          />
        </div>
        <span className={`shrink-0 text-xs font-medium ${allDone ? 'text-emerald-600' : 'text-gray-500'}`}>
          {required === 0 ? 'No required fields' : `${completed} / ${required} required`}
        </span>
      </div>
    </div>
  );
}
