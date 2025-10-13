# Simple Calculator

A lightweight Python library that provides basic arithmetic operations with robust input validation and a friendly command‑line interface.  
The project is structured to support easy contribution, testing, and continuous integration.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Command‑Line Interface](#command-line-interface)
  - [Library API](#library-api)
- [Running Tests](#running-tests)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The calculator implements four core operations:

| Operation | Method |
|-----------|--------|
| Addition  | `add(a, b)` |
| Subtraction | `subtract(a, b)` |
| Multiplication | `multiply(a, b)` |
| Division | `divide(a, b)` |

All methods validate that inputs are numeric and raise a custom `CalculatorError` on invalid input or division by zero. The command‑line interface (`src/main.py`) offers an interactive prompt and supports passing arguments directly.

---

## Features

- **Type‑safe arithmetic** – accepts `int` or `float`; rejects strings, lists, etc.
- **Clear error messages** – custom exception with descriptive text.
- **Unit‑tested** – 100 % coverage on core logic (`tests/test_calculator.py`).
- **CI‑enabled** – GitHub Actions workflow runs tests, linting, and style checks on every push.
- **Documentation** – generated with Sphinx (see `docs/`).

---

## Installation
