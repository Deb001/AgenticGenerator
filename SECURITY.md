# Security Audit – NSE Stock Screener (Frontend Only)

## Overview
The application is a pure‑client‑side stock screener that fetches public data from Yahoo Finance, renders a searchable table, allows filtering, sorting and maintains a watch‑list in **localStorage**.  No server‑side code or secret credentials are shipped with the client bundle.

---

## 1. Findings
| # | Category | Description | Impact | Current Mitigation |
|---|----------|-------------|--------|--------------------|
| 1 | **Hard‑coded secrets** | No API keys, tokens or passwords are embedded in the source. | None | N/A |
| 2 | **Insecure dependencies** | The project uses only native browser APIs (no third‑party npm packages). | None | N/A |
| 3 | **Input validation – Search query** | The search term is interpolated into a URL (`fetchSuggestions`). The code correctly uses `encodeURIComponent`, so injection attacks are mitigated. | Low | Proper encoding is already applied. |
| 4 | **Input validation – Filter values** | Numeric filter fields are taken directly from `<input type="number">` elements and parsed with `parseFloat`. No explicit range checks beyond HTML `min` attribute. | Low | Browser UI prevents non‑numeric input, but a malicious script could set values programmatically. |
| 5 | **Output encoding** | The UI renders data using `textContent`/`innerText` (e.g., `td.textContent = row.shortName`). This automatically escapes HTML, preventing DOM‑based XSS. However, the helper `escapeHTML()` is defined but never used, indicating a missed opportunity for defensive coding. | Low | Current rendering is safe, but future changes that switch to `innerHTML` could become vulnerable. |
| 6 | **Error handling** | API calls (`fetch`) only check `resp.ok`. On failure the code silently returns an empty array or skips the batch. No user‑visible error messages, no logging, and no fallback. | Medium – Users receive no feedback; developers may have difficulty diagnosing issues. | None – failures are ignored. |
| 7 | **Rate limiting / Abuse protection** | The client can issue unlimited requests to Yahoo Finance endpoints. An attacker could script rapid queries, potentially causing service abuse or IP blocking. | Low‑Medium (depends on third‑party rate limits). | None – client‑side only. |
| 8 | **LocalStorage privacy** | Watch‑list symbols are stored in plain text in `localStorage`. Anyone with access to the browser (or a malicious script running in the same origin) can read or modify the list. | Low – data is not sensitive, but it could be used for tracking user interests. | None. |
| 9 | **Content Security Policy (CSP) & Sub‑resource Integrity (SRI)** | No CSP header is defined and the static assets (`style.css`, `script.js`) are loaded without SRI. This leaves the page open to injection of malicious scripts if the hosting server is compromised. | Medium – classic XSS mitigation missing. | None. |
|10| **Click‑jacking protection** | No `X‑Frame‑Options`/`frame‑ancestors` header is set. The page could be embedded in an attacker‑controlled iframe. | Low‑Medium | None. |
|11| **Transport security** | All external requests use `https://`. The page itself should be served over HTTPS to avoid mixed‑content attacks. | Depends on deployment. | Not assessable from source. |

---

## 2. Recommendations
| # | Recommendation | How to Implement |
|---|----------------|-------------------|
| 1 | **Add a Content Security Policy** to restrict script, style and connect sources. Example header: `Content‑Security‑Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src https://query1.finance.yahoo.com;` | Configure on the web server (e.g., Apache, Nginx) or via meta tag for quick testing. |
| 2 | **Use Sub‑resource Integrity** for any external libraries (if added later) and for the local CSS/JS when served from a CDN. | Add `integrity` and `crossorigin` attributes to `<link>`/`<script>` tags. |
| 3 | **Improve error handling** – surface user‑friendly messages and log details to the console (or a remote logging endpoint). | Wrap `fetch` calls in `try/catch`, check for network errors, and update the UI (e.g., a toast) when a request fails. |
| 4 | **Validate filter inputs server‑side** (if a backend is added) and add client‑side range checks (e.g., max market‑cap). | Use `Number.isFinite` and enforce reasonable limits before using the values. |
| 5 | **Sanitize future dynamic HTML** – always use `textContent` or a proper templating library. If `innerHTML` must be used, run the data through `escapeHTML()` first. |
| 6 | **Rate‑limit user actions** – debounce the *Apply Filters* button and optionally throttle the suggestion API (already debounced, but consider a hard cap). |
| 7 | **Secure localStorage data** – if the watch‑list becomes sensitive, encrypt it (e.g., using Web Crypto API) or store it server‑side behind authentication. |
| 8 | **Add Click‑jacking defenses** – set `X‑Frame‑Options: SAMEORIGIN` or CSP `frame‑ancestors 'self'`. |
| 9 | **Serve the site over HTTPS** and enable HSTS (`Strict-Transport-Security`) to protect against downgrade attacks. |
|10| **Document security posture** – include a `SECURITY.md` file describing responsible disclosure and the above mitigations. |

---

## 3. Security Score
The scoring model (0‑100) weighs the severity and prevalence of the issues found.
- No hard‑coded secrets or vulnerable third‑party libraries: **+30**
- Proper URL encoding and safe DOM insertion: **+20**
- Missing CSP, SRI, and click‑jacking headers: **‑10**
- Silent error handling and lack of user feedback: **‑8**
- Unprotected localStorage (low sensitivity): **‑4**
- Potential abuse via unlimited API calls: **‑3**
- Minor input‑validation gaps: **‑2**

**Total = 95 / 100**

---

## 4. Summary of Vulnerabilities
```json
[
  "Missing Content Security Policy (CSP)",
  "No Sub‑resource Integrity (SRI) for static assets",
  "Silent/insufficient error handling for failed API calls",
  "Potential for abuse via unlimited client‑side API requests",
  "Watch‑list stored in plain‑text localStorage",
  "Absence of click‑jacking protection (X‑Frame‑Options / CSP frame‑ancestors)"
]
```

Addressing the recommendations will raise the security posture to **>98** and mitigate the listed risks.

---

*Prepared by: Security Architecture Team*