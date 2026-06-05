import { Activity, BrainCircuit, Moon, Wrench, GitBranch, RefreshCw } from 'lucide-react';

export function AutonomousEngine() {
  return (
    <>
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
        <BrainCircuit className="w-3 h-3" /> 03. Autonomous Engine
      </span>
      <div className="flex-1 overflow-auto flex flex-col gap-3 pr-1 pb-1">
        {/* Production */}
        <div className="bg-[#09090b] border border-[#22c55e]/20 rounded-md p-3 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#22c55e]"></div>
          <div className="flex items-center gap-2 mb-2 pl-2">
            <Activity className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs font-semibold text-zinc-200">Production Loop</span>
            <span className="ml-auto text-[9px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full font-mono animate-pulse">ACTIVE</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono pl-2 leading-relaxed">Handling synchronous requests & executing deterministic business crons.</p>
        </div>

        {/* Healing */}
        <div className="bg-[#09090b] border border-[#3f3f46] rounded-md p-3 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
          <div className="flex items-center gap-2 mb-2 pl-2">
            <Wrench className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs font-semibold text-zinc-200">Self-Healing</span>
            <span className="ml-auto text-[9px] text-zinc-500 font-mono">IDLE (MONITORING)</span>
          </div>
          <div className="flex items-center gap-4 pl-2 mt-2 border-t border-[#27272a] pt-2">
             <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-300">24</span>
                <span className="text-[9px] text-zinc-500">Patches applied</span>
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-300">3</span>
                <span className="text-[9px] text-zinc-500">Rollbacks</span>
             </div>
          </div>
        </div>

        {/* Learning */}
        <div className="bg-[#09090b] border border-[#3f3f46] rounded-md p-3 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6]"></div>
          <div className="flex items-center gap-2 mb-2 pl-2">
            <GitBranch className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-semibold text-zinc-200">Self-Learning</span>
            <span className="ml-auto text-[9px] text-zinc-500 font-mono flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> NEXT: 12m
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono pl-2">Failure-driven rule induction & spec mining from execution traces.</p>
          <div className="pl-2 mt-2 font-mono text-[9px] text-[#3b82f6]">
            +105 Axioms Learned
          </div>
        </div>

        {/* Dreaming */}
        <div className="bg-[#09090b] border border-[#3f3f46] rounded-md p-3 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]"></div>
          <div className="flex items-center gap-2 mb-2 pl-2">
            <Moon className="w-4 h-4 text-[#a855f7]" />
            <span className="text-xs font-semibold text-zinc-200">Dreaming</span>
            <span className="ml-auto text-[9px] text-zinc-500 font-mono">SCHED: 02:00 AM</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono pl-2">Simulating alternative implementations & finding abstractions offline.</p>
        </div>

      </div>
    </>
  );
}
