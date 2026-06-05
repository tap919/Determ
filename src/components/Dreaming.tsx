import { Moon, Beaker, RotateCcw, Combine, Cpu, ShieldAlert } from 'lucide-react';

export function Dreaming() {
  return (
    <>
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
        <Moon className="w-3 h-3" /> 05. Offline Dreaming
      </span>
      <div className="flex-1 overflow-auto flex flex-col gap-3 pr-1 pb-1">
        <div className="flex justify-between items-center shrink-0 mb-1">
            <span className="text-[10px] text-zinc-500 font-mono">Deterministic simulations.</span>
            <span className="text-[9px] font-mono text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/20">SCHED: 02:00 AM</span>
        </div>

        <div className="flex flex-col gap-2">
            {[
              { icon: Beaker, name: 'What-if Analysis', desc: 'Fork KB, run synthesis with relaxed bounds, keep best.', color: 'text-[#a855f7]' },
              { icon: RotateCcw, name: 'Counterfactual', desc: 'Enumerate fix patterns on past logged failure states.', color: 'text-[#a855f7]' },
              { icon: Combine, name: 'Abstraction Discovery', desc: 'Anti-unification (LGG) on canonical ASTs.', color: 'text-[#a855f7]' },
              { icon: Cpu, name: 'Cache Pre-warming', desc: 'Markov chain of query logs to pre-compute states.', color: 'text-[#a855f7]' },
              { icon: ShieldAlert, name: 'Security Probing', desc: 'Bounded model checking against attack patterns.', color: 'text-[#a855f7]' }
            ].map(item => (
                <div key={item.name} className="flex gap-3 bg-[#09090b] border border-[#27272a] rounded p-2 items-start shrink-0">
                    <item.icon className={`w-3 h-3 mt-0.5 shrink-0 ${item.color}`} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-zinc-200">{item.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono leading-relaxed mt-0.5">{item.desc}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </>
  );
}
