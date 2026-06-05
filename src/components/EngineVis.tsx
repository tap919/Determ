import { RefreshCw, CheckCircle2, XCircle, Code, Cpu, Database, ShieldAlert, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EngineVisProps {
  status: string;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  hash?: string;
}

export function EngineVis({ status, attemptCount, maxAttempts, lastError, hash }: EngineVisProps) {
  
  const steps = [
    { id: 'parsing', label: 'Schema-Constrained JSON IR', desc: 'Gemini Structured Output', icon: Database },
    { id: 'compiling', label: 'Deterministic Compiler', desc: 'IR -> JS native compilation', icon: Cpu },
    { id: 'verifying', label: 'Sandbox Eval + Fuzzing', desc: 'E2B Trace Collection', icon: Code },
    { id: 'solving', label: 'Formal Solver Checks', desc: 'cvc5 / Bitwuzla properties', icon: ShieldAlert },
    { id: 'success', label: 'Acceptance Report', desc: hash ? `Hash: ${hash.substring(0, 8)}...` : 'Generating hash...', icon: Fingerprint }
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center shrink-0">
        <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] font-semibold">Verification Pipeline</span>
        {status !== 'idle' && status !== 'success' && (
          <div className="flex items-center gap-2 text-[10px] font-mono bg-[#f97316]/10 text-[#f97316] px-2 py-0.5 rounded border border-[#f97316]/20">
            <RefreshCw className="w-3 h-3 animate-spin" />
            ATTEMPT {attemptCount} / {maxAttempts}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto flex flex-col gap-3 pr-2">
        {steps.map((step, idx) => {
          const isActive = status === step.id || (status === 'success' && step.id === 'success');
          
          let isPast = false;
          if (status === 'success') isPast = true;
          else if (status === 'solving') isPast = ['parsing', 'compiling', 'verifying'].includes(step.id);
          else if (status === 'verifying') isPast = ['parsing', 'compiling'].includes(step.id);
          else if (status === 'compiling') isPast = ['parsing'].includes(step.id);
          
          if (status === 'error') {
             // In error state, keep past steps green, and red current one
             // Simplified for now.
          }

          return (
            <div key={step.id} className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
              isActive ? 'bg-[#f97316]/10 border-[#f97316]/30 text-white' : 
              isPast ? 'bg-[#09090b] border-[#22c55e]/30 text-zinc-300' : 
              'bg-[#09090b] border-[#27272a] text-zinc-600'
            }`}>
               <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                 isActive ? 'bg-[#f97316] text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                 isPast ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                 'bg-[#27272a] text-zinc-500'
               }`}>
                 {isPast && step.id !== 'success' ? <CheckCircle2 className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
               </div>
               <div className="flex flex-col min-w-0">
                 <span className="text-xs font-semibold">{step.label}</span>
                 <span className={`text-[9px] font-mono truncate ${isActive ? 'text-[#f97316]' : isPast ? 'text-[#22c55e]' : 'opacity-60'}`}>
                   {isActive && step.id !== 'success' ? 'Processing...' : step.desc}
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
             className="bg-red-500/10 border border-red-500/20 rounded p-2 flex items-start gap-2 text-red-400 mt-2 shrink-0"
           >
             <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
             <div className="flex flex-col gap-1 min-w-0">
               <span className="text-[10px] font-bold">Verification Failed.</span>
               <span className="text-[9px] font-mono leading-tight whitespace-pre-wrap line-clamp-3">{lastError}</span>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
