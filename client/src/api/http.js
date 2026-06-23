// ============================================================
// Client HTTP centralisé pour l'API ATED-360.
// En développement, le proxy CRA (package.json) redirige /api
// vers http://localhost:4000. En production, le frontend est
// servi par le même serveur que l'API : les chemins relatifs
// suffisent.
// ============================================================

const TOKEN_KEY = "ated_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Erreur enrichie portant le statut HTTP et d'éventuels détails de validation.
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur", 0);
  }

  // 204 / réponses sans corps
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok || json.success === false) {
    const message = json?.error?.message || "Une erreur est survenue";
    // Token expiré/invalide : on nettoie pour forcer une reconnexion.
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(message, res.status, json?.error?.details);
  }

  return json; // { success, data, meta? }
}

export const http = {
  get: (p, opts) => request(p, { ...opts, method: "GET" }),
  post: (p, body, opts) => request(p, { ...opts, method: "POST", body }),
  patch: (p, body, opts) => request(p, { ...opts, method: "PATCH", body }),
  del: (p, opts) => request(p, { ...opts, method: "DELETE" }),
};
