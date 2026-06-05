import { cn } from '../lib/utils';

export function SynthesizedCode({ code }: { code: string }) {
  return (
    <div className="w-full bg-[#09090b] rounded-md border border-[#27272a] p-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 px-2 py-1 bg-[#18181b] border-b border-l border-[#3f3f46] text-[10px] text-zinc-400 font-mono rounded-bl-md">Python (Canonical AST)</div>
      <pre className="font-mono text-[11px] text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
