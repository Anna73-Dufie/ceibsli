/* CEIBS Africa Programme Hub · Overview, 2027 Calendar, Programmes, session panel */
"use strict";

/* ---------- shared pieces ---------- */
function stSelect(t) {
  const cls = isLate(t) ? "late" : t.status;
  if (!canEditTask(t)) return `<span class="pill ${{ done: "green", progress: "blue", waiting: "amber", na: "grey" }[t.status] || (isLate(t) ? "red" : "grey")}"><i></i>${isLate(t) ? "Overdue" : statusLabel(t.status)}</span>`;
  return `<label class="sr" for="st-${esc(t.id)}">Status</label><select class="st ${cls}" id="st-${esc(t.id)}" data-status="${esc(t.id)}">${STATUS.map(([k, l]) => `<option value="${k}" ${k === t.status ? "selected" : ""}>${isLate(t) && k === t.status ? "Overdue · " + l : l}</option>`).join("")}</select>`;
}
function wfTable(L) {
  if (!L.length) return '<p class="empty">No checklist for this entry.</p>';
  return `<div class="tw"><table class="stack-sm"><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>${L.map(t => `<tr class="${t.owner === S.me ? "mine" : ""}"><td><b style="font-weight:600">${esc(t.title)}</b>${t.approver ? `<div class="muted" style="font-size:12.5px">Approved by ${esc(P(t.approver).short)}</div>` : ""}${t.note ? `<div class="muted" style="font-size:12.5px">“${esc(t.note)}”</div>` : ""}</td><td>${who(t.owner, "xs")}</td><td style="white-space:nowrap;${isLate(t) ? "color:var(--red);font-weight:600" : ""}">${fmt(t.due)}</td><td>${stSelect(t)}</td></tr>`).join("")}</tbody></table></div>`;
}
function readyBlock(L, s) {
  const p = readiness(L), st = statusOf(L, s), late = L.filter(isLate).length;
  return `<div class="card ready"><div style="min-width:170px"><h3>Readiness</h3><p style="font-size:13.5px;color:${late ? "var(--red)" : "var(--mute)"};margin-top:3px">${late ? plural(late, "item needs", "items need") + " attention" : esc(st[1])}</p></div><div class="prog ${progTone(p, L)}" style="flex:1"><i style="width:${p}%"></i></div><span class="big">${p}%</span></div>`;
}
const famPill = f => `<span class="tag" style="--c:${famC(f)}"><span class="dot" style="--c:${famC(f)}"></span>${esc(FAM_LABEL[f] || f)}</span>`;

