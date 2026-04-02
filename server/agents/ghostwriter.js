import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const isRevision = correctionNote !== null;

  onLog({
    agent: "ghostwriter",
    status: "thinking",
    message: isRevision
      ? `Revising content based on Prosecutor's note: "${correctionNote}"`
      : "Drafting Blog, Social Thread, and Email from Fact-Sheet...",
  });

  const correctionSection = isRevision
    ? `\n\nPROSECUTOR'S CORRECTION NOTE (YOU MUST FIX THIS):\n${correctionNote}\n`
    : "";

  const prompt = `You are The Ghostwriter — a world-class creative copywriter who writes only from verified facts.

FACT-SHEET (your ONLY source of truth):
${JSON.stringify(factSheet, null, 2)}
${correctionSection}

YOUR TASK: Produce THREE pieces of content simultaneously.

RULES:
- NEVER invent features, prices, or specs not in the Fact-Sheet.
- The Value Proposition must be the HERO of every piece.
- For Blog: Professional, trustworthy, 450-500 words.
- For Social Thread: Punchy, engaging, exactly 5 posts, each under 280 chars. Use emojis sparingly.
- For Email: Formal, concise, 1 paragraph (80-100 words), strong CTA.
- Each sentence that makes a factual claim must end with a citation like [F1], [F2] referencing the feature index.

OUTPUT FORMAT (use these exact delimiters):
===BLOG_START===
[Your 500-word blog post here]
===BLOG_END===

===SOCIAL_START===
POST 1: [text]
POST 2: [text]
POST 3: [text]
POST 4: [text]
POST 5: [text]
===SOCIAL_END===

===EMAIL_START===
Subject: [subject line]
Body: [email body]
===EMAIL_END===`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  const blog = extractSection(raw, "BLOG_START", "BLOG_END");
  const social = extractSection(raw, "SOCIAL_START", "SOCIAL_END");
  const email = extractSection(raw, "EMAIL_START", "EMAIL_END");

  onLog({
    agent: "ghostwriter",
    status: isRevision ? "warning" : "thinking",
    message: isRevision
      ? "Revision complete. Sending corrected draft to Prosecutor..."
      : "All three content pieces drafted. Sending to Prosecutor for review...",
  });

  return { blog, social, email, raw };
}

function extractSection(text, startTag, endTag) {
  const regex = new RegExp(`===${startTag}===([\\s\\S]*?)===${endTag}===`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}