
import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

const api = axios.create({
  baseURL: BASE,
});

export const getDetections = (days, source) =>
  api.get("/detections", { params: { days, source } }).then((r) => r.data);

export const getCalendar = (days) =>
  api.get("/calendar", { params: { days } }).then((r) => r.data);

export const getHighlights = (days) =>
  api.get("/highlights", { params: { days } }).then((r) => r.data);

export const getSectors = () =>
  api.get("/sectors").then((r) => r.data);

export const createVisit = (payload) =>
  api.post("/visits", payload).then((r) => r.data);

export const listVisits = () =>
  api.get("/visits").then((r) => r.data);

export const createObservation = (payload) =>
  api.post("/observations", payload).then((r) => r.data);

export const listObservations = (visitId) =>
  api.get(`/observations/${visitId}`).then((r) => r.data);

export const exportDetectionsUrl = (days, source) =>
  `${BASE}/export/detections.csv?days=${days}&source=${encodeURIComponent(source)}`;

export const exportSummaryUrl = () =>
  `${BASE}/export/summary.csv`;
