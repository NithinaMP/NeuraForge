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
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Sentinel Assembly is online", timestamp: new Date() });
});

// Main pipeline endpoint using Server-Sent Events for real-time streaming
app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const onLog = (logEntry) => {
    send({ type: "log", ...logEntry });
  };

  try {
    // Extract text from uploaded file
    let rawText = "";

    if (req.file) {
      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      if (mimeType === "application/pdf") {
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        rawText = pdfData.text;
      } else {
        rawText = fs.readFileSync(filePath, "utf-8");
      }

      fs.unlinkSync(filePath); // cleanup
    } else if (req.body?.text) {
      rawText = req.body.text;
    } else {
      send({ type: "error", message: "No document provided." });
      return res.end();
    }

    send({ type: "pipeline_start", message: "Sentinel Assembly initiated. All agents standing by." });

    // ─── AGENT 1: THE ARCHIVIST ───
    send({ type: "phase", phase: "archivist", message: "Phase 1: The Archivist is analyzing your document..." });
    const factSheet = await runArchivist(rawText, onLog);
    send({ type: "factsheet", data: factSheet });

    // ─── AGENT LOOP: GHOSTWRITER ↔ PROSECUTOR ───
    const MAX_ATTEMPTS = 3;
    let attempt = 1;
    let finalDrafts = null;
    let correctionNote = null;

    while (attempt <= MAX_ATTEMPTS) {
      send({ type: "phase", phase: "ghostwriter", message: `Phase 2 (Attempt ${attempt}): The Ghostwriter is drafting content...` });
      const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

      send({ type: "phase", phase: "prosecutor", message: `Phase 3 (Attempt ${attempt}): The Prosecutor is auditing the drafts...` });
      const verdict = await runProsecutor(factSheet, drafts, attempt, onLog);

      if (verdict.isApproved) {
        finalDrafts = drafts;
        send({
          type: "approved",
          message: `All content APPROVED on attempt ${attempt} with ${verdict.confidence}% confidence.`,
          confidence: verdict.confidence,
        });
        break;
      } else {
        correctionNote = verdict.correctionNote;
        send({
          type: "rejected",
          attempt,
          correctionNote,
          message: `Attempt ${attempt} rejected. Ghostwriter will revise.`,
        });
        attempt++;
      }
    }

    if (!finalDrafts) {
      send({ type: "error", message: "Maximum revision attempts reached. Returning best draft." });
    }

    // ─── FINAL OUTPUT ───
    send({
      type: "complete",
      drafts: finalDrafts,
      factSheet,
      totalAttempts: attempt,
      message: "Sentinel Assembly complete. Campaign Kit ready.",
    });

    res.end();
  } catch (err) {
    console.error(err);
    send({ type: "error", message: err.message });
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🏛️  Sentinel Assembly Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});