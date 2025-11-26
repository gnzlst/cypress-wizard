import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import { initDb } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

async function fetchWithTimeout(url, options = {}, { timeout = 15000, retries = 3 } = {}) {
  let attempt = 0;
  const backoff = (n) => new Promise((r) => setTimeout(r, 200 * Math.pow(2, n)));
  while (true) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      if (attempt > retries) {
        throw err;
      }
      await backoff(attempt);
    }
  }
}

const geocodeCache = new Map();
const GEOCODE_TTL = 1000 * 60 * 5; // 5 minutes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({ secret: "dev-secret", resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

let db;
initDb()
  .then((d) => {
    db = d;
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "missing" });
  const row = await db.get("SELECT id,username,password FROM users WHERE username = ?", username);
  if (!row || row.password !== password) return res.status(401).json({ error: "invalid" });
  req.session.userId = row.id;
  req.session.username = row.username;
  res.json({ ok: true, username: row.username });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/user", (req, res) => {
  if (req.session && req.session.userId) return res.json({ user: { username: req.session.username } });
  res.json({ user: null });
});

app.get("/api/geocode", async (req, res) => {
  const name = req.query.name || "";
  if (!name) return res.status(400).json({ error: "missing name" });
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5`;
  const key = String(name).toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.data);
  }
  try {
    const r = await fetchWithTimeout(url, {}, { timeout: 15000, retries: 3 });
    const j = await r.json();
    try {
      geocodeCache.set(key, { data: j, expires: Date.now() + GEOCODE_TTL });
    } catch (e) {
      // ignore cache failures
    }
    res.json(j);
  } catch (err) {
    console.error("geocode fetch failed:", {
      message: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : undefined,
      name: err && err.name ? err.name : undefined,
      stack: err && err.stack ? err.stack.split("\n").slice(0, 5).join("\\n") : undefined,
    });
    if (process.env.MOCK_EXTERNAL) {
      const mock = {
        results: [
          { name: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276 },
          { name: "Adelaide", country: "Australia", latitude: -34.9285, longitude: 138.6007 },
        ],
      };
      // cache mock response briefly as well
      geocodeCache.set(key, { data: mock, expires: Date.now() + GEOCODE_TTL });
      return res.json(mock);
    }
    res.status(502).json({ error: "geocode_unavailable" });
  }
});

app.get("/api/weather", async (req, res) => {
  const { lat, lon, date } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "missing coords" });
  const start = date || new Date().toISOString().slice(0, 10);
  const end = start;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&start_date=${start}&end_date=${end}&timezone=UTC`;
  try {
    const r = await fetchWithTimeout(url, {}, { timeout: 15000, retries: 3 });
    const j = await r.json();
    res.json(j);
  } catch (err) {
    console.error("weather fetch failed:", {
      message: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : undefined,
      name: err && err.name ? err.name : undefined,
      stack: err && err.stack ? err.stack.split("\n").slice(0, 5).join("\\n") : undefined,
    });
    if (process.env.MOCK_EXTERNAL) {
      const mock = {
        latitude: lat,
        longitude: lon,
        daily: {
          temperature_2m_max: [22],
          temperature_2m_min: [12],
        },
      };
      return res.json(mock);
    }
    res.status(502).json({ error: "weather_unavailable" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
