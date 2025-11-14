# Expression Evaluator API

A lightweight Node.js service that evaluates arithmetic expressions safely. It provides a single HTTP endpoint (`POST /api/evaluate`) that accepts a JSON payload with an `expression` string and returns the computed result.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Specification](#api-specification)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Arithmetic evaluation** supporting `+`, `-`, `*`, `/`, parentheses, and whitespace.
- **Robust validation** – rejects malformed or unsafe input.
- **Custom error handling** – clear messages for syntax errors and division‑by‑zero.
- **Security middleware** – Helmet, CORS, and rate limiting.
- **Static asset serving** – ready for a front‑end UI placed in the `public/` folder.

---

## Prerequisites

- **Node.js** (version 14 or later recommended)
- **npm** (comes with Node.js)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-folder>

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file in the project root. The only required variable is the port the server will listen on:

```dotenv
PORT=3000
```

You can change `3000` to any available port.

---

## Running the Server

### Development (with hot‑reloading)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start and listen on the port defined in `.env`.

---

## API Specification

### POST `/api/evaluate`

**Request Body** (JSON)

```json
{ "expression": "2 + 3 * (4 - 1)" }
```

- `expression` – a string containing a valid arithmetic expression.

**Responses**

- **200 OK** – Successful evaluation
  ```json
  { "result": 11 }
  ```
- **400 Bad Request** – Missing or empty `expression` field.
- **422 Unprocessable Entity** – Syntax error or runtime error (e.g., division by zero).
- **429 Too Many Requests** – Rate limit exceeded.
- **500 Internal Server Error** – Unexpected server error.

---

## Testing

The project includes a Jest configuration placeholder for future unit tests. To run tests (once they are added):

```bash
npm test
```

---

## Security Considerations

- **Helmet** adds essential HTTP headers.
- **CORS** is configured to allow same‑origin requests only.
- **Rate limiting** caps requests at 100 per minute per IP.
- **Input validation** ensures only safe characters are processed; no `eval` is used.

---

## Project Structure

```
root/
├─ public/                # Static front‑end assets (HTML, CSS, JS)
├─ src/
│   └─ evaluator.js      # Pure expression evaluator library
├─ server/
│   └─ server.js         # Express server and API routes
├─ .env                   # Environment variables (not committed)
├─ .gitignore             # Files/folders ignored by Git
├─ package.json           # npm manifest
└─ README.md              # Documentation (this file)
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes with clear messages.
4. Open a pull request describing the changes.

---

## License

MIT License. See the `LICENSE` file for details.
