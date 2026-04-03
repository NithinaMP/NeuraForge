// import { callAI } from "../utils/ai.js";

// export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
//   const isRevision = correctionNote !== null;

//   onLog({
//     agent: "ghostwriter",
//     status: "thinking",
//     message: isRevision
//       ? `Revising content. Prosecutor said: "${correctionNote?.slice(0, 80)}"`
//       : "Drafting Blog Post, Social Thread, and Email Campaign...",
//   });

//   const correctionBlock = isRevision
//     ? `\n\nIMPORTANT - PROSECUTOR CORRECTION YOU MUST FIX:\n${correctionNote}\n`
//     : "";

//   const prompt = `You are a world-class marketing copywriter. Write content based ONLY on the facts below.

// VERIFIED FACT-SHEET:
// Product: ${factSheet.product_name || "the product"}
// Tagline: ${factSheet.tagline || ""}
// Key Features: ${factSheet.core_features?.map(f => `${f.name}: ${f.description}`).join("; ") || "see document"}
// Value Propositions: ${factSheet.value_propositions?.join("; ") || ""}
// Target Audience: ${factSheet.target_audience?.join(", ") || "general audience"}
// Pricing: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ") || "contact for pricing"}
// ${correctionBlock}

// TASK: Write all three pieces below using EXACTLY these delimiters.

// ===BLOG_START===
// Write a professional 400-word blog post about this product. Make the value proposition the hero. Do not invent any features not listed above.
// ===BLOG_END===

// ===SOCIAL_START===
// POST 1: [Hook - grab attention, under 250 chars]
// POST 2: [Key benefit, under 250 chars]  
// POST 3: [Feature spotlight, under 250 chars]
// POST 4: [Pain point solved, under 250 chars]
// POST 5: [Call to action, under 250 chars]
// ===SOCIAL_END===

// ===EMAIL_START===
// Subject: [Compelling subject line]
// Body: [90-word formal email with one clear call to action. No invented claims.]
// ===EMAIL_END===

// RULES: Use ONLY facts from the Fact-Sheet above. Use the delimiters EXACTLY as shown.`;

//   let raw = "";
//   try {
//     raw = await callAI(prompt);
//   } catch (err) {
//     throw new Error(`Ghostwriter AI call failed: ${err.message}`);
//   }

//   const extract = (startTag, endTag) => {
//     const regex = new RegExp(`===${startTag}===([\\s\\S]*?)===${endTag}===`);
//     const match = raw.match(regex);
//     if (match) return match[1].trim();
//     // Fallback: return a slice of the raw text if delimiters not found
//     return raw.slice(0, 500);
//   };

//   const blog = extract("BLOG_START", "BLOG_END");
//   const social = extract("SOCIAL_START", "SOCIAL_END");
//   const email = extract("EMAIL_START", "EMAIL_END");

//   onLog({
//     agent: "ghostwriter",
//     status: isRevision ? "warning" : "thinking",
//     message: isRevision
//       ? "Revision complete. Forwarding corrected drafts to Prosecutor..."
//       : "All 3 drafts complete. Forwarding to Prosecutor for hallucination audit...",
//   });

//   return { blog, social, email };
// }

import { callAI } from "../utils/ai.js";

/**
 * AGENT-02: THE GHOSTWRITER
 * Responsibility: Creative synthesis based strictly on verified fact-sheets.
 * Logic: Multi-format generation with delimiter-based extraction.
 */
export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
  const isRevision = correctionNote !== null;

  onLog({
    agent: "ghostwriter",
    status: isRevision ? "warning" : "thinking",
    message: isRevision
      ? `CRITICAL REVISION: Adjusting drafts based on Prosecutor's Audit: "${correctionNote.slice(0, 60)}..."`
      : "Synthesizing Blog Post, Social Thread, and Email Campaign from Fact-Sheet...",
  });

  // --- ENHANCED PROMPT ENGINEERING ---
  const prompt = `### ROLE
You are the Sentinel Ghostwriter—a world-class growth hacker and copywriter. You turn raw technical data into high-conversion marketing assets.

### CONSTRAINTS
- SOURCE TRUTH: Use ONLY facts provided in the Fact-Sheet below.
- HALLUCINATION POLICY: Zero tolerance. Do not invent features, prices, or performance metrics.
- DELIMITERS: You MUST use the exact "===TAG_START===" and "===TAG_END===" markers.

### INPUT DATA
Product: ${factSheet.product_name || "Enterprise Solution"}
Tagline: ${factSheet.tagline || "N/A"}
Features: ${factSheet.core_features?.map(f => `${f.name}: ${f.description}`).join(" | ")}
Target Audience: ${factSheet.target_audience?.join(", ")}
Pricing: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ")}

${isRevision ? `### ⚠️ PROSECUTOR REJECTION FEEDBACK (FIX THIS IMMEDIATELY):\n${correctionNote}` : ""}

### ASSET 1: BLOG POST
===BLOG_START===
[Write a professional 350-word industry-leader blog post. Focus on the value propositions.]
===BLOG_END===

### ASSET 2: SOCIAL THREAD (5 POSTS)
===SOCIAL_START===
[POST 1: Hook]
[POST 2: Feature Deep Dive]
[POST 3: Social Proof/Benefit]
[POST 4: The "Why Us"]
[POST 5: CTA]
===SOCIAL_END===

### ASSET 3: DIRECT OUTREACH
===EMAIL_START===
Subject: [High Open-Rate Subject Line]
[Write a 100-word formal executive email. One clear Call to Action.]
===EMAIL_END===`;

  let raw = "";
  try {
    raw = await callAI(prompt);
  } catch (err) {
    throw new Error(`Ghostwriter core failure: ${err.message}`);
  }

  // --- PRECISION EXTRACTION SYSTEM ---
  const extract = (startTag, endTag) => {
    const regex = new RegExp(`===${startTag}===([\\s\\S]*?)===${endTag}===`);
    const match = raw.match(regex);
    if (match) return match[1].trim();
    
    // Safety Fallback: If AI fails delimiters, try to find the text between markers manually
    const parts = raw.split(`===${startTag}===`);
    if (parts.length > 1) {
      return parts[1].split(`===${endTag}===`)[0].trim();
    }
    return "Content extraction failed. Please re-run the pipeline.";
  };

  const blog = extract("BLOG_START", "BLOG_END");
  const social = extract("SOCIAL_START", "SOCIAL_END");
  const email = extract("EMAIL_START", "EMAIL_END");

  onLog({
    agent: "ghostwriter",
    status: "approved",
    message: isRevision
      ? "Correction cycle complete. Re-submitting for final audit."
      : "Creative synthesis finalized. Handing over to Prosecutor for compliance check.",
  });

  return { blog, social, email };
}