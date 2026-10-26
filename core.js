/* CEIBS Africa Programme Hub · core: data, people, permissions, frame */
"use strict";
const SB_URL = "https://skuijlscyqtbqresyhbx.supabase.co";
const SB_KEY = "sb_publishable_lkFD6vqwlhat83gt0k1tPQ_Rkk6-1I0";
const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

/* ---------- utilities ---------- */
const DAY = 864e5;
const pd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return iso(d); };
const diff = (a, b) => Math.round((pd(a) - pd(b)) / DAY);
const TODAY = iso(new Date());
const fmt = (s, o = { day: "numeric", month: "short" }) => s ? pd(s).toLocaleDateString("en-GB", o) : "";
const fmtY = s => fmt(s, { day: "numeric", month: "short", year: "numeric" });
const fmtW = s => fmt(s, { weekday: "short", day: "numeric", month: "short" });
const fmtL = s => fmt(s, { weekday: "long", day: "numeric", month: "long" });
const range = s => !s.start_date ? "Dates to confirm" : s.end_date && s.end_date !== s.start_date ? `${pd(s.start_date).getDate()}${s.start_date.slice(0, 7) === s.end_date.slice(0, 7) ? "" : " " + fmt(s.start_date, { month: "short" })} – ${fmt(s.end_date, { day: "numeric", month: "short", year: "numeric" })}` : fmtY(s.start_date);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = s => document.querySelector(s);
const money = (n, c = "GHS") => `${c} ${Number(n || 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
let toastT; function toast(m) { clearTimeout(toastT); let e = $(".toast"); if (!e) { e = document.createElement("div"); e.className = "toast"; e.setAttribute("role", "status"); document.body.appendChild(e); } e.textContent = m; toastT = setTimeout(() => e.remove(), 2800); }
const plural = (n, w, p = w + "s") => `${n} ${n === 1 ? w : p}`;

/* ---------- reference ---------- */
const FAM = { "WELA": "#C8102E", "WELA Scale": "#E25563", "AMP": "#0E2240", "AMP-TP": "#1F5FAE", "ODP": "#0F766E", "CASCOTEM": "#B45309", "Immersions": "#7C3AED", "Degree": "#64748B", "Joint": "#0891B2", "Alumni": "#DB2777", "Events": "#4B5563", "Reports": "#94A3B8", "Holiday": "#CBD5E1" };
const FAM_LABEL = { "WELA": "WELA", "WELA Scale": "WELA Scale", "AMP": "AMP", "AMP-TP": "AMP Technical", "ODP": "ODP", "CASCOTEM": "CASCOTEM", "Immersions": "Immersions", "Degree": "GEMBA & MBA", "Joint": "Joint sessions", "Alumni": "Alumni", "Events": "Events", "Reports": "Monthly reports" };
const famC = f => FAM[f] || "#64748B";
const STATUS = [["todo", "To do"], ["progress", "In progress"], ["waiting", "Waiting on someone"], ["done", "Done"], ["na", "Not needed"]];
const statusLabel = k => (STATUS.find(s => s[0] === k) || [k, k])[1];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ---------- state ---------- */
const S = {
  member: null, me: null, people: [], sessions: [], tasks: [], steps: [], workflows: [], students: [], vendors: [], faculty: [], accounts: [],
  view: "overview", month: null, fam: "all", calView: "list", pgm: null, mod: null, wf: "classroom", tpl: null, tplSel: {}, team: "30",
  workTab: "week", briefFor: null, ptab: "team", q: "", search: "", nav: false, menu: false, drawer: null, drawerMode: "view", open: {}, stuProg: "all"
};
let SID = {};
const P = k => S.people.find(p => p.key === k) || { key: k, short: k || "?", name: k || "Unassigned", colour: "#64748B" };
const isSup = () => S.me && ["admin", "supervisor"].includes(P(S.me).access);
const isAdmin = () => S.me && P(S.me).access === "admin";
const canPlan = () => isSup() || S.me === "daniel";
const canFees = () => !!(S.me && P(S.me).fees);
const canEditTask = t => t.owner === S.me || t.approver === S.me || canPlan();
const initials = n => (String(n || "?").replace(/^(Prof\.?|Dr\.?)\s+/i, "").trim()[0] || "?").toUpperCase();
function av(key, size = "") { const p = P(key); return `<span class="av ${size}" style="--c:${p.colour}" title="${esc(p.name)}">${p.photo_url ? `<img src="${esc(p.photo_url)}" alt="">` : esc(initials(p.name))}</span>`; }
const who = (key, size = "sm") => `<span class="who">${av(key, size)}${esc(P(key).short)}</span>`;
const stack = keys => { const u = [...new Set(keys)]; return `<span class="stack">${u.slice(0, 3).map(k => av(k, "sm")).join("")}${u.length > 3 ? `<span class="av sm" style="--c:#64748B">+${u.length - 3}</span>` : ""}</span>`; };

/* ---------- derived ---------- */
const sess = () => S.sessions.filter(s => s.kind === "session");
const tasksOf = sid => S.tasks.filter(t => t.session_id === sid);
const isOpen = t => t.status !== "done" && t.status !== "na";
const isLate = t => isOpen(t) && t.due < TODAY;
function readiness(L) { const n = L.filter(t => t.status !== "na").length; return n ? Math.round(L.filter(t => t.status === "done").length / n * 100) : 0; }
function progTone(p, L) { if (L.some(isLate)) return "red"; if (p >= 70) return ""; if (p > 0) return "amber"; return "blue"; }
function statusOf(L, s) {
  const late = L.filter(isLate);
  if (late.length) { const d = Math.max(...late.map(t => diff(TODAY, t.due))); return ["red", late.length === 1 ? `Overdue · ${plural(d, "day")}` : `${late.length} overdue · ${plural(d, "day")}`]; }
  if (s && !s.start_date) return ["grey", "Dates to confirm"];
  if (L.length && L.every(t => !isOpen(t))) return ["green", "Ready"];
  const first = L.filter(isOpen).map(t => t.due).sort()[0];
  if (first && first > TODAY) { const started = L.some(t => t.status !== "todo"); return started ? ["blue", "Preparation underway"] : ["grey", `Planning starts ${fmt(first)}`]; }
  return ["blue", "Preparation underway"];
}
function programmes() {
  const G = {};
  for (const s of sess()) (G[s.programme] || (G[s.programme] = { name: s.programme, family: s.family, sessions: [] })).sessions.push(s);
  return Object.values(G).map(g => {
    g.sessions.sort((a, b) => (a.start_date || "9999").localeCompare(b.start_date || "9999"));
    g.start = g.sessions.find(s => s.start_date)?.start_date || null; g.end = g.sessions.reduce((m, s) => (s.end_date || "") > m ? s.end_date : m, "");
    g.tasks = S.tasks.filter(t => g.sessions.some(s => s.id === t.session_id)); return g;
  }).sort((a, b) => (a.start || "9999").localeCompare(b.start || "9999"));
}
const nextSession = () => sess().filter(s => s.start_date && (s.end_date || s.start_date) >= TODAY).sort((a, b) => a.start_date.localeCompare(b.start_date));
const myTasks = (k = S.me) => S.tasks.filter(t => t.owner === k);

/* ---------- data ---------- */
async function loadAll() {
  const q = [
    sb.from("hub_people").select("*").order("sort"),
    sb.from("hub_sessions").select("*").order("start_date", { nullsFirst: false }),
    sb.from("hub_tasks").select("*").order("due").range(0, 4999),
    sb.from("hub_steps").select("*").order("sort"),
    sb.from("hub_workflows").select("*").order("sort"),
    sb.from("hub_vendors").select("*").order("service"),
    sb.from("hub_faculty").select("*").order("name"),
    sb.from("hub_students").select("*").order("name")
  ];
  const [pe, se, ta, st, wf, ve, fa, stu] = await Promise.all(q);
  const err = [pe, se, ta, st, wf].find(r => r.error); if (err) throw err.error;
  S.people = pe.data; S.sessions = se.data; S.tasks = ta.data; S.steps = st.data; S.workflows = wf.data; S.vendors = ve.data || []; S.faculty = fa.data || []; S.students = stu.data || [];
  SID = Object.fromEntries(S.sessions.map(s => [s.id, s]));
}
let rT; const soon = () => { clearTimeout(rT); rT = setTimeout(() => { SID = Object.fromEntries(S.sessions.map(s => [s.id, s])); render(); if (S.drawer) renderDrawer(); }, 200); };
function upsert(arr, p, key = "id") { const id = (p.new && p.new[key]) || (p.old && p.old[key]); const i = arr.findIndex(x => x[key] === id); if (p.eventType === "DELETE") { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = p.new; else arr.push(p.new); }
function subscribe() {
  sb.channel("hub-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "hub_tasks" }, p => { upsert(S.tasks, p); soon(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "hub_sessions" }, p => { upsert(S.sessions, p); soon(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "hub_people" }, p => { upsert(S.people, p, "key"); soon(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "hub_students" }, p => { if (canFees()) { upsert(S.students, p); soon(); } })
    .subscribe();
}
async function setTask(id, patch, msg) {
  const t = S.tasks.find(x => x.id === id); if (!t) return; const before = { ...t };
  Object.assign(t, patch); render(); if (S.drawer) renderDrawer();
  const { data, error } = await sb.from("hub_tasks").update(patch).eq("id", id).select().single();
  if (error) { Object.assign(t, before); render(); if (S.drawer) renderDrawer(); toast("Could not save: " + error.message); return; }
  Object.assign(t, data); if (msg) toast(msg);
}

/* ---------- icons ---------- */
const ICON = {
  overview: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M12 14h2M16 14h1M8 17h2M12 17h2"/>',
  programmes: '<path d="m2 9 10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  work: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-5"/>',
  workflows: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
  templates: '<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
  fees: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  brief: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
  people: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  admin: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  warn: '<path d="M12 3 2 20h20zM12 10v4M12 17v.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', chev: '<path d="m9 6 6 6-6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
  doc: '<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'
};
const ic = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ""}</svg>`;

