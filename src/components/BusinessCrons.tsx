import { CalendarClock, ShieldCheck, Fingerprint, RotateCcw, Clock } from 'lucide-react';

const CRONS = [
  { name: 'invoice_processor', schedule: '*/15 * * * *', action: 'process_inbox', desc: 'Verify via SMT, generate payment', status: 'active', lastRun: '2m ago' },
  { name: 'inventory_check', schedule: '0 */2 * * *', action: 'reorder_if_below', desc: 'Idempotent supplier API call', status: 'active', lastRun: '1h 5m ago' },
  { name: 'nightly_synthesis', schedule: '0 3 * * *', action: 'synthesize_all', desc: 'Time-bounded self-improvement', status: 'idle', lastRun: '14h ago' },
  { name: 'hourly_invariant', schedule: '0 * * * *', action: 'verify_invariants', desc: 'Rollback on failure', status: 'idle', lastRun: '45m ago' },
];

export function BusinessCrons() {
  return (
    <div className="flex flex-col h-full gap-3">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] font-semibold flex items-center gap-2 shrink-0">
        <CalendarClock className="w-3 h-3" /> 24/7 Automation Crons
      </span>
      <p className="text-[10px] leading-relaxed text-zinc-500 font-mono shrink-0">
        Time as a deterministic dimension. Scheduled, idempotent actions with full audit trails.
      </p>

      <div className="flex-1 overflow-auto flex flex-col gap-2 pr-1">
        {CRONS.map((cron) => (
          <div key={cron.name} className="bg-[#09090b] border border-[#27272a] rounded p-2 flex flex-col gap-1.5 transition-colors hover:border-[#3f3f46]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-200">{cron.name}</span>
              <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {cron.schedule}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              <span className="text-[#f97316]">run</span> {cron.action}()
            </div>
            <div className="flex justify-between items-center mt-1">
               <span className="text-[9px] text-zinc-500">{cron.desc}</span>
               <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${cron.status === 'active' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-zinc-800 text-zinc-400'}`}>
                 {cron.status === 'active' ? 'ACTIVE' : 'IDLE'}
               </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 shrink-0 border-t border-[#27272a] pt-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3 h-3 text-[#22c55e] shrink-0 mt-0.5" />
          <div className="text-[9px] text-zinc-500 font-mono leading-tight">Unique transaction IDs prevent duplicates on replay.</div>
        </div>
        <div className="flex items-start gap-2">
          <RotateCcw className="w-3 h-3 text-[#f97316] shrink-0 mt-0.5" />
          <div className="text-[9px] text-zinc-500 font-mono leading-tight">Deterministic Rollback: Re-process in sandbox to validate rule changes.</div>
        </div>
      </div>
    </div>
  );
}
