import { GoogleGenAI } from "@google/genai";

const API_KEY = "AQ.Ab8RN6KM3wEyFIzRNGa_FpHK8BiHMp7lImcVFV5Q0wLS45O0NQ";
const MODEL = "gemini-3.6-flash";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `You are DAM AI, a prompt clarification engine.
Your job is NOT to answer the user's request.
Your job is to identify missing information that would materially improve the result.

Return ONLY valid JSON, no markdown, no code fences:

{
  "summary": "brief summary",
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
}`;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSingle() {
  console.log("Testing single clarify call...\n");
  try {
    const interaction = await ai.interactions.create({
      model: MODEL,
      input: [
        {
          type: "user_input",
          content: [
            { type: "text", text: `${SYSTEM_PROMPT}\n\nUser's rough prompt:\n\nBuild me a web app that finds scholarships` },
          ],
        },
      ],
      store: false,
    });

    const text = interaction.output_text ?? "";
    console.log("Raw response:\n");
    console.log(text.substring(0, 1500));
    console.log("\n---");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("\n❌ No JSON found in response");
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`\n✅ JSON parsed OK`);
    console.log(`Summary: ${parsed.summary}`);
    console.log(`Questions: ${parsed.questions?.length}`);
    for (const q of parsed.questions ?? []) {
      console.log(`  [${q.type}] ${q.question} (${q.options?.length ?? 0} options)`);
    }

    // Now test enhance
    console.log("\n\nTesting enhance call...\n");
    const answers = (parsed.questions ?? []).map((q: { question: string; options?: { label: string }[] }) => ({
      question: q.question,
      selected: [q.options?.[0]?.label ?? "N/A"],
      skipped: false,
    }));

    const interaction2 = await ai.interactions.create({
      model: MODEL,
      input: [
        {
          type: "user_input",
          content: [
            {
              type: "text",
              text: `You are a prompt enhancement engine. Create ONE self-contained prompt.\n\nOriginal prompt:\nBuild me a web app that finds scholarships\n\nClarification answers:\n${answers.map(a => `${a.question}: ${a.selected[0]}`).join("\n")}\n\nOutput ONLY the improved prompt. No markdown, no commentary.`,
            },
          ],
        },
      ],
      store: false,
    });

    const enhanced = (interaction2.output_text ?? "").trim();
    console.log("Enhanced prompt:\n");
    console.log(enhanced.substring(0, 500));
    console.log(`\n✅ Enhance OK (${enhanced.length} chars)`);

  } catch (err) {
    console.log(`❌ FAILED: ${(err as Error).message}`);
  }
}

testSingle();
