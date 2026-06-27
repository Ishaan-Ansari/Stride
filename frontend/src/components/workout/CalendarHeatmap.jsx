import { useMemo, useState } from "react";
import {
  buildWeeks,
  buildMonthLabels,
  cellClass,
  hoverLabel,
  isoDate,
  isFuture,
  isSunday,
  sessionStatus,
  startOfDay,
} from "./heatmapUtils";

const DAY_LABELS = [
  { key: "mon", label: "MON" },
  { key: "tue", label: "" },
  { key: "wed", label: "WED" },
  { key: "thu", label: "" },
  { key: "fri", label: "FRI" },
  { key: "sat", label: "" },
  { key: "sun", label: "SUN" },
];

const Legend = ({ swatch, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${swatch}`} />
    <span>{label}</span>
  </div>
);

const HeatmapCell = ({ date, session, today, onHover }) => {
  const key = isoDate(date);
  const future = isFuture(date, today);
  const sunday = isSunday(date);
  const status = sessionStatus(session);
  const cls = cellClass({ future, sunday, status });
  const info = { date: key, session, sunday, future };
  return (
    <div
      className={`w-6 h-6 ${cls} transition-transform hover:scale-110 cursor-pointer`}
      onMouseEnter={() => onHover(info)}
      onMouseLeave={() => onHover(null)}
      data-testid={`heatmap-cell-${key}`}
    />
  );
};

const HeatmapWeek = ({ week, sessionMap, today, onHover }) => (
  <div className="flex flex-col gap-1">
    {week.days.map((date) => (
      <HeatmapCell
        key={isoDate(date)}
        date={date}
        session={sessionMap[isoDate(date)]}
        today={today}
        onHover={onHover}
      />
    ))}
  </div>
);

export default function CalendarHeatmap({ sessions }) {
  const [hover, setHover] = useState(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const weeks = useMemo(() => buildWeeks(today), [today]);
  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);
  const sessionMap = useMemo(() => {
    const map = {};
    for (const item of sessions || []) map[item.date] = item;
    return map;
  }, [sessions]);

  return (
    <div className="tac-card p-6" data-testid="calendar-heatmap">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="label-overline">Activity</div>
          <h3 className="font-display font-bold text-2xl uppercase">Last 12 Weeks</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#666]">
          <Legend swatch="bg-[#1A1A1A] border border-white/10" label="Missed" />
          <Legend swatch="bg-[#007AFF]/40 border border-[#007AFF]/40" label="Partial" />
          <Legend swatch="bg-[#007AFF] border border-[#007AFF]" label="Complete" />
          <Legend swatch="rest-stripes border border-white/10" label="Rest" />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex flex-col gap-1 min-w-full">
          <div className="flex gap-1 ml-8">
            {weeks.map((week, i) => (
              <div
                key={week.key}
                className="w-6 text-[10px] font-bold tracking-widest text-[#666]"
              >
                {monthLabels[i]}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 text-[10px] text-[#666] tracking-widest font-bold mr-1 w-7">
              {DAY_LABELS.map((d) => (
                <div key={d.key} className="h-6 flex items-center">
                  {d.label}
                </div>
              ))}
            </div>
            {weeks.map((week) => (
              <HeatmapWeek
                key={week.key}
                week={week}
                sessionMap={sessionMap}
                today={today}
                onHover={setHover}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="mt-4 h-6 font-mono text-xs text-[#A0A0A0]"
        data-testid="heatmap-hover-info"
      >
        {hoverLabel(hover)}
      </div>
    </div>
  );
}
