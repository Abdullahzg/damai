const GROQ_KEY = "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";

const SYSTEM = `You are DAM AI, a prompt clarification engine.

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
5. Use 3–5 concise options when possible.
6. Include a "No preference / Not sure" option when appropriate.
7. ALWAYS include an "Other" option that allows the user to type their own answer.
8. Questions may be single-select or multi-select.
9. Do not ask for information already present in the prompt.
10. Do not ask trivial questions whose answers would not change the output.
11. Do not solve the task.
12. Do not invent facts about the user.
13. Order questions from highest impact to lowest impact.
14. Usually ask 4–8 questions. Never exceed 15.
15. If the original prompt is already sufficiently specific, return zero or only the genuinely useful remaining questions.

## Hard rules for output

- EVERY question MUST have "skippable": true. No exceptions.
- EVERY single-select and multi-select question MUST include an option with "id": "other", "label": "Other", "allowsText": true.
- Return ONLY valid JSON matching this exact schema, no markdown, no code fences.

{"summary":"brief","questions":[{"id":"q1","question":"text","type":"single","options":[{"id":"o1","label":"Option"},{"id":"other","label":"Other","allowsText":true}],"skippable":true}]}

Allowed types: "single", "multi", "text".
Software: target user, platform, features, stack, auth, data, deployment.
Writing: audience, purpose, tone, length, facts to include/exclude.
Recommendations: location, budget, constraints, timing.`;

function cleanJson(text) {
  let cleaned = text.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/"{/g, "{").replace(/}"/g, "}");
  return cleaned;
}

async function testClarify(model, prompt) {
  console.log(`--- "${prompt}" ---`);
  const start = Date.now();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `User's rough prompt:\n\n${prompt}` },
      ],
      temperature: 0.3,
    }),
  });

  const ms = Date.now() - start;
  if (!res.ok) { console.log(`  ❌ ${res.status}\n`); return; }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) { console.log(`  ❌ No JSON\n`); return; }

  let parsed;
  try {
    parsed = JSON.parse(cleanJson(jsonMatch[0]));
  } catch (e) {
    console.log(`  ❌ JSON parse failed: ${e.message}`);
    console.log(`  Raw (first 300): ${jsonMatch[0].substring(0, 300)}\n`);
    return;
  }

  console.log(`  ${ms}ms | ${parsed.questions?.length ?? 0} questions`);

  let allSkippable = true;
  let allHaveOther = true;

  for (const q of parsed.questions ?? []) {
    const hasOther = q.options?.some(o => o.id === "other" || o.label === "Other") ?? false;
    const opts = q.options?.map(o => o.label).join(", ") ?? "none";
    const flags = [];
    if (!q.skippable) { flags.push("NOT SKIPPABLE"); allSkippable = false; }
    if (!hasOther && q.type !== "text") { flags.push("NO OTHER"); allHaveOther = false; }
    console.log(`    [${q.type}] ${q.question}`);
    console.log(`      → ${opts} ${flags.length ? "⚠️ " + flags.join(", ") : "✓"}`);
  }

  console.log(`  skippable: ${allSkippable ? "✅ ALL" : "❌ SOME MISSING"}`);
  console.log(`  other opt: ${allHaveOther ? "✅ ALL" : "❌ SOME MISSING"}\n`);
}

async function main() {
  console.log("=== FINAL PROMPT TEST ===\n");
  const model = "openai/gpt-oss-20b";
  await testClarify(model, "Build me a web app that finds scholarships");
  await testClarify(model, "Write me a blog post about AI");
}

main();
