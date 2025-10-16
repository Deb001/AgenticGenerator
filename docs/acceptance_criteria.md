# Acceptance Criteria – Simple Calculator Feature (AI‑1)

## 1. Overview
The calculator must allow a user to input two numbers, select an arithmetic operator, request a calculation from the backend, and display the result. All interactions are performed through a single page UI that communicates with a RESTful API.

---

## 2. UI Elements
| Element | Type | Identifier | Description |
|---------|------|------------|-------------|
| **First Number** | Number input | `#input-a` | Accepts a numeric value for the left‑hand operand. |
| **Second Number** | Number input | `#input-b` | Accepts a numeric value for the right‑hand operand. |
| **Operator** | Dropdown (`<select>`) | `#operator` | Options: `+` (addition), `-` (subtraction), `*` (multiplication), `/` (division). |
| **Calculate** | Button | `#calculate-btn` | Triggers the calculation request. |
| **Result Area** | Read‑only text / `<div>` | `#result` | Displays the calculation result or an error message. |

### UI Behaviour
1. All fields are required before the **Calculate** button becomes enabled.
2. The **Result Area** is cleared each time a new request is sent.
3. While awaiting a response, a loading indicator (e.g., spinner) is shown.
4. Errors are displayed in the **Result Area** with a distinct style (red text).

---

## 3. API Contract

### Endpoint
POST /api/calculate
Content-Type: application/json
Accept: application/json

### Request Payload
{
  "a": <number>,
  "b": <number>,
  "op": "<operator>"
}
* `a` – First operand (numeric, integer or float).  
* `b` – Second operand (numeric, integer or float).  
* `op` – One of the strings: `"+"`, `"-"`, `"*"`, `"/"`.

### Successful Response (`200 OK`)
{
  "result": <number>
}
* `result` – The computed value. For division, the result follows IEEE‑754 floating‑point rules (e.g., `5 / 2 = 2.5`).

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| `400 Bad Request` | | `400 Bad Request` | | `400 Bad Request` | | `400 Bad Request` | | `500 Internal Server Error` | 
All error responses must include a JSON body with an `error` key describing the problem.

---

## 4. Validation & Error Cases (Backend)

1. **Missing Fields** – Return `400` with a message indicating which field is missing.
2. **Non‑numeric Input** – Return `400` with a message indicating which operand is invalid.
3. **Unsupported Operator** – Return `400` with a generic “Unsupported operator” message.
4. **Division by Zero** – Return `400` with “Division by zero”.
5. **Unexpected Errors** – Log the exception, return `500` with a generic error message.

All validation must be performed **before** any calculation is attempted.

---

## 5. Acceptance Tests (High‑Level)

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| AT‑001 | Submit valid inputs (`a=3`, `b=4`, `op="+"`) | `200 OK`, `result: 7` displayed |
| AT‑002 | Submit valid inputs with division (`a=5`, `b=2`, `op="/"`) | `200 OK`, `result: 2.5` displayed |
| AT‑003 | Omit `a` field | `400 Bad Request`, error “Missing field: a” shown |
| AT‑004 | Provide non‑numeric `b` (`"abc"`) | `400 Bad Request`, error “Invalid number: b” shown |
| AT‑005 | Use unsupported operator (`"%"`) | `400 Bad Request`, error “Unsupported operator” shown |
| AT‑006 | Divide by zero (`a=10`, `b=0`, `op="/"`) | `400 Bad Request`, error “Division by zero” shown |
| AT‑007 | Server throws unexpected exception (simulated) | `500 Internal Server Error`, generic error shown, error logged |

---

## 6. Non‑Functional Requirements

* **Responsiveness** – UI must be usable on desktop and mobile browsers.
* **Accessibility** – All controls must have appropriate `aria-label`s and be keyboard‑navigable.
* **Performance** – API response time ≤ 200 ms for typical inputs.
* **Logging** – Backend must log each request with payload, outcome, and any validation errors at `INFO` level; unexpected exceptions at `ERROR` level.

---

## 7. Documentation Links
* UI implementation – `src/templates/index.html`, `src/static/js/app.js`, `src/static/css/style.css`
* API implementation – `src/routes.py`
* Unit & integration tests – `tests/unit/test_routes.py`, `tests/integration/test_end_to_end.py`

--- 

*Prepared for Subtask 1 (AI‑1).*