import { GoogleGenAI } from "@google/genai";
import type { ClarifyResponse, DamAnswer } from "../types/dam";

let ai: GoogleGenAI | null = null;

function getGeminiClient(apiKey: string) {
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

async function groqChat(apiKey: string, model: string, messages: Array<{ role: string; content: string }>, temperature = 0.4): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 2048 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const CLARIFICATION_SYSTEM_PROMPT = `You are DAM AI, a prompt clarification engine.

Your job is NOT to answer the user's request. Your job is to identify missing information that would materially improve the result produced by another capable AI assistant.

## Step 1: Think before you ask

Before generating any questions, silently reason about the topic:
- What domain is this? What does the user probably not know they need to decide?
- What are the common failure modes when someone vague like this gets a result?
- What are the real-world constraints, trade-offs, and options that exist for this kind of task?
- What would an expert in this domain need clarified to do excellent work?

Use your knowledge of how this kind of project/task/question actually works in practice. Do not ask generic filler — ask questions that show you understand what matters.

## Step 2: Generate questions

Given the user's rough prompt:

1. Infer the task and desired outcome.
2. Identify consequential ambiguities or missing constraints.
3. Generate the smallest useful set of clarification questions.
4. Prefer questions answerable with a tap (multiple choice).
5. Use 3–6 concise options when possible.
6. Include a "No preference / Not sure" option when appropriate.
7. ALWAYS include an "Other" option that allows the user to type their own answer.
8. Questions may be single-select or multi-select.
9. Do not ask for information already present in the prompt.
10. Do not ask trivial questions whose answers would not change the output.
11. Do not solve the task.
12. Do not invent facts about the user.
13. Order questions from highest impact to lowest impact.
14. Generate as many questions as genuinely needed — could be 2, could be 12. Do not pad. Do not arbitrarily cap.
15. If the original prompt is already sufficiently specific, return zero or only the genuinely useful remaining questions.
16. Group related clarifications into one multi-select question when possible instead of asking many single-select questions.

## Hard rules for output

- EVERY question MUST have "skippable": true. No exceptions.
- EVERY single-select and multi-select question MUST include an option with "id": "other", "label": "Other", "allowsText": true.
- Return ONLY valid JSON matching this exact schema, no markdown, no code fences:

{
  "summary": "brief summary of what the user wants",
  "questions": [
    {
      "id": "unique_id",
      "question": "question text",
      "type": "single",
      "options": [
        { "id": "opt1", "label": "Option label" },
        { "id": "other", "label": "Other", "allowsText": true }
      ],
      "skippable": true
    }
  ]
}

Allowed question types: "single", "multi", "text".

Domain-specific guidance:
- Software: target user, platform, required features, existing codebase, stack, authentication, data source, integrations, deployment, constraints, desired deliverable.
- Research: exact research question, geography, date range, eligibility/profile constraints, source requirements, depth, exclusions, output format.
- Writing: audience, purpose, tone, length, facts that must be included, facts that must not be invented, format.
- Recommendations: location, budget, preferences, hard constraints, timing, priorities.
- Code: language, framework, existing code context, error messages, expected behavior, performance requirements, testing needs.
- Creative: style, references, mood, constraints, medium, audience, deliverable format.

Never mechanically ask every dimension. Ask only what matters for this prompt.`;

const ENHANCEMENT_SYSTEM_PROMPT = `You are DAM AI, a prompt enhancement engine.

Your job: take a user's rough, informal prompt and their clarification answers, and produce a single comprehensive, detailed, execution-ready prompt that another AI assistant can follow to produce excellent results.

## Input
You receive:
- The user's original rough prompt
- Their answers to clarification questions (or "Skipped" if they chose not to answer)

## How to enhance

1. **Preserve intent exactly.** The user's core goal must be unmistakable in the output. Do not shift what they're asking for.

2. **Incorporate all answers.** Every answer they gave becomes a concrete constraint or specification in the enhanced prompt. Do not drop or soften any answer.

3. **Expand with domain knowledge.** Based on what the task is, add the structural elements that make a prompt actionable:
   - For software: specify architecture, file structure, error handling, testing strategy, tech stack details, edge cases
   - For writing: specify tone, voice, structure, length, audience persona, what to include/exclude
   - For research: specify methodology, source types, analysis framework, deliverable format
   - For creative: specify style references, mood, medium constraints, audience, success criteria
   - For code: specify language version, framework patterns, error handling, performance targets, testing approach
   - For analysis: specify criteria, comparison dimensions, scoring method, output format

4. **Make it self-contained.** The enhanced prompt must work if copy-pasted into a fresh AI chat with no prior context. Include all necessary background, constraints, and specifications inline.

5. **Structure the output.** Use clear sections, bullet points, or numbered lists. Group related requirements. Make it scannable.

6. **Be specific, not vague.** Replace phrases like "make it good" with concrete quality criteria. Replace "appropriate length" with actual word/paragraph counts or time estimates.

7. **State deliverable format.** If the user's answers establish what they want back (a document, code, analysis, etc.), state the exact format, length, and structure expected.

8. **For skipped questions:** If a skipped detail is genuinely necessary for a good result, include a reasonable default and explicitly state it (e.g., "Use TypeScript 5.x as the language unless otherwise specified"). Do not silently assume — declare your defaults.

9. **Do not answer the prompt.** You are rewriting the prompt, not executing it.

10. **No meta-commentary.** Output ONLY the enhanced prompt. No "Here is your improved prompt", no preamble, no explanation. Just the prompt itself.

11. **Plain text only.** Do not use any markdown formatting. No bold (**), no italic (*), no headers (#), no code fences, no backticks, no dashes for emphasis. Use plain text with line breaks, colons, and numbered lists only. The output must be pure readable text that works anywhere.`;

export async function generateClarifications(
  provider: "gemini" | "groq",
  apiKey: string,
  model: string,
  prompt: string
): Promise<ClarifyResponse> {
  let text: string;

  if (provider === "groq") {
    text = await groqChat(apiKey, model, [
      { role: "system", content: CLARIFICATION_SYSTEM_PROMPT },
      { role: "user", content: `User's rough prompt:\n\n${prompt}` },
    ]);
  } else {
    const client = getGeminiClient(apiKey);
    const interaction = await client.interactions.create({
      model,
      input: [
        {
          type: "user_input",
          content: [
            { type: "text", text: `${CLARIFICATION_SYSTEM_PROMPT}\n\nUser's rough prompt:\n\n${prompt}` },
          ],
        },
      ],
      store: false,
    });
    text = interaction.output_text ?? "";
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in model response");

  let cleaned = jsonMatch[0]
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/"{/g, "{")
    .replace(/}"/g, "}");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    cleaned = cleaned.replace(/[\x00-\x1f\x7f]/g, " ");
    parsed = JSON.parse(cleaned);
  }

  if (!parsed.summary || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid response structure");
  }

  return parsed as unknown as ClarifyResponse;
}

export async function enhancePrompt(
  provider: "gemini" | "groq",
  apiKey: string,
  model: string,
  originalPrompt: string,
  answers: DamAnswer[]
): Promise<string> {
  const answersSummary = answers
    .map((a) => {
      if (a.skipped) return `${a.question}: [Skipped]`;
      const selected = a.selected.join(", ");
      const other = a.otherText ? ` (Other: ${a.otherText})` : "";
      return `${a.question}: ${selected}${other}`;
    })
    .join("\n");

  const userMessage = `${ENHANCEMENT_SYSTEM_PROMPT}\n\nOriginal prompt:\n${originalPrompt}\n\nClarification answers:\n${answersSummary}`;

  if (provider === "groq") {
    const text = await groqChat(apiKey, model, [
      { role: "user", content: userMessage },
    ]);
    return text.trim();
  }

  const client = getGeminiClient(apiKey);
  const interaction = await client.interactions.create({
    model,
    input: [
      {
        type: "user_input",
        content: [{ type: "text", text: userMessage }],
      },
    ],
    store: false,
  });

  return (interaction.output_text ?? "").trim();
}
