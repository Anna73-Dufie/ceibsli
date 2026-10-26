/* CEIBS Africa Programme Hub · My Work, Team Progress, Workflows, Weekly brief */
"use strict";

/* ---------- My Work ---------- */
function workBuckets(k = S.me) {
  const L = myTasks(k).slice().sort((a, b) => a.due.localeCompare(b.due)), O = L.filter(isOpen);
  return {
    over: O.filter(t => t.due < TODAY), week: O.filter(t => t.due >= TODAY && diff(t.due, TODAY) <= 7),
    month: O.filter(t => diff(t.due, TODAY) > 7 && diff(t.due, TODAY) <= 30), later: O.filter(t => diff(t.due, TODAY) > 30),
    done: L.filter(t => !isOpen(t)).sort((a, b) => (b.done_at || b.due).localeCompare(a.done_at || a.due))
  };
}
function taskItem(t, showOwner = false) {
  const s = SID[t.session_id] || {}, late = isLate(t);
  return `<div class="task ${isOpen(t) ? "" : "done"}"><div style="min-width:0"><h4>${esc(t.title)}</h4>
   <div class="meta"><button class="more" style="color:var(--blue);font-weight:500;font-size:13px" data-session="${s.id}">${esc(s.kind === "report" ? s.title : s.programme + " · " + (s.short || s.title))}</button><span class="${late ? "late" : ""}">${late ? "Overdue · was due " : "Due "}${fmtW(t.due)}</span>${t.approver ? `<span>${esc(P(t.approver).short)} approves</span>` : ""}${showOwner ? `<span>${who(t.owner, "xs")}</span>` : ""}${t.done_by && !isOpen(t) ? `<span>Done ${t.done_at ? fmt(t.done_at.slice(0, 10)) : ""}</span>` : ""}${canEditTask(t) && !t.note && !S.open["n:" + t.id] ? `<button class="more" style="font-size:13px;font-weight:500" data-addnote="${esc(t.id)}">Add note</button>` : ""}</div></div>
   <div>${stSelect(t)}</div>
   ${canEditTask(t) && (S.open["n:" + t.id] || t.note) ? `<div class="note"><label class="sr" for="n-${esc(t.id)}">Note</label><input class="input sm" id="n-${esc(t.id)}" data-note="${esc(t.id)}" value="${esc(t.note)}" placeholder="Note for the team, e.g. quote received, waiting on vendor"></div>` : t.note ? `<div class="note muted">“${esc(t.note)}”</div>` : ""}</div>`;
}
function vWork() {
  const B = workBuckets(), tabs = [["over", "Overdue"], ["week", "This week"], ["month", "Next 30 days"], ["later", "Later"], ["done", "Done"]];
  if (!B[S.workTab].length && S.workTab !== "done") S.workTab = ["over", "week", "month", "later"].find(k => B[k].length) || "week";
  const appr = S.tasks.filter(t => t.approver === S.me && isOpen(t) && (["progress", "waiting"].includes(t.status) || diff(t.due, TODAY) <= 14)).sort((a, b) => a.due.localeCompare(b.due));
  const L = B[S.workTab], me = P(S.me);
  return `<div class="head"><div><h1>My Work</h1><p>${esc(me.short)}, these are your tasks only. Update the status as you go and the team sees your progress straight away.</p></div></div>
  ${appr.length ? `<section class="card" style="margin-bottom:18px"><h2 class="ch" style="margin-bottom:8px">Waiting for your approval</h2>${appr.slice(0, 8).map(t => taskItem(t, true)).join("")}</section>` : ""}
  <div class="toolbar"><div class="seg" role="group" aria-label="When">${tabs.map(([k, l]) => `<button data-worktab="${k}" aria-pressed="${S.workTab === k}">${l} · ${B[k].length}</button>`).join("")}</div></div>
  <section class="card">${L.length ? L.slice(0, 80).map(t => taskItem(t)).join("") : `<p class="empty">${S.workTab === "done" ? "Nothing ticked off yet." : "Nothing here."}</p>`}${L.length > 80 ? `<p class="muted" style="padding-top:12px">Showing the first 80 of ${L.length}.</p>` : ""}</section>`;
}

