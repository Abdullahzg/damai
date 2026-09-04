import { GoogleGenAI } from "@google/genai";

const API_KEY = "AQ.Ab8RN6LX2ypXRA8ZliOCiyiVq_tUeAj4TRK1Mr0kxXB4-B1E-g";
const MODEL = "gemini-3.6-flash";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const CLARIFICATION_SYSTEM_PROMPT = `You are DAM AI, a prompt clarification engine.

Your job is NOT to answer the user's request.

Your job is to identify missing information that would materially improve the result produced by another capable AI assistant.

Given the user's rough prompt:

1. Infer the task and desired outcome.
2. Identify consequential ambiguities or missing constraints.
3. Generate the smallest useful set of clarification questions.
4. Prefer questions answerable with a tap.
5. Use 3–5 concise options when possible.
6. Include a No preference / Not sure option when appropriate.
7. Include Other when predefined choices may not cover the user.
8. Questions may be single-select or multi-select.
9. Do not ask for information already present in the prompt.
10. Do not ask trivial questions whose answers would not change the output.
11. Do not solve the task.
12. Do not invent facts about the user.
13. Order questions from highest impact to lowest impact.
14. Usually ask 4–8 questions. Never exceed 15.
15. If the original prompt is already sufficiently specific, return zero or only the genuinely useful remaining questions.
16. Return ONLY valid JSON matching this exact schema, no markdown, no code fences:

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

Examples of useful dimensions depend on task type.

Software: target user, platform, required features, existing codebase, stack, authentication, data source, integrations, deployment, constraints, desired deliverable.
Research: exact research question, geography, date range, eligibility/profile constraints, source requirements, depth, exclusions, output format.
Writing: audience, purpose, tone, length, facts that must be included, facts that must not be invented, format.
Recommendations: location, budget, preferences, hard constraints, timing, priorities.

Never mechanically ask every dimension. Ask only what matters for this prompt.`;

const ENHANCEMENT_SYSTEM_PROMPT = `You are DAM AI, a prompt enhancement engine.

Create ONE self-contained prompt for another AI assistant.

Inputs: original user prompt, clarification questions, user's answers, skipped questions.

Rules:
1. Preserve the user's actual intent.
2. Include all relevant facts from the original prompt.
3. Incorporate the user's clarification answers accurately.
4. Do not invent answers to skipped questions.
5. Do not silently make consequential assumptions.
6. If a skipped detail is genuinely necessary, tell the downstream AI to choose a reasonable default and state it.
7. Make the prompt concrete, organized, and execution-oriented.
8. Specify desired output/deliverable when the user's answers establish it.
9. Preserve important wording, names, URLs, numbers, code, and constraints from the original prompt.
10. Do not answer the prompt.
11. Do not add commentary such as "Here is your improved prompt."
12. Output ONLY the improved prompt as plain text. No markdown, no code fences.`;

const TEST_PROMPTS = [
  "Build me a web app that finds scholarships",
  "Write me a blog post about AI",
  "Help me plan a trip to Japan",
  "Create a resume for a software engineer",
  "Write a Python script to scrape websites",
  "Design a logo for my coffee shop",
  "Help me prepare for a job interview at Google",
  "Write a business plan for a restaurant",
  "Create a workout plan for weight loss",
  "Build me a REST API with authentication",
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseJsonFromResponse(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0]);
}

