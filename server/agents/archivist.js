import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runArchivist(rawText, onLog) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  onLog({
    agent: "archivist",
    status: "thinking",
    message: "Scanning source document for hard facts...",
  });

  const prompt = `You are The Archivist — a ruthless, precise fact-extraction engine.

Your ONLY job is to extract verifiable facts from the provided text and return them as a structured JSON object.

RULES:
1. Extract: product names, features, prices, dates, technical specs, target audience, value propositions.
2. If a claim is vague (e.g., "fast", "powerful", "best"), add it to "ambiguity_warnings" array with the exact quote.
3. Build a "knowledge_graph" showing relationships between entities.
4. Output ONLY valid JSON. No markdown. No explanation. Just raw JSON.

JSON STRUCTURE:
{
  "product_name": "",
  "tagline": "",
  "core_features": [{"name": "", "description": "", "verified": true}],
  "technical_specs": [{"key": "", "value": ""}],
  "pricing": [{"tier": "", "price": "", "details": ""}],
  "target_audience": [],
  "value_propositions": [],
  "key_dates": [],
  "ambiguity_warnings": [{"quote": "", "reason": ""}],
  "knowledge_graph": {"entities": [], "relationships": []}
}

SOURCE TEXT:
${rawText}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code blocks if present
  const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

  let factSheet;
  try {
    factSheet = JSON.parse(cleaned);
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      factSheet = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Archivist failed to produce valid JSON");
    }
  }

  onLog({
    agent: "archivist",
    status: "approved",
    message: `Fact-Sheet created. Found ${factSheet.core_features?.length || 0} features, ${factSheet.ambiguity_warnings?.length || 0} ambiguity warnings.`,
  });

  return factSheet;
}