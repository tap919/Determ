# Deterministic Verification Agent

This project implements a progressive, verifiable coding agent. Rather than just wrapping an LLM behind a text box, it creates an **autonomous execution loop** directly in the browser.

## How It Works (No "Fake Agent" Theater)
1. **Spec & Assertions**: You define a strict functional goal, along with strict input/output JSON assertions. 
2. **Synthesis**: The node server acts as the dispatcher, sending your constraints (and any learned context) to Gemini 2.5 Flash to synthesize executable JavaScript.
3. **Deterministic Eval**: The React frontend securely evaluates the generated AST against your test cases using the `new Function` sandbox.
4. **Self-Healing Loop**: If assertions fail, the execution trace is fed *back* into the context window, and Gemini is forced to iterate and fix the bug (up to 3 times).
5. **Case-Based Learner (Knowledge Base)**: Once an implementation passes all tests perfectly, it is permanently saved to local storage. This context is injected into future prompts, allowing the agent to continuously "learn" successful design patterns and abstractions.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Verification**: Strict JSON evaluation sandbox (`src/lib/agent.ts`)
- **Backend**: Express, @google/genai (Gemini 2.5 Flash)

## Real Utility
By forcing the LLM to write code that actually runs and passes explicit assertions before it is presented to the user, this tool moves beyond generating "vibes" and towards verifiable engineering.
