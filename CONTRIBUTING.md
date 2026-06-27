# Contributing to Iron Protocol

This is a solo-friendly project with a clean, deliberate structure. Contributions are welcome — but keep the tactical aesthetic intact. No bloat. No noise. Ship tight, tested code that fits the mission.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Code Standards](#code-standards)
- [Branch & Commit Convention](#branch--commit-convention)
- [PR Workflow](#pr-workflow)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18+ |
| Python | 3.11+ |
| MongoDB | 6.0+ |
| npm | 9+ |

### Local Setup

**1. Clone & install**

```bash
git clone https://github.com/your-org/iron-protocol.git
cd iron-protocol
```

**2. Backend**

```bash
cd app/backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in your env
cp .env.example .env
```

Minimum `.env` for local dev (email is optional):

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="iron_protocol_dev"
CORS_ORIGINS="http://localhost:3000"
RESEND_API_KEY=""
SENDER_EMAIL="onboarding@resend.dev"
```

Start the backend:

```bash
uvicorn server:app --reload --port 8001
```

**3. Frontend**

```bash
cd app/frontend
npm install

# Copy and set your backend URL
cp .env.example .env
# REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the frontend:

```bash
npm start
```

App runs at `http://localhost:3000`. API at `http://localhost:8001/api`.

> When `RESEND_API_KEY` is empty, all email routes return `{"sent": false, "reason": "disabled_or_missing_config"}` — no side effects.

---

## Project Structure

```
/app
├── backend/
│   ├── server.py          # All routes, models, scheduler, Resend integration
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.js / App.css       # Theme tokens & global styles
        ├── pages/Dashboard.jsx
        ├── components/workout/    # All UI components live here
        ├── hooks/                 # Data-fetching hooks
        └── lib/api.js             # Axios client + typed endpoint wrappers
```

Keep new files in their existing layer. Don't introduce new top-level directories without discussion.

---

## Code Standards

### General

- Prefer clarity over cleverness. This codebase is meant to be readable at a glance.
- No dead code, commented-out blocks, or `TODO` notes left in PRs.
- All user-facing strings should be consistent with the tactical briefing tone — terse, direct, no fluff.

### Frontend (React / Tailwind)

- Components go in `components/workout/`. One component per file.
- Use the existing design tokens from `App.css`. Don't hardcode colors — use CSS variables.
- **Stick to the design system:**
  - Background: `#0A0A0A` / surfaces `#141414` / `#1A1A1A`
  - Accent: `#007AFF`
  - Borders: `rgba(255,255,255,0.1)` — 1px only
  - Radii: `rounded-none` — no soft corners
  - Fonts: Barlow Condensed (headings, uppercase), DM Sans (body), JetBrains Mono (data/numbers)
- Use `lucide-react` for all icons — no new icon libraries.
- Toast notifications via `sonner` only — no `alert()` or custom modals for transient feedback.
- Hooks that fetch data belong in `hooks/`. Keep components focused on rendering.
- Avoid prop drilling more than two levels — lift state or add a hook.

### Backend (FastAPI / Python)

- All routes must be prefixed with `/api`.
- Pydantic models for every request and response body — no raw dicts in route signatures.
- Use `Motor` (async) for all MongoDB operations. No synchronous `pymongo` calls.
- APScheduler jobs must be idempotent — assume they may fire more than once.
- Raise `HTTPException` with meaningful status codes and detail strings; don't swallow errors silently.
- Keep `server.py` organized: models → DB helpers → routes → scheduler → startup. If `server.py` grows beyond ~600 lines, open an issue to discuss splitting it.
- Follow PEP 8. Run `black` before committing Python files.

### Naming

| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `TodaysChecklist.jsx` |
| Hooks | camelCase, `use` prefix | `useDashboardData.js` |
| Utility files | camelCase | `heatmapUtils.js` |
| Python modules | snake_case | `server.py` |
| API route paths | kebab-case | `/api/send-now` |
| MongoDB fields | snake_case | `is_rest`, `best_streak` |
| CSS custom properties | kebab-case | `--color-accent` |

---

## Branch & Commit Convention

### Branch Names

```
feature/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>
```

Examples: `feature/rest-timer`, `fix/streak-sunday-edge-case`, `docs/update-api-reference`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`

**Scope** (optional, use the affected layer): `frontend`, `backend`, `email`, `scheduler`, `heatmap`, `streak`

**Examples:**

```
feat(scheduler): wire reminder_time setting to CronTrigger
fix(streak): skip Sunday when walking backwards through session log
refactor(frontend): extract stats calculation into useDashboardData hook
docs: add Telegram bot integration notes to roadmap
chore(backend): upgrade Motor to 3.x
```

- Keep the subject line under 72 characters.
- Use the imperative mood: "add", "fix", "remove" — not "added", "fixed", "removed".
- No period at the end of the subject line.

---

## PR Workflow

1. **Fork** the repo and create your branch off `main`.
2. **Make your changes.** Keep each PR focused on one thing — a bug fix, a single feature, a refactor. Mixed-purpose PRs will be asked to split.
3. **Test locally** end-to-end before opening the PR:
   - Backend: exercise the affected routes with `curl` or the `/docs` Swagger UI at `http://localhost:8001/docs`.
   - Frontend: verify the UI in a local browser. Check both desktop and a narrow viewport.
   - If you touched streak logic or the heatmap, run through edge cases (Sunday, first day of month, empty session history).
4. **Open the PR** against `main`. Fill out the PR description:
   - **What** changed and **why**.
   - Any routes added or modified (method + path + payload shape).
   - Screenshots or a short screen recording for UI changes.
5. **Checklist before marking Ready for Review:**
   - [ ] `black` run on all changed Python files
   - [ ] No `console.log` or debug prints left in
   - [ ] New components follow the design system (tokens, fonts, radii)
   - [ ] `REACT_APP_BACKEND_URL` not hardcoded anywhere
   - [ ] README updated if the API surface, env vars, or project structure changed
6. **Review & merge.** At least one approval required. Squash-merge into `main` to keep history clean — the PR title becomes the commit message, so make it descriptive.

> **Roadmap items** (from the README) are fair game. Pick one, open a brief issue describing your intended approach, get a thumbs-up, then build it. This avoids duplicated effort.

---

## Reporting Issues

Open a GitHub Issue and use one of these labels:

| Label | Use for |
|---|---|
| `bug` | Something broken or behaving incorrectly |
| `enhancement` | A feature request or improvement |
| `design` | Visual inconsistency or UX issue |
| `question` | Clarification needed before working on something |

**Bug reports should include:**

- Steps to reproduce
- Expected vs. actual behaviour
- Browser / OS (for frontend bugs)
- Relevant logs (`/var/log/supervisor/backend.err.log` for backend issues)
- MongoDB version and whether you're using a local or remote instance

---

MIT License — contributions submitted via PR are assumed to be under the same license.