/* ---------- frame ---------- */
function NAV() {
  const L = [["overview", "Overview"], ["calendar", "2027 Calendar"], ["programmes", "Programmes"], ["work", "My Work"], ["team", "Team Progress"], ["workflows", "Workflows"], ["templates", "Templates"]];
  if (canFees()) L.push(["fees", "Students & fees"]);
  L.push(["brief", "Weekly brief"], ["people", "People"]);
  if (isAdmin()) L.push(["admin", "Admin"]);
  return L;
}
function shell(inner) {
  const me = P(S.me), late = myTasks().filter(isLate).length, dueWeek = myTasks().filter(t => isOpen(t) && t.due >= TODAY && diff(t.due, TODAY) <= 7).length;
  return `<div class="app"><aside class="side ${S.nav ? "open" : ""}"><div class="brand"><span class="emblem"><img src="emblem-white.png" alt=""></span><div><b>CEIBS</b><span>Africa Programme Hub</span></div></div>
   <nav aria-label="Sections">${NAV().map(([k, l]) => `<button data-view="${k}" ${S.view === k ? 'aria-current="page"' : ""}>${ic(k)}${l}${k === "work" && (late || dueWeek) ? `<span class="n">${late || dueWeek}</span>` : ""}</button>`).join("")}</nav>
   <div class="foot">2027 · Programme Office</div></aside>
   <div class="main"><header class="top"><button class="menu" data-nav="1" aria-label="Menu">☰</button>
    <div class="search">${ic("search")}<label class="sr" for="gs">Search</label><input id="gs" placeholder="Search programmes, tasks, people…" value="${esc(S.search)}" autocomplete="off">${S.search.length > 1 ? searchResults() : ""}</div>
    <span class="sp"></span><span class="yearpill">2027</span>
    <div class="me" style="position:relative"><button class="who" data-menu="1" aria-label="Account">${av(S.me)}<span class="t"><b>${esc(me.short)}</b><span>${esc(me.title)}</span></span></button>${S.menu ? `<div class="menu-pop"><button data-view="account">My account and phone reminders</button><button id="signout">Sign out</button></div>` : ""}</div></header>
    <main class="page" id="main">${inner}</main></div></div>${S.nav ? '<div class="scrim" data-nav="0"></div>' : ""}`;
}
function searchResults() {
  const q = S.search.toLowerCase(), out = [];
  for (const s of sess()) if ((s.title + " " + s.programme + " " + s.faculty).toLowerCase().includes(q)) out.push(`<button data-session="${s.id}"><b>${esc(s.title)}</b><small>${esc(s.programme)} · ${esc(range(s))}</small></button>`);
  for (const p of S.people) if (p.name.toLowerCase().includes(q)) out.push(`<button data-teamof="${p.key}"><b>${esc(p.name)}</b><small>${esc(p.title)}</small></button>`);
  for (const t of myTasks()) if (t.title.toLowerCase().includes(q) && out.length < 30) out.push(`<button data-session="${t.session_id}"><b>${esc(t.title)}</b><small>Your task · ${esc(SID[t.session_id]?.title || "")} · ${fmt(t.due)}</small></button>`);
  return `<div class="results">${out.slice(0, 14).join("") || '<p class="empty">Nothing found.</p>'}</div>`;
}
function render() {
  if (!S.me) return;
  const V = { overview: vOverview, calendar: vCalendar, programmes: vProgrammes, work: vWork, team: vTeam, workflows: vWorkflows, templates: vTemplates, fees: vFees, brief: vBrief, people: vPeople, admin: vAdmin, account: vAccount };
  if (!NAV().some(n => n[0] === S.view) && S.view !== "account") S.view = "overview";
  const a = document.activeElement, focusId = a && a.id, pos = a && a.selectionStart;
  const y = window.scrollY; $("#app").innerHTML = shell((V[S.view] || vOverview)()); window.scrollTo(0, y);
  if (focusId) { const n = document.getElementById(focusId); if (n && n.tagName === "INPUT") { n.focus(); try { n.setSelectionRange(pos, pos); } catch (_) { } } }
  after();
}
function go(v) { S.view = v; S.nav = false; S.menu = false; S.search = ""; if (v !== "programmes") { S.pgm = null; } try { history.replaceState(null, "", "#" + v); } catch (_) { } render(); window.scrollTo(0, 0); }

