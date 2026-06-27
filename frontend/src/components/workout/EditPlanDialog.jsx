import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { updatePlanDay, DAY_LABEL } from "@/lib/api";
import { toast } from "sonner";

const blankExercise = () => ({
  id: crypto.randomUUID(),
  name: "",
  sets: 3,
  reps: "10",
  notes: "",
});

export default function EditPlanDialog({ day, plan, onClose, onSaved }) {
  const open = !!day;
  const [title, setTitle] = useState("");
  const [isRest, setIsRest] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title || "");
      setIsRest(!!plan.is_rest);
      setExercises(plan.exercises || []);
    }
  }, [plan, day]);

  const updateEx = (i, patch) => {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };
  const removeEx = (i) => setExercises((prev) => prev.filter((_, idx) => idx !== i));
  const addEx = () => setExercises((prev) => [...prev, blankExercise()]);

  const save = async () => {
    setSaving(true);
    try {
      await updatePlanDay(day, {
        title: title || "Untitled",
        is_rest: isRest,
        exercises: isRest
          ? []
          : exercises.filter((e) => e.name.trim()).map((e) => ({
              ...e,
              sets: Number(e.sets) || 1,
            })),
      });
      toast.success("Plan updated");
      onSaved();
      onClose();
    } catch (e) {
      toast.error("Could not save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-[#141414] border border-white/10 rounded-none text-white max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin"
        data-testid="edit-plan-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight text-2xl">
            Edit {day && DAY_LABEL[day]}
          </DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Customize the day's workout plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="label-overline">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0 mt-2"
              data-testid="plan-title-input"
            />
          </div>

          <div className="flex items-center justify-between border border-white/5 px-3 py-2">
            <Label className="label-overline">Rest Day</Label>
            <Switch
              checked={isRest}
              onCheckedChange={setIsRest}
              data-testid="plan-rest-switch"
            />
          </div>

          {!isRest && (
            <div>
              <div className="label-overline mb-2">Exercises</div>
              <ul className="space-y-2">
                {exercises.map((ex, i) => (
                  <li
                    key={ex.id}
                    className="grid grid-cols-12 gap-2 items-center border border-white/5 p-2"
                    data-testid={`edit-exercise-${i}`}
                  >
                    <Input
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={(e) => updateEx(i, { name: e.target.value })}
                      className="col-span-6 rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0"
                      data-testid={`edit-exercise-name-${i}`}
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={(e) => updateEx(i, { sets: e.target.value })}
                      className="col-span-2 rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0"
                    />
                    <Input
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => updateEx(i, { reps: e.target.value })}
                      className="col-span-3 rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEx(i)}
                      className="col-span-1 rounded-none hover:bg-[#FF3B30]/20 hover:text-[#FF3B30]"
                      data-testid={`edit-exercise-delete-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="ghost"
                className="mt-3 rounded-none border border-white/20 hover:bg-white/5 uppercase tracking-wider"
                onClick={addEx}
                data-testid="add-exercise-btn"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Exercise
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="rounded-none border border-white/20 hover:bg-white/5 uppercase tracking-wider"
            onClick={onClose}
            data-testid="cancel-plan-btn"
          >
            Cancel
          </Button>
          <Button
            className="btn-primary rounded-none"
            onClick={save}
            disabled={saving}
            data-testid="save-plan-btn"
          >
            {saving ? "Saving..." : "Save Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
