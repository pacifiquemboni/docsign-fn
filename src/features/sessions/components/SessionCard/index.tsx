import { useNavigate } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SessionStatusBadge } from '../SessionStatusBadge';
import type { SessionResponse } from '../../types';

interface SessionCardProps {
  session: SessionResponse;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/sessions/${session.id}`)}
      className={cn(
        'group w-full rounded-xl border border-gray-200 bg-white p-4 text-left',
        'transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 line-clamp-1">
          {session.title}
        </p>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {relativeDate(session.created_at)}
        </span>
        {session.expires_at && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Expires {relativeDate(session.expires_at)}
          </span>
        )}
        <span className="ml-auto capitalize text-[11px]">
          {session.signing_order.toLowerCase()}
        </span>
      </div>
    </button>
  );
}
