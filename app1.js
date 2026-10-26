/* CEIBS Africa Programme Hub — programme operations
   Front end for the Supabase back end (tables: sessions, tasks, members, faculty, clients, suppliers, playbook_steps, activity). */
"use strict";
const SB_URL = "https://skuijlscyqtbqresyhbx.supabase.co";
const SB_KEY = "sb_publishable_lkFD6vqwlhat83gt0k1tPQ_Rkk6-1I0";
const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

/* ============ utilities ============ */
const DAY = 864e5;
const pd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return iso(d); };
const TODAY = iso(new Date());
const diff = (a, b) => Math.round((pd(a) - pd(b)) / DAY);
const fmt = (s, o = { day: "numeric", month: "short" }) => s ? pd(s).toLocaleDateString("en-GB", o) : "";
const fmtY = s => fmt(s, { day: "numeric", month: "short", year: "numeric" });
const fmtW = s => fmt(s, { weekday: "short", day: "numeric", month: "short" });
const fmtLong = s => fmt(s, { weekday: "long", day: "numeric", month: "long" });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = n => String(n || "?").replace(/^(Prof\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Lady)\s+/i, "").split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join("");
const $ = s => document.querySelector(s);
let toastT; function toast(m) { clearTimeout(toastT); let e = $(".toast"); if (!e) { e = document.createElement("div"); e.className = "toast"; e.setAttribute("role", "status"); document.body.appendChild(e); } e.textContent = m; toastT = setTimeout(() => e.remove(), 3000); }
const store = { get(k, d) { try { const v = localStorage.getItem("kente-" + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem("kente-" + k, JSON.stringify(v)); } catch (_) { } } };

/* ============ reference ============ */
const ROLES = { COORD: "Programme Coordinator", ED: "Executive Director", LOG: "Logistics & Facilities", COMMS: "Marketing & Comms", ADM: "Admissions & Participants", FIN: "Finance", IT: "IT & AV" };
const ROLE_DOES = { COORD: "Owns the plan, faculty liaison, participants and the Coordinator calendar", ED: "Approves budgets, faculty contracts and client proposals", LOG: "Rooms, catering, AV, travel and ground transport", COMMS: "Brochures, printing, social media and photography", ADM: "Applications, participant lists and joining instructions", FIN: "Invoices, deposits, faculty fees and reconciliation", IT: "Zoom, hybrid set-up and classroom technology" };
const EXT = { FAC: "Faculty", CLIENT: "Client", PAX: "Participants", CATER: "Caterer", PRINT: "Printer", VENUE: "Venue / hotel", TRAVEL: "Travel agent", HANDLER: "Ground handler" };
const roleName = k => ROLES[k] || EXT[k] || k;
const FAMC = { "WELA": "#BF0008", "WELA Scale": "#E8767B", "AMP": "#1B1416", "AMP-TP": "#1B1416", "ODP": "#8C7F81", "CASCOTEM": "#8C0006", "GEMBA": "#C8B4B5", "EMBA": "#C8B4B5", "MBA": "#C8B4B5", "Joint": "#B3A9AA", "Alumni": "#B3A9AA", "Other": "#B3A9AA", "Holiday": "#E3DADA" };
const famC = f => FAMC[f] || FAMC.Other;
const LEGEND = [["WELA", "#BF0008"], ["WELA Scale", "#E8767B"], ["AMP", "#1B1416"], ["ODP", "#8C7F81"], ["CASCOTEM", "#8C0006"], ["Degree programmes", "#C8B4B5"], ["Other", "#B3A9AA"]];
const TYPES = ["Module", "Event", "Coaching", "Immersion", "Marketing", "Venue hire"];
const MODES = ["In-person", "Virtual", "Hybrid", "TBC"];
const TEAMS = {
  PROG: { name: "Programmes", short: "Programmes", roles: ["COORD", "ADM", "IT"], does: "The plan, faculty, participants, Canvas and classroom technology" },
  MKT: { name: "Marketing", short: "Marketing", roles: ["COMMS"], does: "Flyers, brochures, social media, printing and photography" },
  FIN: { name: "Finance", short: "Finance", roles: ["FIN"], does: "Fee reminders, invoices, deposits and faculty payments" },
  FAC: { name: "Facilities & Logistics", short: "Facilities", roles: ["LOG"], does: "Rooms, catering, vendors, travel and transport" },
  LEAD: { name: "Leadership", short: "Leadership", roles: ["ED"], does: "Approves budgets, contracts and client proposals" }
};
const teamOf = r => Object.keys(TEAMS).find(k => TEAMS[k].roles.includes(r)) || "PROG";
const teamName = r => TEAMS[teamOf(r)].short;
const teamTasks = (k, list) => list.filter(t => TEAMS[k].roles.includes(t.owner_role) || (k === "LEAD" && t.approver_role === "ED" && t.status === "open"));
const peopleOf = k => S.roster.filter(r => r.team === k).map(r => r.full_name.replace(/^Prof\. /, "Prof. ")).join(", ");
const ICONS = { overview: "M3 12 12 4l9 8M5 10v10h14V10", year: "M4 5h16v15H4zM4 10h16M8 3v4M16 3v4", calendar: "M4 6h16v14H4zM4 11h16M9 3v4M15 3v4M8 15h3", programmes: "M4 6h16M4 12h16M4 18h10", tasks: "m5 12 4 4L19 6", teams: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a6 6 0 0 1 12 0M12 20a6 6 0 0 1 10 0", brief: "M4 5h16v11H8l-4 4zM8 9h8M8 12h5", people: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0", letters: "M3 6h18v12H3zM3 7l9 6 9-6", playbooks: "M5 4h11l3 3v13H5zM9 11h6M9 15h6", activity: "M3 12h4l3-7 4 14 3-7h4", check: "M12 3 4 7v6c0 4 3.5 7 8 8 4.5-1 8-4 8-8V7zM9 12l2 2 4-4", admin: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.6H9.5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z", me: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0" };
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[k] || ICONS.overview}"/></svg>`;

