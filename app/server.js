import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import { initDb } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

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
  const r = await fetch(url);
  const j = await r.json();
  res.json(j);
});

app.get("/api/weather", async (req, res) => {
  const { lat, lon, date } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "missing coords" });
  const start = date || new Date().toISOString().slice(0, 10);
  const end = start;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&start_date=${start}&end_date=${end}&timezone=UTC`;
  const r = await fetch(url);
  const j = await r.json();
  res.json(j);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
