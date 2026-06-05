import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, CircleOff, Loader2, XCircle } from 'lucide-react';
import { LogEntry, SynthesisStatus } from '../types';
import { cn } from '../lib/utils';

export function TerminalLog({ logs, status }: { logs: LogEntry[], status: SynthesisStatus }) {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 overflow-auto bg-transparent font-mono text-[11px]">
      {logs.length === 0 && status === 'idle' && (
        <div className="text-zinc-600 flex items-center gap-2">
          <ChevronRight className="w-3 h-3" /> Ready for synthesis.
        </div>
      )}

      <div className="space-y-1.5 flex flex-col">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
              
              <div className="flex items-start gap-2 pt-[1px]">
                {log.type === 'system' && <ChevronRight className="w-3 h-3 text-[#f97316] shrink-0" />}
                {log.type === 'info' && <CircleOff className="w-3 h-3 text-zinc-500 shrink-0" />}
                {log.type === 'step' && <Loader2 className="w-3 h-3 text-zinc-400 shrink-0 animate-spin" />}
                {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-[#22c55e] shrink-0" />}
                {log.type === 'error' && <XCircle className="w-3 h-3 text-red-500 shrink-0" />}
                
                <span className={cn(
                  "break-words",
                  log.type === 'system' && "text-[#f97316] font-medium",
                  log.type === 'info' && "text-zinc-400",
                  log.type === 'step' && "text-zinc-300",
                  log.type === 'success' && "text-[#22c55e]",
                  log.type === 'error' && "text-red-400"
                )}>
                  {log.message}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endOfLogsRef} />
      </div>
    </div>
  );
}
