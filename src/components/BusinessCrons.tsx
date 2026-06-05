import { CalendarClock, ChevronRight, Clock, ShieldCheck, Fingerprint, RotateCcw } from 'lucide-react';

const CRONS = [
  { name: 'invoice_processor', schedule: '*/15 * * * *', action: 'process_invoices', desc: 'Parse emails & verify vs. POs', status: 'active', lastRun: '2m ago' },
  { name: 'support_routing', schedule: '0 * * * *', action: 'route_and_escalate', desc: 'Keyword trie → priority queue', status: 'running', lastRun: 'now' },
  { name: 'inventory_reorder', schedule: '0 */2 * * *', action: 'check_stock_levels', desc: 'Auto-generate POs if low stock', status: 'idle', lastRun: '1h 45m ago' },
  { name: 'social_posting', schedule: '0 9-17 * * *', action: 'post_from_calendar', desc: 'Deterministic content rotation', status: 'idle', lastRun: '3h ago' },
  { name: 'timesheet_approval', schedule: '0 18 * * 5', action: 'verify_clock_data', desc: 'Auto-approve within tolerances', status: 'idle', lastRun: '4d ago' },
  { name: 'daily_ops_report', schedule: '0 6 * * *', action: 'generate_pdf_report', desc: 'SQL query → PDF → Email list', status: 'idle', lastRun: '18h ago' },
];

export function BusinessCrons() {
  return (
    <>
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
        <CalendarClock className="w-3 h-3" /> 07. Business Crons
      </span>
      <div className="flex-1 flex flex-col gap-3 overflow-auto pb-2 pr-1">
        <div className="text-[11px] text-[#a1a1aa] font-mono leading-relaxed shrink-0 mb-1">
          Deterministic business process automator replacing operational tasks via idempotent scripts.
        </div>
        
        <div className="flex flex-col gap-2.5">
          {CRONS.map(cron => (
            <div key={cron.name} className="bg-[#09090b] border border-[#27272a] rounded-md p-2.5 flex flex-col gap-1.5 shrink-0 hover:border-[#3f3f46] transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-zinc-200">{cron.name}</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#18181b] border border-[#3f3f46]">
                   <Clock className="w-2.5 h-2.5 text-zinc-500" />
                   <span className="text-[9px] font-mono text-zinc-400">{cron.schedule}</span>
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 font-mono leading-relaxed">
                {cron.desc}
              </div>
              <div className="flex justify-between items-end mt-0.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                     <ChevronRight className="w-3 h-3 text-[#f97316]" /> {cron.action}()
                  </span>
                  <span className="text-[9px] text-[#22c55e] flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Idempotent & Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  {cron.status === 'running' ? (
                     <span className="text-[#3b82f6] animate-pulse font-semibold">Running</span>
                  ) : cron.status === 'active' ? (
                     <span className="text-[#22c55e]">Active</span>
                  ) : (
                     <span className="text-zinc-600">Idle</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Determinism Guarantees */}
        <div className="mt-2 flex flex-col gap-2 shrink-0">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] font-semibold border-t border-[#27272a] pt-4 mt-2">
            Determinism Guarantees
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-[#09090b] border border-[#27272a] rounded p-2 flex items-start gap-2">
              <ShieldCheck className="w-3 h-3 text-[#22c55e] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="text-[10px] font-semibold text-zinc-200">Idempotent Actions</div>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5 leading-relaxed">Unique transaction IDs prevent duplicates on cron replay.</div>
              </div>
            </div>
            <div className="bg-[#09090b] border border-[#27272a] rounded p-2 flex items-start gap-2">
              <Fingerprint className="w-3 h-3 text-[#3b82f6] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="text-[10px] font-semibold text-zinc-200">Full Audit Trail</div>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5 leading-relaxed">Every decision is recorded with its input hash and Z3 proof.</div>
              </div>
            </div>
            <div className="bg-[#09090b] border border-[#27272a] rounded p-2 flex items-start gap-2">
              <RotateCcw className="w-3 h-3 text-[#f97316] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="text-[10px] font-semibold text-zinc-200">Deterministic Rollback</div>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5 leading-relaxed">Re-process transactions in a sandbox to validate rule changes.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
