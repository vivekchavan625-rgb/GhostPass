# GhostPass Known Limitations & Boundaries

To ensure transparent zero-trust claims, GhostPass explicitly documents its operational boundaries and security limits.

## 1. Operating System & Hardware Boundaries
- **Host Keyloggers & Screen Scrapers**: If the user's operating system is compromised by malware or a physical screen capture device, client-side browser sanitization cannot prevent observation of the initial unredacted text.
- **Browser Memory Dumps**: During an active browser tab session, unredacted text exists in the JavaScript V8 heap. A process with administrative access to inspect browser process memory could read these buffers before the tab is closed or "Clear Memory" is invoked.

## 2. Browser Extensions
- **Elevated Host Permissions**: Browser extensions granted permissions such as `<all_urls>` or `activeTab` can run content scripts that access the DOM and read input field values regardless of page Content Security Policy (CSP).
- **Recommendation**: For maximum security when handling high-classification secrets, run GhostPass inside an **Incognito / Private Browsing** profile with all extensions disabled.

## 3. Detection Scope & False Negatives
- **Unstructured Names & Contextual Secrets**: GhostPass does not run heavy NLP/LLM Named Entity Recognition (NER) models locally. Free-form human names ("Alice Smith") or custom internal project codenames are not recognized unless they conform to standard credentials or ID patterns.
- **Non-Standard ID Formats**: Government IDs outside India (e.g. US SSN, UK National Insurance) are currently not included in the standard detection rules.
- **Obfuscated Data**: Deliberately obfuscated PII (e.g., `user [at] domain [dot] com` or numbers written in words `nine eight four...`) will not trigger regex pattern matches.

## 4. Performance & File Size Bounds
- **Input Size Limit**: Ingestion is capped at **2 MB** per file or paste event to prevent browser tab UI lockup and memory exhaustion.
- **Spreadsheet Complexity**: Extremely large CSV files (> 50,000 cells) may introduce UI rendering latency during diff calculation.
