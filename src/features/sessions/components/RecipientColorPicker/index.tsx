import { cn } from '@/utils/cn';
import { RECIPIENT_COLORS } from '../../types';

interface RecipientColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function RecipientColorPicker({ value, onChange }: RecipientColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {RECIPIENT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
            value === color ? 'border-gray-900 scale-110' : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
          aria-pressed={value === color}
        />
      ))}
    </div>
  );
}
