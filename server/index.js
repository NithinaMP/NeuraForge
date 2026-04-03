// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// import { runArchivist } from "./agents/archivist.js";
// import { runGhostwriter } from "./agents/ghostwriter.js";
// import { runProsecutor } from "./agents/prosecutor.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // ── Load .env ────────────────────────────────────────────────────────────────
// const envPath = path.join(__dirname, ".env");
// if (fs.existsSync(envPath)) {
//   for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
//     const t = line.trim();
//     if (!t || t.startsWith("#")) continue;
//     const i = t.indexOf("=");
//     if (i === -1) continue;
//     const key = t.slice(0, i).trim();
//     const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
//     if (!process.env[key]) process.env[key] = val;
//   }
//   console.log("✓ .env loaded");
// } else {
//   console.warn("⚠  server/.env not found. Create it with your OPENROUTER_API_KEY.");
// }

// // ── Validate key ─────────────────────────────────────────────────────────────
// const OR_KEY = process.env.OPENROUTER_API_KEY;
// if (!OR_KEY || OR_KEY.includes("xxxx")) {
//   console.error("\n✗ OPENROUTER_API_KEY is missing or placeholder.");
//   console.error("  1. Go to https://openrouter.ai → sign up free");
//   console.error("  2. Dashboard → Keys → Create Key");
//   console.error("  3. Paste into server/.env as: OPENROUTER_API_KEY=sk-or-v1-...\n");
//   process.exit(1);
// }

// // ── Express ──────────────────────────────────────────────────────────────────
// const app = express();
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const upload = multer({ dest: uploadDir });

// app.use(cors({ origin: "*" }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // ── Health ───────────────────────────────────────────────────────────────────
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "online",
//     model: "mistralai/mistral-7b-instruct:free",
//     provider: "OpenRouter",
//     keyFound: !!OR_KEY,
//   });
// });

// // ── Pipeline (SSE) ───────────────────────────────────────────────────────────
// app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
//   // Server-Sent Events setup
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   if (res.flushHeaders) res.flushHeaders();

//   const send = (data) => {
//     try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
//   };
//   const onLog = (entry) => send({ type: "log", ...entry });

//   try {
//     // ── Extract text from input ───────────────────────────────────────────
//     let rawText = "";

//     if (req.file) {
//       const { path: filePath, mimetype } = req.file;
//       if (mimetype === "application/pdf") {
//         try {
//           const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
//           rawText = (await pdfParse(fs.readFileSync(filePath))).text;
//         } catch {
//           // pdf-parse might not be installed — tell user to paste text
//           send({ type: "error", message: "PDF parsing not available. Please use the Paste Text tab instead." });
//           return res.end();
//         }
//       } else {
//         rawText = fs.readFileSync(filePath, "utf-8");
//       }
//       try { fs.unlinkSync(filePath); } catch {}
//     } else if (req.body?.text) {
//       rawText = req.body.text;
//     } else {
//       send({ type: "error", message: "No input provided. Please paste text or upload a file." });
//       return res.end();
//     }

//     rawText = rawText.trim();
//     if (rawText.length < 30) {
//       send({ type: "error", message: "Input too short. Please provide more content (at least a paragraph)." });
//       return res.end();
//     }

//     // ── Start ─────────────────────────────────────────────────────────────
//     send({ type: "pipeline_start", message: "Sentinel Assembly activated. All agents online." });

//     // ── Phase 1: Archivist ────────────────────────────────────────────────
//     send({ type: "phase", phase: "archivist", message: "Phase 1: Archivist extracting facts from document..." });
//     const factSheet = await runArchivist(rawText, onLog);
//     send({ type: "factsheet", data: factSheet });

//     // ── Phase 2 & 3: Ghostwriter ↔ Prosecutor loop ────────────────────────
//     const MAX_ATTEMPTS = 3;
//     let attempt = 1;
//     let finalDrafts = null;
//     let correctionNote = null;

//     while (attempt <= MAX_ATTEMPTS) {
//       send({
//         type: "phase",
//         phase: "ghostwriter",
//         message: `Phase 2 (Attempt ${attempt}/${MAX_ATTEMPTS}): Ghostwriter drafting content...`,
//       });
//       const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

//       send({
//         type: "phase",
//         phase: "prosecutor",
//         message: `Phase 3 (Attempt ${attempt}/${MAX_ATTEMPTS}): Prosecutor auditing for hallucinations...`,
//       });
//       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog);

//       if (verdict.isApproved) {
//         finalDrafts = drafts;
//         send({
//           type: "approved",
//           message: `APPROVED on attempt ${attempt}. Confidence: ${verdict.confidence}%.`,
//           confidence: verdict.confidence,
//         });
//         break;
//       }

