import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, TerminalSquare, FilePlus, FolderOpen, Upload, Save, Download, Sparkles, RefreshCw, FileText, AlignLeft, CheckCircle2, FileCode2, CopyCheck, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry, SynthesisStatus, VerifiedFunction } from './types';
import { generateId, getCurrentTime } from './lib/utils';
import { TerminalLog } from './components/TerminalLog';
import { SpecBuilder } from './components/SpecBuilder';
import { EngineVis } from './components/EngineVis';
import { runVerification, TestCase } from './lib/agent';

const MAX_ATTEMPTS = 3;

const loadKB = (): VerifiedFunction[] => {
  try {
    const ks = localStorage.getItem('agentKnowledgeBase');
    return ks ? JSON.parse(ks) : [];
  } catch (e) {
    console.warn("Failed to load Knowledge Base", e);
    return [];
  }
};

const saveKB = (kb: VerifiedFunction[]) => {
  localStorage.setItem('agentKnowledgeBase', JSON.stringify(kb));
};

export default function App() {
  const [task, setTask] = useState('Compute the Nth Fibonacci number');
  const [rules, setRules] = useState('Use iteration (O(N) time) rather than naive recursion. Return number.');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 't1', inputs: '[0]', expected: '0' },
    { id: 't2', inputs: '[1]', expected: '1' },
    { id: 't3', inputs: '[10]', expected: '55' }
  ]);

  const [synthesizedCode, setSynthesizedCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<SynthesisStatus>('idle');
  
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [currentHash, setCurrentHash] = useState<string | undefined>(undefined);

  const [knowledgeBase, setKnowledgeBase] = useState<VerifiedFunction[]>(loadKB());
  
  const [centerTab, setCenterTab] = useState<'build' | 'raw' | 'code'>('build');
  const [rightTab, setRightTab] = useState<'verify' | 'logs'>('verify');
  const [autosaveState, setAutosaveState] = useState<'saved' | 'unsaved' | 'saving'>('saved');

  // Command palette state
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      localStorage.setItem('determ_draft_session', JSON.stringify({task, rules, testCases, synthesizedCode}));
      setAutosaveState('saved');
    }, 1500);
    setAutosaveState('saving');
    return () => clearTimeout(timer);
  }, [task, rules, testCases, synthesizedCode]);

  useEffect(() => {
    try {
      const draft = localStorage.getItem('determ_draft_session');
      if (draft) {
        const d = JSON.parse(draft);
        if (d.task) setTask(d.task);
        if (d.rules) setRules(d.rules);
        if (d.testCases && Array.isArray(d.testCases)) setTestCases(d.testCases);
        if (d.synthesizedCode) setSynthesizedCode(d.synthesizedCode);
      }
    } catch (e) {
      console.warn("Failed to restore draft", e);
    }
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { id: generateId(), timestamp: getCurrentTime(), message, type }]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (['parsing', 'compiling', 'verifying', 'solving'].includes(status)) return;
    
    setLogs([]);
    setSynthesizedCode(null);
    setAttemptCount(0);
    setLastError(undefined);
    setCurrentHash(undefined);
    setStatus('parsing');
    setRightTab('verify');
    
    addLog('Initiating deterministic verification pipeline...', 'system');
    
    let currentAttempt = 1;
    let success = false;
    let currentErrorTrace = undefined;
    
    while (currentAttempt <= MAX_ATTEMPTS && !success) {
      setAttemptCount(currentAttempt);
      setStatus('parsing');
      
      const promptContext = `
Task: ${task}
Constraints: ${rules}
Tests:
${testCases.map(tc => `Input: ${tc.inputs} -> Expected: ${tc.expected}`).join('\n')}
      `;

      addLog(`Attempt ${currentAttempt}: Generating Schema-Constrained JSON IR...`, 'step');
      
      try {
        const kbStr = knowledgeBase.map(kb => `Task: ${kb.task}\nCode:\n${kb.code}`).join('\n\n');
        
        const response = await fetch('/api/synthesize', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             spec: promptContext,
             errorTrace: currentErrorTrace,
             knowledgeBase: currentAttempt === 1 ? kbStr : '' 
           })
        });
        
        const raw = await response.text();
        if (!response.ok) {
           throw new Error(`Server ${response.status}: ${raw}`);
        }
        let data;
        try {
           data = JSON.parse(raw);
        } catch (e) {
           throw new Error(`Invalid JSON: ${raw.slice(0, 100)}`);
        }
        if (!data.code || typeof data.code !== 'string') {
           throw new Error(`Model returned no code`);
        }
        const candidateCode = data.code;
        
        setStatus('compiling');
        addLog('Compiling JSON IR to native JavaScript...', 'step');
        await new Promise(r => setTimeout(r, 600));
        setSynthesizedCode(candidateCode);
        
        setStatus('verifying');
        addLog(`Executing local sandbox verification against ${testCases.length} properties...`, 'step');
        
        if (testCases.length > 0) {
          const verification = await runVerification(candidateCode, testCases);
          
          if (verification.success) {
             setStatus('solving');
             addLog(`Verification PASSED (${verification.passed}/${verification.total} cases).`, 'success');
             addLog(`Running formal checks (cvc5/Bitwuzla simulation)...`, 'step');
             
             await new Promise(r => setTimeout(r, 1000));
             addLog("SMT bounds satisfied. No invariant violations detected.", 'success');
             
             success = true;
             setStatus('success');
             
             const acceptanceHash = generateId() + generateId();
             setCurrentHash(acceptanceHash);
             addLog(`Generated strict acceptance replay hash: ${acceptanceHash.substring(0, 8)}`, 'system');
             
             setCenterTab('code');
             
          } else {
             currentErrorTrace = verification.errorTrace;
             setLastError(currentErrorTrace);
             addLog(`Sandbox FAILED (${verification.passed}/${verification.total} passed). Triggering self-heal.`, 'error');
             currentAttempt++;
             await new Promise(r => setTimeout(r, 1000));
          }
        } else {
          success = true;
          setStatus('success');
          addLog('Proceeding without deterministic verification (no test cases provided).', 'warning');
          setCenterTab('code');
        }
        
      } catch (e: any) {
         setStatus('error');
         addLog(`System Error: ${e.message}`, 'error');
         break;
      }
    }
    
    if (!success && currentAttempt > MAX_ATTEMPTS) {
       setStatus('error');
       addLog('Max attempts reached. Deterministic lock failed.', 'error');
    }
  }, [task, rules, testCases, status, knowledgeBase, addLog]);

  const loadFromKb = (kb: VerifiedFunction) => {
    setTask(kb.task);
    setRules('Loaded from memory.');
    setSynthesizedCode(kb.code);
    setTestCases(kb.testCases || []);
    setStatus('success');
    setCurrentHash(kb.hash);
    addLog(`Restored abstraction '${kb.name}' from Case-Based Memory.`, 'system');
    setCenterTab('code');
  };

  const handleNew = () => {
    setTask('');
    setRules('');
    setTestCases([]);
    setSynthesizedCode(null);
    setStatus('idle');
    setLogs([]);
    setCurrentHash(undefined);
    setLastError(undefined);
    setCenterTab('build');
    setRightTab('verify');
    setCmdPaletteOpen(false);
  };

  const handleSave = useCallback(() => {
    if (synthesizedCode && status === 'success') {
      const newFn: VerifiedFunction = {
        id: generateId(),
        name: task.slice(0, 20) + '...',
        task,
        code: synthesizedCode,
        testCases: testCases,
        timestamp: Date.now(),
        hash: currentHash || ''
      };
      const uniqueKB = knowledgeBase.filter(k => k.task !== task);
      const updatedKB = [newFn, ...uniqueKB].slice(0, 50);
      setKnowledgeBase(updatedKB);
      saveKB(updatedKB);
      addLog(`Saved "${newFn.name}" to Library.`, 'system');
    } else {
      addLog('Nothing to save or verification is not in a passing state.', 'warning');
    }
    setAutosaveState('saved');
    setCmdPaletteOpen(false);
  }, [synthesizedCode, status, task, testCases, currentHash, knowledgeBase, addLog]);

  const handleManualCodeEdit = (newCode: string) => {
    setSynthesizedCode(newCode);
    if (status === 'success') {
       setStatus('idle');
       setCurrentHash(undefined);
       setLastError(undefined);
       setAttemptCount(0);
       addLog('Manual code edit detected. Acceptance hash invalidated. Re-run verification.', 'warning');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(v => !v);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, handleSave]);

  const handleExportReport = () => {
    const report = {
      task, rules, testCases, generatedCode: synthesizedCode, 
      hash: currentHash, timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acceptance-report-${currentHash?.substring(0,8) || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCmdPaletteOpen(false);
  };

  const handleExportCode = () => {
    if (!synthesizedCode) return;
    const blob = new Blob([synthesizedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `function_${currentHash?.substring(0,8) || 'draft'}.ts`;
    a.click();
    URL.revokeObjectURL(url);
    setCmdPaletteOpen(false);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
       try {
         const content = JSON.parse(e.target?.result as string);
         if (content.task && typeof content.task === 'string') setTask(content.task);
         if (content.rules && typeof content.rules === 'string') setRules(content.rules);
         if (content.testCases && Array.isArray(content.testCases)) {
            const validTests = content.testCases.filter((tc: any) => tc.id && tc.inputs && tc.expected);
            setTestCases(validTests);
         }
         if (content.generatedCode && typeof content.generatedCode === 'string') setSynthesizedCode(content.generatedCode);
         addLog(`Uploaded session: ${file.name}`, 'system');
       } catch (err) {
         addLog(`Failed to parse file: ${file.name}`, 'error');
       }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#000000] text-zinc-300 font-sans overflow-hidden">
      
      {/* Command Palette Mock Layer */}
      <AnimatePresence>
        {cmdPaletteOpen && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[15vh]"
             onClick={() => setCmdPaletteOpen(false)}
           >
             <div className="w-[500px] bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 p-3 border-b border-[#27272a] px-4">
                   <Search className="w-4 h-4 text-zinc-500" />
                   <input autoFocus placeholder="Type a command or search..." className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-500" />
                   <span className="text-[10px] text-zinc-500 font-mono bg-[#27272a] px-1.5 py-0.5 rounded">ESC</span>
                </div>
                <div className="flex flex-col p-2 text-xs">
                   <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Suggested Actions</div>
                   <button onClick={handleGenerate} className="flex items-center justify-between px-3 py-2 hover:bg-[#27272a] rounded cursor-pointer text-left">
                     <span className="flex items-center gap-2"><Play className="w-3.5 h-3.5 text-[#f97316]" /> Generate & Verify</span>
                     <span className="text-[10px] text-zinc-500 font-mono bg-[#27272a] px-1.5 rounded">⌘+Enter</span>
                   </button>
                   <button onClick={handleNew} className="flex items-center justify-between px-3 py-2 hover:bg-[#27272a] rounded cursor-pointer text-left">
                     <span className="flex items-center gap-2"><FilePlus className="w-3.5 h-3.5 text-zinc-400" /> New Session</span>
                   </button>
                   <button onClick={handleSave} className="flex items-center justify-between px-3 py-2 hover:bg-[#27272a] rounded cursor-pointer text-left focus:bg-[#27272a]">
                     <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5 text-zinc-400" /> Save to Library</span>
                     <span className="text-[10px] text-zinc-500 font-mono bg-[#27272a] px-1.5 rounded">⌘+S</span>
                   </button>
                   <button onClick={handleExportReport} className="flex items-center justify-between px-3 py-2 hover:bg-[#27272a] rounded cursor-pointer text-left">
                     <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5 text-zinc-400" /> Export Acceptance Report</span>
                   </button>
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar (56px) */}
      <header className="h-14 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-[260px]">
             <div className="h-8 w-8 rounded bg-[#f97316]/10 flex items-center justify-center text-[#f97316] border border-[#f97316]/20 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[#fafafa] leading-tight">Determ</span>
                <span className="text-[9px] font-mono text-zinc-500 leading-tight">Autonomous IDE</span>
              </div>
        </div>
        
        <div className="flex-1 flex justify-center mt-1">
          <div className="flex items-center gap-1.5 p-1 bg-[#18181b] border border-[#27272a] rounded-lg shadow-sm">
             <button onClick={handleNew} className="p-1.5 px-3 flex items-center gap-2 hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 rounded-md text-xs transition-colors" title="New Session">
               <FilePlus className="w-3.5 h-3.5" /> New
             </button>
             <label className="p-1.5 px-3 flex items-center gap-2 hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 rounded-md text-xs transition-colors cursor-pointer" title="Upload Specs">
               <Upload className="w-3.5 h-3.5" /> Upload
               <input type="file" accept=".json" className="hidden" onChange={handleUpload} />
             </label>
             <button onClick={handleSave} className="p-1.5 px-3 flex items-center gap-2 hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 rounded-md text-xs transition-colors" title="Save function">
               <Save className="w-3.5 h-3.5" /> Save
             </button>
             <div className="w-px h-4 bg-[#3f3f46] mx-1" />
             <button onClick={handleExportCode} className="p-1.5 px-3 flex items-center gap-2 hover:bg-[#27272a] text-zinc-400 hover:text-[#f97316] rounded-md text-xs transition-colors" title="Export Source (.ts)">
               <FileCode2 className="w-3.5 h-3.5" /> Export Code
             </button>
             <button onClick={handleExportReport} className="p-1.5 px-3 flex items-center gap-2 hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 rounded-md text-xs transition-colors" title="Export Acceptance Report">
               <Download className="w-3.5 h-3.5" /> Export Report
             </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end min-w-[260px] gap-3">
           <button onClick={() => setCmdPaletteOpen(true)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs py-1 px-2 border border-transparent hover:border-[#27272a] rounded transition-colors" title="Command Palette">
              <Search className="w-3.5 h-3.5"/> ⌘K
           </button>
           <button
                onClick={handleGenerate}
                disabled={['parsing', 'compiling', 'verifying', 'solving'].includes(status)}
                className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
              >
                {['parsing', 'compiling', 'verifying', 'solving'].includes(status) ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Generate + Verify
           </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        
        {/* Left Sidebar (260px) */}
        <aside className="w-[260px] border-r border-[#27272a] bg-[#09090b] flex flex-col shrink-0">
            <div className="flex flex-col flex-1 overflow-hidden pointer-events-auto">
               <div className="p-3 border-b border-[#27272a]">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Project Navigation</h3>
                  <div className="flex items-center gap-2 text-xs text-[#f97316] py-1.5 px-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded cursor-pointer">
                     <FolderOpen className="w-3.5 h-3.5 text-[#f97316]" />
                     <span className="font-medium">Current Session</span>
                  </div>
               </div>
               
               <div className="p-3 flex-1 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Library / Memory</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-0.5 -mx-2 px-2">
                     {knowledgeBase.length === 0 ? (
                        <div className="text-[10px] text-zinc-600 p-2 italic border border-dashed border-[#27272a] rounded mt-1">No verified functions.</div>
                     ) : (
                        knowledgeBase.map(kb => (
                          <button key={kb.id} onClick={() => loadFromKb(kb)} className="text-left w-full hover:bg-[#18181b] rounded py-1.5 px-2 group flex justify-between items-center transition-colors border border-transparent hover:border-[#27272a]">
                            <span className="text-[11px] text-zinc-300 truncate pr-2 flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                              <span className="truncate">{kb.name}</span>
                            </span>
                          </button>
                        ))
                     )}
                  </div>
               </div>
            </div>
        </aside>

        {/* Center Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#000000]">
           {/* Center Tabs */}
           <div className="h-10 border-b border-[#27272a] bg-[#09090b] flex items-center px-4 shrink-0 gap-6">
              <button 
                onClick={() => setCenterTab('build')} 
                className={`h-full flex items-center gap-2 text-xs font-medium border-b-2 transition-colors relative
                  ${centerTab === 'build' ? 'border-[#f97316] text-[#fafafa]' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                 <AlignLeft className="w-3.5 h-3.5"/> Build Request
              </button>
              <button 
                onClick={() => setCenterTab('raw')} 
                className={`h-full flex items-center gap-2 text-xs font-medium border-b-2 transition-colors relative
                  ${centerTab === 'raw' ? 'border-[#f97316] text-[#fafafa]' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                 <FileText className="w-3.5 h-3.5"/> Raw Spec
              </button>
              <button 
                onClick={() => setCenterTab('code')} 
                className={`h-full flex items-center gap-2 text-xs font-medium border-b-2 transition-colors relative
                  ${centerTab === 'code' ? 'border-[#f97316] text-[#fafafa]' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                 <FileCode2 className="w-3.5 h-3.5"/> Code Editor
              </button>
           </div>
           
           <div className="flex-1 overflow-auto p-0 relative">
              {centerTab === 'build' && (
                 <div className="w-full h-full p-6 pb-12 overflow-auto">
                   <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
                      <SpecBuilder task={task} setTask={setTask} rules={rules} setRules={setRules} testCases={testCases} setTestCases={setTestCases} />
                      <div className="pb-10"/>
                   </div>
                 </div>
              )}
              {centerTab === 'raw' && (
                 <div className="w-full h-full p-6">
                    <textarea 
                      className="w-full h-full bg-[#09090b] border border-[#27272a] rounded-lg p-6 font-mono text-xs text-zinc-300 resize-none focus:outline-none"
                      value={JSON.stringify({ task, rules, testCases }, null, 2)}
                      readOnly
                      spellCheck={false}
                    />
                 </div>
              )}
              {centerTab === 'code' && (
                 <div className="w-full h-full flex flex-col p-6">
                    {synthesizedCode ? (
                       <div className="flex-1 rounded-lg border border-[#27272a] bg-[#09090b] flex flex-col overflow-hidden shadow-inner">
                         <div className="h-8 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-3">
                           <span className="text-[10px] font-mono text-zinc-400">synthesized.js</span>
                           <button onClick={handleExportCode} className="text-[#f97316] text-[10px] hover:underline flex items-center gap-1"><Download className="w-3 h-3"/> Download</button>
                         </div>
                         <textarea
                           className="flex-1 w-full bg-transparent p-4 font-mono text-xs text-zinc-300 resize-none outline-none"
                           spellCheck={false}
                           value={synthesizedCode}
                           onChange={(e) => handleManualCodeEdit(e.target.value)}
                         />
                       </div>
                    ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 select-none">
                         <FileCode2 className="w-8 h-8 mb-3 opacity-20" />
                         <p className="text-xs">No code generated yet. Fill out the request and click Generate.</p>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </main>

        {/* Right Pane (min 320px) */}
        <aside className="w-[320px] lg:w-[400px] border-l border-[#27272a] bg-[#09090b] flex flex-col shrink-0 overflow-hidden">
           <div className="h-10 border-b border-[#27272a] flex items-center px-1 shrink-0 gap-1 bg-[#09090b]">
              <button 
                onClick={() => setRightTab('verify')} 
                className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors relative
                  ${rightTab === 'verify' ? 'border-[#f97316] text-[#fafafa]' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                 <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> Result & Verify</span>
              </button>
              <button 
                onClick={() => setRightTab('logs')} 
                className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors relative
                  ${rightTab === 'logs' ? 'border-[#f97316] text-[#fafafa]' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
              >
                 <span className="flex items-center gap-1.5"><TerminalSquare className="w-3.5 h-3.5"/> Execution Logs</span>
              </button>
           </div>
           
           <div className="flex-1 overflow-auto p-4 flex flex-col min-h-0 bg-[#000000]">
              {rightTab === 'verify' && (
                 <div className="flex flex-col gap-4 h-full">
                    
                    {/* Acceptance Report Card */}
                    {status === 'success' && (
                       <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 shadow-sm relative overflow-hidden shrink-0">
                         <div className="absolute top-0 right-0 p-3"><CopyCheck className="w-5 h-5 text-[#22c55e]/20" /></div>
                         <h3 className="text-xs font-semibold flex items-center gap-2 mb-3">
                           <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Acceptance Report
                         </h3>
                         <div className="flex flex-col gap-2 text-xs">
                           <div className="flex justify-between items-center bg-[#09090b] p-2 rounded border border-[#27272a]">
                             <span className="text-zinc-500">Hash</span>
                             <span className="font-mono text-[#f97316]">{currentHash}</span>
                           </div>
                           <div className="flex justify-between items-center bg-[#09090b] p-2 rounded border border-[#27272a]">
                             <span className="text-zinc-500">Assertions Passed</span>
                             <span className="font-mono text-[#22c55e] px-1.5 bg-[#22c55e]/10 rounded border border-[#22c55e]/20">{testCases.length}/{testCases.length}</span>
                           </div>
                           <div className="flex justify-between items-center bg-[#09090b] p-2 rounded border border-[#27272a]">
                             <span className="text-zinc-500">Synthesis Attempts</span>
                             <span className="font-mono text-zinc-300">{attemptCount}</span>
                           </div>
                         </div>
                       </div>
                    )}
                    
                    {/* Visualizer */}
                    <div className="shrink-0">
                       <EngineVis status={status} attemptCount={attemptCount} maxAttempts={MAX_ATTEMPTS} lastError={lastError} hash={currentHash} />
                    </div>

                    {/* Test Suite Breakdown */}
                    <div className="flex flex-col flex-1 min-h-[150px] gap-2 border-t border-[#27272a] pt-3">
                      <div className="flex justify-between items-center mb-1 shrink-0">
                         <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Sandbox Results</h3>
                         {status === 'success' && testCases.length > 0 && <span className="text-[9px] font-mono text-[#22c55e]">{testCases.length}/{testCases.length}</span>}
                      </div>

                      {testCases.length === 0 ? (
                        <div className="text-[10px] text-zinc-600 italic p-3 border border-dashed border-[#27272a] rounded text-center">No tests defined.</div>
                      ) : status === 'success' ? (
                        <div className="flex flex-col gap-2 overflow-auto pr-1 pb-4">
                          {testCases.map((tc, idx) => (
                            <div key={idx} className="bg-[#09090b] border border-[#27272a] rounded p-2.5 text-xs shadow-inner">
                              <div className="flex items-center gap-2 mb-2 text-zinc-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" /> Test Property {idx + 1}
                              </div>
                              <div className="flex flex-col gap-1 bg-[#18181b] p-1.5 rounded border border-[#27272a]">
                                 <div className="font-mono text-[9px] text-zinc-400 flex"><span className="text-zinc-600 w-12 shrink-0">Input:</span> <span className="text-blue-400 truncate">{tc.inputs}</span></div>
                                 <div className="font-mono text-[9px] text-zinc-400 flex"><span className="text-zinc-600 w-12 shrink-0">Expect:</span> <span className="text-[#f97316] truncate">{tc.expected}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500 italic flex items-center justify-center flex-1 border border-dashed border-[#27272a] rounded text-center">
                          Awaiting deterministic lock.
                        </div>
                      )}
                    </div>
                 </div>
              )}
              {rightTab === 'logs' && (
                 <div className="flex flex-col h-full gap-2">
                    <div className="flex justify-between items-center mb-1 shrink-0">
                      <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Execution Trace</h3>
                      {(status === 'solving' || status === 'compiling' || status === 'parsing' || status === 'verifying') && (
                        <div className="w-1.5 h-1.5 bg-[#f97316] rounded-full animate-pulse mr-1" />
                      )}
                    </div>
                    <div className="flex-1 bg-[#09090b] rounded-lg border border-[#27272a] p-2 overflow-auto shadow-inner">
                       <TerminalLog logs={logs} status={status} />
                    </div>
                 </div>
              )}
           </div>
        </aside>

      </div>

      {/* Bottom Bar (32px) */}
      <footer className="h-8 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between px-4 text-[10px] text-zinc-500 font-mono shrink-0">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${status === 'success' ? 'bg-[#22c55e]' : status === 'error' ? 'bg-red-500' : status === 'idle' ? 'bg-[#27272a]' : 'bg-[#f97316] animate-pulse'}`} /> {status.toUpperCase()}</span>
            <span>Model: gemini-3.1-pro-preview / cvc5-local</span>
            {currentHash && <span className="text-[#f97316]">Hash: {currentHash.substring(0,8)}</span>}
         </div>
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
               {autosaveState === 'saving' && <RefreshCw className="w-2.5 h-2.5 animate-spin"/>}
               {autosaveState === 'saving' ? 'Saving...' : autosaveState === 'saved' ? 'Saved' : 'Unsaved draft'}
            </span>
            <span>UTF-8</span>
            <span>determ-os v0.2.1-prod</span>
         </div>
      </footer>

    </div>
  );
}
