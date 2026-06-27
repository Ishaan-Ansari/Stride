from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta, timezone
import resend
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ------------------------- Models -------------------------

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
DAY_LABEL = {
    "monday": "Mon", "tuesday": "Tue", "wednesday": "Wed",
    "thursday": "Thu", "friday": "Fri", "saturday": "Sat", "sunday": "Sun",
}

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sets: int = 3
    reps: str = "10"
    notes: str = ""

class DayPlan(BaseModel):
    day: str
    title: str
    is_rest: bool = False
    exercises: List[Exercise] = []

class PlanUpdate(BaseModel):
    title: str
    is_rest: bool = False
    exercises: List[Exercise] = []

class SessionLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # ISO date string YYYY-MM-DD
    day: str
    completed_exercise_ids: List[str] = []
    total_exercises: int = 0
    completed_at: Optional[str] = None  # ISO datetime when marked fully complete

class SessionToggle(BaseModel):
    date: str
    exercise_id: str
    completed: bool

class Settings(BaseModel):
    id: str = "settings"
    email: Optional[str] = None
    reminder_enabled: bool = False
    reminder_time: str = "06:30"  # HH:MM
    timezone: str = "UTC"

class SettingsUpdate(BaseModel):
    email: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None
    timezone: Optional[str] = None

# ------------------------- Default Plan -------------------------

DEFAULT_PLAN = {
    "monday": {
        "title": "Chest & Triceps",
        "is_rest": False,
        "exercises": [
            {"name": "Bench Press", "sets": 4, "reps": "8-10"},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12"},
            {"name": "Chest Fly", "sets": 3, "reps": "12"},
            {"name": "Tricep Pushdown", "sets": 3, "reps": "12"},
            {"name": "Overhead Tricep Extension", "sets": 3, "reps": "12"},
        ],
    },
    "tuesday": {
        "title": "Back & Biceps",
        "is_rest": False,
        "exercises": [
            {"name": "Deadlift", "sets": 4, "reps": "6-8"},
            {"name": "Pull-Ups", "sets": 3, "reps": "AMRAP"},
            {"name": "Barbell Row", "sets": 3, "reps": "10"},
            {"name": "Bicep Curl", "sets": 3, "reps": "12"},
            {"name": "Hammer Curl", "sets": 3, "reps": "12"},
        ],
    },
    "wednesday": {
        "title": "Legs",
        "is_rest": False,
        "exercises": [
            {"name": "Back Squat", "sets": 4, "reps": "8"},
            {"name": "Romanian Deadlift", "sets": 3, "reps": "10"},
            {"name": "Leg Press", "sets": 3, "reps": "12"},
            {"name": "Walking Lunges", "sets": 3, "reps": "10 each"},
            {"name": "Calf Raises", "sets": 4, "reps": "15"},
        ],
    },
    "thursday": {
        "title": "Shoulders",
        "is_rest": False,
        "exercises": [
            {"name": "Overhead Press", "sets": 4, "reps": "8"},
            {"name": "Lateral Raise", "sets": 3, "reps": "12"},
            {"name": "Face Pulls", "sets": 3, "reps": "15"},
            {"name": "Rear Delt Fly", "sets": 3, "reps": "12"},
            {"name": "Shrugs", "sets": 3, "reps": "12"},
        ],
    },
    "friday": {
        "title": "Arms & Core",
        "is_rest": False,
        "exercises": [
            {"name": "Close-Grip Bench", "sets": 3, "reps": "10"},
            {"name": "Preacher Curl", "sets": 3, "reps": "10"},
            {"name": "Cable Tricep Pushdown", "sets": 3, "reps": "12"},
            {"name": "Hanging Leg Raise", "sets": 3, "reps": "12"},
            {"name": "Plank", "sets": 3, "reps": "60s"},
        ],
    },
    "saturday": {
        "title": "Cardio & Conditioning",
        "is_rest": False,
        "exercises": [
            {"name": "Incline Treadmill", "sets": 1, "reps": "20 min"},
            {"name": "Kettlebell Swings", "sets": 4, "reps": "20"},
            {"name": "Burpees", "sets": 4, "reps": "15"},
            {"name": "Mountain Climbers", "sets": 4, "reps": "30s"},
            {"name": "Stretching", "sets": 1, "reps": "10 min"},
        ],
    },
    "sunday": {
        "title": "Rest Day",
        "is_rest": True,
        "exercises": [],
    },
}

# ------------------------- Helpers -------------------------

def today_iso():
    return date.today().isoformat()

def get_day_name(d: date) -> str:
    return DAYS[d.weekday()]

async def ensure_seed():
    count = await db.plan.count_documents({})
    if count == 0:
        docs = []
        for day, data in DEFAULT_PLAN.items():
            exercises = [Exercise(name=e["name"], sets=e["sets"], reps=e["reps"]).model_dump() for e in data["exercises"]]
            docs.append({
                "day": day,
                "title": data["title"],
                "is_rest": data["is_rest"],
                "exercises": exercises,
            })
        await db.plan.insert_many(docs)
    sett = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not sett:
        await db.settings.insert_one(Settings().model_dump())