/* ---------- Overview ---------- */
function vOverview() {
  const me = P(S.me), h = new Date().getHours(), greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const mine = myTasks().filter(isOpen), week = mine.filter(t => diff(t.due, TODAY) <= 7), late = mine.filter(t => t.due < TODAY);
  const upcoming = nextSession(), soon = upcoming.filter(s => diff(s.start_date, TODAY) <= 122);
  const attnPool = isSup() ? S.tasks.filter(t => isLate(t) || (t.status === "waiting" && isOpen(t))) : mine.filter(t => t.due < TODAY || t.status === "waiting");
  const approvals = S.tasks.filter(t => t.approver === S.me && isOpen(t) && ["progress", "waiting"].includes(t.status));
  const attn = [...new Set([...attnPool.sort((a, b) => a.due.localeCompare(b.due)), ...approvals, ...mine.slice(0, 4)])].slice(0, 4);
  const sub = late.length ? `You have ${plural(late.length, "overdue task")} and ${week.length - late.length} more due this week.` : week.length ? `You have ${plural(week.length, "task")} due this week.` : mine.length ? `Your next task is due ${fmtL(mine[0].due)}.` : "Nothing is waiting for you.";
  return `<div class="head"><div><h1>2027 programme overview</h1><p>${greet}, ${esc(me.short)}. ${sub}</p></div></div>
  <div class="tiles"><div class="tile red"><span class="ic">${ic("cal")}</span><div><b>${soon.length}</b><span>sessions in the next four months</span></div></div>
   <div class="tile green"><span class="ic">${ic("check")}</span><div><b>${week.length}</b><span>of your tasks due this week</span></div></div>
   <div class="tile amber"><span class="ic">${ic("warn")}</span><div><b>${attnPool.length + approvals.length}</b><span>${isSup() ? "items need attention" : "need your attention"}</span></div></div></div>
  <div class="grid g-main" style="margin-bottom:18px">
   <section class="card"><div class="ch-row"><h2 class="ch">Programme readiness</h2><button class="more" data-view="programmes">View all programmes ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    <div class="rows">${upcoming.slice(0, 4).map(s => { const L = tasksOf(s.id), p = readiness(L), st = statusOf(L, s); return `<button class="prow" data-session="${s.id}" style="--c:${famC(s.family)}"><span class="bar"></span><div><h4>${esc(s.programme)} · ${esc(s.short || s.title)}</h4><div class="meta"><span>${esc(range(s))}</span><span class="prog ${progTone(p, L)}"><i style="width:${p}%"></i></span><span class="pct">${p}%</span><span class="pill ${st[0]}">${esc(st[1])}</span></div></div>${stack(L.map(t => t.owner))}</button>`; }).join("") || '<p class="empty">No upcoming sessions.</p>'}</div></section>
   <section class="card"><div class="ch-row"><h2 class="ch">Needs your attention</h2><button class="more" data-view="work">View all ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    <div class="rows">${attn.map(t => { const s = SID[t.session_id] || {}; return `<button class="arow" data-session="${s.id}" style="--c:${isLate(t) ? "var(--red)" : t.status === "waiting" ? "#E59A1A" : "#5B8FD6"}"><span class="bar"></span><div><h4>${esc(t.title)}</h4><div class="meta"><span>${esc(s.programme || "")} · ${esc(s.short || s.title || "")}</span><span style="${isLate(t) ? "color:var(--red)" : ""}">Due ${fmtY(t.due)}</span></div></div>${who(t.owner)}<span class="chev">${ic("chev")}</span></button>`; }).join("") || '<p class="empty">Nothing needs you right now.</p>'}</div></section></div>
  <div class="grid g-main">
   <section class="card"><div class="ch-row"><h2 class="ch">This month across the team</h2><button class="more" data-view="team">View team progress ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    <div class="rows">${S.people.map(p => { const L = S.tasks.filter(t => t.owner === p.key && t.due <= addDays(TODAY, 45) && (isOpen(t) || t.due >= addDays(TODAY, -30))); const d = L.filter(t => !isOpen(t)).length, pct = L.length ? Math.round(d / L.length * 100) : 0; const nxt = myTasks(p.key).filter(isOpen)[0];
      return `<div class="trow">${av(p.key)}<div><div class="nm">${esc(p.short)}</div><div class="ti">${esc(p.title.split(",")[0])}</div></div>${L.length ? `<div class="prog ${progTone(pct, L)}"><i style="width:${pct}%"></i></div><span class="muted">${d} of ${L.length} complete</span>` : `<span class="muted" style="grid-column:span 2">${nxt ? `Next: ${esc(nxt.title)} · ${fmt(nxt.due)}` : "Nothing scheduled"}</span>`}</div>`; }).join("")}</div></section>
   <section class="card" style="display:flex;gap:16px;align-items:flex-start"><span class="emblem" style="background:var(--blue-soft)"><span style="color:var(--blue);display:grid">${ic("doc").replace("<svg", '<svg width="22" height="22"')}</span></span><div><h2 class="ch">Weekly brief</h2><p class="muted" style="margin:6px 0 16px">Every Monday at 6am the Hub writes each person's list: what is overdue, what is due this week and what is coming next.</p><button class="btn red" data-view="brief">Review brief ${ic("arrow")}</button></div></section></div>`;
}

