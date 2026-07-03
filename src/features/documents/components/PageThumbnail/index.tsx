import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier } from 'dnd-core';
import { Copy, RotateCw, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getThumbnailUrl } from '../../utils/thumbnailUrl';
import type { DocumentPage } from '../../types';

const ITEM_TYPE = 'PAGE_THUMBNAIL';

interface DragItem {
  index: number;
  pageNumber: number;
}

interface PageThumbnailProps {
  page: DocumentPage;
  index: number;
  isSelected: boolean;
  onSelect: (pageNumber: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDragEnd: () => void;
  onRotate: (pageNumber: number) => void;
  onDelete: (pageNumber: number) => void;
  onDuplicate: (pageNumber: number) => void;
}

export function PageThumbnail({
  page,
  index,
  isSelected,
  onSelect,
  onMove,
  onDragEnd,
  onRotate,
  onDelete,
  onDuplicate,
}: PageThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: { index, pageNumber: page.page_number },
    end: onDragEnd,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null; isOver: boolean }
  >({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOver: monitor.isOver(),
    }),
    hover(item) {
      if (!ref.current || item.index === index) return;
      onMove(item.index, index);
      item.index = index;
    },
  });

  drag(drop(ref));

  const thumbnailUrl = getThumbnailUrl(page.thumbnail_path);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      onClick={() => onSelect(page.page_number)}
      className={cn(
        'group relative mx-3 mb-2 cursor-pointer rounded-xl border-2 transition-all duration-150 select-none',
        isSelected
          ? 'border-brand-500 shadow-md shadow-brand-100'
          : 'border-transparent hover:border-gray-300',
        isDragging && 'opacity-40 scale-95',
        isOver && !isDragging && 'ring-2 ring-brand-300',
      )}
      role="button"
      tabIndex={0}
      aria-label={`Page ${page.page_number}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(page.page_number)}
    >
      {/* Thumbnail image */}
      <div
        className="overflow-hidden rounded-lg bg-white"
        style={{ aspectRatio: `${page.page_width} / ${page.page_height}` }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Page ${page.page_number} thumbnail`}
            className="h-full w-full object-contain"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50 text-xs text-gray-400">
            No preview
          </div>
        )}
      </div>

      {/* Page number badge */}
      <div className="mt-1.5 text-center text-xs font-medium text-gray-500">
        {page.page_number}
      </div>

      {/* Hover action buttons */}
      <div className="pointer-events-none absolute right-1 top-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onRotate(page.page_number); }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm hover:text-brand-600"
          aria-label={`Rotate page ${page.page_number}`}
          title="Rotate 90°"
        >
          <RotateCw className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(page.page_number); }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm hover:text-brand-600"
          aria-label={`Duplicate page ${page.page_number}`}
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(page.page_number); }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm hover:text-red-500"
          aria-label={`Delete page ${page.page_number}`}
          title="Delete page"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
