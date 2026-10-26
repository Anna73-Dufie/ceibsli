"use strict";

/* ============ shell ============ */
const NAV = [["overview", "Overview", "Plan"], ["year", "The year", "Plan"], ["calendar", "Calendar", "Plan"], ["programmes", "Programmes", "Plan"],
  ["tasks", "Tasks", "Work"], ["teams", "Teams", "Work"], ["brief", "Weekly brief", "Work"], ["letters", "Letters", "Work"],
  ["people", "People", "Reference"], ["playbooks", "Playbooks", "Reference"], ["activity", "Activity", "Reference"], ["check", "Data check", "Reference"],
  ["admin", "Admin", "Account"], ["me", "My account", "Account"]];
function shell(inner) {
  const over = mine().filter(t => t.status === "open" && t.due_date < TODAY).length;
  const nav = NAV.filter(n => n[0] !== "admin" || isAdmin());
  const groups = [...new Set(nav.map(n => n[2]))];
  const nm = S.me.full_name || S.me.email;
  return `<div class="app"><aside class="sbar ${S.nav ? "open" : ""}" id="sbar"><a class="logo" href="#overview" data-view="overview"><img src="logo-white.png" alt="CEIBS"></a>
   <div class="product"><small>CEIBS Africa</small>Programme Hub</div>
   <nav aria-label="Sections">${groups.map(g => `<div class="grp">${g}</div>${nav.filter(n => n[2] === g).map(([k, l]) => `<button data-view="${k}" ${S.view === k ? 'aria-current="page"' : ""}>${icon(k)}${l}${k === "tasks" && over ? `<span class="count">${over}</span>` : ""}</button>`).join("")}`).join("")}</nav>
   <div class="me"><span class="av">${esc(initials(nm))}</span><button data-view="me"><b>${esc(nm)}</b><span>${esc(teamName(S.me.role))}${isAdmin() ? " · Admin" : ""}</span></button></div></aside>
   <div class="main"><div class="topbar"><button class="menu" data-nav="1" aria-label="Menu">☰</button><img src="logo.png" alt="CEIBS"><b>Programme Hub</b></div><main class="wrap" id="main">${inner}</main></div></div>${S.nav ? '<div class="scrim" data-nav="0"></div>' : ""}`;
}
function render() {
  if (!S.me) return;
  const v = { overview: vOverview, year: vYear, programmes: vProgrammes, calendar: vCalendar, tasks: vTasks, teams: vTeams, brief: vBrief, people: vPeople, letters: vLetters, activity: vActivity, check: vCheck, playbooks: vPlaybooks, me: vMe, admin: vAdmin }[S.view] || vOverview;
  const y = window.scrollY; $("#app").innerHTML = shell(v()); window.scrollTo(0, y); after();
}
function go(v) { S.view = v; S.nav = false; S.pgm = v === "programmes" ? S.pgm : null; S.person = v === "people" ? S.person : null; try { history.replaceState(null, "", "#" + v); } catch (_) { } render(); window.scrollTo(0, 0); }

