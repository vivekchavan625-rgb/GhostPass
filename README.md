# GhostPass

> **Zero-Trust, Browser-Only PII & Sensitive Data Sanitizer**  
> Protect sensitive data *before* it leaves your machine. Your documents never touch a backend, third-party API, cloud service, or telemetry endpoint.

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Zero Network Requests](https://img.shields.io/badge/Network-0%20Requests-brightgreen.svg)](#zero-trust-privacy-guarantees)
[![Strict CSP](https://img.shields.io/badge/CSP-connect--src%20'none'-success.svg)](#content-security-policy)

---

## 💡 What & Why

Modern LLMs, cloud analytics, and shared bug trackers frequently ingest enterprise and personal data containing highly sensitive Personally Identifiable Information (PII) and credentials. Traditional "data scrubbers" typically rely on server-side APIs—meaning you must trust a 3rd-party SaaS with the very data you are trying to safeguard.

**GhostPass** inverts this model:
- **100% Client-Side**: Execution takes place entirely inside your local browser tab's JavaScript runtime.
- **Architecturally Incapable of Exfiltration**: Network calls (`fetch`, `XHR`, `WebSocket`, `sendBeacon`, `EventSource`) are blocked via strict Content Security Policy (`connect-src 'none'`).
- **Cryptographic & Checksum Validation**: Implements deterministic algorithms (Luhn for Credit Cards, Verhoeff for Indian Aadhaar, Octet verification for IPv4, structured syntax for Indian PAN, Phone, and Email) to eliminate false positives without cloud NLP overhead.

---

## ⚡ Core Features

- **7 High-Confidence Detectors**:
  - **Email Addresses**: RFC 5322 compliant regex with domain and label validations.
  - **Phone Numbers**: Indian (+91/0 with 10 digits starting 6–9) and International (E.164-compliant).
  - **IPv4 Addresses**: Bounded octets (0–255) with contextual exclusion of software version strings (`v1.2.3.4`).
  - **Permanent Account Number (PAN)**: 10-character Indian tax ID format (`[A-Z]{5}[0-9]{4}[A-Z]`).
  - **Aadhaar Numbers**: 12-digit Indian national identity numbers with full **Verhoeff checksum validation** and space/hyphen formatting.
  - **Credit / Debit Cards**: 13–19 digit PANs across major card networks with mandatory **Luhn checksum algorithm**.
- **Deterministic Overlap Resolution**: Priority matrix resolves colliding entities (`Credit Card > Aadhaar > PAN > Email > IPv4 > Phone`), breaking ties by longest span.
- **3 Flexible Redaction Strategies**:
  - **Full Redaction**: Semantic bracketed tokens (`[REDACTED_EMAIL]`, `[REDACTED_CARD]`, etc.).
  - **Partial Masking**: Keeps audit context while masking secrets (`v***@example.com`, `XXXX-XXXX-XXXX-1234`, `98XXXXXX10`).
  - **Pseudonymization**: Consistent, repeatable aliases (`USER_01`, `CARD_01`) mapped per session in memory, ideal for LLM prompts and debugging logs.
- **Document & CSV Support**: Supports raw text, log files, markdown, JSON, and structured CSV files with cell-by-cell sanitation and CSV formula injection mitigation.
- **Privacy Proof Center**: Real-time inspection of runtime network activity, storage allocations (LocalStorage/SessionStorage/IndexedDB), active CSP directives, and automated canary PII leakage scans.
- **Session-Only Audit Log**: Transient activity ledger stored strictly in browser memory. "Clear Memory" immediately wipes all buffers and resets pseudonym mappings.

---

## 🏗️ Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Local Browser Sandbox                           │
│                                                                        │
│   User Input (Paste / Upload: TXT, CSV, LOG, JSON <= 2 MB)             │
│                             │                                          │
│                             ▼                                          │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               GhostPass Engine (src/engine)                    │   │
│   │                                                                │   │
│   │   1. Regex Scanning (Bounded, Non-Backtracking Patterns)       │   │
│   │   2. Algorithmic Validation (Luhn / Verhoeff / Octets)         │   │
│   │   3. Deterministic Overlap Resolution & Entity Prioritization  │   │
│   │   4. Redaction Transformer (Full / Partial / Pseudonym)        │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                             │                                          │
│            ┌────────────────┴────────────────┐                         │
│            ▼                                 ▼                         │
│   Side-by-Side Diff View            Safety-Sanitized Export            │
│   & Entity Breakdown                (Clipboard / TXT / CSV)            │
│                                                                        │
│   ──────────────────────────────────────────────────────────────────   │
│   🛡️ Enforcement Boundary:                                            │
│     • CSP Header: connect-src 'none'; default-src 'self'               │
│     • Runtime Monkeypatch Monitored Traps (fetch, XHR, WebSocket)      │
│     • Ephemeral In-Memory Storage (Reset on Tab Close / Clear Memory)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Verify Privacy Yourself

Don't take our word for it—verify GhostPass's privacy guarantees directly:

### 1. In Browser Developer Tools
1. Open GhostPass in Chromium, Firefox, or Safari.
2. Press `F12` to open DevTools, and navigate to the **Network** tab.
3. Check the **Disable cache** option and refresh.
4. Paste any sensitive test document into the Workspace and perform redactions.
5. Filter by `Fetch/XHR`, `WS`, or `All`: **Notice zero network requests are made during sanitization.**
6. Open the **Application** or **Storage** tab: Inspect `Local Storage`, `Session Storage`, `IndexedDB`, and `Cookies`. **Only the UI theme preference (`ghostpass_theme`) is stored.**

### 2. Live CSP Inspection via curl
Verify that production response headers restrict network connectivity:
```bash
curl -I https://<your-ghostpass-deployment>.vercel.app
```
Look for:
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; worker-src 'self' blob:;
```

---

## 📊 Performance & Benchmark

GhostPass includes a built-in benchmark runner (`src/data/benchmark.ts`) that tests realistic documents with dense PII distributions:

| Document Size / Benchmark | Detected Entities | Avg Execution Time | Memory Overhead |
|:--------------------------|:-----------------:|:------------------:|:---------------:|
| Small Note (~500 B)       | 4                 | < 1 ms             | Negligible      |
| Medium Log (~25 KB)       | ~50               | < 4 ms             | < 100 KB        |
| Large Transcript (~250 KB)| ~300              | < 25 ms            | < 1 MB          |
| Maximum Payload (2 MB)    | > 2,000           | < 180 ms           | Transient Heap  |

*Benchmarked on modern V8 engine (Apple M-series / Intel Core i7).*

---

## ⚠️ Known Limitations & Boundaries

Honest boundaries of GhostPass's architectural model:
1. **Malicious Browser Extensions**: Browser extensions with host permissions (`<all_urls>`) run outside webpage CSP boundaries and can inspect the DOM. For maximum security with confidential data, run GhostPass in an **Incognito / Private Window** with all extensions disabled.
2. **Client Machine Security**: GhostPass cannot protect against hardware keyloggers, screen scrapers, or OS-level malware active on your host machine.
3. **No Named Entity Recognition (NER)**: GhostPass relies on deterministic patterns and algorithmic checksums. It does not detect arbitrary context-dependent personal names (e.g. "John Doe") unless structured like emails, IDs, or phone numbers.
4. **Memory Lifespan**: Data remains in the browser JavaScript heap during your session until you hit **Clear Memory**, refresh, or close the browser tab.

---

## 🚀 Quick Start & Scripts

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/ghostpass.git
cd ghostpass

# Install pinned dependencies
npm ci
```

### Available Scripts
```bash
# Start local development server
npm run dev

# Run static code analysis & type checking
npm run lint
npm run typecheck

# Run unit and integration test suite with coverage
npm run test
npm run test:coverage

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run independent Playwright end-to-end privacy verification
npm run test:e2e
```

---

## 📜 License
MIT License. Crafted for zero-trust privacy and data sovereignty.
