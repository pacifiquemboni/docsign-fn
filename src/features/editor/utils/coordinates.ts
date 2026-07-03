/**
 * PDF point rect, as stored by the backend.
 * x/width/height behave normally; y is the BOTTOM edge measured from the
 * page's bottom (PDF's native coordinate space has its origin bottom-left).
 */
export interface PdfPointRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Pixel rect relative to the rendered canvas (top-left origin, y-down). */
export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * `zoom` is the canvas's px-per-point scale (the same `scale` passed to
 * pdf.js's `getViewport`), so canvasHeight = pageHeightInPoints * zoom.
 */
export function pdfPointsToPixels(
  r: PdfPointRect,
  canvasHeight: number,
  zoom: number,
): PixelRect {
  const width = r.width * zoom;
  const height = r.height * zoom;
  return {
    left: r.x * zoom,
    top: canvasHeight - r.y * zoom - height,
    width,
    height,
  };
}

export function pixelsToPdfPoints(
  px: PixelRect,
  canvasHeight: number,
  zoom: number,
): PdfPointRect {
  return {
    x: px.left / zoom,
    y: (canvasHeight - px.top - px.height) / zoom,
    width: px.width / zoom,
    height: px.height / zoom,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Clamp a pixel rect so it stays fully within the canvas. */
export function clampPixelRect(r: PixelRect, canvasWidth: number, canvasHeight: number): PixelRect {
  const width = Math.min(r.width, canvasWidth);
  const height = Math.min(r.height, canvasHeight);
  return {
    left: clamp(r.left, 0, canvasWidth - width),
    top: clamp(r.top, 0, canvasHeight - height),
    width,
    height,
  };
}
