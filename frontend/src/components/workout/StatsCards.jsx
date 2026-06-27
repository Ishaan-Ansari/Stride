import { Flame, Trophy, CalendarCheck, Target } from "lucide-react";

const Stat = ({ label, value, icon: Icon, accent, testid }) => (
  <div className="tac-card p-5 fade-up" data-testid={testid}>
    <div className="flex items-center justify-between mb-3">
      <div className="label-overline">{label}</div>
      <Icon className={`w-4 h-4 ${accent}`} />
    </div>
    <div
      className={`font-display font-black text-5xl leading-none ${accent}`}
      data-testid={`${testid}-value`}
    >
      {value}
    </div>
  </div>
);

export default function StatsCards({ stats }) {
  const s = stats || {};
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Current Streak"
        value={s.current_streak ?? "—"}
        icon={Flame}
        accent="text-[#007AFF]"
        testid="stat-current-streak"
      />
      <Stat
        label="Best Streak"
        value={s.best_streak ?? "—"}
        icon={Trophy}
        accent="text-white"
        testid="stat-best-streak"
      />
      <Stat
        label="This Week"
        value={s.this_week ?? "—"}
        icon={Target}
        accent="text-[#34C759]"
        testid="stat-this-week"
      />
      <Stat
        label="Total Workouts"
        value={s.total_workouts ?? "—"}
        icon={CalendarCheck}
        accent="text-white"
        testid="stat-total"
      />
    </div>
  );
}
