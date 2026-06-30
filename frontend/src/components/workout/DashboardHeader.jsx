import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Dumbbell } from "lucide-react";

export default function DashboardHeader({ today, onOpenSettings }) {
  return (
    <header className="flex items-center justify-between mb-10 fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-[#007AFF]" />
        </div>
        <div>
          <div className="label-overline">Workout Log</div>
          <h1
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight leading-none"
            data-testid="app-title"
          >
            Stride
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="label-overline">Today</div>
          <div className="font-mono text-sm text-white" data-testid="today-date">
            {today?.day_label} · {today?.date}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none border border-white/20 hover:bg-white/5 h-10 w-10"
          onClick={onOpenSettings}
          data-testid="open-settings-btn"
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
