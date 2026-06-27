import { useState } from "react";

// Render a GitHub-style 12-week grid (last 84 days), columns = weeks
export default function CalendarHeatmap({ sessions }) {
  const [hover, setHover] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build map: dateISO -> session
  const sessionMap = {};
  for (const s of sessions || []) {
    sessionMap[s.date] = s;
  }

  // Generate last 12 weeks (84 days) starting from Monday
  const WEEKS = 12;
  // Find Monday of current week
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - mondayOffset);
  const startMonday = new Date(currentMonday);
  startMonday.setDate(currentMonday.getDate() - (WEEKS - 1) * 7);

  const columns = [];
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMonday);
      date.setDate(startMonday.getDate() + w * 7 + d);
      week.push(date);
    }
    columns.push(week);
  }

  const iso = (date) => date.toISOString().slice(0, 10);
  const isFuture = (date) => date > today;
  const isSunday = (date) => date.getDay() === 0;

  const cellInfo = (date) => {
    const key = iso(date);
    const s = sessionMap[key];
    const completed =
      s && s.total_exercises > 0 && s.completed_exercise_ids.length >= s.total_exercises;
    const partial =
      s && s.total_exercises > 0 && !completed && s.completed_exercise_ids.length > 0;
    return { key, s, completed, partial };
  };

  const monthLabels = columns.map((week, i) => {
    const first = week[0];
    if (i === 0 || first.getDate() <= 7) {
      return first.toLocaleString("en", { month: "short" }).toUpperCase();
    }
    return "";
  });

  return (
    <div className="tac-card p-6" data-testid="calendar-heatmap">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="label-overline">Activity</div>
          <h3 className="font-display font-bold text-2xl uppercase">
            Last 12 Weeks
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#666]">
          <Legend color="bg-[#1A1A1A] border border-white/10" label="Missed" />
          <Legend color="bg-[#007AFF]/40 border border-[#007AFF]/40" label="Partial" />
          <Legend color="bg-[#007AFF] border border-[#007AFF]" label="Complete" />
          <Legend color="rest-stripes border border-white/10" label="Rest" />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {/* Month row */}
          <div className="flex gap-1 ml-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="w-6 text-[10px] font-bold tracking-widest text-[#666]"
              >
                {m}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {/* Day labels column */}
            <div className="flex flex-col gap-1 text-[10px] text-[#666] tracking-widest font-bold mr-1 w-7">
              {["MON", "", "WED", "", "FRI", "", "SUN"].map((d, i) => (
                <div key={i} className="h-6 flex items-center">
                  {d}
                </div>
              ))}
            </div>
            {columns.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((date) => {
                  const { key, s, completed, partial } = cellInfo(date);
                  const future = isFuture(date);
                  const sunday = isSunday(date);
                  let cls = "bg-[#1A1A1A] border border-white/5";
                  if (future) cls = "bg-[#0F0F0F] border border-white/5 opacity-50";
                  else if (sunday) cls = "rest-stripes border border-white/5";
                  else if (completed) cls = "bg-[#007AFF] border border-[#007AFF]";
                  else if (partial) cls = "bg-[#007AFF]/30 border border-[#007AFF]/40";
                  return (
                    <div
                      key={key}
                      className={`w-6 h-6 ${cls} transition-transform hover:scale-110 cursor-pointer`}
                      onMouseEnter={() => setHover({ date: key, s, sunday, future })}
                      onMouseLeave={() => setHover(null)}
                      data-testid={`heatmap-cell-${key}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 h-6 font-mono text-xs text-[#A0A0A0]" data-testid="heatmap-hover-info">
        {hover &&
          (hover.future
            ? `${hover.date} · Upcoming`
            : hover.sunday
            ? `${hover.date} · Rest day (streak protected)`
            : hover.s
            ? `${hover.date} · ${hover.s.completed_exercise_ids.length}/${hover.s.total_exercises} done`
            : `${hover.date} · No workout logged`)}
      </div>
    </div>
  );
}

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color}`} />
    <span>{label}</span>
  </div>
);
