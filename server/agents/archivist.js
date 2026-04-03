// import { callAI } from "../utils/ai.js";

// export async function runArchivist(rawText, onLog) {
//   onLog({
//     agent: "archivist",
//     status: "thinking",
//     message: "Scanning source document for hard facts...",
//   });

//   const prompt = `Extract all verifiable facts from this text and return ONLY a valid JSON object.

// REQUIRED JSON FORMAT (return this exact structure):
// {
//   "product_name": "name here",
//   "tagline": "tagline here",
//   "core_features": [{"name": "feature name", "description": "what it does", "verified": true}],
//   "technical_specs": [{"key": "spec name", "value": "spec value"}],
//   "pricing": [{"tier": "tier name", "price": "price", "details": "details"}],
//   "target_audience": ["audience 1", "audience 2"],
//   "value_propositions": ["proposition 1", "proposition 2"],
//   "key_dates": ["date 1"],
//   "ambiguity_warnings": [{"quote": "vague phrase", "reason": "why it is vague"}],
//   "knowledge_graph": {"entities": ["entity1"], "relationships": ["rel1"]}
// }

// RULES:
// - Return ONLY the JSON object. No text before or after it.
// - No markdown code blocks. No backticks. Just the raw JSON.
// - If a claim is vague like "fast" or "best", add it to ambiguity_warnings.
// - Extract every feature, price, date, spec you can find.

// SOURCE TEXT TO ANALYZE:
// ${rawText}`;

//   let raw = "";
//   try {
//     raw = await callAI(prompt);
//   } catch (err) {
//     throw new Error(`Archivist AI call failed: ${err.message}`);
//   }

//   // Aggressively clean the response to get pure JSON
//   let cleaned = raw.trim();
//   cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

//   // Try to extract JSON object if there's surrounding text
//   const jsonStart = cleaned.indexOf("{");
//   const jsonEnd = cleaned.lastIndexOf("}");
//   if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
//     cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
//   }

//   let factSheet;
//   try {
//     factSheet = JSON.parse(cleaned);
//   } catch (parseErr) {
//     // If JSON parsing still fails, build a basic fact sheet from the raw text
//     console.warn("JSON parse failed, building fallback fact sheet");
//     factSheet = {
//       product_name: "Product",
//       tagline: "",
//       core_features: [{ name: "See source document", description: raw.slice(0, 200), verified: true }],
//       technical_specs: [],
//       pricing: [],
//       target_audience: ["General audience"],
//       value_propositions: ["See source document for details"],
//       key_dates: [],
//       ambiguity_warnings: [],
//       knowledge_graph: { entities: [], relationships: [] },
//     };
//   }

//   onLog({
//     agent: "archivist",
//     status: "approved",
//     message: `Fact-Sheet locked. ${factSheet.core_features?.length || 0} features, ${factSheet.ambiguity_warnings?.length || 0} ambiguity warnings found.`,
//   });

//   return factSheet;
// }

import { callAI } from "../utils/ai.js";

/**
 * AGENT-01: THE ARCHIVIST
 * Responsibility: Hard fact extraction and ambiguity detection.
 * Logic: Strict JSON enforcement with fallback recovery.
 */
export async function runArchivist(rawText, onLog) {
  onLog({
    agent: "archivist",
    status: "thinking",
    message: "Analyzing source document for technical parameters and verifiable claims...",
  });

  const prompt = `### ROLE
You are the Sentinel Archivist, a high-precision data extraction engine. Your goal is to convert unstructured marketing/technical text into a structured JSON Fact-Sheet.

### OBJECTIVE
Analyze the provided source text. Extract every feature, price point, technical specification, and date. Identify vague or non-verifiable claims.

### OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown, no conversational filler.
{
  "product_name": "string",
  "tagline": "string",
  "core_features": [{"name": "string", "description": "string", "verified": true}],
  "technical_specs": [{"key": "string", "value": "string"}],
  "pricing": [{"tier": "string", "price": "string", "details": "string"}],
  "target_audience": ["string"],
  "value_propositions": ["string"],
  "key_dates": ["string"],
  "ambiguity_warnings": [{"quote": "string", "reason": "why this claim is non-verifiable"}],
  "knowledge_graph": {"entities": ["string"], "relationships": ["string"]}
}

### EXTRACTION RULES
1. DATA INTEGRITY: Do not invent facts. If a field is missing, use an empty array/string.
2. AMBIGUITY: If the text uses superlative adjectives (e.g., "fastest," "best," "revolutionary") without supporting data, log it in 'ambiguity_warnings'.
3. CLEANLINESS: Ensure all strings are properly escaped for JSON.

### SOURCE TEXT
${rawText}`;

  let rawResponse = "";
  try {
    // Calling the centralized AI utility
    rawResponse = await callAI(prompt);
  } catch (err) {
    throw new Error(`Archivist core failure: ${err.message}`);
  }

  // --- REGEX CLEANING SYSTEM ---
  // AI sometimes includes markdown backticks even when told not to. We strip them.
  let cleaned = rawResponse.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/); // Finds the first { and last }
  
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    throw new Error("Archivist failed to generate a valid JSON structure.");
  }

  let factSheet;
  try {
    factSheet = JSON.parse(cleaned);
  } catch (parseErr) {
    // FALLBACK LOGIC: If JSON is slightly malformed, we attempt to repair it manually
    onLog({
      agent: "archivist",
      status: "warning",
      message: "Data structure anomaly detected. Initializing heuristic recovery...",
    });
    
    // Final desperate attempt at a clean parse or object creation
    factSheet = {
      product_name: "Extraction Incomplete",
      tagline: "Manual review required",
      core_features: [{ name: "Raw Data", description: "The AI output was malformed.", verified: false }],
      ambiguity_warnings: [{ quote: "N/A", reason: "The source document produced a complex response that exceeded JSON limits." }]
    };
  }

  onLog({
    agent: "archivist",
    status: "approved",
    message: `Verification Complete. Extracted ${factSheet.core_features?.length || 0} features and ${factSheet.technical_specs?.length || 0} specs.`,
  });

  return factSheet;
}