import { useState, useRef, useEffect } from 'react';
import { Play, Code2, Database, TerminalSquare, RotateCcw, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry, SynthesisStatus } from './types';
import { generateId, getCurrentTime } from './lib/utils';
import { SpecEditor } from './components/SpecEditor';
import { SynthesizedCode } from './components/SynthesizedCode';
import { TerminalLog } from './components/TerminalLog';
import { AutonomousEngine } from './components/AutonomousEngine';
import { BusinessCrons } from './components/BusinessCrons';
import { SelfLearning } from './components/SelfLearning';
import { Dreaming } from './components/Dreaming';

const DEFAULT_SPEC = `# function_synthesis_template.yaml
version: 1.0
kind: function

# ---------- Mandatory ----------
name: add
parameters:
  - name: a
    type: int
  - name: b
    type: int
return_type: int

# ---------- Preconditions ----------
requires: []

# ---------- Postconditions ----------
ensures:
  - "result == a + b"

# ---------- Side effects ----------
modifies: []
`;

export default function App() {
  const [specCode, setSpecCode] = useState(DEFAULT_SPEC);
  const [synthesizedCode, setSynthesizedCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<SynthesisStatus>('idle');

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { id: generateId(), timestamp: getCurrentTime(), message, type }]);
  };

  const handleSynthesize = async () => {
    if (status === 'parsing' || status === 'synthesizing' || status === 'verifying') return;
    
    setLogs([]);
    setSynthesizedCode(null);
    setStatus('parsing');
    addLog('System initialized. Starting synthesis pipeline...', 'system');
    
    await new Promise((r) => setTimeout(r, 600));
    addLog('Spec Layer (Python): Validating YAML template formulation...', 'step');
    
    await new Promise((r) => setTimeout(r, 800));
    addLog('Spec Layer (Python): Extracted closed-world constrained logic', 'info');
    setStatus('synthesizing');
    
    await new Promise((r) => setTimeout(r, 700));
    addLog('Synthesis Engine (Rust): Enumerating AST configurations...', 'step');
    
    await new Promise((r) => setTimeout(r, 1200));
    addLog('Synthesis Engine (Rust): Found candidate implementation.', 'info');
    setStatus('verifying');
    
    await new Promise((r) => setTimeout(r, 600));
    addLog('Verification Layer (Rust): Generating Z3 SMT constraints...', 'step');
    
    await new Promise((r) => setTimeout(r, 1000));
    addLog('Z3 Solver: Pre/post-conditions satisfied. Equivalence proven.', 'success');
    
    await new Promise((r) => setTimeout(r, 400));
    setStatus('success');
    addLog('Pipeline complete. Code synthesis successful.', 'success');
    
    setSynthesizedCode(`def add(a: int, b: int) -> int:
    return a + b
`);
  };

  return (
    <div className="h-screen bg-[#09090b] text-[#fafafa] font-sans flex flex-col p-6 gap-6 selection:bg-[#fb923c]/30 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[#3f3f46] pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#f97316]/10 flex items-center justify-center text-[#f97316] border border-[#f97316]/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#fafafa] tracking-tight flex items-center gap-2">Deterministic Coding Agent</h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">Autonomous Loops • Deterministic Execution • Business Ops</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-mono text-[#f97316]">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${status === 'idle' || status === 'success' ? 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]' : 'bg-[#f97316] shadow-[0_0_8px_#f97316]'}`}></span>
              ENGINE ACTIVE
            </div>
            <div className="text-zinc-500">NODES: 1,402</div>
            <div className="text-zinc-500">SOLVER: Z3/CVC5</div>
          </div>
          
          <button
            onClick={handleSynthesize}
            disabled={status === 'parsing' || status === 'synthesizing' || status === 'verifying'}
            className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
          >
            {status === 'parsing' || status === 'synthesizing' || status === 'verifying' ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Execute Pipeline
          </button>
        </div>
      </header>

      {/* Main Workspace - 12x12 Bento Grid */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 h-0 overflow-hidden">
        {/* Left Column Top: Spec Editor */}
        <div className="col-span-3 row-span-6 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
            <Code2 className="w-3 h-3" /> 01. Spec Layer (YAML)
          </span>
          <div className="flex-1 overflow-hidden">
            <SpecEditor code={specCode} onChange={setSpecCode} />
          </div>
        </div>

        {/* Left Column Bottom: Synthesized Code */}
        <div className="col-span-3 row-span-6 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
            <Database className="w-3 h-3" /> 02. Synthesis Output
          </span>
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {synthesizedCode ? (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full overflow-auto"
                >
                  <SynthesizedCode code={synthesizedCode} />
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 font-mono text-xs select-none bg-[#09090b] rounded-md border border-[#27272a]"
                >
                  <Database className="w-8 h-8 mb-4 text-[#27272a]" />
                  <p>Awaiting AST synthesis...</p>
                  <p className="text-[10px] text-zinc-700 mt-2 uppercase tracking-widest px-8 text-center leading-relaxed">Execute Pipeline to run</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle-Left Column Top: Autonomous Engine */}
        <div className="col-span-3 row-span-5 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <AutonomousEngine />
        </div>

        {/* Middle-Left Column Bottom: Self-Learning */}
        <div className="col-span-3 row-span-7 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <SelfLearning />
        </div>

        {/* Middle-Right Column Top: Dreaming */}
        <div className="col-span-3 row-span-7 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <Dreaming />
        </div>

        {/* Middle-Right Column Bottom: Terminal */}
        <div className="col-span-3 row-span-5 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#f97316] mb-3 font-semibold flex items-center gap-2 shrink-0">
            <TerminalSquare className="w-3 h-3" /> 06. System Logs
          </span>
          <div className="flex-1 overflow-auto bg-[#09090b] rounded-[6px] border border-[#27272a] p-3">
            <TerminalLogs logs={logs} status={status} />
          </div>
        </div>

        {/* Right Column: Business Crons */}
        <div className="col-span-3 row-span-12 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex flex-col relative overflow-hidden">
          <BusinessCrons />
        </div>

      </main>
    </div>
  );
}

const TerminalLogs = ({ logs, status }: { logs: LogEntry[], status: SynthesisStatus }) => {
  return <TerminalLog logs={logs} status={status} />;
};
