# Security Audit – NSE Stock Screener (Frontend Only)

## Overview
The project is a pure‑client‑side stock‑screening web‑app that fetches public data from Yahoo Finance, renders the results, and stores a watch‑list in `localStorage`.  No server‑side code or third‑party libraries are bundled, so the attack surface is limited to the browser environment.

## Findings
| # | Category | Description | Impact | Current State |
|---|----------|-------------|--------|---------------|
| 1 | **DOM‑Based XSS** | Stock data returned from Yahoo Finance is injected into the DOM using `innerHTML` (e.g., in `openModal()` and the results table). If the external API ever returns malicious markup (or an attacker can influence the response via a compromised DNS/Man‑in‑the‑Middle), arbitrary JavaScript could be executed. | High – can lead to session hijacking, credential theft, or defacement. | **Present** – no sanitisation/escaping is performed. |
| 2 | **Missing Security Headers / CSP** | The HTML page does not set a Content‑Security‑Policy, X‑Content‑Type‑Options, X‑Frame‑Options, Referrer‑Policy, or Feature‑Policy. Without these headers browsers cannot mitigate XSS, click‑jacking, or MIME‑sniffing attacks. | Medium – reduces defence‑in‑depth. | **Absent** – all headers rely on server configuration which is unknown. |
| 3 | **Unrestricted API Calls (Rate‑Limiting)** | The search input is debounced (500 ms) but a user can still paste a very long list of symbols (hundreds) causing a burst of parallel `fetch` requests to Yahoo Finance. This can lead to denial‑of‑service for the user and may trigger rate‑limits on the public endpoint. | Medium – possible DoS for the client and may get the client IP blocked by Yahoo. | **Present** – no request‑throttling or size limits. |
| 4 | **Information Leakage via Console** | Errors from `fetchQuote`/`fetchSummary` are logged with `console.warn(e)`. In production this may expose internal details (e.g., full request URLs, stack traces) to anyone with the console open. | Low – mainly an information‑leak, but can aid an attacker. |
| 5 | **Insufficient Validation of Imported Watchlist** | The import routine only checks that the parsed JSON is an array of strings. A malicious file could contain extremely large arrays or very long strings, leading to memory exhaustion or UI‑blocking. | Low‑Medium – potential client‑side DoS. |
| 6 | **Lack of Input Sanitisation for Search Field** | The search field value is split and directly used to build request URLs (`encodeURIComponent`). While `encodeURIComponent` prevents URL injection, there is no validation that the symbols conform to the expected pattern (e.g., `^[A-Z0-9.]+$`). Invalid input could cause unnecessary network errors. | Low – mainly usability, but could be abused to generate many failed requests. |

## Recommendations
1. **Sanitise all HTML insertion**
   * Replace `innerHTML` with safe DOM APIs (`textContent`, `createElement`, `appendChild`).
   * If `innerHTML` must be used, employ a robust sanitiser (e.g., DOMPurify) to strip scripts and event handlers.
2. **Add a strong Content‑Security‑Policy**
   ```html
   <meta http‑equiv="Content‑Security‑Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src data:; connect-src https://query1.finance.yahoo.com; font-src 'self'; frame-ancestors 'none';">
   ```
   * Also configure server‑side headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Feature-Policy: none`.
3. **Throttle / limit API requests**
   * Impose a maximum number of symbols per search (e.g., 20).
   * Queue fetches and limit concurrent requests (e.g., max 5 at a time).
4. **Reduce console exposure**
   * In production, replace `console.warn(e)` with a generic user‑facing toast (`showToast('Failed to load data', 'error')`).
   * Optionally keep detailed logs behind a debug flag.
5. **Validate imported watch‑list files**
   * Enforce a maximum array length (e.g., 200) and maximum string length (e.g., 20 characters).
   * Reject files that exceed limits and show an error toast.
6. **Validate search input**
   * Use a regex to allow only characters permitted by Yahoo symbols: `/^[A-Z0-9.]+$/i`.
   * Trim whitespace and ignore malformed tokens before building the request URL.
7. **Graceful error handling for network failures**
   * Show a user‑friendly toast when a fetch fails instead of silently continuing.
   * Provide a retry button for the specific symbol.
8. **Consider Subresource Integrity (SRI)** for any external scripts or styles if you ever add CDN resources.

## Security Score
The application follows good practices such as using HTTPS endpoints, debouncing input, and avoiding third‑party libraries that could introduce vulnerable dependencies. However, the presence of DOM‑XSS vectors, missing CSP, and lack of request throttling are significant concerns.

**Score: 78 / 100**

## Summary of Vulnerabilities
```json
[
  "DOM‑Based XSS via unsanitised innerHTML",
  "Missing Content‑Security‑Policy and related security headers",
  "Unrestricted number of parallel API requests (no rate limiting)",
  "Information leakage through console.warn statements",
  "Potential client‑side DoS via oversized watch‑list import",
  "Insufficient validation of ticker symbols entered by the user"
]
```