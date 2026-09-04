# DAM AI

A Chrome extension that clarifies your intent before sending prompts to ChatGPT or Claude. It asks smart questions, then rewrites your vague prompt into a detailed, structured one.

## How it works

1. Type a rough prompt in ChatGPT or Claude
2. Press Enter or click Send
3. DAM AI intercepts it and asks clarification questions
4. Answer them (single-select auto-advances, multi-select has Submit)
5. Your prompt is rewritten with all your answers incorporated
6. Review the enhanced prompt, then send it

## Features

- Works on ChatGPT and Claude
- Smart questions based on your prompt's domain (code, writing, research, etc.)
- Single-select questions auto-advance on click
- Multi-select and text questions with Submit button
- Back button to revise previous answers
- Blurred backdrop modal with verbose loading states
- Groq (free, fast) and Gemini provider support
- Defaults to Groq with no setup required
- Dark theme matching ChatGPT/Claude UI

## Setup

1. Download or clone this repo
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `dist` folder
5. Done — the extension auto-configures with a free Groq API key

## Changing API key / provider

Click the ⚙ gear button next to the toggle on ChatGPT or Claude to open settings.

## Tech

- Chrome Extension Manifest V3
- Vanilla DOM (no React in content script)
- Groq API (OpenAI-compatible REST)
- Gemini API (`@google/genai` SDK)
- Built with Vite + TypeScript
