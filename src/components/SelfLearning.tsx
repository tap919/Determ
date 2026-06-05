import { BrainCircuit, BookOpen, Activity, GitCommit } from 'lucide-react';
import { VerifiedFunction } from '../types';

interface SelfLearningProps {
  knowledgeBase: VerifiedFunction[];
  loadFromKb: (kb: VerifiedFunction) => void;
}

export function SelfLearning({ knowledgeBase, loadFromKb }: SelfLearningProps) {
  return (
    <div className="flex flex-col h-full gap-3 relative overflow-hidden">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] font-semibold flex items-center gap-2 shrink-0">
        <BrainCircuit className="w-3 h-3" /> Deterministic Skill Acquisition
      </span>
      <p className="text-[10px] leading-relaxed text-zinc-500 font-mono shrink-0">
        Monotonic Fact Addition • Canonical Case-Based Reasoning • Spec Mining
      </p>

      <div className="flex-1 overflow-auto flex flex-col gap-2 pr-1">
         {knowledgeBase.length === 0 ? (
            <div className="text-center text-[10px] text-zinc-600 mt-6 italic font-mono border border-dashed border-[#27272a] p-3 rounded">
              Knowledge base empty. Verify functions to add canonical cases.
            </div>
         ) : (
            knowledgeBase.map(kb => (
              <button 
                key={kb.id} 
                onClick={() => loadFromKb(kb)} 
                className="text-left bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] p-2.5 rounded transition-colors group flex flex-col gap-1.5"
              >
                <div className="text-[11px] font-semibold text-zinc-300 truncate">{kb.name}</div>
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-[#22c55e] flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {kb.testCases} rules proven
                  </span>
                  <span className="text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                    <GitCommit className="w-3 h-3" /> Restore
                  </span>
                </div>
              </button>
            ))
         )}
      </div>

      <div className="shrink-0 border-t border-[#27272a] pt-3 flex flex-col gap-2">
         <div className="flex items-start gap-2">
            <BookOpen className="w-3 h-3 text-[#3b82f6] shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-500 font-mono leading-tight">
              Failure-driven rule induction automatically adds negative constraints on verification failures.
            </div>
         </div>
      </div>
    </div>
  );
}
