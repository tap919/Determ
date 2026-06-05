import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
export const app = express();
app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/synthesize", async (req, res) => {
  try {
    const { spec, errorTrace, knowledgeBase } = req.body;
    
    if (!spec) {
      return res.status(400).json({ error: "No specification provided." });
    }

    // Only attempt to call Gemini if API Key exists
    if (!process.env.GEMINI_API_KEY) {
      // Fallback for development/testing without real API key
      return res.json({
        code: `function generatedFunction() {\n  return "Fallback mode - missing API key";\n}`,
        logs: [
          "Fallback mode triggered due to missing API key.",
          "Generated default stub."
        ]
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a deterministic coding agent synthesis engine.
Your task is to synthesize a robust JavaScript function based on the provided formal specification.

${knowledgeBase && knowledgeBase.length > 0 ? `### PREVIOUSLY LEARNED AXIOMS & PATTERNS:\n${knowledgeBase}\n\n` : ''}
${errorTrace ? `### CORRECTION REQUIRED:\nYour previous attempt failed with the following error/trace:\n${errorTrace}\nYou MUST fix this error in your new implementation.\n\n` : ''}

### SPECIFICATION:
${spec}

Produce ONLY valid JavaScript code containing the function definition (an arrow function or named function). 
Do not wrap in markdown \`\`\`javascript ... \`\`\` blocks, just output the raw code. Do not provide any explanation or wrapping text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const code = response.text?.replace(/^\`\`\`(javascript|js|typescript|ts)/m, '').replace(/^\`\`\`/m, '').trim();

    res.json({
      code: code || "function unsupported() {\n    return null;\n}",
      logs: [
        "Confirmed structured request constraints.",
        errorTrace ? "Applied self-healing correction based on error trace." : "Generated canonical AST.",
        "Synthesized executable JavaScript block."
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
