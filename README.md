# Web Calculator

A lightweight, dark‑mode friendly web calculator built with vanilla HTML, CSS, and JavaScript (ES modules). The project demonstrates:

- **Secure loading** via a Content‑Security‑Policy meta tag.
- **Responsive UI** using CSS Grid.
- **Accessibility** with focus outlines and keyboard‑friendly controls.
- **Robust error handling** using custom `ValidationError` and `EvaluationError` classes.
- **Safe expression evaluation** that only permits numeric characters and basic arithmetic operators.

## Project Structure

```
.
├── index.html      # Entry point – loads CSS and the ES module
├── styles.css      # Reset + dark‑mode styling + toast UI
├── app.js          # Calculator logic, UI generation, and error handling
├── README.md       # Documentation (this file)
└── .gitignore      # Ignored files for Git
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd <repo‑folder>
   ```
2. **Open `index.html`** in a modern browser (Chrome, Firefox, Edge, Safari). No build step is required because the app uses native ES modules.

## Usage

- Click digits and operators to build an expression.
- Press **C** to clear, **←** to delete the last character, and **=** to evaluate.
- Errors (e.g., invalid sequences) appear as a temporary toast at the bottom of the screen.

## Security Considerations

- The HTML includes a strict CSP that only allows resources from the same origin.
- All user‑generated messages displayed in the UI are sanitized via `textContent` to prevent XSS.
- Evaluation uses the `Function` constructor with a whitelist of allowed characters, ensuring no arbitrary code execution.

## Customisation

- **Styling** – Modify `styles.css` to change colors, fonts, or layout.
- **Button Layout** – Adjust the `ButtonConfig` array in `app.js` to add/remove buttons.
- **Extended Operations** – Implement additional methods in `Calculator` and update the UI accordingly.

## License

This project is released under the MIT License.
