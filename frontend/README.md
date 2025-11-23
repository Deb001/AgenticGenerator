# Frontend UI

## Prerequisites
- A running backend API on `http://localhost:8000`.

## Setup
1. Open `frontend/manager.html` or `frontend/employee.html` in a modern browser.
2. No build step is required – Tailwind is loaded via CDN.

## Usage
- **Manager Dashboard**: Select a store and week, click **Run Scheduler**, then assign employees by clicking a shift cell.
- **Employee View**: Choose a week to see your assigned shifts. Notifications appear as toast messages.

## Development
- Edit the HTML/JS files directly.
- The UI falls back to mock data if the API is unreachable.

---
*All UI components use Tailwind utilities for responsive design, gradients, shadows, and hover effects.*