/* ---------- sign in ---------- */
function signinArt(h, p) { return `<section class="signin-art"><img class="logo" src="logo-white.png" alt="CEIBS"><div><h1>${h}</h1><p>${p}</p></div><small>CEIBS Africa · Programme Office · 2027</small></section>`; }
function vSignIn(err = "") {
  $("#app").innerHTML = `<div class="signin">${signinArt("Every programme ready, on time.", "The 2027 programme plan, each person's work, and the team's progress in one place.")}
   <section class="signin-form"><form id="login" novalidate><div class="brandline"><span class="emblem sm"><img src="emblem-white.png" alt=""></span><div><b>CEIBS Africa</b><span>Programme Hub</span></div></div>
    <h2>Sign in</h2><p class="lead">Use your CEIBS email address.</p>
    <div class="field"><label for="em">Email</label><input class="input" id="em" type="email" autocomplete="email" placeholder="name@ceibs.edu"></div>
    <div class="field"><label for="pw">Password</label><input class="input" id="pw" type="password" autocomplete="current-password"></div>
    <div class="err" id="lerr">${esc(err)}</div><button class="btn red block" id="lbtn" type="submit">Sign in</button>
    <p class="fine">No account yet, or forgotten your password? Ask Anna.</p></form></section></div>`;
  $("#login").onsubmit = async e => {
    e.preventDefault(); const b = $("#lbtn"); b.disabled = true; b.textContent = "Signing in…";
    const { error } = await sb.auth.signInWithPassword({ email: $("#em").value.trim(), password: $("#pw").value });
    if (error) { b.disabled = false; b.textContent = "Sign in"; $("#lerr").textContent = /invalid/i.test(error.message) ? "That email and password don't match." : error.message; return; }
    boot();
  };
}
function vSetPassword() {
  $("#app").innerHTML = `<div class="signin">${signinArt(`Welcome, ${esc(P(S.me).short)}.`, "Choose your own password to finish setting up.")}
   <section class="signin-form"><form id="setpw" novalidate><div class="brandline"><span class="emblem sm"><img src="emblem-white.png" alt=""></span><div><b>CEIBS Africa</b><span>Programme Hub</span></div></div>
    <h2>Choose a password</h2><p class="lead">At least 10 characters.</p>
    <div class="field"><label for="p1">New password</label><input class="input" id="p1" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="p2">Repeat it</label><input class="input" id="p2" type="password" autocomplete="new-password"></div>
    <div class="err" id="perr"></div><button class="btn red block" type="submit">Save and continue</button></form></section></div>`;
  $("#setpw").onsubmit = async e => {
    e.preventDefault(); const a = $("#p1").value, b = $("#p2").value;
    if (a.length < 10) return $("#perr").textContent = "Use at least 10 characters.";
    if (a !== b) return $("#perr").textContent = "The two passwords don't match.";
    const { error } = await sb.auth.updateUser({ password: a }); if (error) return $("#perr").textContent = error.message;
    await sb.rpc("password_changed"); S.member.must_reset = false; toast("Password saved"); boot();
  };
}
async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return vSignIn();
  const { data: m } = await sb.from("members").select("id,email,full_name,role,is_admin,must_reset").eq("id", session.user.id).maybeSingle();
  const { data: key } = await sb.rpc("hub_me");
  if (!m || !key) { await sb.auth.signOut(); return vSignIn("This account isn't set up for the Hub. Ask Anna."); }
  S.member = m; S.me = key;
  const tok = await sb.rpc("my_calendar_token"); S.member.cal_token = tok.data || "";
  try { await loadAll(); } catch (e) { $("#app").innerHTML = `<div class="page"><p class="empty">The Hub could not load: ${esc(e.message)}. Refresh to try again.</p></div>`; return; }
  if (m.must_reset) return vSetPassword();
  const h = (location.hash || "").slice(1); if (NAV().some(n => n[0] === h) || h === "account") S.view = h;
  if (!S.month) { const n = nextSession()[0]; S.month = n ? Number(n.start_date.slice(5, 7)) : 1; if (TODAY.slice(0, 4) === "2027") S.month = Number(TODAY.slice(5, 7)); }
  if (isAdmin()) { const { data } = await sb.rpc("hub_accounts"); S.accounts = data || []; }
  render(); subscribe();
}
sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") { S.me = null; vSignIn(); } });
