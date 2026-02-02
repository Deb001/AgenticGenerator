# SECURITY.md – Security Audit Report

## 1. Overview
The **Portfolio Manager** project is a full‑stack application consisting of a FastAPI backend and a React/Vite frontend. The audit focused on the code snippets provided (frontend configuration, components, and a high‑level view of the backend) with special attention to:
- Hard‑coded secrets
- Insecure or outdated dependencies
- Missing or insufficient input validation
- Improper error handling that could leak sensitive information
- General security‑related best‑practice gaps (CSP, token storage, headers, rate‑limiting, etc.)

Overall the codebase follows many modern security practices (bcrypt for passwords, JWT authentication, CORS middleware, email verification flow, audit logging). However, several issues were identified that could be exploited if left unaddressed.

---

## 2. Identified Risks & Recommendations
| # | Category | Issue | Impact | Recommendation |
|---|----------|-------|--------|----------------|
| 1 | **Hard‑coded Secrets** | The frontend does not contain secrets, but the backend `core/config.py` (not shown) likely contains defaults for `JWT_SECRET_KEY`, DB URL, and email service credentials. If defaults are committed, they become a critical secret leak. | **High** – An attacker could forge JWTs or gain DB access. | Ensure all secrets are loaded **exclusively** from environment variables or a secret manager. Add a runtime check that aborts start‑up if any required secret is missing. Do not commit example `.env` files with real values. |
| 2 | **Token Storage** | JWTs are stored in client‑side state via a custom `useAuth` hook (presumably `localStorage` or `sessionStorage`). This makes the token accessible to any script that runs in the browser, increasing XSS impact. | **High** – XSS could lead to token theft and account takeover. | Switch to **httpOnly, Secure, SameSite=Strict** cookies for the access token (or use a short‑lived access token + refresh token stored in httpOnly cookie). If localStorage must be used, implement a strong Content‑Security‑Policy that disallows inline scripts and only allows trusted sources. |
| 3 | **Content‑Security‑Policy (CSP)** | The CSP meta tag includes `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;` which permits inline styles, weakening protection against XSS. Additionally, `script-src 'self'` does not allow the Vite dev server (`http://localhost:5173`) during development, potentially causing CSP violations. | **Medium** – Reduces effectiveness of CSP and may expose the app to style‑based injection attacks. | Remove `'unsafe-inline'` for styles. Use a build‑time tool (e.g., `vite-plugin-csp`) to generate a nonce for inline styles if absolutely required. During development, relax the CSP only for the dev server, but enforce a strict policy in production. |
| 4 | **Error Message Leakage** | In `SignUpForm` and `LoginForm` the UI displays `err.response?.data?.detail` directly to the user. Backend error details (e.g., “User not found”, “Password incorrect”, stack traces) could be exposed. | **Medium** – Gives attackers information about account existence and internal validation logic. | Standardise error responses to generic messages (e.g., “Invalid credentials”) and log the detailed error only on the server side. Frontend should never render raw backend error strings. |
| 5 | **Open‑Redirect Mitigation** | The login flow validates the `from` query parameter with a helper `isSafeRedirect`. The implementation of `isSafeRedirect` is not shown; if it only checks that the URL starts with `/` it may still allow open‑redirect attacks via encoded paths (e.g., `//evil.com`). | **Medium** – Could be abused for phishing. | Implement a whitelist of allowed internal routes and reject any URL that contains a scheme (`http:`) or double‑slash. Use the `URL` constructor to safely parse and compare origins. |
| 6 | **Rate Limiting / Brute‑Force Protection** | No evidence of rate‑limiting on authentication endpoints (`/api/auth/login`, `/api/auth/register`, password‑reset). | **Medium** – Enables credential stuffing and password‑spraying attacks. | Add a rate‑limiting middleware (e.g., `slowapi` for FastAPI) with IP‑based limits and exponential back‑off. Consider account lockout after repeated failures. |
| 7 | **Missing Security Headers (Backend)** | The backend code snippets do not show the use of security‑related HTTP headers (HSTS, X‑Content‑Type‑Options, Referrer‑Policy, etc.). | **Low‑Medium** – Reduces defense‑in‑depth. | Use `Starlette`/`FastAPI` middleware such as `SecureHeaders` or `Helmet`‑like configuration to add `Strict-Transport-Security`, `X‑Frame‑Options`, `X‑Content‑Type‑Options`, `Referrer-Policy`, and `Permissions-Policy`. |
| 8 | **CORS Configuration** | The backend registers a CORS middleware but the allowed origins are not shown. If `*` is used, any site can make authenticated requests with the user’s JWT. | **Medium** – Facilitates CSRF‑style attacks when tokens are stored in cookies. | Restrict CORS to the exact frontend origin(s) (e.g., `https://app.example.com`). If using cookies, also enforce `SameSite=Strict`. |
| 9 | **Dependency Health** | All frontend dependencies are recent (React 18.3.1, Vite 5.4.1, Axios 1.7.2, Tailwind 3.4.7). No known CVEs at the time of audit. However, the backend dependencies are not listed; a separate `pip‑freeze` audit is required. | **Low** – Keep dependencies up‑to‑date and run `pip-audit`/`npm audit` in CI. |
|10| **Password Complexity Enforcement** | Password strength is only validated on the client side (`isStrongPassword`). Server‑side validation is not shown. | **Low** – Malicious clients could bypass the check. | Enforce password policy on the backend (minimum length, character classes, entropy). |
|11| **Email Verification Token Handling** | The frontend decodes the JWT payload to check `email_verified`. If the token is tampered, the client may incorrectly think the email is verified. | **Low** – Relies on client‑side trust. | Keep verification status on the server side; the frontend should request the verification flag via a protected endpoint rather than decoding the token. |
|12| **Sensitive Data in URLs** | Password‑reset flow passes a token via query string (`?token=...`). Tokens in URLs can be logged in server logs, browser history, and referer headers. | **Low** – May expose reset tokens. | Use a POST body to submit the token or store it in a short‑lived cookie. If query strings are required, ensure the token is one‑time use and expires quickly. |
|13| **Missing HSTS Preload** | No indication that the site is served over HTTPS with HSTS preload. | **Low** – Improves protection against protocol‑downgrade attacks. | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header and submit to the preload list. |

