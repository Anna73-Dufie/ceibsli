"use strict";

/* ============ Weekly brief ============ */
function briefFor(k, from = TODAY) {
  const rows = teamTasks(k, S.tasks.filter(live)).filter(t => t.status === "open" && diff(t.due_date, from) <= 13).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const b = { overdue: rows.filter(t => t.due_date < from), week: rows.filter(t => t.due_date >= from && diff(t.due_date, from) <= 6), next: rows.filter(t => diff(t.due_date, from) > 6) };
  const line = t => { const s = SID[t.session_id] || {}; return `• ${fmtW(t.due_date)} — ${t.title}  (${sName(s)}${t.approver_role ? ", approve: " + roleName(t.approver_role) : ""})`; };
  const who = peopleOf(k), hi = who ? `Good morning ${who.split(", ").map(n => n.split(" ")[0]).join(" and ")},` : "Good morning,";
  const parts = [hi, "", `${TEAMS[k].name} brief for the week of ${fmtLong(from)}.`];
  if (b.overdue.length) parts.push("", `OVERDUE (${b.overdue.length})`, ...b.overdue.map(line));
  parts.push("", b.week.length ? `DUE THIS WEEK (${b.week.length})` : "Nothing due this week.", ...b.week.map(line));
  if (b.next.length) parts.push("", `COMING NEXT WEEK (${b.next.length})`, ...b.next.map(line));
  parts.push("", `Tick things off in the Hub: ${location.origin}`, "— Programme Hub");
  return { text: parts.join("\n"), ...b };
}
function vBrief() {
  const k = S.bteam || teamOf(S.me.role), B = briefFor(k);
  const last = S.briefs[0], subj = `Your week at a glance · ${fmtLong(TODAY)}`;
  const emails = S.members.filter(m => TEAMS[k].roles.includes(m.role)).map(m => m.email);
  return `<div class="pagehead"><div><p class="kicker">The Monday agent</p><h1 class="page">Weekly brief</h1><p class="dek">Every Monday at 6am the Hub writes a brief for each person: what is overdue, what is due this week, what is coming. It goes out by email once an email key is added; until then, copy it here and send it on WhatsApp or Outlook.</p></div>
   <span class="live"><i></i>${last ? `Last run ${new Date(last.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${S.briefs.filter(b => b.week_start === last.week_start).length} briefs` : "Scheduled · first run next Monday"}</span></div>
  <div class="toolbar"><div class="seg" role="group" aria-label="Team">${Object.keys(TEAMS).map(x => `<button data-bteam="${x}" aria-pressed="${x === k}">${TEAMS[x].short}</button>`).join("")}</div><span class="sp"></span><span class="muted">${B.overdue.length} overdue · ${B.week.length} this week · ${B.next.length} next week</span></div>
  <div class="cols"><section class="brief"><article class="card"><h2>${esc(TEAMS[k].name)} · week of ${fmtLong(TODAY)}</h2><pre id="brieftext">${esc(B.text)}</pre>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" data-copytext="brieftext">Copy for WhatsApp</button><a class="btn sm" href="mailto:${esc(emails.join(","))}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(B.text)}">Open in email</a><a class="btn sm" href="https://wa.me/?text=${encodeURIComponent(B.text)}" target="_blank" rel="noopener">Share on WhatsApp</a></div></article></section>
  <aside><h3 class="label">How it works</h3><ol class="steps"><li>The playbook dates every task from the session date.</li><li>On Monday morning the agent reads each person's tasks and writes their brief.</li><li>Each person also has the same tasks in their phone calendar with alerts (My account).</li><li>Ticking a task here updates everyone's view at once.</li></ol>
   <hr class="rule"><h3 class="label">Goes to</h3><p class="muted">${esc(peopleOf(k) || "No one assigned yet")}${emails.length ? `<br><span class="mono">${esc(emails.join(", "))}</span>` : "<br>Nobody from this team has signed in yet."}</p></aside></div>`;
}

/* ============ Programmes ============ */
function vProgrammes() {
  if (S.pgm) { const p = programmes().find(x => x.name === S.pgm); if (p) return vProgramme(p); S.pgm = null; }
  const P = programmes().filter(p => p.end >= TODAY);
  return `<div class="pagehead"><div><p class="kicker">Portfolio</p><h1 class="page">Programmes</h1><p class="dek">${P.length} programmes and event series ahead, built from ${sess().filter(s => s.end_date >= TODAY).length} sessions on the calendar. Add a session and its full checklist is dated and assigned instantly.</p></div><button class="btn primary" data-new="1">Add a session</button></div>
  <div class="index">${P.map(p => { const h = health(p), d = p.tasks.filter(done).length; return `<button class="entry" data-pgm="${esc(p.name)}"><span class="health ${h[0]}">${esc(h[1])}</span><h4><span class="dot" style="--c:${famC(p.family)}"></span>${esc(p.name)}</h4>
    <div class="meta">${p.sessions.length} session${p.sessions.length > 1 ? "s" : ""} · ${fmt(p.start)} – ${fmt(p.end)} · ${esc(p.locs.join(", ") || "TBC")}</div><div class="meta">Faculty: ${esc(p.faculty.slice(0, 2).join(", ") || "TBC")}${p.faculty.length > 2 ? ` +${p.faculty.length - 2}` : ""}</div>
    <div class="prog" style="max-width:none"><i style="width:${p.tasks.length ? Math.round(d / p.tasks.length * 100) : 0}%"></i></div><div class="meta mono">${d} of ${p.tasks.length} tasks done</div></button>`; }).join("")}</div>`;
}
function vProgramme(p) {
  const h = health(p), open = p.tasks.filter(t => t.status === "open" && t.due_date >= TODAY).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const roles = [...new Set(p.tasks.flatMap(t => [t.owner_role, t.approver_role, ...t.consult]).filter(Boolean))];
  const tbc = p.sessions.filter(s => /tbc/i.test(s.faculty)).length, over = p.tasks.filter(t => t.status === "open" && t.due_date < TODAY);
  return `<p><button class="btn ghost sm" data-pgm="">← All programmes</button></p><p class="kicker"><span class="health ${h[0]}">${esc(h[1])}</span></p>
  <h1 class="page">${esc(p.name)}</h1><p class="dek">${p.sessions.length} session${p.sessions.length > 1 ? "s" : ""} from ${fmtY(p.start)} to ${fmtY(p.end)} · ${esc(p.locs.join(", "))}</p>
  <div class="figures"><div><b>${p.tasks.length}</b><span>Tasks in the plan</span></div><div><b>${p.tasks.filter(done).length}</b><span>Done</span></div><div class="${over.length ? "hot" : ""}"><b>${over.length}</b><span>Overdue</span></div><div class="${tbc ? "hot" : ""}"><b>${tbc}</b><span>Sessions with faculty TBC</span></div></div>
  <h3 class="label">Progress by team</h3>${teamStrip(p.tasks)}
  <div class="cols"><section><h2 class="sec">Sessions</h2><div class="list" style="margin-top:12px">${p.sessions.map(sessItem).join("")}</div>
    <h2 class="sec" style="margin-top:34px">Next deadlines</h2>${[...over, ...open].slice(0, 10).map(t => taskRow(t, true, true)).join("") || '<p class="empty">All done.</p>'}</section>
   <aside><h3 class="label">Faculty</h3>${p.faculty.map(n => `<div class="person" style="padding:10px 0" data-person="${esc(n)}"><span class="mono-av">${esc(initials(n))}</span><div><div class="pn">${esc(n)}</div><div class="is">${p.sessions.filter(s => facultyIn(s.faculty).includes(n)).length} session(s) in this programme</div></div></div>`).join("") || '<p class="muted">Faculty TBC</p>'}
    <hr class="rule"><h3 class="label">Teams involved</h3><table><tbody>${Object.keys(TEAMS).filter(k => teamTasks(k, p.tasks).length).map(k => `<tr><td><b>${TEAMS[k].name}</b><div class="is">${esc(peopleOf(k) || "Not yet assigned")}</div></td><td class="mono">${teamTasks(k, p.tasks).length}</td></tr>`).join("")}</tbody></table>
    <hr class="rule"><h3 class="label">Outside parties</h3><p class="muted">${roles.filter(r => EXT[r] && r !== "FAC").map(r => EXT[r]).join(" · ") || "None"}</p></aside></div>`;
}

/* ============ Calendar ============ */
function vCalendar() {
  if (!S.month) S.month = TODAY.slice(0, 7);
  const [y, m] = S.month.split("-").map(Number), first = new Date(y, m - 1, 1), off = (first.getDay() + 6) % 7, gs = iso(new Date(y, m - 1, 1 - off));
  const tasks = S.tasks.filter(t => (S.layers.coord && t.calendar === "Coordinator") || (S.layers.team && t.calendar === "Team"));
  let cells = "";
  for (let i = 0; i < 42; i++) {
    const d = addDays(gs, i), inM = pd(d).getMonth() === m - 1; if (i >= 35 && !inM) break;
    const ev = S.sessions.filter(s => s.start_date <= d && s.end_date >= d && !(nDays(s) > 40 && s.start_date !== d && pd(d).getDay() !== 1));
    const hol = ev.some(isHol), items = [];
    for (const s of ev) if (isHol(s)) items.push(`<span class="chip h">${esc(s.title)}</span>`); else if (S.layers.sessions) items.push(`<button class="chip" style="--c:${famC(s.family)}" data-session="${s.id}" title="${esc(sFull(s))}">${esc(sName(s))}</button>`);
    for (const t of tasks.filter(t => t.due_date === d)) items.push(`<button class="chip t" data-session="${t.session_id}" title="${esc(t.title)}">${esc(t.title)}</button>`);
    const show = items.slice(0, 4);
    cells += `<div class="cell ${inM ? "" : "out"} ${hol ? "hol" : ""} ${d === TODAY ? "today" : ""}"><span class="dn">${pd(d).getDate()}</span>${show.join("")}${items.length > 4 ? `<span class="more">+${items.length - 4} more</span>` : ""}</div>`;
  }
  const mS = sess().filter(s => s.start_date.slice(0, 7) === S.month);
  return `<p class="kicker">Calendar</p><h1 class="page" style="margin-bottom:16px">Month view</h1><div class="calhead"><button class="btn sm" data-month="-1" aria-label="Previous month">←</button><h2>${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2><button class="btn sm" data-month="1" aria-label="Next month">→</button><button class="btn ghost sm" data-month="0">Today</button><span style="flex:1"></span>
   <div class="seg" role="group" aria-label="Show">${[["sessions", "Sessions"], ["coord", "Coordinator tasks"], ["team", "Team tasks"]].map(([k, l]) => `<button data-layer="${k}" aria-pressed="${S.layers[k]}">${l}</button>`).join("")}</div><button class="btn primary sm" data-new="1">Add a session</button></div>
   <p class="muted" style="font-size:13px;margin:0 0 12px">${LEGEND.map(([n, c]) => `<span style="margin-right:14px"><span class="dot" style="--c:${c}"></span>${n}</span>`).join("")}<span>Hatched days are holidays or closures.</span></p>
   <div class="month">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<div class="dow">${d}</div>`).join("")}${cells}</div>
   <h2 class="sec" style="margin-top:34px">Starting this month</h2><div class="list" style="margin-top:12px">${mS.map(sessItem).join("") || '<p class="empty">No sessions start this month.</p>'}</div>`;
}

/* ============ Tasks ============ */
function vTasks() {
  let L = S.tasks.filter(live);
  const w = S.tWho;
  if (w === "mine") L = mine(); else if (w.startsWith("T:")) L = teamTasks(w.slice(2), L); else if (w === "Coordinator" || w === "Team") L = L.filter(t => t.calendar === w); else if (ROLES[w]) L = mineFor(w);
  if (S.tRange === "over") L = L.filter(t => t.status === "open" && t.due_date < TODAY);
  else if (S.tRange === "done") L = L.filter(done);
  else if (S.tRange === "all") L = L.filter(t => t.due_date >= TODAY || t.status === "open");
  else L = L.filter(t => t.due_date >= TODAY && diff(t.due_date, TODAY) <= Number(S.tRange));
  const q = S.q.toLowerCase(); if (q) L = L.filter(t => (t.title + " " + sFull(SID[t.session_id] || {}) + " " + (SID[t.session_id] || {}).programme).toLowerCase().includes(q));
  L.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return `<p class="kicker">Action calendars</p><h1 class="page">Tasks</h1><p class="dek">Every task carries its team, its owner, who approves and who to consult. The <b>Coordinator</b> calendar holds decisions, contracts, money and faculty; the <b>Team</b> calendar holds the doing.</p>
  <div class="toolbar"><label class="sr" for="who">Whose tasks</label><select class="select" id="who" style="width:auto">${[["mine", "My tasks"], ...Object.keys(TEAMS).map(k => ["T:" + k, TEAMS[k].name + " team"]), ["Coordinator", "Coordinator calendar"], ["Team", "Team calendar"], ...Object.entries(ROLES).map(([k, v]) => [k, v]), ["all", "Everyone"]].map(([k, l]) => `<option value="${k}" ${S.tWho === k ? "selected" : ""}>${l}</option>`).join("")}</select>
   <div class="seg" role="group" aria-label="When">${[["7", "7 days"], ["30", "30 days"], ["90", "90 days"], ["over", "Overdue"], ["all", "Everything ahead"], ["done", "Done"]].map(([k, l]) => `<button data-range="${k}" aria-pressed="${S.tRange === k}">${l}</button>`).join("")}</div>
   <span class="sp"></span><label class="sr" for="tq">Search</label><input class="search" id="tq" type="search" placeholder="Search tasks or programmes" value="${esc(S.q)}"></div>
  <p class="muted" style="margin:0 0 10px">${L.length} task${L.length === 1 ? "" : "s"}</p>
  ${L.length ? byDay(L.slice(0, 300), true) : '<p class="empty">No tasks match.</p>'}${L.length > 300 ? '<p class="muted">Showing the first 300. Narrow the range to see more.</p>' : ""}`;
}

/* ============ People ============ */
function vPeople() {
  if (S.person) return vPerson(S.person);
  const q = S.q.toLowerCase(), tabs = [["faculty", "Faculty"], ["team", "CEIBS Africa teams"], ["clients", "Clients"], ["suppliers", "Vendors"]];
  let body = "";
  if (S.ptab === "faculty") {
    const L = S.faculty.filter(f => !q || f.name.toLowerCase().includes(q));
    body = `<div class="people">${L.map(f => { const up = sess().filter(s => s.end_date >= TODAY && facultyIn(s.faculty).includes(f.name)); return `<button class="person" data-person="${esc(f.name)}"><span class="mono-av">${esc(initials(f.name))}</span><div><div class="pn">${esc(f.name)}</div><div class="is">${f.sessions_count} session${f.sessions_count > 1 ? "s" : ""} · ${f.years[0]}–${f.years[f.years.length - 1]}</div><div class="is">${up.length ? `<b style="color:var(--red)">${up.length} upcoming</b> · next ${fmt(up[0].start_date)}` : "None booked"}</div></div></button>`; }).join("")}</div>`;
  } else if (S.ptab === "team") {
    body = `<div class="tw"><table><thead><tr><th>Team</th><th>Owns</th><th>People</th><th>Open tasks</th></tr></thead><tbody>${Object.keys(TEAMS).map(k => `<tr><td><b>${TEAMS[k].name}</b></td><td>${TEAMS[k].does}</td><td>${esc(peopleOf(k) || "Not yet assigned")}</td><td class="mono">${teamTasks(k, S.tasks.filter(live)).filter(t => t.status === "open").length}</td></tr>`).join("")}</tbody></table></div><p style="margin-top:14px"><button class="btn" data-view="teams">See team progress</button> ${isAdmin() ? `<button class="btn" data-view="admin">Invite or manage people</button>` : ""}</p>`;
  } else if (S.ptab === "clients") {
    body = `<div class="tw"><table><thead><tr><th>Client</th><th>Sessions</th><th>Years</th><th>Programmes</th></tr></thead><tbody>${S.clients.filter(c => !q || c.name.toLowerCase().includes(q)).map(c => `<tr><td><b>${esc(c.name)}</b></td><td class="mono">${c.sessions_count}</td><td class="mono">${c.years.join(", ")}</td><td>${esc(c.programmes.join("; "))}</td></tr>`).join("")}</tbody></table></div><p class="muted">From the client programme rows of the 2024–2027 calendars.</p>`;
  } else {
    body = `<p class="muted">Record the supplier for each service so letters and orders go to the right place.</p><div class="tw"><table><thead><tr><th>Service</th><th>Covers</th><th>Supplier</th><th>Contact</th></tr></thead><tbody>${S.suppliers.map(s => `<tr><td><b>${esc(s.service)}</b></td><td>${esc(s.covers)}</td><td><label class="sr" for="sp-${s.key}">Supplier</label><input class="input" id="sp-${s.key}" data-sup="${s.key}" data-f="supplier" value="${esc(s.supplier)}" placeholder="Add supplier"></td><td><label class="sr" for="sc-${s.key}">Contact</label><input class="input" id="sc-${s.key}" data-sup="${s.key}" data-f="contact" value="${esc(s.contact)}" placeholder="Phone or email"></td></tr>`).join("")}</tbody></table></div>`;
  }
  return `<p class="kicker">Directory</p><h1 class="page">People</h1><p class="dek">Who teaches, who decides, who to consult. Faculty and clients come from four years of the CEIBS Africa programme calendar; vendors are kept here so letters go to the right place.</p>
  <div class="toolbar"><div class="seg" role="group" aria-label="Directory">${tabs.map(([k, l]) => `<button data-ptab="${k}" aria-pressed="${S.ptab === k}">${l}</button>`).join("")}</div><span class="sp"></span>${["faculty", "clients"].includes(S.ptab) ? `<label class="sr" for="pq">Search</label><input class="search" id="pq" type="search" placeholder="Search" value="${esc(S.q)}">` : ""}</div>${body}`;
}
function vPerson(n) {
  const f = S.faculty.find(x => x.name === n); if (!f) { S.person = null; return vPeople(); }
  const up = sess().filter(s => s.end_date >= TODAY && facultyIn(s.faculty).includes(n));
  const asks = S.tasks.filter(t => live(t) && t.status === "open" && (t.notify.includes("FAC") || t.consult.includes("FAC")) && facultyIn((SID[t.session_id] || {}).faculty).includes(n)).sort((a, b) => a.due_date.localeCompare(b.due_date));
  return `<p><button class="btn ghost sm" data-person="">← All people</button></p><p class="kicker">Faculty</p><h1 class="page">${esc(n)}</h1><p class="dek">${f.sessions_count} sessions recorded, ${f.years[0]}–${f.years[f.years.length - 1]}. ${esc(f.programmes.slice(0, 3).join(" · "))}</p>
  <div class="cols"><section><h2 class="sec">Upcoming sessions</h2><div class="list" style="margin-top:12px">${up.map(sessItem).join("") || '<p class="empty">None booked.</p>'}</div>
   <h2 class="sec" style="margin-top:30px">Recent sessions</h2><table><tbody>${(f.recent || []).slice().reverse().map(r => `<tr><td class="mono" style="width:170px">${esc(r.d)}</td><td>${esc(r.w)}</td></tr>`).join("")}</tbody></table></section>
  <aside><h3 class="label">Letters and requests due</h3>${asks.slice(0, 10).map(t => taskRow(t)).join("") || '<p class="empty">Nothing pending.</p>'}<p style="margin-top:14px"><button class="btn sm" data-view="letters" data-lf="FAC">Open faculty letters</button></p></aside></div>`;
}
