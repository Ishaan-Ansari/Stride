import { DAY_LABEL } from "@/lib/api";
import { Pencil } from "lucide-react";

export default function WeeklyPlan({ plan, currentDay, onEdit }) {
  return (
    <div className="tac-card p-6 h-full" data-testid="weekly-plan">
      <div className="label-overline mb-1">Weekly Protocol</div>
      <h3 className="font-display font-bold text-2xl uppercase mb-5">
        Schedule
      </h3>
      <ul className="space-y-2">
        {plan.map((d) => {
          const active = d.day === currentDay;
          return (
            <li
              key={d.day}
              className={`flex items-center justify-between px-3 py-3 border transition-all ${
                active
                  ? "border-[#007AFF] bg-[#007AFF]/10"
                  : "border-white/5 hover:border-white/20"
              }`}
              data-testid={`week-row-${d.day}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`font-mono text-xs font-bold w-9 ${
                    active ? "text-[#007AFF]" : "text-[#666]"
                  }`}
                >
                  {DAY_LABEL[d.day]}
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-bold uppercase text-sm tracking-wide truncate ${
                      d.is_rest ? "text-[#666]" : "text-white"
                    }`}
                  >
                    {d.title}
                  </div>
                  <div className="text-xs text-[#666]">
                    {d.is_rest ? "Recovery" : `${d.exercises.length} exercises`}
                  </div>
                </div>
              </div>
              <button
                className="text-[#666] hover:text-white p-1 transition-colors"
                onClick={() => onEdit(d.day)}
                data-testid={`edit-day-${d.day}`}
                aria-label={`Edit ${d.day}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
