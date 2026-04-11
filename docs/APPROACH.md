# Sentinel Assembly — Approach Document

**Track:** Marketing Tech — Autonomous Content Factory

---

## 1. Problem & Insight

The brief described a marketing department struggling with multi-channel content repurposing. The obvious solution is an AI that generates content in multiple formats. That is a solved problem.

The less obvious problem — and the one I chose to solve — is **verification**. When an AI rewrites a product document, it tends to paraphrase, approximate, and occasionally invent. A price point becomes a range. A feature becomes a benefit that was never stated. A statistic gets rounded up. None of this is caught because there is nothing in the pipeline to catch it.

The core idea behind Sentinel Assembly is that content generation and content verification should be handled by separate, adversarial agents — one tasked with writing, one tasked with finding errors in what was written.

---

## 2. Solution Design

The system uses three agents in a sequential, self-correcting loop:

**Agent 1 — The Archivist** reads the raw source document and extracts only verifiable facts — product names, features, prices, dates, technical specs, target audience, and value propositions — into a structured JSON Fact-Sheet. It also flags ambiguous claims (e.g. "fast", "powerful") that cannot be verified. This Fact-Sheet becomes the ground truth for the entire pipeline.

**Agent 2 — The Ghostwriter** receives the Fact-Sheet (not the original document) and produces three content pieces simultaneously: a 400-word blog post, a 5-post social media thread, and a formal email campaign. The user selects a personality — Corporate Executive, Hype Beast, or Minimalist — which is injected as a tone instruction into the prompt at runtime.

**Agent 3 — The Prosecutor** compares every factual claim in the Ghostwriter's output against the Fact-Sheet. It checks for hallucinated features, missing value propositions, vague hype language, and tone inconsistency. If it finds a problem, it generates a specific Correction Note — naming the exact phrase and the required fix — and sends it back to the Ghostwriter. The loop repeats, up to three times, without any human interaction.

When the Prosecutor issues an approval, the output is surfaced to the user with a confidence score, a visual Audit Trail of every loop, and options to export, copy, or preview the content.

The self-correcting loop is the differentiating design decision. Most content tools are one-shot generators. Sentinel Assembly is a feedback system.

---

## 3. Tech Stack Choices

**OpenRouter + Mistral 7B (free tier)** — selected specifically because it requires no billing and no credit card. This makes the project fully reproducible by any evaluator or student without setup cost. Mistral 7B handles structured reasoning and delimiter-based output reliably within the free quota.

**Server-Sent Events (SSE)** — chosen over WebSockets for the real-time agent log feed. SSE is unidirectional, HTTP-native, and requires no additional library. It fits the use case precisely: the server streams updates to the client during a pipeline run, and the client never sends data back mid-stream.

**React 18 + Vite with pure CSS** — Tailwind CSS was removed after causing PostCSS dependency failures in student environments. A CSS custom properties system was written instead, which is more portable, has zero build-time dependencies, and produces a smaller bundle.

**MySQL 8** — chosen over SQLite for production realism. The schema is relational: users have many missions, missions have structured JSON fields (fact_sheet, audit_trail). Auto-table creation on server start means evaluators do not need to run migration scripts.

**JWT + bcryptjs** — industry-standard stateless authentication. Tokens are signed with a configurable secret and verified on every protected route. Passwords are hashed with bcrypt (12 rounds) before storage.

**Node.js + Express** — lightweight, same language as the frontend, and has native support for streaming responses via `res.write()`. No additional framework overhead.

---

## 4. Additional Features Built

Beyond the minimum requirements of a 3-agent pipeline with live feed and comparison view:

- JWT-secured user authentication (register, login, persistent sessions)
- Mission History — every pipeline run auto-saved to MySQL with full metadata
- Mission Detail Page — 4 tabs: Campaign Results, Audit Trail, Fact Sheet, Source Document
- Agent Personality selector — 3 distinct writing voices with dynamic prompt injection
- Visual Audit Trail — step-by-step timeline showing each prosecution loop, correction notes, and confidence scores
- Mobile preview — social posts rendered inside a phone frame mockup
- Export Kit — formatted download of the complete approved campaign
- Graceful degradation — app functions without MySQL (history disabled, pipeline intact)

---

## 5. What I Would Improve With More Time

**Semantic traceability** is the most valuable improvement I did not have time to build. The goal: every sentence in the final blog post would display a hover tooltip showing the exact line from the source document that proves the claim is true. This would make the "hallucination-free" guarantee visually verifiable rather than asserted.

**Streaming output** — currently each agent completes its task and returns the full result. Token-by-token streaming would make the Ghostwriter phase feel live and reduce perceived wait time significantly.

**PDF parsing** — the current implementation accepts plain text only. A proper PDF extractor with layout awareness would make the tool practical for real product documentation.

**Stronger AI model** — Mistral 7B occasionally fails to follow delimiter formatting precisely, which requires fallback parsing logic. GPT-4o or a fine-tuned model would improve output consistency and reduce the number of Prosecutor rejections.

**Team workspaces** — allowing multiple users to share missions, leave comments, and approve content collaboratively would move this from a personal tool to a team product with genuine B2B value.

---

*The most useful thing AI can do for content teams is not write faster — it's catch mistakes before they publish.*
