import { useState } from "react";
import TodaysChecklist from "@/components/workout/TodaysChecklist";
import WeeklyPlan from "@/components/workout/WeeklyPlan";
import StatsCards from "@/components/workout/StatsCards";
import CalendarHeatmap from "@/components/workout/CalendarHeatmap";
import SettingsDialog from "@/components/workout/SettingsDialog";
import EditPlanDialog from "@/components/workout/EditPlanDialog";
import DashboardHeader from "@/components/workout/DashboardHeader";
import useDashboardData from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { today, plan, stats, sessions, settings, refresh } = useDashboardData();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editDay, setEditDay] = useState(null);

  return (
    <div className="noise relative min-h-screen">
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 py-8">
        <DashboardHeader today={today} onOpenSettings={() => setSettingsOpen(true)} />
        <StatsCards stats={stats} />

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
