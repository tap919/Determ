import { generateId } from './utils';

export interface TestCase {
  id: string;
  inputs: string; // JSON array string e.g., "[1, 2]"
  expected: string; // JSON string e.g., "3"
}

export interface VerificationResult {
  success: boolean;
  passed: number;
  total: number;
  errorTrace?: string;
  details: any[];
}

export async function runVerification(code: string, testCases: TestCase[]): Promise<VerificationResult> {
  const details = [];
  let passed = 0;
  let errorTrace: string | undefined = undefined;

  for (const tc of testCases) {
    try {
      // Parse inputs and expected
      const inputArgs = JSON.parse(tc.inputs);
      const expectedVal = JSON.parse(tc.expected);

      // Wrapper to extract the function safely without eval clashing
      const wrappedCode = `
        return (function() {
          ${code}
          // Find the exported or first defined function
          const codeStr = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
          const match = codeStr.match(/function\\s+([a-zA-Z0-9_]+)/);
          const constMatch = codeStr.match(/(?:const|let|var)\\s+([a-zA-Z0-9_]+)\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>)/);
          const name = match ? match[1] : (constMatch ? constMatch[1] : null);
          
          if (name) return eval(name);
          return eval('(' + codeStr + ')');
        })();
      `;
      
      const extractedFn = new Function(wrappedCode)();
      if (typeof extractedFn !== 'function') {
        throw new Error('Could not identify a callable function in the generated code.');
      }

      const result = extractedFn(...inputArgs);
      
      // Simple deep equality check
      if (JSON.stringify(result) === JSON.stringify(expectedVal)) {
        passed++;
        details.push({ id: tc.id, success: true, actual: JSON.stringify(result) });
      } else {
        const errStr = `Test Failed: Input: ${tc.inputs}. Expected: ${tc.expected}, but got: ${JSON.stringify(result)}`;
        details.push({ id: tc.id, success: false, error: errStr });
        if (!errorTrace) errorTrace = errStr;
      }
    } catch (e: any) {
      const errStr = `Execution Error on Input ${tc.inputs}: ${e.message}`;
      details.push({ id: tc.id, success: false, error: errStr });
      if (!errorTrace) errorTrace = errStr;
    }
  }

  return {
    success: passed === testCases.length && testCases.length > 0,
    passed,
    total: testCases.length,
    errorTrace,
    details
  };
}
