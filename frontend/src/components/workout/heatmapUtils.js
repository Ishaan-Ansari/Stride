const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86400000;

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isoDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const isSunday = (d) => d.getDay() === 0;
export const isFuture = (d, today) => d.getTime() > today.getTime();

export const buildWeeks = (today) => {
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today.getTime() - mondayOffset * MS_PER_DAY);
  const startMonday = new Date(
    currentMonday.getTime() - (WEEKS - 1) * DAYS_PER_WEEK * MS_PER_DAY,
  );
  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const date = new Date(
        startMonday.getTime() + (w * DAYS_PER_WEEK + d) * MS_PER_DAY,
      );
      days.push(date);
    }
    weeks.push({ key: isoDate(days[0]), days });
  }
  return weeks;
};

export const buildMonthLabels = (weeks) =>
  weeks.map((week, i) => {
    const first = week.days[0];
    if (i === 0 || first.getDate() <= DAYS_PER_WEEK) {
      return first.toLocaleString("en", { month: "short" }).toUpperCase();
    }
    return "";
  });

export const sessionStatus = (session) => {
  if (!session) return "none";
  const total = session.total_exercises || 0;
  const done = (session.completed_exercise_ids || []).length;
  if (total > 0 && done >= total) return "complete";
  if (done > 0) return "partial";
  return "none";
};

export const cellClass = ({ future, sunday, status }) => {
  if (future) return "bg-[#0F0F0F] border border-white/5 opacity-50";
  if (sunday) return "rest-stripes border border-white/5";
  if (status === "complete") return "bg-[#007AFF] border border-[#007AFF]";
  if (status === "partial")
    return "bg-[#007AFF]/30 border border-[#007AFF]/40";
  return "bg-[#1A1A1A] border border-white/5";
};

export const hoverLabel = (info) => {
  if (!info) return "";
  if (info.future) return `${info.date} · Upcoming`;
  if (info.sunday) return `${info.date} · Rest day (streak protected)`;
  if (info.session) {
    const done = (info.session.completed_exercise_ids || []).length;
    return `${info.date} · ${done}/${info.session.total_exercises} done`;
  }
  return `${info.date} · No workout logged`;
};
