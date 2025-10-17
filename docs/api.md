# API Documentation

## Endpoint: `POST /api/calculate`

### Description
Calculates a result based on two numeric operands and a specified operator.

### Request

- **Headers**
  - `Content-Type: application/json`

- **Body JSON Schema**

{
  "operand1": "number",
  "operand2": "number",
  "operator": "string"
}

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `operand1` | number | Yes | First numeric operand. |
| `operand2` | number | Yes | Second numeric operand. |
| `operator` | string | Yes | Arithmetic operator. Allowed values: `add`, `subtract`, `multiply`, `divide`. |

### Response

#### Success (HTTP 200)

{
  "result": "number"
}

| Field   | Type   | Description |
|---------|--------|-------------|
| `result` | number | Result of the calculation. |

#### Error (HTTP 400)

{
  "error": "string",
  "code": "string"
}

| Field | Type   | Description |
|-------|--------|-------------|
| `error` | string | Human‑readable error message. |
| `code`  | string | Machine‑readable error identifier (e.g., `INVALID_OPERATOR`, `DIVIDE_BY_ZERO`, `MISSING_FIELD`). |

### Examples

#### Addition

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 5,
  "operand2": 3,
  "operator": "add"
}

**Response**

{
  "result": 8
}

#### Subtraction

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 10,
  "operand2": 4,
  "operator": "subtract"
}

**Response**

{
  "result": 6
}

#### Multiplication

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 7,
  "operand2": 6,
  "operator": "multiply"
}

**Response**

{
  "result": 42
}

#### Division

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 20,
  "operand2": 5,
  "operator": "divide"
}

**Response**

{
  "result": 4
}

#### Division by Zero (Error)

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 10,
  "operand2": 0,
  "operator": "divide"
}

**Response (HTTP 400)**

{
  "error": "Division by zero is not allowed.",
  "code": "DIVIDE_BY_ZERO"
}

#### Invalid Operator (Error)

**Request**

POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "operand1": 5,
  "operand2": 2,
  "operator": "modulo"
}

**Response (HTTP 400)**

{
  "error": "Operator 'modulo' is not supported.",
  "code": "INVALID_OPERATOR"
}

### Notes

- All numeric values are treated as floating‑point numbers; integer inputs will be returned as integers when the result has no fractional part.
- The API validates the request payload and returns a `400 Bad Request` with an appropriate error object if validation fails.
- Ensure the `Content-Type` header is set to `application/json` for all requests.

---