# ------------------------- Plan Routes -------------------------

@api_router.get("/plan")
async def get_plan():
    docs = await db.plan.find({}, {"_id": 0}).to_list(10)
    # sort by day order
    docs.sort(key=lambda x: DAYS.index(x["day"]))
    return docs

@api_router.put("/plan/{day}")
async def update_plan_day(day: str, payload: PlanUpdate):
    if day not in DAYS:
        raise HTTPException(status_code=400, detail="Invalid day")
    exercises = [e.model_dump() for e in payload.exercises]
    await db.plan.update_one(
        {"day": day},
        {"$set": {"title": payload.title, "is_rest": payload.is_rest, "exercises": exercises}},
        upsert=True,
    )
    doc = await db.plan.find_one({"day": day}, {"_id": 0})
    return doc

# ------------------------- Today -------------------------

@api_router.get("/today")
async def get_today():
    today_date = today_iso()
    day_name = get_day_name(date.today())
    plan = await db.plan.find_one({"day": day_name}, {"_id": 0})
    session = await db.sessions.find_one({"date": today_date}, {"_id": 0})
    return {
        "date": today_date,
        "day": day_name,
        "day_label": DAY_LABEL[day_name],
        "plan": plan,
        "session": session,
    }

# ------------------------- Sessions -------------------------

@api_router.post("/sessions/toggle")
async def toggle_exercise(payload: SessionToggle):
    if payload.date > today_iso():
        raise HTTPException(status_code=400, detail="Cannot log future date")
    day_name = get_day_name(date.fromisoformat(payload.date))
    plan = await db.plan.find_one({"day": day_name}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="No plan for day")
    total = len(plan.get("exercises", []))
    session = await db.sessions.find_one({"date": payload.date}, {"_id": 0})
    if not session:
        session = SessionLog(date=payload.date, day=day_name, total_exercises=total).model_dump()
        await db.sessions.insert_one(session)
    completed_ids = set(session.get("completed_exercise_ids", []))
    if payload.completed:
        completed_ids.add(payload.exercise_id)
    else:
        completed_ids.discard(payload.exercise_id)
    completed_at = datetime.now(timezone.utc).isoformat() if completed_ids and len(completed_ids) >= total and total > 0 else None
    await db.sessions.update_one(
        {"date": payload.date},
        {"$set": {
            "completed_exercise_ids": list(completed_ids),
            "total_exercises": total,
            "completed_at": completed_at,
            "day": day_name,
        }},
    )
    return await db.sessions.find_one({"date": payload.date}, {"_id": 0})

@api_router.get("/sessions")
async def get_sessions(start: Optional[str] = None, end: Optional[str] = None):
    query = {}
    if start or end:
        query["date"] = {}
        if start:
            query["date"]["$gte"] = start
        if end:
            query["date"]["$lte"] = end
    docs = await db.sessions.find(query, {"_id": 0}).to_list(1000)
    return docs

# ------------------------- Stats / Streak -------------------------

def is_completed(session: dict) -> bool:
    total = session.get("total_exercises", 0)
    done = len(session.get("completed_exercise_ids", []))
    return total > 0 and done >= total

@api_router.get("/stats")
async def get_stats():
    all_sessions = await db.sessions.find({}, {"_id": 0}).to_list(5000)
    completed_dates = {s["date"] for s in all_sessions if is_completed(s)}
    # Current streak (counting back from today; Sunday rest days don't break)
    current = 0
    d = date.today()
    # If today is not completed yet, start checking from yesterday for streak purposes,
    # but allow today's completion to extend
    # Approach: walk backwards. For each day, if Sunday -> skip (don't break, don't count).
    # If completed -> +1. If not completed and not Sunday -> break.
    # We start from today; if today not completed and today not Sunday, streak can still be
    # based on prior days, so we start by skipping today if not completed.
    checking = d
    # Skip today if not completed (so user doesn't see streak=0 just because day isn't done yet)
    if checking.isoformat() not in completed_dates and get_day_name(checking) != "sunday":
        checking = checking - timedelta(days=1)
    while True:
        day_name = get_day_name(checking)
        iso = checking.isoformat()
        if day_name == "sunday":
            checking = checking - timedelta(days=1)
            # don't break, don't count
            # safety: prevent infinite loop after very long time
            if (date.today() - checking).days > 3650:
                break
            continue
        if iso in completed_dates:
            current += 1
            checking = checking - timedelta(days=1)
        else:
            break
        if (date.today() - checking).days > 3650:
            break

    # Best streak: scan all dates from earliest session
    best = 0
    if completed_dates:
        earliest = min(date.fromisoformat(x) for x in completed_dates)
        cur = 0
        d_iter = earliest
        today_d = date.today()
        while d_iter <= today_d:
            day_name = get_day_name(d_iter)
            iso = d_iter.isoformat()
            if day_name == "sunday":
                d_iter += timedelta(days=1)
                continue
            if iso in completed_dates:
                cur += 1
                best = max(best, cur)
            else:
                cur = 0
            d_iter += timedelta(days=1)
        best = max(best, current)

    # This week (Monday-Sunday)
    today_d = date.today()
    monday = today_d - timedelta(days=today_d.weekday())
    week_completed = sum(1 for s in all_sessions if is_completed(s) and date.fromisoformat(s["date"]) >= monday)
    # This month
    month_start = today_d.replace(day=1)
    month_completed = sum(1 for s in all_sessions if is_completed(s) and date.fromisoformat(s["date"]) >= month_start)
    total = len(completed_dates)
    return {
        "current_streak": current,
        "best_streak": best,
        "this_week": week_completed,
        "this_month": month_completed,
        "total_workouts": total,
    }