async function callWithRetry(fn: () => Promise<unknown>, maxRetries = 5): Promise<unknown> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("429") || msg.includes("quota") || msg.includes("rate")) {
        const retryMatch = msg.match(/retry in (\d+\.?\d*)s/);
        const waitMs = retryMatch
          ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000
          : 60000;
        console.log(`    Rate limited, waiting ${Math.round(waitMs / 1000)}s...`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

async function testClarify(prompt: string) {
  const start = Date.now();
  try {
    const interaction = await callWithRetry(() =>
      ai.interactions.create({
        model: MODEL,
        input: [
          {
            type: "user_input",
            content: [
              { type: "text", text: `${CLARIFICATION_SYSTEM_PROMPT}\n\nUser's rough prompt:\n\n${prompt}` },
            ],
          },
        ],
        store: false,
      })
    ) as { output_text?: string };

    const text = interaction.output_text ?? "";
    const parsed = parseJsonFromResponse(text);

    const d = parsed as Record<string, unknown>;
    if (typeof d.summary !== "string") throw new Error("Missing summary");
    if (!Array.isArray(d.questions)) throw new Error("Missing questions array");

    const timeMs = Date.now() - start;
    return { success: true, data: parsed as { summary: string; questions: Array<{ id: string; question: string; type: string; options?: Array<{ id: string; label: string; allowsText?: boolean }>; skippable: boolean }> }, timeMs };
  } catch (err) {
    const timeMs = Date.now() - start;
    return { success: false, error: (err as Error).message, timeMs };
  }
}

async function testEnhance(originalPrompt: string, answers: Array<{ question: string; selected: string[]; otherText?: string | null; skipped?: boolean }>) {
  const start = Date.now();
  try {
    const answersSummary = answers
      .map((a) => {
        if (a.skipped) return `${a.question}: [Skipped]`;
        const selected = a.selected.join(", ");
        const other = a.otherText ? ` (Other: ${a.otherText})` : "";
        return `${a.question}: ${selected}${other}`;
      })
      .join("\n");

    const interaction = await callWithRetry(() =>
      ai.interactions.create({
        model: MODEL,
        input: [
          {
            type: "user_input",
            content: [
              {
                type: "text",
                text: `${ENHANCEMENT_SYSTEM_PROMPT}\n\nOriginal prompt:\n${originalPrompt}\n\nClarification answers:\n${answersSummary}`,
              },
            ],
          },
        ],
        store: false,
      })
    ) as { output_text?: string };

    const enhanced = (interaction.output_text ?? "").trim();
    const timeMs = Date.now() - start;

    if (enhanced.length < 50) {
      return { success: false, error: "Enhanced prompt too short", timeMs };
    }

    return { success: true, prompt: enhanced, timeMs };
  } catch (err) {
    const timeMs = Date.now() - start;
    return { success: false, error: (err as Error).message, timeMs };
  }
}

async function main() {
  console.log("=== DAM AI FULL API TEST ===\n");
  console.log(`Model: ${MODEL}`);
  console.log(`Prompts: ${TEST_PROMPTS.length}`);
  console.log("(Adding delays between requests to respect rate limits)\n");

  let clarifyPassed = 0;
  let clarifyFailed = 0;
  let enhancePassed = 0;
  let enhanceFailed = 0;

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    console.log(`--- Prompt ${i + 1}/${TEST_PROMPTS.length} ---`);
    console.log(`"${prompt}"\n`);

    // Test clarification
    console.log("  CLARIFY...");
    const clarifyResult = await testClarify(prompt);

    if (!clarifyResult.success) {
      console.log(`  ❌ CLARIFY FAILED: ${clarifyResult.error?.substring(0, 200)}`);
      console.log(`  Time: ${clarifyResult.timeMs}ms\n`);
      clarifyFailed++;
      await sleep(2000);
      continue;
    }

    const data = clarifyResult.data!;
    console.log(`  ✅ CLARIFY OK (${clarifyResult.timeMs}ms)`);
    console.log(`  Summary: ${data.summary}`);
    console.log(`  Questions: ${data.questions.length}`);

    for (const q of data.questions) {
      const opts = q.options?.map(o => o.label).join(", ") ?? "none";
      console.log(`    [${q.type}] ${q.question}`);
      console.log(`      Options: ${opts} (skippable: ${q.skippable})`);
    }
    clarifyPassed++;

    // Build mock answers
    const mockAnswers = data.questions.map((q) => {
      if (q.type === "text") {
        return { question: q.question, selected: [], otherText: "test answer", skipped: false };
      }
      if (q.options && q.options.length > 0) {
        return { question: q.question, selected: [q.options[0].label], skipped: false };
      }
      return { question: q.question, selected: [], skipped: true };
    });

    // Test enhancement
    console.log("  ENHANCE...");
    const enhanceResult = await testEnhance(prompt, mockAnswers);

    if (!enhanceResult.success) {
      console.log(`  ❌ ENHANCE FAILED: ${enhanceResult.error?.substring(0, 200)}`);
      console.log(`  Time: ${enhanceResult.timeMs}ms\n`);
      enhanceFailed++;
      await sleep(2000);
      continue;
    }

    console.log(`  ✅ ENHANCE OK (${enhanceResult.timeMs}ms)`);
    console.log(`  Enhanced prompt length: ${enhanceResult.prompt!.length} chars`);
    console.log(`  Preview: ${enhanceResult.prompt!.substring(0, 300)}...`);
    enhancePassed++;
    console.log("");

    // Delay between prompts to respect rate limits
    if (i < TEST_PROMPTS.length - 1) {
      console.log("  (waiting 5s for rate limit...)\n");
      await sleep(5000);
    }
  }

  console.log("=== RESULTS ===");
  console.log(`Clarify: ${clarifyPassed}/${TEST_PROMPTS.length} passed, ${clarifyFailed} failed`);
  console.log(`Enhance: ${enhancePassed}/${TEST_PROMPTS.length} passed, ${enhanceFailed} failed`);
  console.log(`Total: ${clarifyPassed + enhancePassed}/${TEST_PROMPTS.length * 2} passed`);
}

main().catch(console.error);
