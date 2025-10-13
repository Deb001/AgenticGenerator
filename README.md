# Accessible Calculator

A small, production-ready, accessible calculator web app and a pure calculation engine. The project separates concerns:

- `src/calculator.js` — pure arithmetic engine that safely parses and evaluates mathematical expressions (no eval).
- `index.html` + `styles.css` — accessible, responsive UI.
- `src/app.js` — UI/controller connecting the engine and the UI (keyboard and mouse handling, state management).
- `tests/` — unit tests for the engine.

This README documents setup, usage, file mapping, error handling for integrators, accessibility notes, and contribution/linting guidance.

---

## Quick Links

- Entry UI: `index.html`
- Styling: `styles.css`
- Engine: `src/calculator.js` (exports `evaluate(expression)`)
- UI controller: `src/app.js` (imports engine)
- Tests: `tests/calculator.test.js`

---

## Project purpose

This project is intended to provide:

- A small, well-documented JS calculation engine (safe parsing, operator precedence).
- A simple, keyboard- and screen-reader-friendly web UI demonstrating integration.
- Unit tests for the engine so it can be used by other projects or embedded in a site.

---

## Requirements / Environment

- Modern browser (Chrome, Firefox, Edge, Safari).
- Node.js (optional, for running tests and dev server). Node 14+ recommended.

---

## Getting started (local)

Clone the repo:
