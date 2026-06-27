import { DAY_LABEL } from "@/lib/api";
import { Pencil } from "lucide-react";

const DayCard = ({ day, active, onEdit }) => (
  <li
    className={`flex items-center justify-between px-3 py-3 border transition-all ${
      active
        ? "border-[#007AFF] bg-[#007AFF]/10"
        : "border-white/5 hover:border-white/20"
    }`}
    data-testid={`week-row-${day.day}`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`font-mono text-xs font-bold w-9 ${
          active ? "text-[#007AFF]" : "text-[#666]"
        }`}
      >
        {DAY_LABEL[day.day]}
      </div>
      <div className="min-w-0">
        <div
          className={`font-bold uppercase text-sm tracking-wide truncate ${
            day.is_rest ? "text-[#666]" : "text-white"
          }`}
        >
          {day.title}
        </div>
        <div className="text-xs text-[#666]">
          {day.is_rest ? "Recovery" : `${day.exercises.length} exercises`}
        </div>
      </div>
    </div>
    <button
      className="text-[#666] hover:text-white p-1 transition-colors"
      onClick={onEdit}
      data-testid={`edit-day-${day.day}`}
      aria-label={`Edit ${day.day}`}
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  </li>
);

export default function WeeklyPlan({ plan, currentDay, onEdit }) {
  return (
    <div className="tac-card p-6 h-full" data-testid="weekly-plan">
      <div className="label-overline mb-1">Weekly Protocol</div>
      <h3 className="font-display font-bold text-2xl uppercase mb-5">Schedule</h3>
      <ul className="space-y-2">
        {plan.map((d) => (
          <DayCard
            key={d.day}
            day={d}
            active={d.day === currentDay}
            onEdit={() => onEdit(d.day)}
          />
        ))}
      </ul>
    </div>
  );
}
