import type { FieldType } from '../types';
import type { PdfPointRect } from './coordinates';
import { clampPixelRect, pixelsToPdfPoints } from './coordinates';

/** Default field size in PDF points (72pt = 1in). */
const DEFAULTS: Record<FieldType, { width: number; height: number }> = {
  SIGNATURE: { width: 180, height: 40 },
  INITIAL:   { width: 80,  height: 40 },
  TEXT:      { width: 180, height: 24 },
  DATE:      { width: 120, height: 24 },
  CHECKBOX:  { width: 20,  height: 20 },
};

/** Default labels shown inside fields. */
export const FIELD_LABELS: Record<FieldType, string> = {
  SIGNATURE: 'Signature',
  INITIAL:   'Initials',
  TEXT:      'Text',
  DATE:      'Date',
  CHECKBOX:  'Checkbox',
};

/**
 * Build a PDF-point rect centered on a pixel drop point (cxPx, cyPx),
 * clamped to stay within the canvas, then converted to PDF points.
 */
export function buildDefaultRect(
  type: FieldType,
  cxPx: number,
  cyPx: number,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
): PdfPointRect {
  const { width: wPt, height: hPt } = DEFAULTS[type];
  const wPx = wPt * zoom;
  const hPx = hPt * zoom;

  const clamped = clampPixelRect(
    { left: cxPx - wPx / 2, top: cyPx - hPx / 2, width: wPx, height: hPx },
    canvasWidth,
    canvasHeight,
  );

  return pixelsToPdfPoints(clamped, canvasHeight, zoom);
}
