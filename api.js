import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const getHealth = () => client.get("/");

export const getModelInfo = () => client.get("/model-info");

export const predict = (payload) => client.post("/predict", payload);

export const getHistory = () => client.get("/history");

export const deleteHistoryEntry = (id) => client.delete(`/history/${id}`);

export const clearHistory = () => client.delete("/history");

export const getFeatureImportance = () => client.get("/analytics/feature-importance");

export const getCorrelation = () => client.get("/analytics/correlation");

export const getScatter = (x, y) => client.get("/analytics/scatter", { params: { x, y } });

export const getHistogram = (column) => client.get("/analytics/histogram", { params: { column } });

export const getDatasetSummary = () => client.get("/analytics/dataset-summary");

export default client;
