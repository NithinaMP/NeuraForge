# Approach Document: Sentinel Assembly

## 1. Solution Design: The Adversarial Loop
Sentinel Assembly addresses the "Hallucination Gap" in Generative AI by moving away from linear prompting to a **Recursive 3-Agent Architecture**:

* **AGT-01 (Archivist):** The Deterministic Layer. Extracts structured, verifiable data from raw payloads to create an immutable Fact-Sheet.
* **AGT-02 (Ghostwriter):** The Synthesis Layer. Generates multi-channel content (Blog, Social, Email) while strictly bound to the Fact-Sheet.
* **AGT-03 (Prosecutor):** The Governance Layer. Audits content against the Fact-Sheet. If a hallucination is detected, it triggers a **Recursive Correction Loop** where rejection logs are fed back to the Ghostwriter for re-synthesis.

## 2. Tech Stack & Infrastructure
* **React (Frontend):** Industrial HUD-style UI for real-time observability of the AI pipeline.
* **Node.js + Express (Backend):** The orchestrator managing stateful agent transitions and **SSE (Server-Sent Events)** for live audit streaming.
* **MySQL (Persistence):** A relational "Vault" to store user authentication, mission history, and step-by-step audit trails.
* **OpenRouter API (Intelligence):** Provides a model-agnostic gateway to high-logic models (GPT-4o/Mistral), ensuring the system is future-proof.

## 3. Core Innovations
* **Deterministic Fact-Locking:** Content generation is physically gated until facts are extracted and verified.
* **Adversarial Audit Enforcement:** No output is approved without a 100% consensus from the Prosecutor agent.
* **Stateful Observability:** Users can monitor the internal "argument" between agents via the Live Feed.

## 4. Challenges & Engineering Hurdles
* **Context Steering:** Ensuring the Ghostwriter respects rejection notes without losing the original persona.
* **State Management:** Handling multi-step asynchronous workflows and maintaining SSE connection stability.
* **Consistency:** Normalizing JSON outputs from different LLM providers via OpenRouter.

## 5. Future Roadmap
* **RAG Integration:** Utilizing Vector Databases for large-scale document analysis.
* **Human-in-the-Loop:** A manual override interface for high-stakes legal/medical review.
* **Domain-Specific Tuning:** Implementing specialized agents for technical or financial auditing.

## 6. Conclusion
Sentinel Assembly is not just a content generator; it is a **Trust Engine**. By enforcing an adversarial relationship between generation and validation, it ensures that AI output is reliable, auditable, and ready for enterprise deployment.
