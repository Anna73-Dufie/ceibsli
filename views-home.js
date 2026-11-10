/* CEIBS Africa Programme Hub · Home: a personal dashboard for whoever signs in */
"use strict";

const byDue = (a, b) => a.due.localeCompare(b.due);
const ctxOf = t => { const s = SID[t.session_id] || {}; return s.kind === "report" ? s.title || "Monthly report" : `${s.programme || ""}${s.short || s.title ? " · " + (s.short || s.title) : ""}`; };
const famOf = t => { const s = SID[t.session_id] || {}; return s.family || "Other"; };
const svgI = (d, w = 18) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I_PLAY = '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>';
const I_TICK = '<path d="m5 12.5 4.5 4.5L19 7.5" stroke-width="2.6"/>';
const I_PLUS = '<path d="M12 5v14M5 12h14" stroke-width="2.4"/>';
const I_STAR = '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>';
const weekStart = () => { const d = pd(TODAY), w = (d.getDay() + 6) % 7; return addDays(TODAY, -w); };

function spark(vals, c) {
  const W = 132, H = 40, m = Math.max(1, ...vals), n = vals.length - 1 || 1;
  const pts = vals.map((v, i) => [Math.round(i / n * W), Math.round(H - 4 - v / m * (H - 10))]);
  const line = pts.map(p => p.join(",")).join(" ");
  return `<svg class="h-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${H} ${line} ${W},${H}" fill="${c}" opacity=".14"/><polyline points="${line}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><line x1="0" y1="${H - 1}" x2="${W}" y2="${H - 1}" stroke="${c}" stroke-dasharray="3 3" opacity=".45"/></svg>`;
}