# ------------------------- Settings -------------------------

@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not doc:
        doc = Settings().model_dump()
        await db.settings.insert_one(doc)
    return doc

@api_router.put("/settings")
async def update_settings(payload: SettingsUpdate):
    update = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    await db.settings.update_one({"id": "settings"}, {"$set": update}, upsert=True)
    reschedule_reminder()
    return await db.settings.find_one({"id": "settings"}, {"_id": 0})

# ------------------------- Email -------------------------

def build_reminder_html(day_label: str, plan: dict) -> str:
    if not plan or plan.get("is_rest"):
        return f"""
        <div style='font-family:Arial,sans-serif;background:#0A0A0A;color:#fff;padding:24px;'>
          <h1 style='font-size:28px;letter-spacing:2px;text-transform:uppercase;color:#fff;margin:0;'>{day_label} · Rest Day</h1>
          <p style='color:#A0A0A0;'>Recover well. Hydrate. See you tomorrow.</p>
        </div>"""
    rows = ""
    for ex in plan.get("exercises", []):
        rows += f"""
          <tr><td style='padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);'>
            <div style='color:#fff;font-weight:bold;font-size:16px;'>{ex['name']}</div>
            <div style='color:#A0A0A0;font-size:13px;'>{ex['sets']} × {ex['reps']}</div>
          </td></tr>"""
    return f"""
    <div style='font-family:Arial,sans-serif;background:#0A0A0A;color:#fff;padding:24px;max-width:600px;'>
      <div style='color:#007AFF;font-weight:bold;letter-spacing:3px;font-size:12px;'>DAILY DROP · {day_label.upper()}</div>
      <h1 style='font-size:32px;text-transform:uppercase;color:#fff;margin:8px 0 24px;'>{plan['title']}</h1>
      <table style='width:100%;border-collapse:collapse;'>{rows}</table>
      <p style='color:#666;font-size:12px;margin-top:24px;'>Sent by your Workout Log · 6:30 AM Drop</p>
    </div>"""

async def send_reminder_email():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0}) or {}
    api_key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
    if not api_key or not settings.get("reminder_enabled") or not settings.get("email"):
        logger.info("Reminder skipped (disabled or missing config).")
        return {"sent": False, "reason": "disabled_or_missing_config"}
    resend.api_key = api_key
    day_name = get_day_name(date.today())
    plan = await db.plan.find_one({"day": day_name}, {"_id": 0})
    html = build_reminder_html(DAY_LABEL[day_name], plan)
    params = {
        "from": sender,
        "to": [settings["email"]],
        "subject": f"💪 {DAY_LABEL[day_name]} · {plan['title'] if plan else 'Workout'}",
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Reminder sent: {result}")
        return {"sent": True, "id": result.get("id")}
    except Exception as e:
        logger.error(f"Reminder failed: {e}")
        return {"sent": False, "error": str(e)}

@api_router.post("/reminder/send-now")
async def reminder_send_now():
    return await send_reminder_email()

@api_router.get("/today/preview-email")
async def preview_email():
    day_name = get_day_name(date.today())
    plan = await db.plan.find_one({"day": day_name}, {"_id": 0})
    return {"html": build_reminder_html(DAY_LABEL[day_name], plan)}

# ------------------------- Scheduler -------------------------

scheduler = AsyncIOScheduler()

def reschedule_reminder():
    """Re-schedule the daily reminder job based on settings."""
    if scheduler.get_job("daily_reminder"):
        scheduler.remove_job("daily_reminder")
    # Schedule for default 06:30 always; the send function checks enabled flag.
    scheduler.add_job(
        send_reminder_email,
        CronTrigger(hour=6, minute=30),
        id="daily_reminder",
        replace_existing=True,
    )

@app.on_event("startup")
async def on_startup():
    await ensure_seed()
    reschedule_reminder()
    if not scheduler.running:
        scheduler.start()
    logger.info("Scheduler started. Daily reminder armed for 06:30.")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if scheduler.running:
        scheduler.shutdown()
    client.close()