//       correctionNote = verdict.correctionNote;
//       send({
//         type: "rejected",
//         attempt,
//         correctionNote,
//         message: `Attempt ${attempt} rejected. Correction sent back to Ghostwriter.`,
//       });
//       attempt++;
//     }

//     if (!finalDrafts) {
//       send({ type: "error", message: "Could not produce approved content after 3 attempts. Try a clearer source document." });
//       return res.end();
//     }

//     // ── Complete ──────────────────────────────────────────────────────────
//     send({
//       type: "complete",
//       drafts: finalDrafts,
//       factSheet,
//       totalAttempts: attempt,
//       confidence: 96,
//     });
//     res.end();

//   } catch (err) {
//     console.error("Pipeline error:", err.message);
//     send({ type: "error", message: `Pipeline error: ${err.message}` });
//     res.end();
//   }
// });

// // ── 404 ──────────────────────────────────────────────────────────────────────
// app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.url}` }));

// // ── Start ─────────────────────────────────────────────────────────────────────
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`\n🏛️  Sentinel Assembly — Server Online`);
//   console.log(`   URL      → http://localhost:${PORT}`);
//   console.log(`   Health   → http://localhost:${PORT}/api/health`);
//   console.log(`   Provider → OpenRouter (FREE)`);
//   console.log(`   Model    → mistralai/mistral-7b-instruct:free`);
//   console.log(`   Key      → ✓ Found (${OR_KEY.length} chars)\n`);
// });








import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { runArchivist } from "./agents/archivist.js";
import { runGhostwriter } from "./agents/ghostwriter.js";
import { runProsecutor } from "./agents/prosecutor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuration ──
const PORT = process.env.PORT || 3001;

// ── Load .env ──
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const i = t.indexOf("=");
    if (i === -1) return;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  });
  console.log("✓ .env loaded");
}

const OR_KEY = process.env.OPENROUTER_API_KEY;
if (!OR_KEY) {
  console.error("✗ OPENROUTER_API_KEY missing in server/.env");
  process.exit(1);
}

// ── Express Setup ──
const app = express();
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "online", provider: "OpenRouter", keyFound: !!OR_KEY });
});

// ── Main Pipeline (SSE) ──
app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (e) {}
  };
  const onLog = (entry) => send({ type: "log", ...entry });

  try {
    let rawText = "";
    if (req.file) {
      rawText = fs.readFileSync(req.file.path, "utf-8");
      fs.unlinkSync(req.file.path);
    } else if (req.body?.text) {
      rawText = req.body.text;
    }

    if (!rawText || rawText.length < 10) {
      send({ type: "error", message: "Input too short to analyze." });
      return res.end();
    }

    send({ type: "pipeline_start", message: "Sentinel Assembly activated. Engine Online." });

    // --- PHASE 1: ARCHIVIST ---
    send({ type: "phase", phase: "archivist", message: "Phase 1: Archivist extracting ground truth..." });
    const factSheet = await runArchivist(rawText, onLog);
    send({ type: "factsheet", data: factSheet });

    // --- PHASE 2 & 3: THE SMART LOOP ---
    let attempt = 1;
    const MAX_ATTEMPTS = 3; 
    let correctionNote = null;
    let finalDrafts = null;

    while (attempt <= MAX_ATTEMPTS) {
      // CIRCUIT BREAKER: If this is the last try, we tell the agents to finalize.
      const isLastAttempt = (attempt === MAX_ATTEMPTS);

      send({ 
        type: "phase", 
        phase: "ghostwriter", 
        message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Synthesizing content...` 
      });
      const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

      send({ 
        type: "phase", 
        phase: "prosecutor", 
        message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Auditing for compliance...` 
      });
      
      // Pass the isLastAttempt flag to the Prosecutor
      const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

      // SUCCESS CONDITION: Either it's approved OR we hit the attempt limit.
      if (verdict.isApproved || isLastAttempt) {
        finalDrafts = drafts;
        send({
          type: "complete",
          drafts: finalDrafts,
          factSheet,
          totalAttempts: attempt,
          message: isLastAttempt ? "Manual Override: Final Draft Sealed." : "Audit Approved."
        });
        return res.end();
      }

      // REJECTION LOGIC: Prep for next loop
      correctionNote = verdict.correctionNote;
      send({ type: "rejected", attempt, correctionNote });
      attempt++;
    }

    res.end();
  } catch (err) {
    console.error("Pipeline Error:", err.message);
    send({ type: "error", message: `Pipeline Failure: ${err.message}` });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n🏛️  SENTINEL ASSEMBLY — COMMAND CENTER ONLINE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔑 Key: ${OR_KEY.slice(0, 10)}... [ACTIVE]\n`);
});