# YAML to Code Synthesizer

A deterministic coding agent interface that converts formal YAML specifications into working Python code, powered by Gemini 2.5 Flash SMT solver simulation.

## Overview

This project provides a clean, single-screen bento-grid dashboard where you can define Python functions using a formal YAML specification. The YAML spec is dispatched to a custom Node.js/Express server, validated, and translated into an AST to synthesize the final Python output.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Express, js-yaml, @google/genai

## Running Locally

1. Create a `.env` file by copying `.env.example` and adding your Gemini API key.
2. Run `npm run dev`
3. Open http://localhost:3000
