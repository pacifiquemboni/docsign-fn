import {
  CheckCircle2, Eye, FileCheck2, Link, Mail, PenLine,
  PlayCircle, RotateCcw, UserPlus, XCircle, AlertTriangle,
} from 'lucide-react';
import type { AuditEventResponse, AuditEventType, RecipientResponse } from '../../types';

interface AuditTimelineProps {
  events: AuditEventResponse[];
  recipients: RecipientResponse[];
}

const EVENT_CONFIG: Record<AuditEventType, { icon: React.ReactNode; color: string; verb: string }> = {
  SESSION_CREATED:     { icon: <PlayCircle className="h-4 w-4" />,   color: 'text-indigo-500 bg-indigo-50',  verb: 'Session created' },
  RECIPIENT_ADDED:     { icon: <UserPlus className="h-4 w-4" />,     color: 'text-blue-500 bg-blue-50',      verb: 'Recipient added' },
  FIELD_ASSIGNED:      { icon: <PenLine className="h-4 w-4" />,      color: 'text-violet-500 bg-violet-50',  verb: 'Fields assigned' },
  EMAIL_SENT:          { icon: <Mail className="h-4 w-4" />,         color: 'text-sky-500 bg-sky-50',        verb: 'Invitation sent' },
  LINK_OPENED:         { icon: <Link className="h-4 w-4" />,         color: 'text-amber-500 bg-amber-50',    verb: 'Link opened' },
  DOCUMENT_VIEWED:     { icon: <Eye className="h-4 w-4" />,          color: 'text-amber-500 bg-amber-50',    verb: 'Document viewed' },
  FIELD_COMPLETED:     { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-500 bg-emerald-50',verb: 'Field completed' },
  SIGNATURE_APPLIED:   { icon: <PenLine className="h-4 w-4" />,      color: 'text-emerald-500 bg-emerald-50',verb: 'Signature applied' },
  SIGNING_COMPLETED:   { icon: <FileCheck2 className="h-4 w-4" />,   color: 'text-emerald-600 bg-emerald-50',verb: 'Signing completed' },
  DOCUMENT_DOWNLOADED: { icon: <FileCheck2 className="h-4 w-4" />,   color: 'text-gray-500 bg-gray-50',      verb: 'Document downloaded' },
  REMINDER_SENT:       { icon: <RotateCcw className="h-4 w-4" />,    color: 'text-sky-500 bg-sky-50',        verb: 'Reminder sent' },
  SESSION_EXPIRED:     { icon: <AlertTriangle className="h-4 w-4" />,color: 'text-gray-400 bg-gray-50',      verb: 'Session expired' },
  SESSION_CANCELLED:   { icon: <XCircle className="h-4 w-4" />,      color: 'text-gray-500 bg-gray-50',      verb: 'Session cancelled' },
  SESSION_DECLINED:    { icon: <XCircle className="h-4 w-4" />,      color: 'text-red-500 bg-red-50',        verb: 'Session declined' },
  LINK_REVOKED:        { icon: <XCircle className="h-4 w-4" />,      color: 'text-gray-400 bg-gray-50',      verb: 'Link revoked' },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function AuditTimeline({ events, recipients }: AuditTimelineProps) {
  const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r]));

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No events yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.event_type] ?? {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-gray-400 bg-gray-50',
          verb: event.event_type,
        };
        const recipient = event.recipient_id ? recipientMap[event.recipient_id] : null;
        const isLast = i === events.length - 1;

        return (
          <li key={event.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                {cfg.icon}
              </span>
              {!isLast && <div className="mt-1 w-px flex-1 bg-gray-100" />}
            </div>

            {/* Event body */}
            <div className={`min-w-0 pb-4 ${isLast ? '' : ''}`}>
              <p className="text-sm font-medium text-gray-800">{cfg.verb}</p>
              {recipient && (
                <p className="text-xs text-gray-500">
                  <span
                    className="inline-block h-2 w-2 rounded-full mr-1"
                    style={{ backgroundColor: recipient.color }}
                  />
                  {recipient.full_name}
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">{formatTime(event.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
