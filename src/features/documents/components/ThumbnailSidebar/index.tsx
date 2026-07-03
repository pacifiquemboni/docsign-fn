import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageThumbnail } from '../PageThumbnail';
import type { DocumentPage } from '../../types';

interface ThumbnailSidebarProps {
  pages: DocumentPage[];
  selectedPageNumber: number;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  onSelectPage: (pageNumber: number) => void;
  onReorder: (newPageNumbers: number[]) => void;
  onRotate: (pageNumber: number) => void;
  onDelete: (pageNumber: number) => void;
  onDuplicate: (pageNumber: number) => void;
  /** Render without the outer aside/collapse chrome — used when embedded in a tabbed panel. */
  bare?: boolean;
}

export function ThumbnailSidebar({
  pages,
  selectedPageNumber,
  collapsed,
  onCollapse,
  onSelectPage,
  onReorder,
  onRotate,
  onDelete,
  onDuplicate,
  bare = false,
}: ThumbnailSidebarProps) {
  const [ordered, setOrdered] = useState<DocumentPage[]>(pages);

  useEffect(() => {
    setOrdered(pages);
  }, [pages]);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setOrdered((prev) => {
      const result = [...prev];
      const [item] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, item);
      return result;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    onReorder(ordered.map((p) => p.page_number));
  }, [ordered, onReorder]);

  const list = (
    <>
      <div className="border-b border-gray-100 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Pages ({pages.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {ordered.map((page, index) => (
          <PageThumbnail
            key={page.id}
            page={page}
            index={index}
            isSelected={page.page_number === selectedPageNumber}
            onSelect={onSelectPage}
            onMove={move}
            onDragEnd={handleDragEnd}
            onRotate={onRotate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </>
  );

  if (bare) {
    return (
      <div className="flex min-h-0 flex-1 flex-col" aria-label="Page thumbnails">
        {list}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'relative flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-0 overflow-hidden' : 'w-52',
      )}
      aria-label="Page thumbnails"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => onCollapse(!collapsed)}
        className={cn(
          'absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center',
          'rounded-full border border-gray-200 bg-white shadow-sm',
          'text-gray-400 transition-colors hover:text-gray-700',
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {!collapsed && list}
    </aside>
  );
}
