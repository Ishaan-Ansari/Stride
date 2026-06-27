import { Checkbox } from "@/components/ui/checkbox";
import { toggleExercise } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Coffee, Flame } from "lucide-react";

const RestCard = ({ dayLabel }) => (
  <div className="tac-card p-8 h-full min-h-[420px] flex flex-col justify-center">
    <Coffee className="w-10 h-10 text-[#007AFF] mb-4" />
    <div className="label-overline mb-2">{dayLabel} · Recovery</div>
    <h2 className="font-display font-black text-5xl sm:text-6xl uppercase leading-[0.9]">
      Rest Day.
    </h2>
    <p className="text-[#A0A0A0] mt-4 max-w-md">
      No exercises today. Sundays are for recovery &mdash; your streak stays
      protected. Hydrate, stretch, sleep well.
    </p>
  </div>
);

const ChecklistHeader = ({ dayLabel, title, done, total }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <div className="label-overline flex items-center gap-2">
        <Flame className="w-3 h-3 text-[#007AFF]" /> Today&apos;s Drop &middot; {dayLabel}
      </div>
      <h2
        className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight leading-none mt-2"
        data-testid="today-title"
      >
        {title}
      </h2>
    </div>
    <div className="text-right">
      <div className="label-overline">Progress</div>
      <div
        className="font-display font-black text-4xl text-[#007AFF] leading-none"
        data-testid="today-progress"
      >
        {done}/{total}
      </div>
    </div>
  </div>
);

const ExerciseItem = ({ ex, index, checked, onToggle }) => (
  <li className="py-4 flex items-center gap-4 group" data-testid={`exercise-row-${index}`}>
    <Checkbox
      checked={checked}
      onCheckedChange={onToggle}
      className="rounded-none w-5 h-5 border-white/30 data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF] data-[state=checked]:text-white"
      data-testid={`exercise-checkbox-${index}`}
    />
    <div className="flex-1">
      <div
        className={`font-bold uppercase tracking-wide transition-all duration-300 ${
          checked
            ? "text-[#666] line-through"
            : "text-white group-hover:text-[#3395FF]"
        }`}
      >
        {ex.name}
      </div>
      {ex.notes && <div className="text-xs text-[#666] mt-0.5">{ex.notes}</div>}
    </div>
    <div className="font-mono text-sm text-[#A0A0A0]">
      {ex.sets} × {ex.reps}
    </div>
  </li>
);

export default function TodaysChecklist({ today, onChange }) {
  if (!today) {
    return (
      <div className="tac-card p-6 h-full min-h-[420px] flex items-center justify-center">
        <div className="label-overline">Loading today&apos;s workout...</div>
      </div>
    );
  }

  const { plan, session, date, day_label: dayLabel } = today;
  const completedIds = new Set(session?.completed_exercise_ids || []);
  const total = plan?.exercises?.length || 0;
  const done = completedIds.size;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const handleToggle = async (exerciseId, current) => {
    try {
      await toggleExercise({
        date,
        exercise_id: exerciseId,
        completed: !current,
      });
      if (!current && done + 1 === total) {
        toast.success("Workout complete. Locked in.", {
          description: `${dayLabel} session logged.`,
        });
      }
      onChange();
    } catch (e) {
      toast.error("Failed to update. Try again.");
    }
  };

  if (plan?.is_rest) return <RestCard dayLabel={dayLabel} />;

  return (
    <div className="tac-card p-6 sm:p-8 h-full" data-testid="todays-checklist">
      <ChecklistHeader
        dayLabel={dayLabel}
        title={plan?.title}
        done={done}
        total={total}
      />
      <Progress
        value={pct}
        className="h-1 rounded-none bg-white/5 [&>div]:bg-[#007AFF] [&>div]:rounded-none"
      />
      <ul className="mt-6 divide-y divide-white/5">
        {plan?.exercises?.map((ex, i) => (
          <ExerciseItem
            key={ex.id}
            ex={ex}
            index={i}
            checked={completedIds.has(ex.id)}
            onToggle={() => handleToggle(ex.id, completedIds.has(ex.id))}
          />
        ))}
      </ul>
    </div>
  );
}
