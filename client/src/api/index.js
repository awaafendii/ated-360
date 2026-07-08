// Fonctions d'accès à l'API, regroupées par domaine.
// Chaque fonction renvoie directement `data` (déballe l'enveloppe { success, data }).

import { http, tokenStore } from "./http.js";

// ---------- Auth ----------
export const authApi = {
  async register(payload) {
    const { data } = await http.post("/auth/register", payload, { auth: false });
    tokenStore.set(data.token);
    return data.user;
  },
  async login(email, password) {
    const { data } = await http.post("/auth/login", { email, password }, { auth: false });
    tokenStore.set(data.token);
    return data.user;
  },
  async me() {
    const { data } = await http.get("/auth/me");
    return data;
  },
  logout() {
    tokenStore.clear();
  },
};

// ---------- Producteur ----------
export const producerApi = {
  async dashboard() {
    const { data } = await http.get("/producers/dashboard");
    return data;
  },
  async updateProfile(payload) {
    const { data } = await http.patch("/producers/profile", payload);
    return data;
  },
  async uploadCv(file) {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await http.upload("/producers/cv", fd);
    return data;
  },
  async listProofs() {
    const { data } = await http.get("/producers/proofs");
    return data;
  },
  async addProof(file, type, label) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    if (label) fd.append("label", label);
    const { data } = await http.upload("/producers/proofs", fd);
    return data;
  },
  async removeProof(id) {
    return http.del(`/producers/proofs/${id}`);
  },
};

// ---------- Registre ----------
export const recordsApi = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await http.get(`/records${qs ? `?${qs}` : ""}`);
    return { items: res.data, meta: res.meta };
  },
  async create(payload) {
    const { data } = await http.post("/records", payload);
    return data;
  },
  async remove(id) {
    return http.del(`/records/${id}`);
  },
};

// ---------- Alertes ----------
export const alertsApi = {
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const { data } = await http.get(`/alerts${qs ? `?${qs}` : ""}`);
    return data;
  },
  async summary() {
    const { data } = await http.get("/alerts/summary");
    return data;
  },
  async resolve(id) {
    const { data } = await http.patch(`/alerts/${id}/resolve`);
    return data;
  },
};

// ---------- Score ----------
export const scoreApi = {
  async get(farmType = "AVICOLE") {
    const { data } = await http.get(`/score?farmType=${farmType}`);
    return data;
  },
};

// ---------- Drones ----------
export const dronesApi = {
  async listMissions() {
    const { data } = await http.get("/drones/missions");
    return data;
  },
  async createMission(payload) {
    const { data } = await http.post("/drones/missions", payload);
    return data;
  },
  async generateReport(id) {
    const { data } = await http.post(`/drones/missions/${id}/report`);
    return data;
  },
};

// ---------- Partenaires ----------
export const partnersApi = {
  async summary() {
    const { data } = await http.get("/partners/summary");
    return data;
  },
  async producers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const { data } = await http.get(`/partners/producers${qs ? `?${qs}` : ""}`);
    return data;
  },
  async producerDetail(id) {
    const { data } = await http.get(`/partners/producers/${id}`);
    return data;
  },
  async sendOffer(payload) {
    const { data } = await http.post("/partners/offers", payload);
    return data;
  },
};
