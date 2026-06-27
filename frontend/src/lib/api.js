import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const fetchPlan = () => api.get("/plan").then((r) => r.data);
export const updatePlanDay = (day, payload) =>
  api.put(`/plan/${day}`, payload).then((r) => r.data);
export const fetchToday = () => api.get("/today").then((r) => r.data);
export const toggleExercise = (payload) =>
  api.post("/sessions/toggle", payload).then((r) => r.data);
export const fetchSessions = (params = {}) =>
  api.get("/sessions", { params }).then((r) => r.data);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const fetchSettings = () => api.get("/settings").then((r) => r.data);
export const updateSettings = (payload) =>
  api.put("/settings", payload).then((r) => r.data);
export const sendReminderNow = () =>
  api.post("/reminder/send-now").then((r) => r.data);

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
export const DAY_LABEL = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
  sunday: "SUN",
};