/* ---------- 2027 Calendar ---------- */
function calItems(m) {
  const mm = `2027-${String(m).padStart(2, "0")}`, first = mm + "-01", last = mm + "-31";
  return S.sessions.filter(s => s.start_date && s.start_date <= last && (s.end_date || s.start_date) >= first)
    .filter(s => S.fam === "all" ? true : s.kind === "holiday" || s.family === S.fam)
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || (a.kind === "holiday" ? -1 : 1));
}
function vCalendar() {
  const fams = Object.keys(FAM_LABEL).filter(f => S.sessions.some(s => s.family === f));
  const items = calItems(S.month), real = items.filter(s => s.kind !== "holiday"), tbc = sess().filter(s => !s.start_date && (S.fam === "all" || s.family === S.fam));
  return `<div class="head"><div><h1>2027 Calendar</h1><p>Every programme, month by month.</p></div>${canPlan() ? '<button class="btn red" data-new="1">Add a session</button>' : ""}</div>
  <div class="months" role="group" aria-label="Month">${MONTHS.map((n, i) => { const c = calItems(i + 1).filter(s => s.kind === "session").length; return `<button data-month="${i + 1}" aria-pressed="${S.month === i + 1}">${n.slice(0, 3)}<span>${c ? plural(c, "session") : "—"}</span></button>`; }).join("")}</div>
  <div class="toolbar"><div class="chips" role="group" aria-label="Programme"><button class="chip" data-fam="all" aria-pressed="${S.fam === "all"}">All programmes</button>${fams.map(f => `<button class="chip" data-fam="${esc(f)}" aria-pressed="${S.fam === f}"><span class="dot" style="--c:${famC(f)}"></span>${esc(FAM_LABEL[f])}</button>`).join("")}</div>
</div>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin:6px 0 12px"><h2 style="font-size:20px;font-weight:800">${MONTHS[S.month - 1]} 2027 <span class="muted" style="font-weight:500;font-size:15px">· ${plural(real.length, "entry", "entries")}</span></h2><div class="seg" role="group" aria-label="View"><button data-calview="list" aria-pressed="${S.calView === "list"}">List</button><button data-calview="grid" aria-pressed="${S.calView === "grid"}">Month</button></div></div>
  ${S.calView === "grid" ? monthGrid(S.month) : `<div class="agenda">${items.map(agItem).join("") || '<p class="empty">Nothing this month for this filter.</p>'}</div>`}
  ${tbc.length ? `<section class="card" style="margin-top:22px"><h2 class="ch" style="margin-bottom:10px">Dates to confirm</h2><div class="agenda">${tbc.map(agItem).join("")}</div></section>` : ""}`;
}
function agItem(s) {
  if (s.kind === "holiday") return `<div class="ag hol"><div class="d"><b>${pd(s.start_date).getDate()}</b><span>${fmt(s.start_date, { month: "short" })}</span></div><div><h4>${esc(s.title)}</h4><div class="meta">${s.end_date !== s.start_date ? esc(range(s)) + " · " : ""}Public holiday or closure${s.check_note ? " · check date" : ""}</div></div><span></span></div>`;
  const L = tasksOf(s.id), p = readiness(L), st = statusOf(L, s);
  return `<button class="ag" data-session="${s.id}"><div class="d">${s.start_date ? `<b>${pd(s.start_date).getDate()}</b><span>${fmt(s.start_date, { month: "short" })}</span>` : '<b>—</b><span>TBC</span>'}</div>
   <div style="min-width:0">${famPill(s.family)}<h4>${esc(s.kind === "report" ? s.title : s.programme + " · " + (s.short || ""))}</h4><div class="meta">${s.kind === "report" ? "Monthly report" : `<span>${esc(s.title)}</span>`}${s.start_date && s.end_date !== s.start_date ? `<span>${esc(range(s))}</span>` : ""}${s.location && s.kind !== "report" ? `<span>${esc(s.location)}</span>` : ""}${s.mode !== "In person" ? `<span>${esc(s.mode)}</span>` : ""}${s.check_note ? '<span style="color:var(--amber)">Check date</span>' : ""}</div></div>
   <div style="display:flex;gap:12px;align-items:center">${L.length ? `<span class="pill ${st[0]}">${esc(st[1])}</span>` : ""}${stack(L.map(t => t.owner))}</div></button>`;
}
function monthGrid(m) {
  const first = new Date(2027, m - 1, 1), off = (first.getDay() + 6) % 7, gs = iso(new Date(2027, m - 1, 1 - off)); let cells = "";
  for (let i = 0; i < 42; i++) {
    const d = addDays(gs, i), inM = pd(d).getMonth() === m - 1; if (i >= 35 && !inM) break;
    const ev = S.sessions.filter(s => s.start_date && s.start_date <= d && (s.end_date || s.start_date) >= d && (S.fam === "all" || s.kind === "holiday" || s.family === S.fam) && !(s.kind === "holiday" && diff(s.end_date, s.start_date) > 7 && pd(d).getDay() !== 1 && d !== s.start_date));
    const hol = ev.some(s => s.kind === "holiday");
    cells += `<div class="cell ${inM ? "" : "out"} ${hol ? "hol" : ""}"><span class="dn">${pd(d).getDate()}</span>${ev.slice(0, 3).map(s => s.kind === "holiday" ? `<span class="ev h">${esc(s.title)}</span>` : `<button class="ev" style="--c:${famC(s.family)}" data-session="${s.id}" title="${esc(s.programme + " · " + s.title)}">${esc(s.kind === "report" ? "Monthly report" : (FAM_LABEL[s.family] || s.programme) + " · " + (s.short || s.title))}</button>`).join("")}${ev.length > 3 ? `<span class="muted" style="font-size:11px">+${ev.length - 3} more</span>` : ""}</div>`;
  }
  return `<div class="grid7">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<div class="dow">${d}</div>`).join("")}${cells}</div>`;
}

/* ---------- Programmes ---------- */
function vProgrammes() {
  const G = programmes();
  if (S.pgm) { const g = G.find(x => x.name === S.pgm); if (g) return vProgramme(g); S.pgm = null; }
  const L = G.filter(g => S.fam === "all" || g.family === S.fam), fams = [...new Set(G.map(g => g.family))];
  return `<div class="head"><div><h1>Programmes</h1><p>${plural(G.length, "programme")} in 2027. Open one to see each module and who is doing what.</p></div>${canPlan() ? '<button class="btn red" data-new="1">Add a session</button>' : ""}</div>
  <div class="toolbar"><div class="chips"><button class="chip" data-fam="all" aria-pressed="${S.fam === "all"}">All</button>${fams.map(f => `<button class="chip" data-fam="${esc(f)}" aria-pressed="${S.fam === f}"><span class="dot" style="--c:${famC(f)}"></span>${esc(FAM_LABEL[f] || f)}</button>`).join("")}</div></div>
  <div class="pcards">${L.map(g => { const p = readiness(g.tasks), st = statusOf(g.tasks); return `<button class="pcard" data-pgm="${esc(g.name)}"><h3><span class="dot" style="--c:${famC(g.family)}"></span>${esc(g.name)}</h3>
    <div class="meta">${plural(g.sessions.length, "session")}${g.start ? ` · ${fmt(g.start, { month: "short" })} – ${fmt(g.end || g.start, { month: "short", year: "numeric" })}` : ""}</div>
    <div style="display:flex;align-items:center;gap:10px"><span class="prog ${progTone(p, g.tasks)}" style="max-width:none"><i style="width:${p}%"></i></span><span class="pct">${p}%</span></div>
    <div class="foot"><span class="pill ${st[0]}">${esc(st[1])}</span>${stack(g.tasks.map(t => t.owner))}</div></button>`; }).join("")}</div>`;
}
function vProgramme(g) {
  if (!S.mod || !g.sessions.some(s => s.id === S.mod)) S.mod = (g.sessions.find(s => (s.end_date || "9999") >= TODAY) || g.sessions[0]).id;
  const s = SID[S.mod], L = tasksOf(s.id).sort((a, b) => a.due.localeCompare(b.due)), owners = [...new Set(L.map(t => t.owner))];
  return `<div class="crumb"><button data-pgm="">Programmes</button> / ${esc(g.name)} / <b style="color:var(--ink)">${esc(s.short || s.title)}</b></div>
  <div class="head" style="margin-bottom:6px"><div><h1>${esc(s.short && /^Module/.test(s.short) ? s.short.replace("Module ", "Module ") + " · " + s.title.replace(/^M\d:\s*/, "") : s.title)}</h1><p>${esc(range(s))} · ${esc(s.location || "")} · ${esc(s.mode)}${s.faculty && s.faculty !== "TBC" ? " · " + esc(s.faculty) : ""}</p></div>${canPlan() ? `<button class="btn outline" data-edit="${s.id}">Edit session</button>` : ""}</div>
  <div class="mtabs" role="group" aria-label="Sessions">${g.sessions.map((x, i) => `<button class="mtab" data-mod="${x.id}" aria-pressed="${x.id === s.id}"><span class="no">${i + 1}</span><span>${esc(x.short || "Session " + (i + 1))}<small>${x.start_date ? fmt(x.start_date) : "TBC"}</small></span></button>`).join("")}</div>
  <p class="muted" style="margin-bottom:16px">Same workflow every session. Faculty, dates and materials change.</p>
  ${s.check_note ? `<div class="callout">${esc(s.check_note)}</div>` : ""}
  ${readyBlock(L, s)}
  <div class="grid g-main" style="margin-top:18px"><section class="card"><h2 class="ch" style="margin-bottom:14px">Preparation workflow</h2>${wfTable(L)}</section>
   <aside class="grid" style="align-content:start"><section class="card"><h2 class="ch" style="margin-bottom:12px">Who's involved</h2>${owners.map(k => { const M = L.filter(t => t.owner === k); return `<div class="trow" style="grid-template-columns:auto minmax(0,1fr) auto">${av(k)}<div><div class="nm">${esc(P(k).short)}</div><div class="ti">${M.filter(t => !isOpen(t)).length} of ${M.length} done</div></div>${M.some(isLate) ? '<span class="pill red">Late</span>' : ""}</div>`; }).join("")}</section>
   <section class="card"><h2 class="ch" style="margin-bottom:10px">Session</h2><dl class="facts"><div><dt>Class</dt><dd>${esc(s.audience)}</dd></div><div><dt>Time</dt><dd>${esc(s.time_text || "TBC")}</dd></div><div><dt>Faculty</dt><dd>${esc(s.faculty || "TBC")}</dd></div><div><dt>Workflow</dt><dd>${esc((S.workflows.find(w => w.key === s.workflow) || {}).name || s.workflow)}</dd></div></dl></section></aside></div>`;
}

/* ---------- session panel ---------- */
function openDrawer(id, mode = "view") { S.drawer = id; S.drawerMode = mode; renderDrawer(); }
function closeDrawer() { S.drawer = null; $("#sheet").innerHTML = ""; }
function renderDrawer() {
  const root = $("#sheet");
  if (S.drawer === "new") return root.innerHTML = drawerWrap("New session", "Add a session", sessionForm({}), "");
  const s = SID[S.drawer]; if (!s) return closeDrawer();
  if (S.drawerMode === "edit") return root.innerHTML = drawerWrap(esc(s.programme), "Edit session", sessionForm(s), "");
  const L = tasksOf(s.id).sort((a, b) => a.due.localeCompare(b.due));
  const body = `${s.check_note ? `<div class="callout">${esc(s.check_note)}</div>` : ""}
   <dl class="facts" style="margin-bottom:16px"><div><dt>Class</dt><dd>${esc(s.audience)}</dd></div><div><dt>Time</dt><dd>${esc(s.time_text || "TBC")}</dd></div><div><dt>Where</dt><dd>${esc(s.location)} · ${esc(s.mode)}</dd></div><div><dt>Faculty</dt><dd>${esc(s.faculty || "—")}</dd></div></dl>
   ${L.length ? readyBlock(L, s) : ""}
   <div style="display:flex;gap:8px;margin:16px 0">${s.kind === "session" ? `<button class="btn sm" data-pgm="${esc(s.programme)}" data-mod="${s.id}">Open in Programmes</button>` : ""}${canPlan() ? `<button class="btn sm" data-edit="${s.id}">Edit session</button>` : ""}</div>
   <h3 style="font-size:16px;font-weight:800;margin:6px 0 10px">Preparation workflow</h3>${wfTable(L)}
   ${canPlan() && s.kind !== "holiday" ? `<form id="addtask" class="form2" style="margin-top:18px;border-top:1px solid var(--line);padding-top:16px"><div class="field full"><label for="at">Add a task to this session</label><input class="input" id="at" placeholder="e.g. Book interpreter for day two" required></div>
    <div class="field"><label for="ao">Owner</label><select class="select" id="ao">${S.people.map(p => `<option value="${p.key}" ${p.key === S.me ? "selected" : ""}>${esc(p.short)}</option>`).join("")}</select></div>
    <div class="field"><label for="ad">Due</label><input class="input" id="ad" type="date" value="${s.start_date ? addDays(s.start_date, -7) : TODAY}" required></div><div class="full"><button class="btn red" type="submit">Add task</button></div></form>` : ""}`;
  root.innerHTML = drawerWrap(`<span class="dot" style="--c:${famC(s.family)}"></span> ${esc(s.programme)}`, esc(s.kind === "report" ? s.title : (s.short ? s.short + " · " : "") + s.title), body, esc(range(s)));
  const f = $("#addtask"); if (f) f.onsubmit = async e => {
    e.preventDefault(); const row = { id: `${s.id}:u${Date.now().toString(36)}`, session_id: s.id, step_key: "custom", title: $("#at").value.trim(), category: "Added", owner: $("#ao").value, due: $("#ad").value, custom: true };
    const { data, error } = await sb.from("hub_tasks").insert(row).select().single(); if (error) return toast(error.message);
    if (!S.tasks.some(t => t.id === data.id)) S.tasks.push(data); toast("Task added"); render(); renderDrawer();
  };
}
function drawerWrap(kicker, title, body, sub) {
  return `<div class="scrim" data-close="1"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dt"><div class="dh"><div style="min-width:0"><div class="muted" style="font-size:13px;display:flex;gap:8px;align-items:center">${kicker}</div><h2 id="dt">${title}</h2>${sub ? `<div class="muted">${sub}</div>` : ""}</div><button class="x" data-close="1" aria-label="Close">×</button></div><div class="db">${body}</div></aside>`;
}
function sessionForm(s) {
  const v = (k, d = "") => esc(s[k] ?? d), progs = [...new Set(sess().map(x => x.programme))].sort();
  return `<form id="sform" class="form2">
   <div class="field full"><label for="f-programme">Programme</label><input class="input" id="f-programme" list="plist" value="${v("programme")}" required><datalist id="plist">${progs.map(p => `<option value="${esc(p)}">`).join("")}</datalist></div>
   <div class="field"><label for="f-family">Programme line</label><select class="select" id="f-family">${Object.keys(FAM_LABEL).map(f => `<option value="${f}" ${f === (s.family || "WELA") ? "selected" : ""}>${FAM_LABEL[f]}</option>`).join("")}</select></div>
   <div class="field"><label for="f-short">Short name</label><input class="input" id="f-short" value="${v("short")}" placeholder="e.g. Module 2"></div>
   <div class="field full"><label for="f-title">Topic</label><input class="input" id="f-title" value="${v("title")}" required></div>
   <div class="field"><label for="f-start">Start date</label><input class="input" type="date" id="f-start" min="2027-01-01" max="2027-12-31" value="${v("start_date")}"></div>
   <div class="field"><label for="f-end">End date</label><input class="input" type="date" id="f-end" min="2027-01-01" max="2027-12-31" value="${v("end_date")}"></div>
   <div class="field"><label for="f-time">Time</label><input class="input" id="f-time" value="${v("time_text")}"></div>
   <div class="field"><label for="f-mode">Format</label><select class="select" id="f-mode">${["In person", "Virtual", "Hybrid"].map(m => `<option ${m === (s.mode || "In person") ? "selected" : ""}>${m}</option>`).join("")}</select></div>
   <div class="field"><label for="f-loc">Location</label><input class="input" id="f-loc" value="${v("location", "Accra, Ghana")}"></div>
   <div class="field"><label for="f-fac">Faculty</label><input class="input" id="f-fac" value="${v("faculty", "TBC")}" list="flist"><datalist id="flist">${S.faculty.map(f => `<option value="${esc(f.name)}">`).join("")}</datalist></div>
   <div class="field full"><label for="f-wf">Workflow</label><select class="select" id="f-wf">${S.workflows.map(w => `<option value="${w.key}" ${w.key === (s.workflow || "classroom") ? "selected" : ""}>${esc(w.name)}</option>`).join("")}</select></div>
   <div class="callout blue full">${s.id ? "Changing dates, format or workflow rebuilds the open tasks. Done tasks and dates someone moved by hand are kept." : "The checklist is built as soon as you save, with every task dated and assigned."}</div>
   <div class="err full" id="serr"></div>
   <div class="full" style="display:flex;gap:8px;justify-content:space-between">${s.id && isSup() ? `<button class="btn" type="button" data-delsession="${s.id}">Delete</button>` : "<span></span>"}<span style="display:flex;gap:8px"><button class="btn" type="button" ${s.id ? `data-viewsheet="1"` : 'data-close="1"'}>Cancel</button><button class="btn red" type="submit">${s.id ? "Save" : "Create session"}</button></span></div></form>`;
}
async function saveSession(e) {
  e.preventDefault(); const s = S.drawer !== "new" ? SID[S.drawer] : null;
  const row = { programme: $("#f-programme").value.trim(), family: $("#f-family").value, short: $("#f-short").value.trim(), title: $("#f-title").value.trim(), start_date: $("#f-start").value || null, end_date: $("#f-end").value || $("#f-start").value || null, time_text: $("#f-time").value.trim(), mode: $("#f-mode").value, location: $("#f-loc").value.trim(), faculty: $("#f-fac").value.trim() || "TBC", workflow: $("#f-wf").value };
  if (!row.programme || !row.title) return $("#serr").textContent = "Programme and topic are needed.";
  if (row.start_date && !row.start_date.startsWith("2027")) return $("#serr").textContent = "The Hub covers 2027 only.";
  if (row.end_date && row.start_date && row.end_date < row.start_date) return $("#serr").textContent = "The end date is before the start date.";
  if (s) { const { error } = await sb.from("hub_sessions").update(row).eq("id", s.id); if (error) return $("#serr").textContent = error.message; Object.assign(s, row); await refreshTasks(s.id); S.drawerMode = "view"; toast("Saved; checklist updated"); }
  else { row.id = "U" + Date.now().toString(36).toUpperCase(); row.audience = row.programme; const { data, error } = await sb.from("hub_sessions").insert(row).select().single(); if (error) return $("#serr").textContent = error.message; if (!S.sessions.some(x => x.id === data.id)) S.sessions.push(data); SID[data.id] = data; await refreshTasks(data.id); S.drawer = data.id; S.drawerMode = "view"; toast("Session added with its checklist"); }
  render(); renderDrawer();
}
async function refreshTasks(sid) { const { data } = await sb.from("hub_tasks").select("*").eq("session_id", sid); S.tasks = S.tasks.filter(t => t.session_id !== sid).concat(data || []); }