/* ---------- Team Progress ---------- */
function vTeam() {
  const win = Number(S.team), end = addDays(TODAY, win);
  return `<div class="head"><div><h1>Team Progress</h1><p>Where everyone is, without a phone call.</p></div>
   <div class="seg" role="group" aria-label="Window">${[["30", "Next 30 days"], ["90", "Next 90 days"], ["365", "Whole year"]].map(([k, l]) => `<button data-teamwin="${k}" aria-pressed="${S.team === k}">${l}</button>`).join("")}</div></div>
  <div class="pgrid">${S.people.map(p => {
    const all = myTasks(p.key), L = all.filter(t => t.due <= end && (isOpen(t) || (t.done_at || t.due) >= addDays(TODAY, -30)));
    const done = L.filter(t => !isOpen(t)).length, open = L.filter(isOpen).length, late = all.filter(isLate).length, pct = L.length ? Math.round(done / L.length * 100) : 0;
    const working = all.filter(t => ["progress", "waiting"].includes(t.status)).slice(0, 2), next = all.filter(t => isOpen(t) && t.status === "todo").sort((a, b) => a.due.localeCompare(b.due)).slice(0, 2);
    const ctx = t => { const s = SID[t.session_id] || {}; return s.kind === "report" ? s.short + " report" : (FAM_LABEL[s.family] || s.programme) + " · " + (s.short || ""); };
    return `<section class="card person" id="tp-${p.key}"><div class="top2">${av(p.key, "lg")}<div><h3>${esc(p.name)}</h3><div class="ti">${esc(p.title)}</div></div></div>
     <div class="stats3"><div><b>${done}</b><span>Done</span></div><div><b>${open}</b><span>Open</span></div><div><b style="${late ? "color:var(--red)" : ""}">${late}</b><span>Overdue</span></div></div>
     <div style="display:flex;align-items:center;gap:10px"><span class="prog ${progTone(pct, L)}" style="max-width:none"><i style="width:${pct}%"></i></span><span class="pct">${pct}%</span></div>
     ${working.length ? `<div><div class="label">Working on</div><div class="mini">${working.map(t => `<div><span class="dot" style="--c:${t.status === "waiting" ? "#E59A1A" : "#5B8FD6"}"></span><span>${esc(t.title)} <span class="muted">· ${esc(ctx(t))}</span></span></div>`).join("")}</div></div>` : ""}
     <div><div class="label">Next up</div><div class="mini">${next.map(t => `<div><span class="dot" style="--c:${isLate(t) ? "var(--red)" : "#CBD5E1"}"></span><span>${esc(t.title)} <span class="muted">· ${esc(ctx(t))} · ${fmt(t.due)}</span></span></div>`).join("") || '<span class="muted">Nothing scheduled.</span>'}</div></div></section>`;
  }).join("")}</div>`;
}

/* ---------- Workflows ---------- */
const whenText = (o, a) => o === 0 ? (a === "end" ? "Last day" : "On the day") : o < 0 ? `${-o} days before` : `${o} days after`;
function vWorkflows() {
  const W = S.workflows, w = W.find(x => x.key === S.wf) || W[0], steps = S.steps.filter(st => st.workflow === w.key).sort((a, b) => a.off - b.off || a.sort - b.sort);
  const used = S.sessions.filter(s => s.workflow === w.key && s.kind !== "holiday").length;
  return `<div class="head"><div><h1>Workflows</h1><p>Reusable plans. Every session copies its workflow, with each task dated from the session and given to a named person.</p></div></div>
  <div class="grid" style="grid-template-columns:minmax(0,320px) minmax(0,1fr)">
   <div class="tlist">${W.map(x => { const n = S.steps.filter(st => st.workflow === x.key).length, u = S.sessions.filter(s => s.workflow === x.key && s.kind !== "holiday").length; return `<button class="titem" data-wf="${x.key}" aria-pressed="${x.key === w.key}"><span class="ic ${{ coaching: "blue", immersion: "violet", report: "green" }[x.key] || ""}">${ic("workflows")}</span><span><b>${esc(x.name)}</b><span>${plural(n, "step")} · used ${u} ${u === 1 ? "time" : "times"} in 2027</span></span></button>`; }).join("")}</div>
   <section class="card"><h2 class="ch">${esc(w.name)}</h2><p class="muted" style="margin:6px 0 16px">${esc(w.blurb)} Used by ${plural(used, "session")}.</p>
    <div class="tw"><table class="stack-sm"><thead><tr><th>When</th><th>Task</th><th>Owner</th><th>Approves</th>${isSup() ? "<th></th>" : ""}</tr></thead><tbody>${steps.map(st => `<tr><td style="white-space:nowrap" class="muted">${isSup() && S.open["st:" + w.key + st.key] ? `<input class="input sm" style="width:80px" type="number" id="off-${st.key}" value="${st.off}"> days` : whenText(st.off, st.anchor)}</td>
      <td><b style="font-weight:600">${esc(st.title)}</b>${st.phys ? '<div class="muted" style="font-size:12px">In-person sessions only</div>' : st.virt ? '<div class="muted" style="font-size:12px">Virtual sessions only</div>' : ""}</td>
      <td>${isSup() && S.open["st:" + w.key + st.key] ? `<select class="select sm" id="own-${st.key}">${S.people.map(p => `<option value="${p.key}" ${p.key === st.owner ? "selected" : ""}>${esc(p.short)}</option>`).join("")}</select>` : who(st.owner, "xs")}</td>
      <td>${st.approver ? esc(P(st.approver).short) : '<span class="muted">—</span>'}</td>
      ${isSup() ? `<td style="white-space:nowrap">${S.open["st:" + w.key + st.key] ? `<button class="btn sm red" data-savestep="${st.key}">Save</button>` : `<button class="btn sm" data-editstep="${st.key}">Edit</button>`}</td>` : ""}</tr>`).join("")}</tbody></table></div>
    ${isSup() ? '<p class="muted" style="font-size:12.5px;margin-top:12px">Changing a step updates every open task that uses it. Done tasks are left alone.</p>' : ""}</section></div>`;
}

/* ---------- Weekly brief ---------- */
function briefData(k, from = TODAY) {
  const O = myTasks(k).filter(isOpen).sort((a, b) => a.due.localeCompare(b.due));
  const appr = k === "gordon" || S.tasks.some(t => t.approver === k) ? S.tasks.filter(t => t.approver === k && isOpen(t) && diff(t.due, from) <= 13) : [];
  return { over: O.filter(t => t.due < from), week: O.filter(t => t.due >= from && diff(t.due, from) <= 6), next: O.filter(t => diff(t.due, from) > 6 && diff(t.due, from) <= 13), appr };
}
function briefText(k) {
  const B = briefData(k), p = P(k), line = t => `• ${fmtW(t.due)} — ${t.title} (${(SID[t.session_id] || {}).programme || ""} · ${(SID[t.session_id] || {}).short || ""})`;
  const out = [`Good morning ${p.short},`, "", `Your week from ${fmtL(TODAY)}.`];
  if (B.over.length) out.push("", `OVERDUE (${B.over.length})`, ...B.over.map(line));
  out.push("", B.week.length ? `DUE THIS WEEK (${B.week.length})` : "Nothing due this week.", ...B.week.map(line));
  if (B.next.length) out.push("", `NEXT WEEK (${B.next.length})`, ...B.next.map(line));
  if (B.appr.length) out.push("", `FOR YOUR APPROVAL (${B.appr.length})`, ...B.appr.map(line));
  out.push("", `Update your tasks in the Hub: ${location.origin}`);
  return out.join("\n");
}
function vBrief() {
  const k = isSup() ? (S.briefFor || S.me) : S.me, p = P(k), B = briefData(k), text = briefText(k);
  const sec = (title, L, tone) => L.length ? `<div style="margin-top:16px"><div class="label" style="color:${tone || "var(--mute)"}">${title} · ${L.length}</div>${L.map(t => `<div class="trow" style="grid-template-columns:90px minmax(0,1fr) auto"><span class="muted" style="font-size:13px">${fmtW(t.due)}</span><span>${esc(t.title)} <span class="muted">· ${esc((SID[t.session_id] || {}).short || "")}</span></span>${t.owner !== k ? who(t.owner, "xs") : ""}</div>`).join("")}</div>` : "";
  return `<div class="head"><div><h1>Weekly brief</h1><p>Every Monday at 6am the Hub writes this for each person.</p></div></div>
  ${isSup() ? `<div class="toolbar"><div class="chips">${S.people.map(x => `<button class="chip" data-brief="${x.key}" aria-pressed="${x.key === k}">${av(x.key, "xs")}${esc(x.short)}</button>`).join("")}</div></div>` : ""}
  <div class="grid g-main"><section class="card"><div style="display:flex;gap:14px;align-items:center">${av(k, "lg")}<div><h2 class="ch">${esc(p.short)} · week of ${fmtL(TODAY)}</h2><p class="muted">${plural(B.over.length, "overdue")} · ${B.week.length} this week · ${B.next.length} next week</p></div></div>
    ${sec("Overdue", B.over, "var(--red)")}${sec("Due this week", B.week)}${sec("Next week", B.next)}${sec("For approval", B.appr)}
    ${!B.over.length && !B.week.length && !B.next.length && !B.appr.length ? '<p class="empty">Nothing due in the next two weeks.</p>' : ""}</section>
   <section class="card"><h2 class="ch" style="margin-bottom:10px">Send it</h2><textarea class="letter" id="brieftext" readonly style="min-height:260px">${esc(text)}</textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-copyid="brieftext">${ic("copy")} Copy</button><a class="btn" href="mailto:${esc(p.email)}?subject=${encodeURIComponent("Your week · " + fmtL(TODAY))}&body=${encodeURIComponent(text)}">${ic("mail")} Email</a><a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${ic("wa")} WhatsApp</a></div></section></div>`;
}
