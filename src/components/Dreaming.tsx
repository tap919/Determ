import { Moon, Database, Merge, FastForward, Search } from 'lucide-react';
import { motion } from 'motion/react';

export function Dreaming() {
  const dreams = [
    { label: 'Counterfactual repair', desc: 'Try alt patches on logged failures', icon: Merge },
    { label: 'Abstraction discovery', desc: 'Generalize map+lambda -> double_all', icon: Database },
    { label: 'Cache pre-warming', desc: 'Simulate future queries via Markov chain', icon: FastForward },
    { label: 'Vulnerability probing', desc: 'Run bounded constraints against attack DB', icon: Search }
  ];

  return (
    <div className="flex flex-col h-full gap-3 relative overflow-hidden">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] font-semibold flex items-center gap-2 shrink-0">
        <Moon className="w-3 h-3" /> Dreaming Simulator
      </span>
      <p className="text-[10px] leading-relaxed text-zinc-500 font-mono shrink-0">
        Offline simulation during scheduled idle times (2AM - 5AM). Exploring alternatives without affecting production.
      </p>

      <div className="flex-1 flex flex-col gap-2 relative">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#18181b] to-transparent z-10 pointer-events-none" />
        
        {dreams.map((dream, i) => (
           <motion.div 
             key={dream.label}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-[#09090b] border border-[#27272a] rounded p-2.5 flex items-start gap-3"
           >
             <div className="p-1.5 bg-[#f97316]/10 text-[#f97316] rounded-md shrink-0">
               <dream.icon className="w-3 h-3" />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-semibold text-zinc-200">{dream.label}</span>
               <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{dream.desc}</span>
             </div>
           </motion.div>
        ))}
      </div>
    </div>
  );
}
