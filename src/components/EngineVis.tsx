import { RefreshCw, CheckCircle2, XCircle, Code, Lightbulb, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EngineVisProps {
  status: string;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
}

export function EngineVis({ status, attemptCount, maxAttempts, lastError }: EngineVisProps) {
  
  const steps = [
    { id: 'parsing', label: 'Spec Ingestion', icon: Code },
    { id: 'synthesizing', label: 'AST Synthesis', icon: Lightbulb },
    { id: 'verifying', label: 'Deterministic Eval', icon: PlayCircle },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-[#f97316] font-semibold">Autonomous Core</span>
        {status !== 'idle' && status !== 'success' && (
          <div className="flex items-center gap-2 text-[10px] font-mono bg-[#f97316]/10 text-[#f97316] px-2 py-0.5 rounded border border-[#f97316]/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            ATTEMPT {attemptCount} / {maxAttempts}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {steps.map((step, idx) => {
          const isActive = status === step.id;
          const isPast = ['synthesizing', 'verifying', 'success'].includes(status) && step.id === 'parsing' ||
                         ['verifying', 'success'].includes(status) && step.id === 'synthesizing' ||
                         status === 'success' && step.id === 'verifying';

          return (
            <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isActive ? 'bg-[#f97316]/10 border-[#f97316]/30 text-white' : 
              isPast ? 'bg-[#09090b] border-[#22c55e]/30 text-zinc-300' : 
              'bg-[#09090b] border-[#27272a] text-zinc-600'
            }`}>
               <div className={`w-6 h-6 rounded flex items-center justify-center ${
                 isActive ? 'bg-[#f97316] text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                 isPast ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                 'bg-[#27272a] text-zinc-500'
               }`}>
                 {isPast ? <CheckCircle2 className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
               </div>
               <div className="flex flex-col">
                 <span className="text-xs font-semibold">{step.label}</span>
                 <span className="text-[9px] font-mono opacity-60">
                   {isActive ? 'Processing...' : isPast ? 'Verified' : 'Awaiting input'}
                 </span>
               </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {lastError && status !== 'success' && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="bg-red-500/10 border border-red-500/20 rounded p-2 flex items-start gap-2 text-red-400 mt-2"
           >
             <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold">Verification Failed. Self-Healing triggered.</span>
               <span className="text-[9px] font-mono leading-tight whitespace-pre-wrap line-clamp-3">{lastError}</span>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
