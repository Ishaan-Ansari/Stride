# Stride — Workout Session Log

## Original Problem Statement
"I want to create a workout session log workflow which has my day-wise workout schedule from Monday to Saturday and everyday at 6:30 AM, I should get a checklist of all the exercises to be performed at that particular day. And should also have a streak and a calendar, which keeps track of all my workouts. It should automatically share the day-wise plan of what exercise to do on that particular day."

## User Choices
- Workout Plan: default editable plan (seeded)
- 6:30 AM reminder: in-app + email via Resend
- Sunday rest does NOT break streak
- Auth: Single user (no login)
- Sharing: Email + in-app (Telegram deferred)

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) + APScheduler (daily 06:30 cron) + Resend SDK
- **Frontend**: React + TailwindCSS + Shadcn UI + lucide-react
- **Theme**: Tactical Minimalism (dark obsidian, Volt Blue accents, Barlow Condensed)

## Implemented (2026-02-27)
- Default Mon–Sun workout plan seeded on startup (Sun = rest)
- GET /api/plan, PUT /api/plan/{day} (edit any day)
- GET /api/today (today's plan + session state)
- POST /api/sessions/toggle (mark/unmark exercises)
- GET /api/sessions, GET /api/stats (current/best streak, weekly/monthly totals)
- Streak logic skips Sundays (rest day doesn't break streak)
- GET/PUT /api/settings (email, reminder_enabled, reminder_time)
- POST /api/reminder/send-now (manual trigger), built HTML template
- APScheduler cron job at 06:30 server time
- Frontend Dashboard: Stats cards, Today's Checklist with progress, Weekly Plan sidebar, 12-week Calendar Heatmap, Edit Plan dialog, Settings dialog

## Backlog
### P1 (recommended next)
- User-provided RESEND_API_KEY → enable real email delivery
- Make scheduler dynamically respect `reminder_time` from settings (currently fixed at 06:30)
- Per-exercise weight tracking & history graph
- Telegram bot integration for daily plan share

### P2
- Multi-user auth (JWT or Emergent Google)
- Pre-built program templates (PPL, 5x5, Upper/Lower)
- Personal records (PR) tracker
- Workout timer / rest timer
- Export progress as CSV/PDF

## Test Credentials
N/A — single-user app, no authentication.
