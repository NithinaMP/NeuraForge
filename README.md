# 🏛️ Sentinel Assembly v2.0

### *Self-Correcting Multi-Agent Content Governance Engine*

<p align="center">
  <img src="https://img.shields.io/badge/AI%20Pipeline-Active-0A66C2?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Validation-Recursive-success?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Operational-black?style=for-the-badge"/>
</p>

---

## ✦ Overview

Sentinel Assembly is an adversarial AI middleware designed to generate **fact-verified, audit-compliant content** through a structured, self-correcting pipeline.

Unlike traditional generation systems, it enforces **recursive validation**, ensuring outputs are continuously audited before approval.

---

## ✦ Core Concept

> **“Generate → Challenge → Correct → Approve”**

A closed-loop architecture where **no output escapes verification**.

---

## ✦ Architecture: Recursive Consensus Model

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NnZm1jY2ZqdnV3c2t0b3V4cHh3bWRyZ3ZyY3JrZ3R3a3J6d2R3NyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKtnuHOHHUjR38Y/giphy.gif" width="400"/>
</p>

### 🧠 AGT-01 — Archivist

* Extracts structured facts
* Builds deterministic **Fact-Sheet**
* Flags ambiguity

---

### ✍️ AGT-02 — Ghostwriter

* Generates multi-format content
* Strictly bound to Fact-Sheet
* Supports tone/personality control

---

### ⚖️ AGT-03 — Prosecutor

* Audits for hallucinations
* Enforces factual consistency
* Issues correction directives

---

## 🔁 Recursive Validation Loop (Core Innovation)

```text
Draft → Audit → Reject → Correct → Re-Audit → Approve
```

✔ No bypass
✔ No unchecked output
✔ No hallucination tolerance

---

## ⚙️ System Flow

```mermaid
graph TD;
A[User Input] --> B[Archivist]
B --> C[Fact-Sheet]
C --> D[Ghostwriter]
D --> E[Draft Content]
E --> F[Prosecutor Audit]

F -->|Rejected| D
F -->|Approved| G[Final Output]
```

---

## 🛠️ Tech Stack

| Layer     | Technology        |
| --------- | ----------------- |
| Frontend  | React + Vite      |
| Backend   | Node.js + Express |
| Database  | MySQL             |
| Auth      | JWT               |
| AI Engine | OpenRouter        |

---

## ✨ Key Features

* 🧠 Multi-agent AI pipeline
* 🔁 Recursive self-correction
* ⚖️ Hallucination detection
* 📊 Real-time audit logs
* 🎭 Persona-based generation
* 🔐 Secure authentication
* 📂 Mission history tracking


---

## 🛡️ Operational Guarantees

✔ Deterministic grounding
✔ Mandatory validation
✔ Transparent audit trail
✔ Controlled generation

---

## 📁 Structure

```
client/     → UI
server/     → API + Agents
docs/       → Approach Document
```




---

## 🔐 Security

* .env protected
* JWT sessions
* API key isolation

---

## 📌 Status

<p align="center">
  <img src="https://img.shields.io/badge/System-Verified-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/Loop-Recursive-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/Output-Audited-black?style=flat-square"/>
</p>

---

