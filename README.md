# Calculator App

A lightweight web‑based calculator built with vanilla JavaScript. The project includes a pure calculation engine, a responsive UI, comprehensive unit tests (Jest) and end‑to‑end tests (Playwright).

## Project Structure

```
root/
├─ src/
│  ├─ index.html      # Entry point
│  ├─ styles.css      # UI styling
│  ├─ app.js          # UI logic
│  └─ calculator.js   # Pure calculation engine
├─ tests/
│  ├─ calculator.test.js   # Jest unit tests
│  └─ e2e.test.js          # Playwright e2e tests
├─ package.json
├─ jest.config.js
└─ .github/workflows/ci.yml
```

## Setup & Development

1. **Install Node.js (v20 or later)**
2. Clone the repository and install dependencies:
   ```bash
   npm ci
   ```
3. Run a local static server to view the UI:
   ```bash
   npm run serve
   ```
   The app will be available at `http://localhost:5000`.

## Testing

- **Unit tests** (Jest):
  ```bash
  npm run test
  ```
- **End‑to‑end tests** (Playwright):
  ```bash
  npm run e2e
  ```
- **CI script** (runs both suites):
  ```bash
  npm run ci
  ```

## Continuous Integration

GitHub Actions automatically runs the CI workflow on every push and pull request to the `main` branch. The workflow installs dependencies, executes unit tests, installs Playwright browsers, and runs the e2e suite in headless mode.

## Security & Production Notes

- No secrets or API keys are stored in the repository.
- The UI does **not** evaluate user input with `eval`; the calculation engine parses expressions safely.
- The static server (`serve`) runs in production mode without debug flags.
- All scripts exit with non‑zero status on failure, causing the CI pipeline to fail accordingly.

## License

MIT License