/* ============ state ============ */
const S = {
  user: null, me: null, sessions: [], tasks: [], members: [], roster: [], briefs: [], faculty: [], clients: [], suppliers: [], playbook: [], activity: [],
  view: "overview", pgm: null, person: null, month: null, year: null, team: null, bteam: null, nav: false, layers: { sessions: true, coord: true, team: false },
  tWho: "mine", tRange: "30", q: "", ptab: "faculty", lf: "all", open: {}, sheet: null, sheetMode: "view"
};
const byS = () => Object.fromEntries(S.sessions.map(s => [s.id, s]));
let SID = {};
const isHol = s => s.type === "Holiday";
const sess = () => S.sessions.filter(s => !isHol(s));
const sName = s => (s.topic && s.topic !== "TBC" ? s.topic : s.title);
const sFull = s => s.title + (s.topic && s.topic !== "TBC" && s.topic !== s.title ? " — " + s.topic : "");
const city = s => (s.location || "").split(/[,/]/)[0].trim();
const nDays = s => diff(s.end_date, s.start_date) + 1;
const paxN = s => /^\d+$/.test(String(s.participants)) ? Number(s.participants) : null;
const live = t => SID[t.session_id] && SID[t.session_id].end_date >= TODAY;
const done = t => t.status === "done";
const tstate = t => t.status === "done" ? "done" : t.status === "na" ? "na" : t.due_date < TODAY ? "over" : diff(t.due_date, TODAY) <= 7 ? "soon" : "open";
const isAdmin = () => !!(S.me && S.me.is_admin);
function mineFor(role) {
  const all = S.tasks.filter(live);
  if (role === "COORD") return all.filter(t => t.calendar === "Coordinator" || t.owner_role === "COORD");
  if (role === "ED") return all.filter(t => t.owner_role === "ED" || t.approver_role === "ED");
  return all.filter(t => t.owner_role === role);
}
const mine = () => mineFor(S.me.role);
function facultyIn(str) {
  const s = (str || "").toLowerCase(), out = [];
  for (const f of S.faculty) { const last = f.name.replace(/ Esq\.$/, "").split(" ").pop().toLowerCase().replace(/[^a-z-]/g, ""); if (last.length > 2 && (s.includes(last) || (last === "adomdza" && s.includes("adomda")))) out.push(f.name); }
  return out;
}
function programmes() {
  const P = {};
  for (const s of sess()) (P[s.programme] || (P[s.programme] = { name: s.programme, family: s.family, sessions: [] })).sessions.push(s);
  return Object.values(P).map(p => {
    p.sessions.sort((a, b) => a.start_date.localeCompare(b.start_date)); p.start = p.sessions[0].start_date; p.end = p.sessions.reduce((m, s) => s.end_date > m ? s.end_date : m, "");
    p.faculty = [...new Set(p.sessions.flatMap(s => facultyIn(s.faculty)))]; p.locs = [...new Set(p.sessions.map(city).filter(Boolean))];
    p.tasks = S.tasks.filter(t => p.sessions.some(s => s.id === t.session_id)); return p;
  }).sort((a, b) => a.start.localeCompare(b.start));
}
function health(p) {
  if (p.end < TODAY) return ["h-idle", "Complete"];
  const over = p.tasks.filter(t => t.status === "open" && t.due_date < TODAY).length;
  if (over) return ["h-behind", `Behind · ${over} overdue`];
  const tbc = p.sessions.some(s => s.end_date >= TODAY && /tbc/i.test(s.faculty) && diff(s.start_date, TODAY) <= 120);
  if (tbc) return ["h-risk", "At risk · faculty TBC"];
  if (p.tasks.every(t => t.due_date > TODAY)) return ["h-idle", "Planning starts " + fmt(p.tasks.reduce((m, t) => t.due_date < m ? t.due_date : m, "9999-12-31"))];
  return ["h-ok", "On track"];
}

