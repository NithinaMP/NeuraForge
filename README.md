<div align="center">

<br />

```
 ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
 ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
 ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
 ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
 ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
 ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
          A S S E M B L Y
```

### Self-Governing AI Content Governance Engine

*Drop a document. Three agents argue, audit, and approve — until the output is hallucination-free.*

<br />

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Free_Tier-00ff88?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

<br />

</div>

---

## The Problem

Every product launch forces a marketing team to manually rewrite the same information — once for the blog, once for LinkedIn, once for email. The result is inconsistency, creative burnout, and content that slowly drifts from what the product actually does.

The deeper problem is not about writing speed. It's about **trust**. Single-model AI tools generate content confidently, but with no mechanism to verify what they wrote against what the source document actually said. A claimed feature that doesn't exist, a price point that was invented, a stat that was approximated — these slip through because nothing is checking.

Sentinel Assembly is built around a different principle: **content should be verified before it leaves the system.**

---

## How It Works

Rather than a single AI generating content and hoping for the best, three specialized agents each perform a distinct role in sequence:

```
Raw Document
     │
     ▼
┌─────────────────────────────────────────┐
│  AGENT 1 — THE ARCHIVIST                │
│  Extracts verifiable facts into a       │
│  structured JSON Fact-Sheet.            │
│  Flags vague or ambiguous claims.       │
└─────────────────────────────────────────┘
     │
     ▼  (Fact-Sheet, not original doc)
┌─────────────────────────────────────────┐
│  AGENT 2 — THE GHOSTWRITER              │
│  Drafts Blog Post + Social Thread +     │
│  Email Campaign from the Fact-Sheet     │
│  only. Tone set by personality mode.   │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  AGENT 3 — THE PROSECUTOR               │
│  Compares every claim in the drafts     │
│  against the Fact-Sheet. Issues a       │
│  specific correction note if anything   │
│  is wrong. Approves if all clear.       │
└─────────────────────────────────────────┘
     │
  ┌──┴──┐
  │     │
REJECT  APPROVE
  │         │
  └─ loop ──┘   (up to 3 attempts, fully autonomous)
     │
     ▼
Approved Campaign Kit
```

The self-correcting loop is the key design choice. The Prosecutor is adversarial by intent — it exists specifically to break the Ghostwriter's work. This means the final output is not just generated content; it's content that has been challenged and survived.

---

## Features

**Core Pipeline**
- Three-agent autonomous pipeline: Archivist → Ghostwriter → Prosecutor
- Self-correcting loop — runs until approved, up to 3 attempts
- Live agent log feed via Server-Sent Events (real-time, no polling)
- Audit Trail — visual timeline of every prosecution attempt and correction note

**Content Output**
- Blog post (~400 words, structured)
- Social media thread (5 posts, under 280 chars each)
- Email campaign (subject line + 90-word body with CTA)
- Mobile preview — see social posts rendered in a phone frame

**Agent Personality**
- Three selectable writing voices: Corporate Executive, Hype Beast, Minimalist
- Each personality dynamically injects a different system prompt into the Ghostwriter

**User System**
- JWT authentication — register, login, secure sessions
- Mission History — every run auto-saved to MySQL
- Mission Detail Page — 4 tabs: Campaign Results, Audit Trail, Fact Sheet, Source Document
- Export Kit — download full approved campaign as formatted text

**Technical**
- Server-Sent Events for real-time streaming (no WebSocket library needed)
- MySQL with auto-table creation on first run
- Graceful degradation — app works without MySQL (history disabled, pipeline still runs)

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast build, no overhead |
| Styling | Pure CSS custom properties | No build-time dependency issues |
| Backend | Node.js + Express | Lightweight, SSE-native |
| AI | OpenRouter — Mistral 7B (free) | Zero cost, no billing required |
| Auth | JWT + bcryptjs | Industry-standard stateless auth |
| Database | MySQL 8 | Relational fit for users + missions |
| Streaming | Server-Sent Events | Simpler than WebSockets, HTTP-native |

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MySQL 8.x** — [dev.mysql.com/downloads](https://dev.mysql.com/downloads/)
- **OpenRouter account (free)** — [openrouter.ai](https://openrouter.ai)

---



## Usage

1. Register an account or use the demo credentials button
2. Select a Ghostwriter personality (Corporate Executive / Hype Beast / Minimalist)
3. Paste a product document — or click **Load sample document** to test immediately
4. Click **Activate Sentinel Assembly**
5. Watch the three agents work in the live Agent Operations Room (left panel)
6. View the approved campaign — Blog, Social Thread, Email — in the right panel
7. Check the Audit Trail to see every prosecution loop and correction
8. Open Mission History to revisit any past run with full detail across 4 tabs

---

## Project Structure

```
sentinel-assembly/
├── README.md
├── APPROACH.md
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                    # Router + pipeline orchestrator
│       ├── index.css                  # Complete design system
│       ├── main.jsx
│       ├── pages/
│       │   ├── AuthPage.jsx           # Login / register
│       │   └── MissionDetailPage.jsx  # Past mission — 4 tabs
│       └── components/
│           ├── UploadArea.jsx         # Input + history drawer
│           ├── AgentChat.jsx          # Live agent log feed
│           ├── AuditTrail.jsx         # Visual prosecution timeline
│           └── CampaignPreview.jsx    # Approved output + export
│
└── server/
    ├── index.js                       # Express server + SSE pipeline
    ├── package.json
    ├── .env.example
    ├── agents/
    │   ├── archivist.js               # Fact extraction
    │   ├── ghostwriter.js             # Content creation (3 formats)
    │   └── prosecutor.js              # Hallucination audit
    ├── utils/
    │   └── ai.js                      # OpenRouter API caller
    ├── db/
    │   └── database.js                # MySQL pool + table init
    ├── middleware/
    │   └── auth.js                    # JWT verification
    └── routes/
        ├── auth.js                    # Register + login
        └── missions.js                # Mission history CRUD
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `OPENROUTER_API_KEY missing` | Check `server/.env` exists and key starts with `sk-or-v1-` |
| MySQL connection refused | Confirm MySQL is running; verify `DB_PASSWORD` in `.env` |
| `Port 3001 already in use` | Change `PORT=3002` in `server/.env` |
| Client shows proxy error | Server must be running before starting the client |
| Empty output sections | The free AI model may have hit rate limits — wait 30 seconds and retry |

> **Note:** The app runs without MySQL. If the database is unavailable, mission history is disabled but the AI pipeline works normally.

---

## Approach Document

See [APPROACH.md](docs/APPROACH.md) for the full solution design, tech stack reasoning, and improvement roadmap.

---

