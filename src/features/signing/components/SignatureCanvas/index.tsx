import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

type Stroke = Point[];

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toBlob: () => Promise<Blob | null>;
}

interface SignatureCanvasProps {
  width?: number;
  height?: number;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas({ width = 480, height = 200 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const currentStrokeRef = useRef<Point[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);

    // Redraw all strokes onto the canvas
    const redraw = useCallback((allStrokes: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const stroke of allStrokes) {
        if (stroke.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);

        // Quadratic Bezier through midpoints for smooth curves
        for (let i = 1; i < stroke.length - 1; i++) {
          const midX = (stroke[i].x + stroke[i + 1].x) / 2;
          const midY = (stroke[i].y + stroke[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY);
        }
        ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
        ctx.stroke();
      }
    }, []);

    useEffect(() => {
      redraw(strokes);
    }, [strokes, redraw]);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = e.currentTarget.width / rect.width;
      const scaleY = e.currentTarget.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [getPoint(e)];
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const pt = getPoint(e);
      currentStrokeRef.current = [...currentStrokeRef.current, pt];

      // Live preview of current stroke
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pts = currentStrokeRef.current;
      if (pts.length < 2) return;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }, []);

    const handlePointerUp = useCallback(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = [];
      if (stroke.length > 0) {
        setStrokes((prev) => {
          const next = [...prev, stroke];
          // Re-render smooth version after committing stroke
          setTimeout(() => redraw(next), 0);
          return next;
        });
      }
    }, [redraw]);

    useImperativeHandle(ref, () => ({
      clear() {
        setStrokes([]);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
      isEmpty() {
        return strokes.length === 0;
      },
      toBlob() {
        return new Promise<Blob | null>((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas) { resolve(null); return; }
          canvas.toBlob(resolve, 'image/png');
        });
      },
    }), [strokes]);

    const handleUndo = () => {
      setStrokes((prev) => prev.slice(0, -1));
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="block w-full touch-none cursor-crosshair"
            style={{ height }}
            aria-label="Signature drawing area"
          />
          {strokes.length === 0 && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              Draw your signature here
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            aria-label="Undo last stroke"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={() => setStrokes([])}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 disabled:opacity-40"
            aria-label="Clear signature"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>
    );
  },
);