/* ============ data ============ */
async function loadAll() {
  const [s, t, m, f, c, su, pb, a, ro, br] = await Promise.all([
    sb.from("sessions").select("*").order("start_date").range(0, 4999),
    sb.from("tasks").select("*").order("due_date").range(0, 9999),
    sb.from("members").select("id,email,full_name,role,is_admin,created_at").order("created_at"),
    sb.from("faculty").select("*").order("sessions_count", { ascending: false }),
    sb.from("clients").select("*").order("sessions_count", { ascending: false }),
    sb.from("suppliers").select("*").order("service"),
    sb.from("playbook_steps").select("*").order("type").order("sort"),
    sb.from("activity").select("*").order("at", { ascending: false }).limit(150),
    sb.from("roster").select("*").order("sort"),
    sb.from("briefs").select("id,member_id,role,week_start,sent_via,created_at").order("created_at", { ascending: false }).limit(50)
  ]);
  const err = [s, t, m, f, c, su, pb, a].find(r => r.error);
  if (err) throw err.error;
  S.sessions = s.data; S.tasks = t.data; S.members = m.data; S.faculty = f.data; S.clients = c.data; S.suppliers = su.data; S.playbook = pb.data; S.activity = a.data; S.roster = ro.data || []; S.briefs = br.data || [];
  SID = byS();
}
let rT; const soon = () => { clearTimeout(rT); rT = setTimeout(() => { SID = byS(); render(); if (S.sheet) renderSheet(); }, 250); };
function subscribe() {
  sb.channel("kente-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, p => { upsert(S.tasks, p); soon(); })
    .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, p => { upsert(S.sessions, p); soon(); })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity" }, p => { S.activity.unshift(p.new); soon(); })
    .subscribe();
}
function upsert(arr, p) {
  const id = (p.new && p.new.id) || (p.old && p.old.id); const i = arr.findIndex(x => x.id === id);
  if (p.eventType === "DELETE") { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = p.new; else arr.push(p.new);
}
async function updateTask(id, patch, msg) {
  const t = S.tasks.find(x => x.id === id); if (!t) return; const before = { ...t };
  Object.assign(t, patch); render(); if (S.sheet) renderSheet();
  const { data, error } = await sb.from("tasks").update(patch).eq("id", id).select().single();
  if (error) { Object.assign(t, before); render(); if (S.sheet) renderSheet(); toast("Could not save: " + error.message); return false; }
  Object.assign(t, data); if (msg) toast(msg); return true;
}

/* ============ cover / auth ============ */
function coverArt(h1, dek) {
  return `<section class="cover-art"><img class="cover-logo" src="logo-white.png" alt="CEIBS">
    <div><span class="tag">CEIBS Africa · Programme Office</span><h1>${h1}</h1><p class="dek">${dek}</p></div>
    <div class="cover-facts"><div><b>One hub</b>every programme, module and event for the year</div><div><b>Five teams</b>Programmes, Marketing, Finance, Facilities, Leadership</div><div><b>Every Monday</b>each team is briefed on what is due</div></div></section>`;
}
function vCover(err = "") {
  $("#app").innerHTML = `<div class="cover">${coverArt("Every programme.<br>Every team.<br>One place.", "The Hub turns the CEIBS Africa calendar into a dated plan for every team, shows progress without a single phone call, and reminds people before anything slips.")}
  <section class="cover-form"><form id="login" novalidate><div class="brand"><img src="logo.png" alt="CEIBS"> Programme Hub</div>
      <h2>Welcome back</h2><p class="lead">Sign in with the email address your administrator invited.</p>
      <div class="field"><label for="em">Work email</label><input class="input" id="em" type="email" autocomplete="email" required placeholder="you@ceibs.edu"></div>
      <div class="field"><label for="pw">Password</label><input class="input" id="pw" type="password" autocomplete="current-password" required></div>
      <div class="err" id="lerr">${esc(err)}</div>
      <button class="btn primary block" type="submit" id="lbtn">Sign in</button>
      <p class="fine">Forgotten your password, or need access? Ask your Hub administrator. Your first sign-in asks you to choose your own password.</p>
    </form></section></div>`;
  $("#login").onsubmit = async e => {
    e.preventDefault(); const b = $("#lbtn"); b.disabled = true; b.textContent = "Signing in…"; $("#lerr").textContent = "";
    const { error } = await sb.auth.signInWithPassword({ email: $("#em").value.trim(), password: $("#pw").value });
    if (error) { b.disabled = false; b.textContent = "Sign in"; $("#lerr").textContent = /invalid/i.test(error.message) ? "That email and password don't match. Check both, or ask your administrator to reset your password." : error.message; return; }
    boot();
  };
}
function vSetPassword() {
  $("#app").innerHTML = `<div class="cover">${coverArt("Welcome to the Hub.", `${esc(S.me.full_name || S.me.email)}, choose your own password to finish setting up.`)}
  <section class="cover-form"><form id="setpw" novalidate><div class="brand"><img src="logo.png" alt="CEIBS"> Programme Hub</div><h2>Choose a password</h2><p class="lead">At least 10 characters. You'll use it with ${esc(S.me.email)} on any phone or laptop.</p>
  <div class="field"><label for="p1">New password</label><input class="input" id="p1" type="password" autocomplete="new-password"></div>
  <div class="field"><label for="p2">Repeat it</label><input class="input" id="p2" type="password" autocomplete="new-password"></div>
  <div class="err" id="perr"></div><button class="btn primary block" type="submit">Save and continue</button></form></section></div>`;
  $("#setpw").onsubmit = async e => {
    e.preventDefault(); const a = $("#p1").value, b = $("#p2").value;
    if (a.length < 10) return $("#perr").textContent = "Use at least 10 characters.";
    if (a !== b) return $("#perr").textContent = "The two passwords don't match.";
    const { error } = await sb.auth.updateUser({ password: a });
    if (error) return $("#perr").textContent = error.message;
    await sb.rpc("password_changed"); S.me.must_reset = false; toast("Password saved"); boot();
  };
}
async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return vCover();
  S.user = session.user;
  const { data: me, error } = await sb.from("members").select("id,email,full_name,role,is_admin,must_reset,created_at").eq("id", S.user.id).maybeSingle();
  if (error || !me) { await sb.auth.signOut(); return vCover("This account isn't set up for the Hub. Ask your administrator."); }
  S.me = me;
  const tok = await sb.rpc("my_calendar_token"); S.me.cal_token = tok.data || "";
  if (me.must_reset) return vSetPassword();
  $("#app").innerHTML = `<div class="boot">Programme Hub</div>`;
  try { await loadAll(); } catch (e) { $("#app").innerHTML = `<div class="wrap"><p class="empty">The Hub could not load the calendar: ${esc(e.message)}. Refresh to try again.</p></div>`; return; }
  const h = (location.hash || "").slice(1); if (NAV.some(n => n[0] === h)) S.view = h;
  { const cnt = {}; for (const s of sess()) if (s.end_date >= TODAY) cnt[s.start_date.slice(0, 4)] = (cnt[s.start_date.slice(0, 4)] || 0) + 1; S.year = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || TODAY.slice(0, 4); }
  render(); subscribe();
}
sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") { S.me = null; vCover(); } });
