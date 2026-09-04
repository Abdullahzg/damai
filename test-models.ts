import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AQ.Ab8RN6LX2ypXRA8ZliOCiyiVq_tUeAj4TRK1Mr0kxXB4-B1E-g";
const genAI = new GoogleGenerativeAI(API_KEY);

// Try all plausible model names
const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const TEST_PROMPT = "Build me a web app";

async function testModel(modelName: string) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(TEST_PROMPT);
    const text = result.response.text();
    console.log(`  ✅ ${modelName}: "${text.substring(0, 80)}..."`);
    return true;
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("404")) {
      console.log(`  ❌ ${modelName}: 404 Not Found`);
    } else if (msg.includes("503")) {
      console.log(`  ⚠️ ${modelName}: 503 Overloaded (model exists)`);
      return true;
    } else {
      console.log(`  ❌ ${modelName}: ${msg.substring(0, 100)}`);
    }
    return false;
  }
}

async function main() {
  console.log("Scanning available models...\n");
  const available: string[] = [];
  for (const m of MODELS) {
    const ok = await testModel(m);
    if (ok) available.push(m);
  }
  console.log(`\nAvailable: ${available.join(", ") || "none"}`);
}

main().catch(console.error);
