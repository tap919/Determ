import { TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface SpecEditorProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  code: string;
  onChange: (value: string) => void;
}

export function SpecEditor({ code, onChange, className, ...props }: SpecEditorProps) {
  return (
    <div className="relative h-full w-full bg-[#09090b] rounded-md border border-[#27272a] overflow-hidden group focus-within:border-[#f97316]/50 transition-colors">
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={cn(
          "h-full w-full bg-transparent p-4 text-[11px] font-mono text-[#a1a1aa] resize-none outline-none",
          "leading-relaxed",
          className
        )}
        {...props}
      />
    </div>
  );
}
