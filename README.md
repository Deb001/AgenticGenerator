# Flask Calculator

A lightweight web application that demonstrates a simple calculator built with **Flask** on the backend and vanilla JavaScript, HTML, and CSS on the frontend.  
The project follows best practices for code quality, testing, and deployment.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#clone-the-repository)
  - [Create a Virtual Environment](#create-a-virtual-environment)
  - [Install Dependencies](#install-dependencies)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Arithmetic Operations** | Supports addition, subtraction, multiplication, and division. |
| **Input Validation** | Client‑side validation prevents non‑numeric input; server validates again. |
| **RESTful API** | `/api/calculate` accepts JSON payloads and returns results. |
| **Unit Tests** | 100% coverage for calculation logic (`test_app.py`). |
| **Responsive UI** | Clean, mobile‑friendly design using CSS Grid. |

---

## Prerequisites

- Python 3.10+  
- `pip` (Python package installer)  

---

## Installation

### Clone the Repository
