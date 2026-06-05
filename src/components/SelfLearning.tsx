import { GitBranch, Fingerprint, DatabaseZap, Clock, Target } from 'lucide-react';

export function SelfLearning() {
  return (
    <>
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
        <GitBranch className="w-3 h-3" /> 04. Self-Learning
      </span>
      <div className="flex-1 overflow-auto flex flex-col gap-3 pr-1 pb-1">
        <div className="text-[10px] text-zinc-500 font-mono mb-1 shrink-0 leading-relaxed">
          Monotonic skill acquisition without non-deterministic sampling.
        </div>
        
        {/* Rule Induction */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-md p-2 relative overflow-hidden shrink-0">
          <div className="flex items-center gap-2 mb-1">
             <Fingerprint className="w-3 h-3 text-[#3b82f6]" />
             <span className="text-[11px] font-semibold text-zinc-200">Rule Induction</span>
             <span className="ml-auto text-[9px] text-[#3b82f6] font-mono bg-[#3b82f6]/10 px-1.5 rounded border border-[#3b82f6]/20">+105 Axioms</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Failure-driven constraint learning. (e.g. requires den != 0)</p>
        </div>

        {/* Case-based Reasoning */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-md p-2 relative overflow-hidden shrink-0">
          <div className="flex items-center gap-2 mb-1">
             <DatabaseZap className="w-3 h-3 text-[#3b82f6]" />
             <span className="text-[11px] font-semibold text-zinc-200">Case-based Reasoning</span>
             <span className="ml-auto text-[9px] text-[#22c55e] font-mono bg-[#22c55e]/10 px-1.5 rounded border border-[#22c55e]/20">HIT: 94%</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Persistent cache of normalized spec → program pairs.</p>
        </div>

        {/* Performance Profiling */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-md p-2 relative overflow-hidden shrink-0">
          <div className="flex items-center gap-2 mb-1">
             <Clock className="w-3 h-3 text-[#3b82f6]" />
             <span className="text-[11px] font-semibold text-zinc-200">Cron Profiling</span>
             <span className="ml-auto text-[9px] text-zinc-400 font-mono bg-[#18181b] px-1.5 rounded border border-[#27272a]">NIGHTLY</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Regression prevention via time/memory benchmarks.</p>
        </div>

        {/* Spec Mining */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-md p-2 relative overflow-hidden shrink-0">
          <div className="flex items-center gap-2 mb-1">
             <Target className="w-3 h-3 text-[#3b82f6]" />
             <span className="text-[11px] font-semibold text-zinc-200">Spec Mining</span>
             <span className="ml-auto text-[9px] text-zinc-400 font-mono">VERSION SPACE</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Infers pre/postconditions from production trace replays.</p>
        </div>
      </div>
    </>
  );
}
