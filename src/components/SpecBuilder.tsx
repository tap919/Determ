import React from 'react';
import { TestCase } from '../lib/agent';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '../lib/utils';

interface SpecBuilderProps {
  task: string;
  setTask: (v: string) => void;
  rules: string;
  setRules: (v: string) => void;
  testCases: TestCase[];
  setTestCases: (v: TestCase[]) => void;
}

export function SpecBuilder({
  task, setTask,
  rules, setRules,
  testCases, setTestCases
}: SpecBuilderProps) {
  
  const addTestCase = () => {
    setTestCases([...testCases, { id: generateId(), inputs: '[]', expected: 'null' }]);
  };

  const updateTestCase = (id: string, field: 'inputs' | 'expected', value: string) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  return (
    <div className="flex-1 overflow-auto flex flex-col gap-5 pr-2 pb-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300">Goal / Task</label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Filter an array of objects by a specific property value"
          className="w-full bg-[#09090b] border border-[#27272a] rounded p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#f97316]/50 resize-none h-16 placeholder:text-zinc-600 font-sans"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300">Constraints & Rules</label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="e.g., Must use purely functional methods (map/filter/reduce), no mutations."
          className="w-full bg-[#09090b] border border-[#27272a] rounded p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#f97316]/50 resize-none h-16 placeholder:text-zinc-600 font-sans"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            Verification Assertions (Strict JSON)
          </label>
          <button 
            onClick={addTestCase}
            className="flex items-center gap-1 text-[10px] bg-[#27272a] hover:bg-[#3f3f46] text-white px-2 py-1 rounded transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Case
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {testCases.map((tc, idx) => (
            <div key={tc.id} className="flex gap-2 items-start bg-[#09090b] p-2 rounded border border-[#27272a]">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-zinc-500 font-mono w-14">INPUTS</span>
                   <input
                     value={tc.inputs}
                     onChange={(e) => updateTestCase(tc.id, 'inputs', e.target.value)}
                     placeholder='[ [1,2,3], "target" ]'
                     className="flex-1 bg-transparent border-b border-[#27272a] focus:border-[#f97316]/50 outline-none text-xs font-mono py-1 text-zinc-300"
                   />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-[#22c55e] font-mono w-14">EXPECTS</span>
                   <input
                     value={tc.expected}
                     onChange={(e) => updateTestCase(tc.id, 'expected', e.target.value)}
                     placeholder='{"result": true}'
                     className="flex-1 bg-transparent border-b border-[#27272a] focus:border-[#f97316]/50 outline-none text-xs font-mono py-1 text-zinc-300"
                   />
                </div>
              </div>
              <button onClick={() => removeTestCase(tc.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded transition-colors">
                 <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {testCases.length === 0 && (
            <div className="text-xs text-zinc-600 font-mono italic p-4 text-center border border-dashed border-[#27272a] rounded">
              No verification cases. Agent will generate code but cannot deterministically verify it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
