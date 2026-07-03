import { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { HANDWRITING_FONTS, type HandwritingFont } from '../../types';

interface TypedSignatureProps {
  text: string;
  font: HandwritingFont;
  onTextChange: (t: string) => void;
  onFontChange: (f: HandwritingFont) => void;
}

export function TypedSignature({ text, font, onTextChange, onFontChange }: TypedSignatureProps) {
  // Load Google Fonts once
  useEffect(() => {
    const id = 'docsign-handwriting-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Pacifico&family=Great+Vibes&family=Dancing+Script&family=Allura&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Your name</span>
        <input
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Type your full name"
          maxLength={100}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
          autoFocus
          aria-label="Signature text"
        />
      </label>

      {/* Live preview in selected font */}
      <div className="min-h-[72px] rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-center">
        {text.trim() ? (
          <p
            style={{ fontFamily: `'${font}', cursive`, fontSize: 36, lineHeight: 1.2, color: '#1e293b' }}
            aria-label="Signature preview"
          >
            {text}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Preview appears here</p>
        )}
      </div>

      {/* Font picker */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">Choose style</p>
        <div className="grid grid-cols-2 gap-2">
          {HANDWRITING_FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFontChange(f)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left transition-colors',
                font === f
                  ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
              aria-pressed={font === f}
            >
              <span
                style={{
                  fontFamily: `'${f}', cursive`,
                  fontSize: text.trim() ? 22 : 16,
                  color: '#1e293b',
                  lineHeight: 1.3,
                  display: 'block',
                }}
              >
                {text.trim() || f}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
