const $ = (sel) => document.querySelector(sel);
const loginForm = $("#login-form");
const auth = $("#auth");
const wizard = $("#wizard");
const whoami = $("#whoami");
const logoutBtn = $("#logout");
const guestBtn = $("#guest");
const cityInput = $("#city");
const searchCity = $("#search-city");
const results = $("#results");
const step1 = $("#step-1");
const step2 = $("#step-2");
const step3 = $("#step-3");
const dateInput = $("#date");
const getWeatherBtn = $("#get-weather");
const forecastEl = $("#forecast");
const againBtn = $("#again");

async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  return r.json();
}

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = $("#username").value;
  const password = $("#password").value;
  const j = await api("/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (j.ok) openWizard(j.username);
  else alert("login failed");
});

guestBtn.addEventListener("click", () => openWizard("guest"));

logoutBtn.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  hide(wizard);
  show(auth);
});

function openWizard(username) {
  hide(auth);
  show(wizard);
  whoami.textContent = username ? `Hi ${username}` : "";
}

searchCity.addEventListener("click", async () => {
  const name = cityInput.value.trim();
  if (!name) return;
  results.innerHTML = "Searching...";
  const j = await api(`/api/geocode?name=${encodeURIComponent(name)}`);
  results.innerHTML = "";
  if (!j.results || j.results.length === 0) {
    results.textContent = "No results";
    return;
  }
  j.results.forEach((r) => {
    const li = document.createElement("li");
    li.className = "p-2 border rounded my-1 cursor-pointer";
    li.textContent = `${r.name}, ${r.country}`;
    li.addEventListener("click", () => selectLocation(r));
    results.appendChild(li);
  });
});

let selected;
function selectLocation(loc) {
  selected = loc;
  hide(step1);
  show(step2);
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;
}

getWeatherBtn.addEventListener("click", async () => {
  if (!selected) return;
  const d = dateInput.value || new Date().toISOString().slice(0, 10);
  forecastEl.textContent = "Loading...";
  const j = await api(`/api/weather?lat=${selected.latitude}&lon=${selected.longitude}&date=${d}`);
  renderForecast(j, d, selected);
  hide(step2);
  show(step3);
});

function renderForecast(j, d, selected) {
  const daily = j.daily || {};
  const max = daily.temperature_2m_max ? daily.temperature_2m_max[0] : "-";
  const min = daily.temperature_2m_min ? daily.temperature_2m_min[0] : "-";
  forecastEl.innerHTML = `
    <div class="p-4 border rounded bg-slate-50">
      <div class="text-sm text-slate-600">${selected.name}, ${selected.country} - ${d}</div>
      <div class="text-2xl font-bold mt-2">${max}° / ${min}°</div>
      <div class="mt-2 text-sm">${funMessage(max)}</div>
    </div>
  `;
}

function funMessage(max) {
  if (max === "-") return "No data";
  const t = Number(max);
  if (t >= 30) return "It's hot - grab ice cream!";
  if (t >= 20) return "Nice weather - sunglasses time.";
  if (t >= 10) return "Mild - a light jacket should do.";
  return "Cold - bring a warm coat!";
}

againBtn.addEventListener("click", () => {
  selected = null;
  results.innerHTML = "";
  cityInput.value = "";
  hide(step3);
  show(step1);
});

async function init() {
  const j = await api("/api/user");
  if (j.user) openWizard(j.user.username);
}

init();
