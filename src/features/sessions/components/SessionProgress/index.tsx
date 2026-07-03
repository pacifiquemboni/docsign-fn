import type { SessionProgressResponse } from '../../types';

interface SessionProgressProps {
  progress: SessionProgressResponse;
}

export function SessionProgress({ progress }: SessionProgressProps) {
  const { total, signed, viewed, pending, declined } = progress;
  const pct = total === 0 ? 0 : Math.round((signed / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">{signed} / {total} signed</span>
        <span className="font-semibold text-indigo-600">{pct}%</span>
      </div>

      {/* Segmented progress bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
        {total > 0 && (
          <>
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(signed / total) * 100}%` }}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${(viewed / total) * 100}%` }}
            />
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${(declined / total) * 100}%` }}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
        <Dot color="bg-emerald-500" label={`${signed} signed`} />
        <Dot color="bg-amber-400" label={`${viewed} viewed`} />
        <Dot color="bg-gray-300" label={`${pending} pending`} />
        {declined > 0 && <Dot color="bg-red-400" label={`${declined} declined`} />}
      </div>
    </div>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