/* the panel that changes with each person's job */
function roleCard() {
  const k = S.me, me = P(k);
  if (["anna", "nicholas", "mavis"].includes(k) && canFees()) {
    const L = S.students, owe = x => bal(x) > 0;
    const groups = [
      ["Overdue", "var(--red)", L.filter(x => owe(x) && x.due_date && x.due_date < TODAY)],
      ["Not paid", "#E25563", L.filter(x => owe(x) && !Number(x.paid) && !(x.due_date && x.due_date < TODAY))],
      ["Part paid", "#1F8FD6", L.filter(x => owe(x) && Number(x.paid) > 0 && !(x.due_date && x.due_date < TODAY))],
      ["Fully paid", "var(--green)", L.filter(x => !owe(x))]
    ];
    const total = L.reduce((a, x) => a + Number(x.fee || 0), 0) || 1;
    const amt = (g, i) => i === 3 ? g.reduce((a, x) => a + Number(x.fee || 0), 0) : g.reduce((a, x) => a + bal(x), 0);
    const toVerify = L.filter(x => Number(x.paid) > 0 && !x.verified_by).length;
    return `<section class="card h-role"><div class="ch-row"><h2 class="ch">${k === "anna" ? "Student fees and reminders" : "Fee overview"}</h2><button class="more" data-view="fees">Students & fees ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
     <p class="muted h-sub">${L.length ? `${plural(L.length, "student")} on the fee list${k === "anna" ? ` · ${plural(groups[0][2].length + groups[1][2].length + groups[2][2].length, "student")} to remind` : toVerify ? ` · ${plural(toVerify, "payment")} to verify` : ""}` : "No students on the fee list yet."}</p>
     <div class="h-fees">${groups.map(([l, c, g], i) => { const a = amt(g, i), w = Math.max(g.length ? 4 : 0, Math.round(a / total * 100)); return `<div class="h-fee"><div class="h-fee-t"><span>${l} <span class="muted">· ${g.length}</span></span><b>${money(a)}</b></div><div class="h-bar"><i style="width:${w}%;--c:${c}"></i></div></div>`; }).join("")}</div>
     ${k === "anna" && L.some(owe) ? `<button class="btn red" data-view="templates" style="margin-top:18px">Send fee reminders ${ic("arrow")}</button>` : ""}</section>`;
  }
  if (k === "daniel") {
    const L = sess().filter(s => s.start_date && (s.end_date || s.start_date) >= TODAY && s.workflow === "classroom").sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(0, 5);
    return `<section class="card h-role"><div class="ch-row"><h2 class="ch">Faculty for upcoming sessions</h2><button class="more" data-view="programmes">Programmes ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
     <p class="muted h-sub">Invitation letters, Canvas and classroom set-up for the next five sessions.</p>
     <div class="rows">${L.map(s => { const T = tasksOf(s.id).filter(t => t.owner === "daniel"), letter = T.find(t => t.step_key === "letter"), d = T.filter(t => !isOpen(t)).length;
      const pill = !letter ? "" : !isOpen(letter) ? '<span class="pill green">Letter sent</span>' : isLate(letter) ? '<span class="pill red">Letter overdue</span>' : `<span class="pill blue">Letter due ${fmt(letter.due)}</span>`;
      return `<button class="h-line" data-session="${s.id}" style="--c:${famC(s.family)}"><span class="bar"></span><div><h4>${esc(s.programme)} · ${esc(s.short || s.title)}</h4><div class="meta"><span>${esc(range(s))}</span><span>${esc(s.faculty || "Faculty to confirm")}</span><span>${d} of ${T.length} done</span></div></div>${pill}</button>`; }).join("") || '<p class="empty">No classroom sessions coming up.</p>'}</div></section>`;
  }
  if (k === "celestine") {
    const L = sess().filter(s => s.start_date && (s.end_date || s.start_date) >= TODAY).sort((a, b) => a.start_date.localeCompare(b.start_date)).map(s => [s, tasksOf(s.id).filter(t => t.owner === "celestine")]).filter(([, T]) => T.length).slice(0, 5);
    return `<section class="card h-role"><div class="ch-row"><h2 class="ch">Logistics coming up</h2><button class="more" data-view="people" data-ptab="vendors">Vendors ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
     <p class="muted h-sub">Venue, catering and vendors for the next sessions.</p>
     <div class="rows">${L.map(([s, T]) => { const d = T.filter(t => !isOpen(t)).length, p = Math.round(d / T.length * 100), nx = T.filter(isOpen).sort(byDue)[0];
      return `<button class="h-line" data-session="${s.id}" style="--c:${famC(s.family)}"><span class="bar"></span><div><h4>${esc(s.programme)} · ${esc(s.short || s.title)}</h4><div class="meta"><span>${esc(range(s))}${s.location ? " · " + esc(s.location) : ""}</span>${nx ? `<span style="${isLate(nx) ? "color:var(--red)" : ""}">Next: ${esc(nx.title)}</span>` : "<span>All done</span>"}</div></div><span class="h-mini"><span class="prog ${progTone(p, T)}"><i style="width:${p}%"></i></span><b>${p}%</b></span></button>`; }).join("") || '<p class="empty">Nothing to arrange right now.</p>'}</div></section>`;
  }
  if (isSup()) {
    return `<section class="card h-role"><div class="ch-row"><h2 class="ch">Team at a glance</h2><button class="more" data-view="team">Team Progress ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
     <p class="muted h-sub">Each person's work for the next 30 days.</p>
     <div class="rows">${S.people.filter(p => p.key !== k && myTasks(p.key).length).map(p => { const all = myTasks(p.key), L = all.filter(t => t.due <= addDays(TODAY, 30) && (isOpen(t) || (t.done_at || t.due) >= addDays(TODAY, -30))), d = L.filter(t => !isOpen(t)).length, pct = L.length ? Math.round(d / L.length * 100) : 0, late = all.filter(isLate).length;
      return `<button class="trow" data-teamof="${p.key}" style="width:100%;text-align:left">${av(p.key)}<div><div class="nm">${esc(p.short)}</div><div class="ti">${late ? `<span style="color:var(--red)">${late} overdue</span>` : esc(p.title.split(",")[0])}</div></div><div class="prog ${progTone(pct, L)}"><i style="width:${pct}%"></i></div><span class="muted">${d} of ${L.length}</span></button>`; }).join("")}</div></section>`;
  }
  const up = nextSession().slice(0, 4);
  return `<section class="card h-role"><div class="ch-row"><h2 class="ch">Programme readiness</h2><button class="more" data-view="programmes">Programmes ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
   <div class="rows">${up.map(s => { const L = tasksOf(s.id), p = readiness(L); return `<button class="h-line" data-session="${s.id}" style="--c:${famC(s.family)}"><span class="bar"></span><div><h4>${esc(s.programme)} · ${esc(s.short || s.title)}</h4><div class="meta"><span>${esc(range(s))}</span></div></div><span class="h-mini"><span class="prog ${progTone(p, L)}"><i style="width:${p}%"></i></span><b>${p}%</b></span></button>`; }).join("") || '<p class="empty">No upcoming sessions.</p>'}</div></section>`;
}

