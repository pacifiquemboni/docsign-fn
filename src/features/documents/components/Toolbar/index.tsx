import { Copy, FilePlus, FileUp, RotateCw, Trash2 } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { ZoomControls } from '../ZoomControls';
import type { ZoomLevel } from '../../types';

interface ToolbarProps {
  selectedPageNumber: number;
  totalPages: number;
  zoom: ZoomLevel;
  isRotating: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  onRotate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onInsertBlank: () => void;
  onInsertPdf: () => void;
  onZoomChange: (zoom: ZoomLevel) => void;
}

export function Toolbar({
  selectedPageNumber,
  totalPages,
  zoom,
  isRotating,
  isDeleting,
  isDuplicating,
  onRotate,
  onDelete,
  onDuplicate,
  onInsertBlank,
  onInsertPdf,
  onZoomChange,
}: ToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Page actions */}
      <div className="flex items-center gap-1">
        {/* Existing: rotate */}
        <Tooltip content="Rotate page 90°">
          <button
            onClick={onRotate}
            disabled={isRotating}
            aria-label="Rotate page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
          </button>
        </Tooltip>

        {/* Existing: delete */}
        <Tooltip content="Delete page">
          <button
            onClick={onDelete}
            disabled={isDeleting || totalPages <= 1}
            aria-label="Delete page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* New: duplicate */}
        <Tooltip content="Duplicate page">
          <button
            onClick={onDuplicate}
            disabled={isDuplicating}
            aria-label="Duplicate page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* New: insert blank */}
        <Tooltip content="Insert blank page">
          <button
            onClick={onInsertBlank}
            aria-label="Insert blank page"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FilePlus className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* New: insert PDF */}
        <Tooltip content="Insert PDF pages">
          <button
            onClick={onInsertPdf}
            aria-label="Insert PDF pages"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FileUp className="h-4 w-4" />
          </button>
        </Tooltip>

        <div className="mx-2 h-5 w-px bg-gray-200" />

        <span className="text-xs text-gray-400">
          Page <span className="font-medium text-gray-700">{selectedPageNumber}</span>{' '}
          of <span className="font-medium text-gray-700">{totalPages}</span>
        </span>
      </div>

      {/* Zoom controls */}
      <ZoomControls zoom={zoom} onChange={onZoomChange} />
    </div>
  );
}
