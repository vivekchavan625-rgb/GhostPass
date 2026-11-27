# GhostPass 3-Minute Demo Walkthrough

A structured script for demonstrating GhostPass's zero-trust capabilities to judges, auditors, or team members.

---

### Minute 0:00 – 0:45: The Problem & The Solution
1. **Navigate** to `https://<ghostpass-url>/#workspace`.
2. **Pitch**: *"Whenever we paste incident logs, support tickets, or customer records into cloud LLMs, sensitive PII leaks to third parties. Cloud scrubbers ask us to trust them with our data. GhostPass solves this by sanitizing everything 100% inside your browser tab."*
3. **Open Developer Tools** (`F12`), switch to the **Network** tab, and show that zero telemetry calls are being made.

---

### Minute 0:45 – 1:30: Detection & Redaction in Action
1. Click **Load Sample** in the Workspace toolbar and select **"Incident Log with Mixed PII"**.
2. Point out detected entities highlighted in the side-by-side diff:
   - Indian Aadhaar numbers validated with Verhoeff checksum.
   - Credit card numbers validated with Luhn algorithm.
   - PAN cards, IP addresses, and emails.
3. Toggle through the three redaction modes:
   - **Full Redaction**: Semantic placeholder tokens (`[REDACTED_EMAIL]`, `[REDACTED_CARD]`).
   - **Partial Masking**: Preserves structural audit context (`v***@example.com`, `XXXX-XXXX-XXXX-1234`).
   - **Pseudonymization**: Replaces sensitive data with deterministic aliases (`USER_01`, `CARD_01`) that preserve entity relationships for AI prompting.

---

### Minute 1:30 – 2:15: Privacy Proof Center
1. Click **Privacy** in the top navigation bar (`#privacy`).
2. Show the live **Privacy Proof Center**:
   - **Network Monitor**: Confirms `0` external requests and displays the active Content Security Policy (`connect-src 'none'`).
   - **Storage Auditor**: Proves `localStorage`, `sessionStorage`, and `IndexedDB` contain zero document text or PII tokens.
   - **Canary Scanner**: Demonstrates automated scanning for in-memory leaks.

---

### Minute 2:15 – 3:00: Verification, Evaluation & Ephemeral Wipe
1. Click **Evaluate** (`#evaluate`): Run the live 1-click test suite and show sub-millisecond benchmark results.
2. Return to the **Workspace** and click **Clear Memory**.
3. Point out that all document buffers and pseudonym mappings are instantly wiped from browser memory.
4. Conclude: *"GhostPass delivers verifiable, zero-trust data protection right where the data originates: on the user's device."*
