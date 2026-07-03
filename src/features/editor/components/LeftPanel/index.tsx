import { useState } from 'react';
import { LayoutGrid, PenLine } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ThumbnailSidebar } from '@/features/documents/components/ThumbnailSidebar';
import type { DocumentPage } from '@/features/documents/types';
import { FieldPalette } from '../FieldPalette';

type LeftTab = 'pages' | 'fields';

interface LeftPanelProps {
  pages: DocumentPage[];
  selectedPageNumber: number;
  onSelectPage: (pageNumber: number) => void;
  onReorder: (newPageNumbers: number[]) => void;
  onRotate: (pageNumber: number) => void;
  onDelete: (pageNumber: number) => void;
  onDuplicate: (pageNumber: number) => void;
  fieldCount: number;
}

export function LeftPanel({
  pages,
  selectedPageNumber,
  onSelectPage,
  onReorder,
  onRotate,
  onDelete,
  onDuplicate,
  fieldCount,
}: LeftPanelProps) {
  const [tab, setTab] = useState<LeftTab>('pages');

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex border-b border-gray-100" role="tablist">
        <TabButton
          active={tab === 'pages'}
          onClick={() => setTab('pages')}
          icon={<LayoutGrid className="h-3.5 w-3.5" />}
          label="Pages"
        />
        <TabButton
          active={tab === 'fields'}
          onClick={() => setTab('fields')}
          icon={<PenLine className="h-3.5 w-3.5" />}
          label="Fields"
        />
      </div>

      {tab === 'pages' ? (
        <ThumbnailSidebar
          bare
          pages={pages}
          selectedPageNumber={selectedPageNumber}
          collapsed={false}
          onCollapse={() => {}}
          onSelectPage={onSelectPage}
          onReorder={onReorder}
          onRotate={onRotate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ) : (
        <FieldPalette bare fieldCount={fieldCount} />
      )}
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors',
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-400 hover:text-gray-600',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
