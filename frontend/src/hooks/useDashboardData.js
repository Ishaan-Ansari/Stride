import { useCallback, useEffect, useState } from "react";
import {
  fetchToday,
  fetchPlan,
  fetchStats,
  fetchSessions,
  fetchSettings,
} from "@/lib/api";

export default function useDashboardData() {
  const [today, setToday] = useState(null);
  const [plan, setPlan] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);

  const refresh = useCallback(async () => {
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
  }, [setToday, setPlan, setStats, setSessions, setSettings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { today, plan, stats, sessions, settings, refresh };
}
