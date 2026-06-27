import { useEffect, useState } from "react";
import {
  fetchToday,
  fetchPlan,
  fetchStats,
  fetchSessions,
  fetchSettings,
  DAYS,
  DAY_LABEL,
} from "@/lib/api";
import TodaysChecklist from "@/components/workout/TodaysChecklist";
import WeeklyPlan from "@/components/workout/WeeklyPlan";
import StatsCards from "@/components/workout/StatsCards";
import CalendarHeatmap from "@/components/workout/CalendarHeatmap";
import SettingsDialog from "@/components/workout/SettingsDialog";
import EditPlanDialog from "@/components/workout/EditPlanDialog";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Dumbbell } from "lucide-react";

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [plan, setPlan] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editDay, setEditDay] = useState(null);

  const refresh = async () => {
    const [t, p, s, ss, set] = await Promise.all([
      fetchToday(),
      fetchPlan(),
      fetchStats(),
      fetchSessions(),
      fetchSettings(),
    ]);
    setToday(t);
    setPlan(p);
    setStats(s);
    setSessions(ss);
    setSettings(set);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="noise relative min-h-screen">
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 py-8">
        {/* Header */}
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
                Iron Protocol
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
              onClick={() => setSettingsOpen(true)}
              data-testid="open-settings-btn"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <div className="lg:col-span-2 fade-up" style={{ animationDelay: "80ms" }}>
            <TodaysChecklist today={today} onChange={refresh} />
          </div>
          <div className="fade-up" style={{ animationDelay: "160ms" }}>
            <WeeklyPlan
              plan={plan}
              currentDay={today?.day}
              onEdit={(day) => setEditDay(day)}
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-6 fade-up" style={{ animationDelay: "240ms" }}>
          <CalendarHeatmap sessions={sessions} />
        </div>

        <footer className="mt-12 pb-8 text-center label-overline">
          Built for consistency · 6:30 AM Daily Drop
        </footer>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSaved={refresh}
      />
      <EditPlanDialog
        day={editDay}
        plan={plan.find((p) => p.day === editDay)}
        onClose={() => setEditDay(null)}
        onSaved={refresh}
      />
    </div>
  );
}
