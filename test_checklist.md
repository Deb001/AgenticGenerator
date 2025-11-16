# Manual Test Checklist for Calculator

1. **Load Page**
   - Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).
   - Verify that two numeric input fields, an operator dropdown, and a **Calculate** button are visible.

2. **Basic Operations**
   - For each operator (`+`, `-`, `*`, `/`):
     - Enter `5` in the first field and `3` in the second field.
     - Click **Calculate**.
     - Confirm the displayed result matches the expected value:
       - `+` → `8`
       - `-` → `2`
       - `*` → `15`
       - `/` → `1.6666666666666667` (or appropriate decimal).

3. **Non‑numeric Input**
   - Enter `abc` in the first field, keep the second field as `3`.
   - Click **Calculate**.
   - Verify an error message appears indicating the first operand must be a valid number.

4. **Empty Input**
   - Leave both fields empty and click **Calculate**.
   - Verify error messages indicate that both operands are required.

5. **Division by Zero**
   - Enter `10` as the first operand and `0` as the second operand.
   - Select the division operator (`/`) and click **Calculate**.
   - Verify a specific error message: “Division by zero is not allowed.”

6. **Responsive Layout**
   - Resize the browser window to a narrow width (e.g., mobile width < 480px).
   - Ensure the calculator UI remains fully visible, inputs and button are not clipped, and layout stays centered.

7. **State Reset**
   - After any calculation or error, refresh the page.
   - Confirm that no previous result or error persists and the inputs are cleared.

8. **Accessibility Checks**
   - Verify that result and error messages are announced by screen readers (they have `aria-live` attributes).

All tests should pass without JavaScript console errors.