# Stride — Workout Session Log

A tactical, dark-themed workout tracker that delivers your day's exercises like a daily mission briefing. Mon–Sat workouts, Sunday rest, streak tracking that respects rest days, and a 12-week activity heatmap.

> Built with FastAPI + React + MongoDB. Single-user. No login. 6:30 AM daily email drop via Resend.

---

## Features

- **Day-wise weekly plan** — Mon–Sat workouts, Sun rest. Fully editable per day (title, exercises, sets, reps).
- **Today's checklist** — Mark each exercise complete; progress bar updates live; toast fires when the session is locked in.
- **Streak tracker** — Current streak + best streak. **Sundays don't break the streak** (rest day is protected).
- **12-week activity heatmap** — GitHub-style grid showing complete / partial / missed / rest cells with hover details.
- **Stats dashboard** — Current streak, best streak, this week, this month, total workouts.
- **Daily 6:30 AM email reminder** — Resend integration sends the day's plan as a styled HTML email.
- **In-app daily plan** — Today's drop is shown front-and-center on the dashboard.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Tailwind, Shadcn UI, lucide-react, sonner |
| Backend | FastAPI, Motor (async MongoDB), APScheduler, Resend SDK |
| Database | MongoDB |
| Fonts | Barlow Condensed (display), DM Sans (body), JetBrains Mono (data) |

---

## Project Structure

```
/app
├── backend/
│   ├── server.py              # All API routes, models, scheduler, email
│   ├── requirements.txt
│   └── .env                   # MONGO_URL, DB_NAME, RESEND_API_KEY, SENDER_EMAIL
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css            # Theme tokens & utility classes
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── components/workout/
    │   │   ├── DashboardHeader.jsx
    │   │   ├── StatsCards.jsx
    │   │   ├── TodaysChecklist.jsx
    │   │   ├── WeeklyPlan.jsx
    │   │   ├── CalendarHeatmap.jsx
    │   │   ├── SettingsDialog.jsx
    │   │   ├── EditPlanDialog.jsx
    │   │   └── heatmapUtils.js
    │   ├── hooks/
    │   │   └── useDashboardData.js
    │   └── lib/
    │       └── api.js         # Axios client + endpoints
    └── .env                   # REACT_APP_BACKEND_URL
```

---

## API Reference

All routes are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/plan` | Returns 7-day plan (Mon→Sun) |
| `PUT` | `/plan/{day}` | Update title / is_rest / exercises for a day |
| `GET` | `/today` | Today's date, day, label, plan and current session |
| `POST` | `/sessions/toggle` | Mark/unmark a specific exercise complete |
| `GET` | `/sessions?start=YYYY-MM-DD&end=YYYY-MM-DD` | List session logs |
| `GET` | `/stats` | `current_streak`, `best_streak`, `this_week`, `this_month`, `total_workouts` |
| `GET` / `PUT` | `/settings` | Email, reminder_enabled, reminder_time |
| `POST` | `/reminder/send-now` | Manually trigger the daily email |
| `GET` | `/today/preview-email` | Preview the HTML email for today |

### Streak Logic
- Walks backwards from today (or yesterday if today isn't done yet).
- Sunday is **skipped** — it doesn't count toward the streak, but it also doesn't break it.
- Any non-Sunday day that isn't fully completed breaks the streak.

---

## Configuration

### Backend `.env`
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
RESEND_API_KEY=""                         # Get one at https://resend.com → API Keys
SENDER_EMAIL="onboarding@resend.dev"
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=<your-public-backend-url>
```

> When `RESEND_API_KEY` is empty, `/api/reminder/send-now` safely returns `{"sent": false, "reason": "disabled_or_missing_config"}` — no emails are sent.

---

## Running Locally

The Emergent environment runs everything under supervisor. Manual commands you may need:

```bash
# Restart after .env changes or new packages
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Tail logs
tail -f /var/log/supervisor/backend.err.log
```

Backend serves on `:8001` (internal), frontend on `:3000`. The Kubernetes ingress routes `/api/*` to backend; everything else to frontend.

---

## Daily Email Reminder Setup

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add to `/app/backend/.env`:
   ```env
   RESEND_API_KEY=re_your_key_here
   SENDER_EMAIL=onboarding@resend.dev
   ```
3. `sudo supervisorctl restart backend`
4. Open the app → gear icon → enter your email → toggle Daily Reminder ON → Save.
5. Hit **Send Test Now** to verify.

> The APScheduler cron job runs at **06:30 server time** every day. The `reminder_time` setting in the UI is currently informational; wire it up to `CronTrigger` if you want a configurable time.

---

## Default Workout Plan (Seeded)

| Day | Focus |
|---|---|
| Monday | Chest & Triceps |
| Tuesday | Back & Biceps |
| Wednesday | Legs |
| Thursday | Shoulders |
| Friday | Arms & Core |
| Saturday | Cardio & Conditioning |
| Sunday | Rest |

Edit any day via the ✎ icon in the Weekly Protocol sidebar.

---

## Design System

- **Background**: `#0A0A0A` deep obsidian + subtle noise overlay
- **Primary accent**: `#007AFF` (Volt Blue)
- **Surfaces**: Flat `#141414` / `#1A1A1A`, 1px borders (`rgba(255,255,255,0.1)`)
- **Radii**: `rounded-none` — sharp tactical edges
- **Typography**: Barlow Condensed (uppercase headings), DM Sans (body), JetBrains Mono (data)

---

## Roadmap

- [ ] Dynamic scheduler honoring `reminder_time` setting
- [ ] Per-exercise weight tracking + progress graphs
- [ ] Telegram bot integration for daily plan share
- [ ] Pre-built program templates (PPL, 5x5, Upper/Lower)
- [ ] Personal record (PR) tracker
- [ ] Rest timer
- [ ] Export progress to CSV/PDF
- [ ] Multi-user auth

---

## License

MIT — see [LICENSE](./LICENSE).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, code standards, and PR workflow.
