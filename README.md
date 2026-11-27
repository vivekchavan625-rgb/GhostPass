# GhostPass

> **Client-Side, Browser-Only PII & Sensitive Data Sanitizer**  
> Protect sensitive data before sharing with AI models, ticketing platforms, or logs. Document contents are processed locally in the browser and never transmitted.

**Live Deployment:** [https://ghostpass-zeta.vercel.app](https://ghostpass-zeta.vercel.app)  
**Source Repository:** [https://github.com/vivekchavan625-rgb/GhostPass](https://github.com/vivekchavan625-rgb/GhostPass)  

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Tests: 76 Passing](https://img.shields.io/badge/Vitest-76%2F76%20Passed-brightgreen.svg)](#real-verified-numbers)
[![E2E: 5 Passing](https://img.shields.io/badge/Playwright-5%2F5%20Passed-brightgreen.svg)](#real-verified-numbers)
[![CSP: connect-src 'none'](https://img.shields.io/badge/CSP-connect--src%20'none'-success.svg)](#architecture--data-flow)

---

## What & Why

Modern LLMs, cloud analytics tools, and shared ticketing systems frequently receive incident logs, support records, or database extracts containing sensitive Personally Identifiable Information (PII). Cloud-based sanitizers require uploading raw data to a third-party server, introducing privacy and compliance risks.

**GhostPass** processes everything directly in your browser:
- **Local-Only Processing**: Document contents are parsed, detected, and redacted entirely within your local browser's JavaScript runtime.
- **Strict Outbound Network Policy**: Protected by production Content Security Policy headers (`connect-src 'none'`), which block runtime network connection APIs (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`). Note: standard static assets (HTML, CSS, JS bundles) load when you first open the web application.
- **Algorithmic & Checksum Validation**: Mathematical checksum algorithms (Luhn for Credit Cards, Verhoeff for Indian Aadhaar, Octet range validation for IPv4, structured syntax for Indian PAN, Phone, and Email) eliminate false positives without requiring external API calls or heavyweight models.

---

## Core Features

- **7 High-Confidence Detectors**:
  - **Email Addresses**: RFC 5322 regex with bounded domain and label validation.
  - **Phone Numbers**: Indian (+91/0 prefix with 10 digits starting with 6–9) and International (E.164-compliant).
  - **IPv4 Addresses**: Bounded octets (0–255) with contextual exclusion of software version strings (e.g., `v1.2.3.4`).
  - **Permanent Account Number (PAN)**: 10-character Indian tax identification format (`[A-Z]{5}[0-9]{4}[A-Z]`).
  - **Aadhaar Numbers**: 12-digit Indian national identity numbers with mandatory **Verhoeff checksum validation** and optional grouping.
  - **Credit & Debit Cards**: 13–19 digit card numbers across major card networks validated with the **Luhn checksum algorithm**.
- **Deterministic Overlap Resolution**: Strict priority matrix (`Credit Card > Aadhaar > PAN > Email > IPv4 > Phone`), breaking ties by the longest matched span.
- **3 Redaction Modes**:
  - **Full Mask**: Semantic placeholder tokens (`[REDACTED_EMAIL]`, `[REDACTED_CARD]`, etc.).
  - **Partial Mask**: Preserves structural audit context while masking sensitive characters (`v***@example.com`, `XXXX-XXXX-XXXX-1234`, `98XXXXXX10`).
  - **Pseudonymization**: Consistent, repeatable aliases (`USER_01`, `CARD_01`) mapped per session in memory, ideal for AI prompt workflows.
- **CSV & Formula Injection Mitigation**: Cell-by-cell sanitation with automated neutralization of formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) to protect spreadsheet exports.
- **Privacy Proof Center**: Real-time auditing of runtime network activity, client storage allocations (LocalStorage, SessionStorage, IndexedDB), active CSP directives, and automated canary PII leakage scans.
- **Session-Only Audit Log**: Transient activity ledger stored strictly in browser memory. Clicking "Clear Memory" immediately wipes all buffers and resets pseudonym mappings.

---

## Architecture & Data Flow

```
+------------------------------------------------------------------------+
|                          Local Browser Sandbox                         |
|                                                                        |
|    User Input (Paste or Drop: TXT, CSV, LOG, JSON <= 2 MB)             |
|                               |                                        |
|                               v                                        |
|    +--------------------------------------------------------------+    |
|    |               GhostPass Engine (src/engine)                  |    |
|    |                                                              |    |
|    |   1. Bounded Regex Scanning (Linear, Non-Backtracking)       |    |
|    |   2. Checksum Validation (Luhn / Verhoeff / Octets)          |    |
|    |   3. Deterministic Overlap Resolution & Prioritization       |    |
|    |   4. Redaction Transformer (Full / Partial / Pseudonym)      |    |
|    +--------------------------------------------------------------+    |
|                               |                                        |
|             +-----------------+-----------------+                      |
|             v                                   v                      |
|    Side-by-Side Diff View              Sanitized Export                |
|    & Entity Breakdown                  (Clipboard / TXT / CSV)         |
|                                                                        |
|    ----------------------------------------------------------------    |
|    Enforcement Boundary:                                               |
|      - CSP Header: connect-src 'none'; default-src 'self'              |
|      - Runtime Monitor Traps (fetch, XHR, WebSocket, sendBeacon)       |
|      - Volatile Memory Lifecycle (Cleared on Tab Close or Reset)       |
+------------------------------------------------------------------------+
```

---

## How to Verify Privacy Yourself

You can independently audit GhostPass's privacy guarantees using standard browser tools:

### 1. In Browser Developer Tools
1. Open GhostPass in any modern browser (Chrome, Edge, Firefox, Safari).
2. Press `F12` to open DevTools, then navigate to the **Network** tab.
3. Check the **Disable cache** option and reload the page to observe initial static asset delivery.
4. Paste sensitive test data into the Workspace and perform sanitizations.
5. Filter by `Fetch/XHR`, `WS`, or `All`: **Observe that no network requests are made during sanitization.**
6. Open the **Application** or **Storage** tab: Inspect `Local Storage`, `Session Storage`, `IndexedDB`, and `Cookies`. **Only the UI theme preference (`ghostpass_theme`) is stored.**

### 2. Live CSP Inspection via curl
Verify that production response headers enforce the client-side restriction:
```bash
curl -I https://ghostpass-zeta.vercel.app
```
Expected header includes:
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; worker-src 'self' blob:;
```

---

## Real Verified Numbers

All metrics reported below reflect verified test runs in the project repository:

- **Unit & Integration Tests**: **76 passed** across 15 test files (`vitest run`).
- **Engine Test Coverage**: **96.01%** statement coverage across `src/engine/` (`vitest run --coverage`).
- **End-to-End Privacy Verification**: **5 passed** out of 5 tests (`@playwright/test` on Chromium):
  - *Test A*: Zero canary data leakage and 0 post-load network requests.
  - *Test B*: Zero canary content stored in `localStorage`, `sessionStorage`, or `IndexedDB`.
  - *Test C*: Outbound `fetch()` calls blocked by CSP `connect-src 'none'`.
  - *Test D*: Golden journey (sample load, multi-mode sanitization, stable `data-testid="entity-count"` verification, and memory wipe).
  - *Test E*: XSS immunity with inert rendering of malicious `<script>` and `<img onerror>` payloads.
- **Synthetic Benchmark Results**:
  - Tested on a labeled dataset of **44 synthetic items** (including 21 adversarial negative items).
  - Overall Precision: **0.957**
  - Overall Recall: **0.957**
  - Overall F1 Score: **0.957**
  - *Note: This benchmark evaluates a curated synthetic sample set to test algorithmic rules and edge cases; it does not constitute a statistical guarantee of real-world accuracy across all data distributions.*

---

## Known Limitations & Boundaries

To ensure transparent disclosures, GhostPass explicitly outlines its security boundaries:

1. **Browser Extensions**: Extensions with broad host permissions (e.g. `<all_urls>` or `activeTab`) run content scripts outside page CSP boundaries and can inspect DOM elements. For maximum security when processing confidential data, use an **Incognito / Private Browsing** window with extensions disabled.
2. **Host Machine & OS Security**: GhostPass cannot protect against hardware keyloggers, screen recording malware, or memory scraping software active on the host machine.
3. **Deterministic Rules vs. Named Entity Recognition (NER)**: GhostPass uses deterministic pattern and checksum algorithms rather than AI/NER models. It does not identify arbitrary free-form personal names (e.g., "Alice Smith") unless formatted as credentials, IDs, email addresses, or phone numbers.
4. **Memory Lifespan & Garbage Collection**: Document text resides in the browser JavaScript heap during your session until you click **Clear Memory**, reload the tab, or close the browser.

---

## Quick Start & Scripts

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/vivekchavan625-rgb/GhostPass.git
cd GhostPass

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

# Run unit and integration tests
npm test

# Run tests with coverage reporting
npm run test:coverage

# Build for production with CSP meta injection
npm run build

# Preview production build locally
npm run preview

# Run Playwright end-to-end privacy verification
npm run test:e2e
```

---

## License

MIT License. Designed for privacy-first, zero-trust data sanitization.