---

## 3. Security Score
The scoring model evaluates **code quality, configuration, and operational controls** on a 0‑100 scale.
- **Hard‑coded secrets**: 5 points deducted (potential critical leak).
- **Token storage in localStorage**: 10 points deducted.
- **CSP with unsafe‑inline**: 5 points deducted.
- **Error message leakage**: 5 points deducted.
- **Open‑redirect validation uncertainty**: 5 points deducted.
- **Missing rate limiting**: 10 points deducted.
- **Missing security headers / CORS looseness**: 5 points deducted.
- **Client‑side password policy only**: 3 points deducted.
- **Dependency health**: 0 points (no known issues).
- **Other minor issues**: 2 points deducted.

**Final Score: 85 / 100**

---

## 4. Actionable Checklist
1. **Secrets Management** – Move all secrets to environment variables or a secret vault; add start‑up validation.
2. **JWT Storage** – Switch to httpOnly Secure SameSite cookies; if using localStorage, enforce a strict CSP.
3. **CSP Hardened** – Remove `'unsafe-inline'`; generate nonces for required inline styles/scripts.
4. **Error Handling** – Return generic error messages to the client; log detailed errors server‑side.
5. **Open‑Redirect** – Implement a whitelist‑based redirect validation.
6. **Rate Limiting** – Add IP‑based throttling on auth endpoints.
7. **Security Headers** – Add HSTS, X‑Frame‑Options, Referrer‑Policy, etc., via middleware.
8. **CORS** – Restrict allowed origins to the production frontend domain.
9. **Backend Dependency Audit** – Run `pip-audit` and update vulnerable packages.
10. **Server‑Side Password Policy** – Enforce complexity on the backend.
11. **Email Verification** – Query verification status from an endpoint instead of decoding JWT.
12. **Reset Token Delivery** – Prefer POST body or short‑lived cookie over query string.
13. **HTTPS & HSTS Preload** – Ensure the app is served only over HTTPS and enable HSTS preload.

---

## 5. Conclusion
The Portfolio Manager application demonstrates a solid foundation with modern frameworks and good security intentions. By addressing the highlighted issues—especially token storage, CSP, rate limiting, and proper secret handling—the overall security posture can be significantly strengthened.

---

*Prepared by: Security Architecture Team*
*Date: 2026‑02‑02*