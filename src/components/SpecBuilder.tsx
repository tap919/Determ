import React, { useState } from 'react';
import { TestCase } from '../types';
import { Plus, Trash2, Copy, AlertTriangle, Wand2, FileJson, CheckCircle2 } from 'lucide-react';
import { generateId } from '../lib/utils';

interface SpecBuilderProps {
  task: string;
  setTask: (v: string) => void;
  rules: string;
  setRules: (v: string) => void;
  testCases: TestCase[];
  setTestCases: (v: TestCase[]) => void;
}

const TEMPLATES = [
  { label: "Array transform", task: "Filter an array of objects to only those with active: true, then return their IDs.", rules: "Pure function. Do not mutate inputs.", inputs: '[[{"id": 1, "active": true}, {"id": 2, "active": false}]]', expected: '[1]' },
  { label: "String parser", task: "Parse a URL query string into an object of key-value pairs.", rules: "Handle URL decoding. Ignore empty keys.", inputs: '["?q=hello&page=2"]', expected: '{"q": "hello", "page": "2"}' },
  { label: "Math helper", task: "Compute the factorial of n.", rules: "Iterative approach preferred. Return 1 for 0.", inputs: '[5]', expected: '120' }
];

export function SpecBuilder({
  task, setTask,
  rules, setRules,
  testCases, setTestCases
}: SpecBuilderProps) {
  
  const [testMode, setTestMode] = useState<'advanced' | 'simple'>('advanced');

  const addTestCase = () => {
    setTestCases([...testCases, { id: generateId(), inputs: '[]', expected: 'null' }]);
  };

  const generateSamples = () => {
    setTestCases([
      ...testCases,
      { id: generateId(), inputs: '[ [1, 2, 3], 2 ]', expected: 'true' },
      { id: generateId(), inputs: '[ [{"a": 1}, {"a": 2}], "a" ]', expected: '[1, 2]' }
    ]);
  };

  const updateTestCase = (id: string, field: 'inputs' | 'expected', value: string) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const duplicateTestCase = (tc: TestCase) => {
    setTestCases([...testCases, { ...tc, id: generateId() }]);
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  const loadTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTask(tmpl.task);
    setRules(tmpl.rules);
    setTestCases([{ id: generateId(), inputs: tmpl.inputs, expected: tmpl.expected }]);
  };

  const isValidJSON = (str: string) => {
    try { JSON.parse(str); return true; } catch { return false; }
  };

  return (
    <div className="flex-1 overflow-auto flex flex-col gap-5 pr-2 pb-2">
      
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {TEMPLATES.map(tmpl => (
           <button 
             key={tmpl.label}
             onClick={() => loadTemplate(tmpl)}
             className="text-[10px] whitespace-nowrap bg-[#18181b] border border-[#27272a] hover:border-[#f97316]/50 text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1.5"
           >
             <Wand2 className="w-3 h-3 text-[#f97316]" /> {tmpl.label}
           </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300">Function Goal / Task</label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Filter an array of objects by a specific property value"
          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-zinc-200 focus:outline-none focus:border-[#f97316]/50 resize-none h-16 placeholder:text-zinc-600 font-sans leading-relaxed transition-colors shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300">Constraints & Rules</label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="e.g., Must use purely functional methods (map/filter/reduce), no mutations."
          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-zinc-200 focus:outline-none focus:border-[#f97316]/50 resize-none h-16 placeholder:text-zinc-600 font-sans leading-relaxed transition-colors shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              Behavioral Assertions
            </label>
            <div className="flex bg-[#09090b] border border-[#27272a] rounded overflow-hidden">
               <button onClick={() => setTestMode('simple')} className={`text-[9px] px-2 py-0.5 transition-colors ${testMode === 'simple' ? 'bg-[#27272a] text-zinc-200' : 'text-zinc-500'}`}>Simple</button>
               <button onClick={() => setTestMode('advanced')} className={`text-[9px] px-2 py-0.5 transition-colors flex items-center gap-1 ${testMode === 'advanced' ? 'bg-[#27272a] text-zinc-200' : 'text-zinc-500'}`}><FileJson className="w-2.5 h-2.5" /> Strict JSON</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={generateSamples}
              className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 bg-[#09090b] hover:bg-[#27272a] px-2 py-1 rounded border border-[#27272a] transition-colors whitespace-nowrap"
            >
              <Wand2 className="w-3 h-3" /> Auto-Generate
            </button>
            <button 
              onClick={addTestCase}
              className="flex items-center gap-1.5 text-[10px] bg-[#27272a] hover:bg-[#3f3f46] text-[#f97316] hover:text-[#fb923c] border border-transparent px-2 py-1 rounded transition-colors font-medium"
            >
              <Plus className="w-3 h-3" /> Add Case
            </button>
          </div>
        </div>

        {testCases.length === 0 && (
           <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 p-3 rounded text-[10px]">
             <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
             <span>Warning: Without test cases, the agent will skip deterministic sandbox verification and cannot self-heal functional logic.</span>
           </div>
        )}
        
        <div className="flex flex-col gap-2.5">
          {testCases.map((tc, idx) => {
            const inputsValid = isValidJSON(tc.inputs);
            const expectedValid = isValidJSON(tc.expected);
            
            return (
              <div key={tc.id} className="flex gap-2 items-start bg-[#09090b] p-2.5 rounded-lg border border-[#27272a] focus-within:border-[#f97316]/50 transition-colors shadow-inner group">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                     <span className={`text-[9px] font-mono w-14 shrink-0 ${inputsValid ? 'text-zinc-500' : 'text-red-400'}`}>INPUTS</span>
                     <input
                       value={tc.inputs}
                       onChange={(e) => updateTestCase(tc.id, 'inputs', e.target.value)}
                       placeholder='[ [1,2,3], "target" ]'
                       className="flex-1 bg-transparent border-b border-[#27272a] focus:border-[#f97316]/50 outline-none text-[11px] font-mono py-1 text-zinc-300 placeholder:text-zinc-600 transition-colors"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`text-[9px] font-mono w-14 shrink-0 ${expectedValid ? 'text-[#22c55e]' : 'text-red-400'}`}>EXPECTS</span>
                     <input
                       value={tc.expected}
                       onChange={(e) => updateTestCase(tc.id, 'expected', e.target.value)}
                       placeholder='{"result": true}'
                       className="flex-1 bg-transparent border-b border-[#27272a] focus:border-[#f97316]/50 outline-none text-[11px] font-mono py-1 text-zinc-300 placeholder:text-zinc-600 transition-colors"
                     />
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => duplicateTestCase(tc)} className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-[#27272a] rounded transition-colors" title="Duplicate Case">
                     <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeTestCase(tc.id)} className="p-1 text-zinc-500 hover:text-red-400 hover:bg-[#27272a] rounded transition-colors" title="Delete Case">
                     <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
