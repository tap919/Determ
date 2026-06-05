import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as acorn from "acorn";
import seedrandom from "seedrandom";
import vm from "vm";
import util from "util";

export const app = express();
app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/verify", async (req, res) => {
  try {
    const { code, testCases } = req.body;
    if (!code || !Array.isArray(testCases)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    let ast;
    try {
      ast = acorn.parse(code, { ecmaVersion: 2024, sourceType: "module" });
    } catch (err: any) {
      return res.status(400).json({ error: `Parse error: ${err.message}` });
    }

    let fnName = null;
    for (const node of ast.body as any[]) {
      if (node.type === "ExportNamedDeclaration" && node.declaration && node.declaration.type === "FunctionDeclaration" && node.declaration.id) {
        fnName = node.declaration.id.name;
        break;
      } else if (node.type === "FunctionDeclaration" && node.id) {
        // Fallback for non-exported function
        fnName = node.id.name;
        break;
      }
    }

    if (!fnName) {
      return res.status(400).json({ error: "Could not identify a callable function declaration in the generated code." });
    }

    const details = [];
    let passed = 0;
    let errorTrace: string | undefined = undefined;

    for (const tc of testCases) {
      try {
        const inputArgs = JSON.parse(tc.inputs);
        const expectedVal = JSON.parse(tc.expected);

        // Fresh sandbox for each test case
        const prng = seedrandom('determ-seed');
        const boxMath = Object.create(Math);
        boxMath.random = () => prng();
        
        const sandbox: any = {
           Math: boxMath,
           console: { log: () => {} }, // mock console if code logs
           inputArgs
        };
        const context = vm.createContext(sandbox);

        // Strip export keyword to run in traditional VM context without experimental modules
        const safeCode = code.replace(/^\s*export\s+/, '');

        // Compile the code into the context
        const script = new vm.Script(`${safeCode}\n${fnName}(...inputArgs);`);

        // Run with timeout to prevent infinite loops
        const result = script.runInContext(context, { timeout: 1000 });

        if (util.isDeepStrictEqual(result, expectedVal)) {
          passed++;
          details.push({ id: tc.id, success: true, actual: JSON.stringify(result) });
        } else {
          const errStr = `Test Failed: Input: ${tc.inputs}. Expected: ${tc.expected}, but got: ${JSON.stringify(result)}`;
          details.push({ id: tc.id, success: false, error: errStr });
          if (!errorTrace) errorTrace = errStr;
        }
      } catch (e: any) {
        let errStr = `Execution Error on Input ${tc.inputs}: ${e.message}`;
        if (e.message.includes('Script execution timed out')) {
          errStr = `Execution Timeout on Input ${tc.inputs}: Possible infinite loop detected.`;
        }
        details.push({ id: tc.id, success: false, error: errStr });
        if (!errorTrace) errorTrace = errStr;
      }
    }

    res.json({
      success: passed === testCases.length && testCases.length > 0,
      passed,
      total: testCases.length,
      errorTrace,
      details
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Verification failed." });
  }
});

app.post("/api/synthesize", async (req, res) => {
  try {
    const { spec, errorTrace, knowledgeBase } = req.body;
    
    if (!spec) {
      return res.status(400).json({ error: "No specification provided." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        code: `function generatedFunction() {\n  return "Fallback mode - missing API key";\n}`,
        logs: [
          "Fallback mode triggered due to missing API key.",
          "Generated default stub."
        ]
      });
    }

    const { Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a deterministic coding agent synthesis engine.
Your task is to synthesize a simple program represented as JSON Intermediate Representation (IR), based on the provided specification.

${knowledgeBase && knowledgeBase.length > 0 ? `### PREVIOUSLY LEARNED AXIOMS & PATTERNS:\n${knowledgeBase}\n\n` : ''}
${errorTrace ? `### CORRECTION REQUIRED:\nYour previous attempt failed with the following error/trace:\n${errorTrace}\nYou MUST fix this error in your new implementation.\n\n` : ''}

### SPECIFICATION:
${spec}

Output ONLY the JSON IR matching the strict schema.
Always prefer local variables, loops, arrays, and basic mathematical operations.`;

    const irSchema = {
      type: Type.OBJECT,
      properties: {
        functionName: { type: Type.STRING },
        parameters: { type: Type.ARRAY, items: { type: Type.STRING } },
        operations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kind: { type: Type.STRING, description: "One of: let, const, assign, if, end_if, for, end_for, push, return, expr" },
              target: { type: Type.STRING, description: "The variable being declared or operated on (can be empty)" },
              value: { type: Type.STRING, description: "RHS value, condition, array variable (for push), or iterables" }
            },
            required: ["kind", "value"]
          }
        }
      },
      required: ["functionName", "parameters", "operations"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: irSchema
      }
    });

    let ir;
    try {
      ir = JSON.parse(response.text || "{}");
    } catch (e: any) {
      return res.status(502).json({ error: `Model returned invalid JSON: ${response.text?.substring(0, 100)}` });
    }

    if (!ir.functionName || !Array.isArray(ir.operations)) {
       return res.status(502).json({ error: 'Model returned malformed IR structure' });
    }
    
    // Phase 2: Deterministic Compiler (IR -> JS)
    let code = `export function ${ir.functionName || 'synthesized'}(${(ir.parameters || []).join(", ")}) {\n`;
    let indent = "  ";
    
    for (const op of ir.operations || []) {
       if (op.kind === "end_if" || op.kind === "end_for") {
         indent = indent.slice(0, Math.max(0, indent.length - 2));
       }
       
       switch (op.kind) {
         case "let": code += `${indent}let ${op.target} = ${op.value};\n`; break;
         case "const": code += `${indent}const ${op.target} = ${op.value};\n`; break;
         case "assign": code += `${indent}${op.target} = ${op.value};\n`; break;
         case "push": code += `${indent}${op.target}.push(${op.value});\n`; break;
         case "if": 
           code += `${indent}if (${op.value}) {\n`; 
           indent += "  ";
           break;
         case "end_if": 
           code += `${indent}}\n`; 
           break;
         case "for": 
           code += `${indent}for (${op.value}) {\n`; 
           indent += "  ";
           break;
         case "end_for": 
           code += `${indent}}\n`; 
           break;
         case "return": code += `${indent}return ${op.value};\n`; break;
         case "expr": code += `${indent}${op.value};\n`; break;
         default: code += `${indent}// compiler ignored: ${op.kind}\n`;
       }
    }
    code += `}`;

    res.json({
      code: code,
      logs: [
        "Phase 1: Generated Schema-constrained JSON IR.",
        "Phase 2: Compiled IR to JavaScript deterministically.",
        errorTrace ? "Phase Heal: Applied self-healing correction." : "Phase Init: Initial synthesis successful."
      ]
    });
  } catch (error: any) {
    console.error("Synthesis error:", error);
    res.status(500).json({ error: error?.message || "Failed to synthesize code." });
  }
});


async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VITEST) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" && !process.env.VITEST) {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  if (!process.env.VITEST) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