/* ============ shared pieces ============ */
function tags(t) {
  const st = tstate(t);
  return `${st === "done" ? '<span class="tag done">Done</span>' : st === "na" ? '<span class="tag">Not needed</span>' : st === "over" ? '<span class="tag over">Overdue</span>' : st === "soon" ? '<span class="tag soon">This week</span>' : ""}<span class="tag ${t.calendar === "Coordinator" ? "coord" : ""}">${t.calendar}</span>${t.custom ? '<span class="tag custom">Added</span>' : ""}`;
}
function raci(t, s) {
  const fac = facultyIn(s && s.faculty).join(", ") || "Faculty (TBC)";
  const nm = c => c === "FAC" ? fac : roleName(c);
  return `<div class="raci"><span><b>R</b>${esc(roleName(t.owner_role))}</span>${t.approver_role ? `<span><b>A</b>${esc(roleName(t.approver_role))}</span>` : ""}${t.consult.length ? `<span><b>C</b>${esc(t.consult.map(nm).join(", "))}</span>` : ""}${t.notify.length ? `<span><b>I</b>${esc(t.notify.map(nm).join(", "))}</span>` : ""}</div>`;
}
function taskRow(t, showSession = true, showRaci = false) {
  const s = SID[t.session_id] || {}, st = tstate(t), open = S.open[t.id];
  const who = t.done_by ? S.members.find(m => m.id === t.done_by) : null;
  return `<div class="task ${st === "done" || st === "na" ? "done" : ""} ${st === "over" ? "over" : ""}">
   <input type="checkbox" data-done="${t.id}" ${done(t) ? "checked" : ""} aria-label="Mark done: ${esc(t.title)}">
   <div style="min-width:0"><div class="tt" data-open="${t.id}" role="button" tabindex="0">${esc(t.title)}</div>
    <div class="tm"><span class="due mono">${fmtW(t.due_date)}</span><span class="tag tteam">${esc(teamName(t.owner_role))}</span>${teamName(t.owner_role) !== roleName(t.owner_role) ? `<span>${esc(roleName(t.owner_role))}</span>` : ""}<span>${esc(t.category)}</span>${showSession && s.id ? `<button class="link" data-session="${s.id}"><span class="dot" style="--c:${famC(s.family)}"></span>${esc(sName(s))} · ${fmt(s.start_date)}</button>` : ""}${who && done(t) ? `<span>Done by ${esc(who.full_name || who.email)}</span>` : ""}</div>
    ${showRaci ? raci(t, s) : ""}</div>
   <div class="tags">${tags(t)}</div>
   ${t.notes && !open ? `<div class="note">${esc(t.notes)}</div>` : ""}
   ${open ? `<form class="edit" data-edit="${t.id}">
     <div class="field"><label for="d-${t.id}">Due date</label><input class="input" type="date" id="d-${t.id}" name="due_date" value="${t.due_date}"></div>
     <div class="field"><label for="o-${t.id}">Responsible</label><select class="select" id="o-${t.id}" name="owner_role">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === t.owner_role ? "selected" : ""}>${v}</option>`).join("")}</select></div>
     <div class="field"><label for="c-${t.id}">Calendar</label><select class="select" id="c-${t.id}" name="calendar">${["Coordinator", "Team"].map(c => `<option ${c === t.calendar ? "selected" : ""}>${c}</option>`).join("")}</select></div>
     <div class="field full"><label for="n-${t.id}">Note for the team</label><textarea class="textarea" id="n-${t.id}" name="notes" placeholder="e.g. Quote received from caterer, awaiting approval">${esc(t.notes)}</textarea></div>
     <div class="row">${t.custom ? `<button class="btn ghost sm" type="button" data-del="${t.id}">Delete task</button>` : `<button class="btn ghost sm" type="button" data-na="${t.id}">${t.status === "na" ? "Needed after all" : "Not needed for this session"}</button>`}<button class="btn sm" type="button" data-open="${t.id}">Cancel</button><button class="btn primary sm" type="submit">Save</button></div></form>` : ""}
  </div>`;
}
function byDay(list, showRaci = false) {
  const g = {}; for (const t of list) (g[t.due_date] || (g[t.due_date] = [])).push(t);
  return Object.keys(g).sort().map(d => `<section class="day"><div class="day-h"><b>${d === TODAY ? "Today" : d === addDays(TODAY, 1) ? "Tomorrow" : fmtLong(d)}</b><span>${g[d].length} task${g[d].length > 1 ? "s" : ""}</span></div>${g[d].map(t => taskRow(t, true, showRaci)).join("")}</section>`).join("");
}
function sessItem(s) {
  const ts = S.tasks.filter(t => t.session_id === s.id), d = ts.filter(done).length, pct = ts.length ? Math.round(d / ts.length * 100) : 0;
  return `<button class="item" data-session="${s.id}"><div class="date"><b>${pd(s.start_date).getDate()}</b>${fmt(s.start_date, { month: "short", year: "numeric" })}</div>
   <div style="min-width:0"><div class="it">${esc(sName(s))}</div><div class="is"><span class="dot" style="--c:${famC(s.family)}"></span>${esc(s.programme)} · ${esc(city(s) || s.location)} · ${esc(s.mode)} · ${esc(facultyIn(s.faculty).join(", ") || "Faculty TBC")}</div><div class="prog"><i style="width:${pct}%"></i></div></div>
   <div class="side mono">${d}/${ts.length}</div></button>`;
}

/* ============ team helpers ============ */
function teamStats(k, list) {
  const ts = teamTasks(k, list), d = ts.filter(done).length, open = ts.filter(t => t.status === "open"), over = open.filter(t => t.due_date < TODAY).length, na = ts.filter(t => t.status === "na").length;
  const tot = ts.length - na; return { ts, d, over, tot, open: open.length, pct: tot ? Math.round(d / tot * 100) : 0 };
}
function teamCards(list, title) {
  return `<div class="teamrow">${Object.keys(TEAMS).map(k => { const s = teamStats(k, list); return `<button class="team" data-team="${k}"><div class="tn">${TEAMS[k].short}</div><div class="tp">${esc(peopleOf(k) || "Not yet assigned")}</div><div class="nums"><span>${s.d}/${s.tot} done</span>${s.over ? `<span class="o">${s.over} overdue</span>` : `<span>${s.open} open</span>`}</div><div class="prog ${s.over ? "red" : ""}"><i style="width:${s.pct}%"></i></div></button>`; }).join("")}</div>`;
}
function teamStrip(list) {
  const ks = Object.keys(TEAMS).filter(k => teamTasks(k, list).length);
  return `<div class="tprog">${ks.map(k => { const s = teamStats(k, list); return `<div><b>${TEAMS[k].short}</b><span class="mono">${s.d}/${s.tot}${s.over ? ` · <span style="color:var(--red)">${s.over} late</span>` : ""}</span><div class="prog ${s.over ? "red" : ""}"><i style="width:${s.pct}%"></i></div></div>`; }).join("")}</div>`;
}

/* ============ Overview ============ */
function vOverview() {
  const m = mine(), open = m.filter(t => t.status === "open");
  const over = open.filter(t => t.due_date < TODAY), week = open.filter(t => t.due_date >= TODAY && diff(t.due_date, TODAY) <= 7);
  const live30 = S.tasks.filter(t => live(t) && t.due_date >= addDays(TODAY, -60) && diff(t.due_date, TODAY) <= 30);
  const allOver = S.tasks.filter(t => live(t) && t.status === "open" && t.due_date < TODAY);
  const P = programmes().filter(p => p.end >= TODAY), risk = P.filter(p => ["h-behind", "h-risk"].includes(health(p)[0]));
  const appr = S.tasks.filter(t => live(t) && t.approver_role === S.me.role && t.status === "open" && diff(t.due_date, TODAY) <= 30);
  const h = new Date().getHours(), greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const first = (S.me.full_name || "").split(" ")[0];
  const next14 = open.filter(t => t.due_date >= TODAY && diff(t.due_date, TODAY) <= 14);
  const up30 = sess().filter(s => s.end_date >= TODAY && diff(s.start_date, TODAY) <= 30);
  return `<div class="pagehead"><div><p class="kicker">${fmt(TODAY, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><h1 class="page">${greet}${first ? ", " + esc(first) : ""}.</h1>
   <p class="dek">${over.length ? `You have <b>${over.length}</b> overdue task${over.length > 1 ? "s" : ""} and ${week.length} due this week.` : week.length ? `${week.length} task${week.length > 1 ? "s" : ""} due this week. Nothing overdue.` : "Nothing due this week. A good moment to look ahead."} Across the Hub, ${up30.length} session${up30.length === 1 ? "" : "s"} start in the next 30 days.</p></div><span class="live"><i></i>Live · everyone sees the same board</span></div>
  <div class="figures"><div class="${over.length ? "hot" : ""}"><b>${over.length}</b><span>My overdue tasks</span></div><div><b>${week.length}</b><span>Mine due in 7 days</span></div><div class="${allOver.length ? "hot" : ""}"><b>${allOver.length}</b><span>Overdue across all teams</span></div><div class="${risk.length ? "hot" : ""}"><b>${risk.length}</b><span>Programmes behind or at risk</span></div></div>
  <h2 class="sec">Where each team is · next 30 days</h2>${teamCards(live30)}
  <div class="cols"><section><h2 class="sec">My next fortnight</h2><p class="muted" style="margin:0 0 14px">Tick tasks off as you finish them. Tap a task to move its date, hand it over or leave a note for the team.</p>
    ${next14.length ? byDay(next14, true) : '<p class="empty">Nothing due in the next fourteen days.</p>'}
    ${over.length ? `<section class="day" style="margin-top:30px"><div class="day-h"><b style="color:var(--red)">Overdue</b><span>${over.length}</span></div>${over.slice(0, 8).map(t => taskRow(t)).join("")}${over.length > 8 ? `<p><button class="btn sm" data-view="tasks" data-range="over">See all ${over.length}</button></p>` : ""}</section>` : ""}
  </section>
  <aside>${appr.length ? `<h3 class="label">Waiting for your approval</h3>${appr.slice(0, 5).map(t => taskRow(t)).join("")}<hr class="rule">` : ""}
    <h3 class="label">Needs attention</h3>${risk.length ? `<div class="list">${risk.slice(0, 6).map(p => { const h = health(p); return `<button class="item" style="grid-template-columns:minmax(0,1fr)" data-pgm="${esc(p.name)}"><div><div class="it">${esc(p.name)}</div><div class="is"><span class="health ${h[0]}">${esc(h[1])}</span> · ${p.sessions.length} session${p.sessions.length > 1 ? "s" : ""} from ${fmt(p.start)}</div></div></button>`; }).join("")}</div>` : '<p class="empty">Every programme is on track.</p>'}
    <hr class="rule"><h3 class="label">Coming up</h3><div class="list">${sess().filter(s => s.end_date >= TODAY).slice(0, 5).map(sessItem).join("")}</div></aside></div>`;
}

/* ============ The year ============ */
function vYear() {
  const years = [...new Set(S.sessions.map(s => s.start_date.slice(0, 4)))].sort(); if (!years.includes(S.year)) S.year = years[years.length - 1];
  const Y = S.year, months = Array.from({ length: 12 }, (_, i) => `${Y}-${String(i + 1).padStart(2, "0")}`);
  const yS = sess().filter(s => s.start_date.startsWith(Y)), yT = S.tasks.filter(t => t.due_date.startsWith(Y));
  return `<div class="pagehead"><div><p class="kicker">Annual plan</p><h1 class="page">${Y} at a glance</h1><p class="dek">${yS.length} sessions across ${new Set(yS.map(s => s.programme)).size} programmes, and ${yT.length} dated tasks for the teams. Each month shows what starts and what every team must get done.</p></div>
   <div class="seg" role="group" aria-label="Year">${years.map(y => `<button data-year="${y}" aria-pressed="${y === Y}">${y}</button>`).join("")}</div></div>
  <div class="year">${months.map(mo => { const ss = sess().filter(s => s.start_date.startsWith(mo)), tt = S.tasks.filter(t => t.due_date.startsWith(mo)), now = mo === TODAY.slice(0, 7);
    return `<div class="ym ${now ? "now" : ""}"><h3><button class="link" style="color:inherit" data-cal="${mo}">${pd(mo + "-01").toLocaleDateString("en-GB", { month: "long" })}</button><span>${ss.length} session${ss.length === 1 ? "" : "s"} · ${tt.length} tasks</span></h3>
     <div class="ses">${ss.slice(0, 7).map(s => `<button data-session="${s.id}"><span class="dot" style="--c:${famC(s.family)};margin:0"></span><span class="d">${fmt(s.start_date)}</span><span class="n">${esc(sName(s))}</span></button>`).join("")}${ss.length > 7 ? `<button class="link" data-cal="${mo}" style="font-size:12px">+${ss.length - 7} more</button>` : ""}${ss.length ? "" : '<span class="muted" style="font-size:12.5px">No sessions start this month.</span>'}</div>
     <div class="tl">${["PROG", "MKT", "FIN", "FAC"].map(k => { const s = teamStats(k, tt); return `<div><b>${s.d}/${s.tot}</b>${TEAMS[k].short}</div>`; }).join("")}</div></div>`; }).join("")}</div>`;
}

/* ============ Teams ============ */
function vTeams() {
  const k = S.team || teamOf(S.me.role), T = TEAMS[k];
  const ppl = S.roster.filter(r => r.team === k), live60 = S.tasks.filter(t => live(t));
  const st = teamStats(k, live60.filter(t => diff(t.due_date, TODAY) <= 30 && t.due_date >= addDays(TODAY, -60)));
  const ses = sess().filter(s => s.end_date >= TODAY && diff(s.start_date, TODAY) <= 90);
  const open = teamTasks(k, live60).filter(t => t.status === "open" && t.due_date >= TODAY && diff(t.due_date, TODAY) <= 30).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const over = teamTasks(k, live60).filter(t => t.status === "open" && t.due_date < TODAY).sort((a, b) => a.due_date.localeCompare(b.due_date));
  return `<div class="pagehead"><div><p class="kicker">Teams</p><h1 class="page">Who is where</h1><p class="dek">Progress by team, without phoning anyone. Open a team to see its people, its share of every upcoming session and what is due.</p></div></div>
  <div class="toolbar"><div class="seg" role="group" aria-label="Team">${Object.keys(TEAMS).map(x => `<button data-team="${x}" aria-pressed="${x === k}">${TEAMS[x].short}</button>`).join("")}</div></div>
  <div class="figures"><div><b>${st.d}</b><span>Done · last 60 days</span></div><div><b>${st.open}</b><span>Open · next 30 days</span></div><div class="${over.length ? "hot" : ""}"><b>${over.length}</b><span>Overdue</span></div><div><b>${st.pct}%</b><span>Of this window complete</span></div></div>
  <div class="cols"><section>
    <h2 class="sec">${esc(T.name)} on each upcoming session</h2><div class="list" style="margin-bottom:26px">${ses.map(s => { const ts = teamTasks(k, S.tasks.filter(t => t.session_id === s.id)); if (!ts.length) return ""; const d = ts.filter(done).length, ov = ts.filter(t => t.status === "open" && t.due_date < TODAY).length, tot = ts.filter(t => t.status !== "na").length; return `<button class="item" data-session="${s.id}"><div class="date"><b>${pd(s.start_date).getDate()}</b>${fmt(s.start_date, { month: "short" })}</div><div style="min-width:0"><div class="it">${esc(sName(s))}</div><div class="is"><span class="dot" style="--c:${famC(s.family)}"></span>${esc(s.programme)} · ${ts.filter(t => t.status === "open").map(t => t.title).slice(0, 2).join(" · ") || "All done"}</div><div class="prog ${ov ? "red" : ""}"><i style="width:${tot ? Math.round(d / tot * 100) : 0}%"></i></div></div><div class="side">${d}/${tot}${ov ? ` · ${ov} late` : ""}</div></button>`; }).join("") || '<p class="empty">Nothing for this team in the next 90 days.</p>'}</div>
    ${over.length ? `<h2 class="sec" style="color:var(--red)">Overdue · ${over.length}</h2>${over.slice(0, 10).map(t => taskRow(t)).join("")}` : ""}
    <h2 class="sec" style="margin-top:22px">Due in the next 30 days</h2>${open.length ? byDay(open.slice(0, 60)) : '<p class="empty">Nothing due.</p>'}</section>
  <aside><h3 class="label">People</h3>${ppl.map(r => { const m = S.members.find(x => x.id === r.member_id); return `<div class="person" style="margin-bottom:8px"><span class="mono-av ${m ? "red" : ""}">${esc(initials(r.full_name))}</span><div><div class="pn">${esc(r.full_name)}</div><div class="is">${esc(r.title)} · ${m ? "signed up" : "not yet invited"}</div></div></div>`; }).join("") || '<p class="empty">No one listed yet.</p>'}
    ${isAdmin() ? `<p><button class="btn sm" data-view="admin">Invite or edit people</button></p>` : ""}
    <hr class="rule"><h3 class="label">What this team owns</h3><p class="muted">${esc(T.does)}.</p>
    <h3 class="label" style="margin-top:14px">Roles inside the team</h3>${T.roles.map(r => `<div style="margin-bottom:8px"><b>${esc(ROLES[r])}</b><div class="is">${esc(ROLE_DOES[r])}</div></div>`).join("")}
    <hr class="rule"><p><button class="btn sm" data-view="brief" data-bteam="${k}">This team's weekly brief</button></p></aside></div>`;
}
