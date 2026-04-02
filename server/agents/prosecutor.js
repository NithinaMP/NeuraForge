import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runProsecutor(factSheet, drafts, attempt, onLog) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  onLog({
    agent: "prosecutor",
    status: "thinking",
    message: `Attempt #${attempt}: Interrogating drafts for hallucinations and tone violations...`,
  });

  const prompt = `You are The Prosecutor — a ruthless, zero-tolerance editorial auditor and legal compliance officer.

YOUR MISSION: Destroy any content that is inaccurate, misleading, or brand-damaging.

VERIFIED FACT-SHEET (the GROUND TRUTH):
${JSON.stringify(factSheet, null, 2)}

DRAFTS TO AUDIT:
--- BLOG ---
${drafts.blog}

--- SOCIAL THREAD ---
${drafts.social}

--- EMAIL ---
${drafts.email}

AUDIT CHECKLIST — Check each draft for:
1. HALLUCINATIONS: Any feature, price, date, or spec NOT in the Fact-Sheet.
2. MISSING FACTS: Is the core Value Proposition the hero? If not, flag it.
3. TONE VIOLATIONS: Too salesy ("best ever!"), too robotic, or inconsistent.
4. VAGUE CLAIMS: Any claim from "ambiguity_warnings" that slipped through.
5. SHADOW SKEPTIC CHECK: Would a cynical customer or legal auditor find any "fluff" or "fake hype"?

OUTPUT FORMAT — You must respond with ONLY one of these two formats:

IF APPROVED:
VERDICT: APPROVED
CONFIDENCE: [0-100]%
NOTES: [Brief praise of what was done well]

IF REJECTED:
VERDICT: REJECTED
ISSUES_FOUND: [number]
CORRECTION_NOTE: [Precise, specific instruction for the Ghostwriter. Mention the EXACT phrase that is wrong and what it should say instead.]
ISSUE_1: [description]
ISSUE_2: [description if applicable]`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  const isApproved = raw.includes("VERDICT: APPROVED");
  const correctionMatch = raw.match(/CORRECTION_NOTE:\s*(.+?)(?=\nISSUE_|\n\n|$)/s);
  const correctionNote = correctionMatch ? correctionMatch[1].trim() : null;
  const confidenceMatch = raw.match(/CONFIDENCE:\s*(\d+)%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : null;

  if (isApproved) {
    onLog({
      agent: "prosecutor",
      status: "approved",
      message: `APPROVED with ${confidence}% confidence. Content is factually accurate and brand-safe.`,
    });
  } else {
    onLog({
      agent: "prosecutor",
      status: "rejected",
      message: `REJECTED — ${correctionNote || "Correction required. Sending notes to Ghostwriter..."}`,
    });
  }

  return { isApproved, correctionNote, confidence, raw };
}