export type DocumentStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'READY'
  | 'SIGNED'
  | 'ARCHIVED'
  | 'DELETED'
  | 'TEMP';

export interface Document {
  id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
  page_count: number;
  checksum: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface ListDocumentsParams {
  skip?: number;
  limit?: number;
}

// Sprint 2 — page management types

export type PageSource = 'ORIGINAL' | 'BLANK' | 'IMPORTED' | 'DUPLICATE';

export interface DocumentPage {
  id: string;
  document_id: string;
  original_page_index: number | null;
  page_number: number;
  page_width: number;
  page_height: number;
  rotation: number;
  thumbnail_path: string | null;
  page_source: PageSource;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViewerData {
  document_id: string;
  original_name: string;
  page_count: number;
  pages: DocumentPage[];
}

// Phase 3 — page insertion types

export type InsertPosition = 'before' | 'after';
export type PageSize = 'A4' | 'LETTER';
export type PageOrientation = 'portrait' | 'landscape';

export interface InsertBlankPageRequest {
  position: InsertPosition;
  page: number;
  size: PageSize;
  orientation: PageOrientation;
}

export interface UploadSourceResponse {
  source_document_id: string;
  original_name: string;
  page_count: number;
  pages: DocumentPage[];
}

export interface InsertFromSourceRequest {
  source_document_id: string;
  pages: number[];
  position: InsertPosition;
  target_page: number;
}

export const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];