function vOverview() {
  const me = P(S.me), hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const all = myTasks(), O = all.filter(isOpen).sort(byDue), late = O.filter(t => t.due < TODAY), dueToday = O.filter(t => t.due === TODAY);
  const week = O.filter(t => t.due >= TODAY && diff(t.due, TODAY) <= 7);
  const appr = S.tasks.filter(t => t.approver === S.me && isOpen(t) && ["progress", "waiting"].includes(t.status)).sort(byDue);
  const sub = late.length ? `You have ${plural(late.length, "overdue task")}${dueToday.length ? ` and ${dueToday.length} due today` : ""}.` : dueToday.length ? `You have ${plural(dueToday.length, "task")} due today.` : week.length ? `${plural(week.length, "task")} due this week. Nothing is overdue.` : O.length ? `Nothing due this week. Your next task is due ${fmtL(O[0].due)}.` : "Nothing is waiting for you.";

  /* up next */
  const f = O.find(t => t.status === "progress") || O[0];
  const fd = f ? diff(f.due, TODAY) : 0;
  const focus = f ? `<section class="card h-focus"><div class="h-k">Up next</div><h3>${esc(f.title)}</h3><button class="h-ctx" data-session="${f.session_id}">${esc(ctxOf(f))}</button>
     <button class="h-play ${f.status === "todo" ? "" : "go"}" data-quick="${esc(f.id)}" aria-label="${f.status === "todo" ? "Start this task" : "Mark this task done"}">${svgI(f.status === "todo" ? I_PLAY : I_TICK, 34)}</button>
     <div class="h-play-l">${f.status === "todo" ? "Start" : f.status === "waiting" ? "Waiting on someone · mark done" : "In progress · mark done"}</div>
     <div class="h-two"><div><span>Due</span><b>${fmt(f.due)}</b></div><div><span>${fd < 0 ? "Overdue by" : "Days left"}</span><b style="${fd < 0 ? "color:var(--red)" : ""}">${fd < 0 ? plural(-fd, "day") : fd === 0 ? "Today" : fd}</b></div></div></section>`
    : `<section class="card h-focus"><div class="h-k">Up next</div><h3>You're all clear</h3><p class="muted">No open tasks. Enjoy it.</p><span class="h-play go" style="pointer-events:none">${svgI(I_TICK, 34)}</span></section>`;

  /* today's tasks */
  const urgent = late.length || dueToday.length, tl = (urgent ? [...late, ...dueToday] : week.length ? week : O).slice(0, 3);
  const tTitle = urgent ? "Today's tasks" : week.length ? "This week" : "Next up";
  const todayC = `<section class="card h-list"><div class="ch-row"><h2 class="ch">${tTitle} <span class="h-count">${urgent ? late.length + dueToday.length : week.length || O.length}</span></h2><button class="more" data-view="work">Manage ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    ${tl.map((t, i) => `<button class="h-task ${i === 0 ? "first" : ""}" data-session="${t.session_id}"><span class="h-dot" style="--c:${isLate(t) ? "var(--red)" : t.status === "progress" ? "var(--blue)" : "#E25563"}">${svgI(t.status === "progress" ? '<path d="M9 6v12M15 6v12" stroke-width="2.6"/>' : I_PLAY, 14)}</span><span class="h-tt"><b>${esc(t.title)}</b><small>${esc(ctxOf(t))} · ${isLate(t) ? `<span style="color:var(--red)">was due ${fmt(t.due)}</span>` : fmtW(t.due)}</small></span>${t.approver && t.approver !== S.me ? `<span class="h-star" title="${esc(P(t.approver).short)} approves">${svgI(I_STAR, 16)}</span>` : ""}</button>`).join("") || '<p class="empty">Nothing due. Look ahead under My Work.</p>'}</section>`;

  /* sessions this fortnight */
  let ss = sess().filter(s => s.start_date && s.start_date <= addDays(TODAY, 14) && (s.end_date || s.start_date) >= TODAY).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const near = ss.length > 0; if (!near) ss = nextSession().slice(0, 3);
  const sessC = `<section class="card h-list"><div class="ch-row"><h2 class="ch">${near ? "Sessions soon" : "Next sessions"} <span class="h-count">${ss.length}</span></h2><button class="more" data-view="calendar">Calendar ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    <div class="h-sess">${ss.slice(0, 3).map(s => { const d = pd(s.start_date); return `<button class="h-st" data-session="${s.id}"><span class="h-st-top"><span><small>${d.toLocaleDateString("en-GB", { weekday: "short" })}</small><b>${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}</b></span><span class="h-sq" style="--c:${famC(s.family)}">${esc((FAM_LABEL[s.family] || s.family || "").slice(0, 4))}</span></span><span class="h-st-t">${esc(s.short || s.title)}</span><small class="muted">${esc(s.time_text || (s.mode === "Online" ? "Online" : s.location || s.mode || ""))}</small></button>`; }).join("")}
     <button class="h-st add" data-view="calendar"><span class="h-plus">${svgI(I_PLUS, 16)}</span><span>Open the 2027 calendar</span></button></div></section>`;

  /* this week's activity */
  const ws = weekStart(), days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((l, i) => { const d = addDays(ws, i); return [l, d, all.filter(t => t.done_at && t.done_at.slice(0, 10) === d).length]; });
  const wkAll = all.filter(t => t.due >= ws && t.due <= addDays(ws, 6) && t.status !== "na"), wkDone = wkAll.filter(t => t.status === "done").length;
  const mx = Math.max(1, ...days.map(d => d[2])), doneWk = days.reduce((a, d) => a + d[2], 0), left = wkAll.length - wkDone;
  const actC = `<section class="card h-act"><div class="ch-row"><h2 class="ch">Your week</h2>${wkAll.length ? `<span class="pill ${left ? "amber" : "green"}">${left ? left + " still due" : "All done"}</span>` : ""}</div>
    <div class="h-big">${doneWk}<small>${doneWk === 1 ? "task" : "tasks"} done</small></div><div class="h-bars">${days.map(([l, d, n]) => `<div class="h-col ${d === TODAY ? "now" : ""}"><div class="h-track"><i style="height:${n ? Math.max(14, Math.round(n / mx * 100)) : 0}%"></i></div><b>${n}</b><span>${l}</span></div>`).join("")}</div><p class="muted h-foot">Tasks you ticked off each day</p></section>`;

  /* numbers with sparklines */
  const wk = i => addDays(ws, i * 7);
  const loadNext = [...Array(8)].map((_, i) => O.filter(t => t.due >= wk(i) && t.due < wk(i + 1)).length);
  const doneBack = [...Array(8)].map((_, i) => all.filter(t => t.done_at && t.done_at.slice(0, 10) >= wk(i - 7) && t.done_at.slice(0, 10) < wk(i - 6)).length);
  const lateBack = [...Array(8)].map((_, i) => O.filter(t => t.due < wk(i - 6)).length);
  const done30 = all.filter(t => t.done_at && t.done_at.slice(0, 10) >= addDays(TODAY, -30)).length;
  const numsC = `<section class="card h-nums">
    <div class="h-num" style="--c:var(--green)"><div><h3>My open tasks</h3><span class="muted">Rest of 2027</span><b>${O.length}</b></div>${spark(loadNext, "#15803D")}</div>
    <div class="h-num" style="--c:var(--blue)"><div><h3>Completed</h3><span class="muted">Last 30 days</span><b>${done30}</b></div>${spark(doneBack, "#1F5FAE")}</div>
    <div class="h-num" style="--c:var(--red)"><div><h3>Overdue</h3><span class="muted">${late.length ? "Needs clearing" : "All on time"}</span><b style="${late.length ? "color:var(--red)" : ""}">${late.length}</b></div>${spark(lateBack, "#C8102E")}</div></section>`;

  /* coming up timeline */
  const nextL = O.filter(t => t.due >= TODAY).slice(0, 5);
  const schedC = `<section class="card h-sched"><div class="ch-row"><h2 class="ch">Coming up</h2><button class="more" data-view="work">My Work ${ic("arrow").replace("<svg", '<svg width="16" height="16"')}</button></div>
    <div class="h-tl">${nextL.map(t => `<div class="h-tli"><button class="h-chip" data-session="${t.session_id}" style="--c:${famC(famOf(t))}"><b>${esc(t.title)}</b><small>${esc((FAM_LABEL[famOf(t)] || famOf(t)).toUpperCase())} · ${fmt(t.due)}</small></button><span class="h-when"><i></i>${t.due === TODAY ? "Today" : fmtW(t.due).replace(/^(\w+) /, "$1 ")}</span></div>`).join("") || '<p class="empty">Nothing coming up.</p>'}</div></section>`;

  /* my work by programme */
  const fams = {}; O.forEach(t => { const fm = famOf(t); fams[fm] = (fams[fm] || 0) + 1; });
  let fl = Object.entries(fams).sort((a, b) => b[1] - a[1]); if (fl.length > 4) { const rest = fl.slice(3).reduce((a, x) => a + x[1], 0); fl = [...fl.slice(0, 3), ["Other", rest]]; }
  let acc = 0; const seg = fl.map(([fm, n]) => { const a = acc, b = acc + n / (O.length || 1) * 100; acc = b; return `${fm === "Other" ? "#CBD5E1" : famC(fm)} ${a}% ${b}%`; }).join(",");
  const donutC = `<section class="card h-donut"><div class="ch-row"><h2 class="ch">My work by programme</h2></div>
    <div class="h-ring" style="background:conic-gradient(${seg || "#E3E8EF 0 100%"})"><div><b>${fl.length}</b><span>programmes</span></div></div>
    <div class="h-leg">${fl.map(([fm, n]) => `<div><span class="h-sw" style="--c:${fm === "Other" ? "#CBD5E1" : famC(fm)}"></span><span>${esc(FAM_LABEL[fm] || fm)}</span><b>${Math.round(n / O.length * 100)}%</b></div>`).join("") || '<p class="empty">No open work.</p>'}</div></section>`;

  /* reminders */
  const R = [];
  if (appr.length) R.push([fmt(appr[0].due), `${plural(appr.length, "task")} waiting for your approval`, "High", "work"]);
  if (late.length) R.push(["Now", `${plural(late.length, "overdue task")} to clear`, "High", "work"]);
  if (canFees() && ["anna", "nicholas", "mavis"].includes(S.me)) {
    const owing = S.students.filter(x => bal(x) > 0 && x.due_date && x.due_date <= addDays(TODAY, 14));
    if (S.me === "anna" && owing.length) R.push(["Fees", `Remind ${plural(owing.length, "student")} with a balance`, owing.some(x => x.due_date < TODAY) ? "High" : "Low", "fees"]);
    const ver = S.students.filter(x => Number(x.paid) > 0 && !x.verified_by).length;
    if (S.me !== "anna" && ver) R.push(["Fees", `Verify ${plural(ver, "payment")}`, "High", "fees"]);
  }
  const wt = O.filter(t => t.status === "waiting"); if (wt.length) R.push([fmt(wt[0].due), `${plural(wt.length, "task")} waiting on someone else`, "Low", "work"]);
  const mon = addDays(ws, 7); R.push([fmtW(mon).split(" ")[0] + " 6am", "Your weekly brief arrives", "Info", "brief"]);
  const remC = `<section class="card h-rem"><div class="ch-row"><h2 class="ch">Reminders</h2></div>${R.slice(0, 3).map(([w, tx, pr, v]) => `<button class="h-ri" data-view="${v}"><span><b>${esc(w)}</b><small>${esc(tx)}</small></span><span class="h-pr ${pr.toLowerCase()}">${pr}<i></i></span></button>`).join("")}</section>`;

  return `<div class="head"><div><h1>${greet}, ${esc(me.short)}</h1><p>${fmtL(TODAY)} · ${sub}</p></div>${appr.length ? `<button class="btn" data-view="work">${plural(appr.length, "approval")} waiting ${ic("arrow")}</button>` : ""}</div>
   <div class="h-row1">${focus}${todayC}${sessC}${actC}</div>
   ${numsC}
   <div class="h-row3">${roleCard()}${schedC}<div class="h-side">${donutC}${remC}</div></div>`;
}

/* one-tap start / done on the Up next card */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-quick]"); if (!b) return;
  const t = S.tasks.find(x => x.id === b.dataset.quick); if (!t || !canEditTask(t)) return;
  const nx = t.status === "todo" ? "progress" : "done";
  setTask(t.id, { status: nx }, nx === "done" ? "Done. The team can see it." : "Started. It shows as in progress.");
});

/* admins: switch whose Home / My Work you are looking at */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-viewas]"); if (!b || !isAdmin()) return;
  S.viewAs = b.dataset.viewas || null; S.workTab = "week";
  if (b.dataset.goto) go(b.dataset.goto); else { render(); window.scrollTo(0, 0); }
});
