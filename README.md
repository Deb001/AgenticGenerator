# Simple Items CRUD App

A minimal full‑stack example that demonstrates a **Node.js + Express** backend with **SQLite** persistence and a vanilla JavaScript single‑page frontend. The project is deliberately lightweight to serve as a starter template or teaching aid while still being production‑ready.

---

## 📋 MVP Scope & Acceptance Criteria

| Scope | Acceptance Criteria |
|-------|----------------------|
| **Core data model** | An `items` table with columns `id` (PK, auto‑increment), `title` (string, required), `body` (string, optional), `created_at` (timestamp, default `CURRENT_TIMESTAMP`). |
| **REST API** | CRUD endpoints (`GET /items`, `GET /items/:id`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`) that accept/return JSON, validate input, and return appropriate HTTP status codes (`200`, `201`, `400`, `404`, `500`). |
| **Frontend UI** | A single‑page app that can list items, create a new item, edit an existing item, and delete items using the API. All interactions are performed with `fetch()` and UI updates happen without a full page reload. |
| **Configuration** | All configurable values are supplied via environment variables (`PORT`, `DB_PATH`). Reasonable defaults are provided (`PORT=3000`, `DB_PATH=./data/items.db`). |
| **Docker support** | A `Dockerfile` that builds a lightweight container (Node 20 Alpine) and runs the app with the same environment variable contract. |
| **Documentation** | This README stays in sync with the codebase: it lists the exact folder layout, required scripts, env vars, and Docker usage. |

---

## 🎯 Core User Stories

1. **As a visitor**, I want to see a list of all items so that I can browse existing content.  
2. **As a visitor**, I want to add a new item (title & body) so that I can contribute content.  
3. **As a visitor**, I want to edit or delete any item so that I can keep the list up‑to‑date.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20 (LTS) |
| **Web framework** | Express 4 |
| **Database** | SQLite (via `better-sqlite3`) |
| **Frontend** | HTML5, vanilla JavaScript (ES6+), CSS |
| **Containerisation** | Docker (Alpine base) |
| **Package manager** | npm |

---

## 📁 Folder Layout

root
├─ src
│  ├─ server.js          # Express entry point, middleware, route mounting
│  ├─ db.js              # SQLite connection & simple query helpers
│  └─ routes
│     └─ items.js        # CRUD API for the "items" resource
├─ public
│  ├─ index.html         # SPA skeleton
│  ├─ app.js             # Front‑end logic (fetch, render, UI events)
│  └─ styles.css         # Minimal styling
├─ data
│  └─ items.db           # SQLite file (auto‑created on first run)
├─ Dockerfile            # Container build definition
├─ .gitignore            # Files/folders excluded from VCS
├─ package.json          # Project metadata, scripts, dependencies
└─ README.md             # ← you are here

---

## ⚙️ Setup & Installation

# 1️⃣ Clone the repo
git clone <repository-url>
cd <repo-directory>

# 2️⃣ Install dependencies
npm ci

# 3️⃣ (Optional) Create a .env file to override defaults
#    PORT=4000
#    DB_PATH=./data/custom.db

# 4️⃣ Start the development server
npm start

The server will listen on `http://localhost:3000` (or the value of `PORT`).  
Open `http://localhost:3000` in a browser to view the UI.

---

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | TCP port for the Express server. | `3000` |
| `DB_PATH` | Filesystem path to the SQLite database file. | `./data/items.db` |

All variables can be set in the shell or via a `.env` file (the project uses `dotenv` implicitly through `npm start`).

---

## 🐳 Docker Usage

### Build the image

docker build -t simple-items-app .

### Run the container

docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DB_PATH=/app/data/items.db \
  -v $(pwd)/data:/app/data \
  --name simple-items-app \
  simple-items-app

* The `-v` flag mounts a host `data` directory so the SQLite file persists across container restarts.

---

## 📡 API Reference

| Method | Endpoint | Description | Request Body | Success Response |
|--------|----------|-------------|--------------|------------------|
| `GET` | `/items` | List all items | — | `200` → `[{id, title, body, created_at}, …]` |
| `GET` | `/items/:id` | Get a single item | — | `200` → `{id, title, body, created_at}` |
| `POST` | `/items` | Create a new item | `{title: string, body?: string}` | `201` → created item |
| `PUT` | `/items/:id` | Update an existing item | `{title?: string, body?: string}` | `200` → updated item |
| `DELETE` | `/items/:id` | Remove an item | — | `200` → `{message: "Deleted"}` |

All error responses are JSON with a `message` field and appropriate HTTP status (`400` for validation errors, `404` when not found, `500` for unexpected failures).

---

## 📜 License

MIT © 2025

---

*Keep this README synchronized with any future changes to scripts, environment variables, or folder structure.*