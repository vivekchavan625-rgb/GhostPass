# GhostPass Threat Model

## 1. System Overview & Trust Assumptions
GhostPass is an in-browser application engineered to sanitize Personally Identifiable Information (PII) before it is shared with third parties or cloud LLMs.

### In-Scope Boundaries
- The web browser tab executing GhostPass.
- Browser storage APIs (`localStorage`, `sessionStorage`, `indexedDB`, `cookies`).
- Outbound network stack interfaces (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, beacon elements).
- Client memory lifecycle (JavaScript heap).

### Out-of-Scope (Untrusted / External)
- Host machine operating system and kernel security.
- Malicious or compromised browser extensions with elevated privileges.
- Physical access and screen recording/keylogger attacks.

---

## 2. Threat Analysis & Mitigations

### Threat 1: Unauthorized Data Exfiltration via Network
- **Vector**: Malicious dependencies, injected scripts, or DNS prefetch attempting to exfiltrate user input or detected entities.
- **Severity**: Critical.
- **Mitigation**:
  - **Content Security Policy (CSP)**: Mandatory `connect-src 'none'`. All runtime connection attempts are blocked by the browser engine.
  - **Runtime Monitor (`src/privacy/monitor.ts`)**: Traps `window.fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket`, and `EventSource`. Any cross-origin attempt is detected and counted in the Privacy Center.
  - **Zero External Resources**: No external Google Fonts, CDNs, analytics SDKs, or remote telemetry.

### Threat 2: Cross-Site Scripting (XSS) & Code Injection
- **Vector**: User uploading or pasting weaponized documents containing `<script>alert(1)</script>` or `<img src=x onerror=...>` payloads.
- **Severity**: High.
- **Mitigation**:
  - React's default JSX automatic escaping is strictly maintained.
  - Zero instances of `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval()`, or `new Function()` anywhere in the codebase.
  - CSP directive `object-src 'none'; base-uri 'none'; script-src 'self'`.

### Threat 3: CSV Formula Injection (Spreadsheet Execution)
- **Vector**: Uploading or exporting CSV documents where cell values begin with executable characters (`=`, `+`, `-`, `@`, `\t`, `\r`) designed to execute malicious code when opened in Microsoft Excel or Google Sheets.
- **Severity**: Medium-High.
- **Mitigation**:
  - `src/engine/csv.ts` sanitizes every exported cell starting with formula trigger symbols by prepending a single quote `'` (`wrapFormulaCell`).
  - Strict quoting and RFC 4180 parsing compliance via pinned `papaparse`.

### Threat 4: Prototype Pollution
- **Vector**: Malicious CSV column headers or JSON keys such as `__proto__`, `constructor`, `prototype` designed to alter Object prototypes.
- **Severity**: Medium.
- **Mitigation**:
  - Pseudonym generation and dictionary mappings utilize clean `Map` instances (`new Map()`) rather than plain object dictionary lookups.
  - Verified by dedicated automated test suite (`tests/engine/prototype-pollution.test.ts`).

### Threat 5: Regular Expression Denial of Service (ReDoS)
- **Vector**: Adversarial strings (e.g. 100,000 repeated numbers or nested pattern combinations) causing catastrophic polynomial/exponential backtracking.
- **Severity**: Medium.
- **Mitigation**:
  - All detector patterns are linear-time, non-backtracking regular expressions without nested quantifiers.
  - Enforced 2 MB input size limit across paste and file upload channels.
  - Verified by `tests/engine/redos.test.ts` where 100k character adversarial inputs evaluate under 150ms.

### Threat 6: Accidental Persistence in Browser Storage
- **Vector**: Sensitive document contents surviving a tab close or being readable by other tabs via `localStorage` or `sessionStorage`.
- **Severity**: High.
- **Mitigation**:
  - The document state, extracted entities, and pseudonym maps reside exclusively in transient JavaScript memory (Zustand ephemeral store).
  - Only the non-sensitive string key `ghostpass_theme` ('light' | 'dark') is ever persisted in `localStorage`.
  - Active runtime storage scanner continuously audits all storage mechanisms for canary values.

### Threat 7: Browser Extension Eavesdropping
- **Vector**: Third-party browser extensions with permissions to read page DOM (`<all_urls>`).
- **Severity**: Medium (Platform constraint).
- **Mitigation**:
  - Clear user guidance advising the use of Incognito / Private Browsing windows without extensions enabled for high-sensitivity data sanitization.
