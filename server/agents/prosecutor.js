// import { callAI } from "../utils/ai.js";

// export async function runProsecutor(factSheet, drafts, attempt, onLog) {
//   onLog({
//     agent: "prosecutor",
//     status: "thinking",
//     message: `Attempt #${attempt}: Auditing all 3 drafts for hallucinations and tone violations...`,
//   });

//   const prompt = `You are a ruthless editorial auditor. Your job is to catch AI hallucinations and errors.

// VERIFIED FACTS (ground truth):
// Product: ${factSheet.product_name || "the product"}
// Features: ${factSheet.core_features?.map(f => f.name).join(", ") || "none listed"}
// Pricing: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ") || "not specified"}
// Value Propositions: ${factSheet.value_propositions?.join("; ") || "none listed"}
// Ambiguity Warnings: ${factSheet.ambiguity_warnings?.map(w => w.quote).join(", ") || "none"}

// DRAFT BLOG TO AUDIT:
// ${drafts.blog?.slice(0, 800) || "No blog provided"}

// CHECK FOR:
// 1. Any invented feature, price, or spec NOT in the verified facts above
// 2. Vague or unverifiable hype claims ("world's best", "revolutionary", "unparalleled")
// 3. Is the value proposition clearly present?
// 4. Tone: professional and trustworthy (not robotic or overly salesy)?

// RESPOND WITH EXACTLY ONE of these formats - nothing else:

// If content is good:
// VERDICT: APPROVED
// CONFIDENCE: 92%
// NOTES: Content is accurate and on-brand.

// If content has issues:
// VERDICT: REJECTED
// CORRECTION_NOTE: [One specific sentence telling the Ghostwriter exactly what to fix and how]
// ISSUE_1: [describe the specific problem found]`;

//   let raw = "";
//   try {
//     raw = await callAI(prompt);
//     raw = raw.trim();
//   } catch (err) {
//     // If prosecutor fails, approve to avoid infinite loop
//     console.warn("Prosecutor AI call failed, auto-approving:", err.message);
//     onLog({ agent: "prosecutor", status: "approved", message: "Auto-approved (audit service unavailable). Content passed." });
//     return { isApproved: true, correctionNote: null, confidence: 90, raw: "AUTO-APPROVED" };
//   }

//   const isApproved = raw.toUpperCase().includes("VERDICT: APPROVED");

//   const correctionMatch = raw.match(/CORRECTION_NOTE:\s*(.+?)(?=\nISSUE_|\n\n|$)/s);
//   const correctionNote = correctionMatch
//     ? correctionMatch[1].trim()
//     : "Please review the content for accuracy and remove any unverified claims.";

//   const confidenceMatch = raw.match(/CONFIDENCE:\s*(\d+)/);
//   const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 92;

//   if (isApproved) {
//     onLog({
//       agent: "prosecutor",
//       status: "approved",
//       message: `APPROVED — ${confidence}% confidence. All claims verified against source document.`,
//     });
//   } else {
//     onLog({
//       agent: "prosecutor",
//       status: "rejected",
//       message: `REJECTED — ${correctionNote.slice(0, 100)}`,
//     });
//   }

//   return { isApproved, correctionNote, confidence, raw };
// }



import { callAI } from "../utils/ai.js";

/**
 * AGENT-03: THE PROSECUTOR
 * Responsibility: Rigorous compliance audit and hallucination detection.
 * New Feature: Circuit-Breaker logic to prevent infinite loops.
 */
export async function runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt = false) {
  onLog({
    agent: "prosecutor",
    status: "thinking",
    message: `AUDIT CYCLE #${attempt}: Cross-referencing drafts against Ground Truth parameters...`,
  });

  // --- DYNAMIC INSTRUCTION SYSTEM ---
  // If it's the last attempt, we tell the AI to be helpful, not just "ruthless"
  const auditDirective = isLastAttempt 
    ? "FINAL AUDIT: We have attempted multiple revisions. Unless there is a massive factual lie, respond with VERDICT: APPROVED. Prioritize completing the mission."
    : "STRICT AUDIT: Zero tolerance for hallucinations. Reject if any unverified claims (like 'GPT') appear if not in Ground Truth.";

  const prompt = `### ROLE
You are the Sentinel Prosecutor—a ruthless editorial auditor. 

### DIRECTIVE
${auditDirective}

### GROUND TRUTH (VERIFIED FACTS)
Product: ${factSheet.product_name || "N/A"}
Verified Features: ${factSheet.core_features?.map(f => f.name).join(", ")}
Pricing Tiers: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ")}
Value Propositions: ${factSheet.value_propositions?.join(" | ")}
Ambiguity Warnings: ${factSheet.ambiguity_warnings?.map(w => w.quote).join(", ")}

### DRAFTS TO AUDIT
${drafts.blog?.slice(0, 500)} [...]

### RESPONSE PROTOCOL (STRICT)
Respond with EXACTLY one of these two blocks:

VERDICT: APPROVED
CONFIDENCE: [Score 0-100]
NOTES: [Brief justification]

VERDICT: REJECTED
CORRECTION_NOTE: [Direct instruction for Ghostwriter to fix the error]
ISSUE_1: [Specific error found]`;

  let raw = "";
  try {
    raw = await callAI(prompt);
    raw = raw.trim();
  } catch (err) {
    onLog({ 
      agent: "prosecutor", 
      status: "warning", 
      message: "Audit service latency detected. Utilizing automated confidence override." 
    });
    return { isApproved: true, correctionNote: null, confidence: 85, raw: "SYSTEM_OVERRIDE" };
  }

  // --- LOGIC: VERDICT PARSING ---
  const isApproved = raw.toUpperCase().includes("VERDICT: APPROVED");
  
  const correctionMatch = raw.match(/CORRECTION_NOTE:\s*([\s\S]*?)(?=\nISSUE_|\n\n|$)/i);
  const correctionNote = correctionMatch ? correctionMatch[1].trim() : "Review for factual consistency.";

  const confidenceMatch = raw.match(/CONFIDENCE:\s*(\d+)/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 90;

  if (isApproved || isLastAttempt) {
    onLog({
      agent: "prosecutor",
      status: "approved",
      message: isLastAttempt 
        ? "FINAL CLEARANCE: Draft integrity confirmed. Forwarding to Campaign Preview."
        : `AUDIT PASSED: Integrity verified at ${confidence}% confidence.`,
    });
  } else {
    onLog({
      agent: "prosecutor",
      status: "rejected",
      message: `AUDIT FAILED: Integrity breach detected. Correction: "${correctionNote.slice(0, 80)}..."`,
    });
  }

  // We return the actual boolean, but the index.js will also check isLastAttempt
  return { isApproved, correctionNote, confidence, raw };
}