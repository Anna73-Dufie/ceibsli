"use strict";

/* ============ Letters ============ */
function letters(t) {
  const s = SID[t.session_id]; if (!s) return [];
  const when = `${fmtY(s.start_date)}${s.end_date !== s.start_date ? " – " + fmtY(s.end_date) : ""}`, where = s.mode === "Virtual" ? "online (Zoom)" : s.location, name = sName(s), k = t.step_key;
  const sign = `\n\nKind regards,\n${S.me.full_name || "Programme Office"}\n${ROLES[S.me.role]}, CEIBS Africa`;
  const out = [];
  for (const who of t.notify) {
    let to = EXT[who], subj = "", body = "";
    if (who === "FAC") {
      const fac = facultyIn(s.faculty); to = fac.join(", ") || "Faculty (TBC)";
      const g = fac.length ? `Dear ${fac.map(n => n.replace(/ Esq\.$/, "")).join(" and ")},` : "Dear colleague,";
      const M = { fac: [`Invitation to teach: ${name}`, `${g}\n\nWe would be delighted to have you lead "${name}" for ${s.title} on ${when}, ${s.time_text || "time to be confirmed"}, ${where}.\n\nPlease confirm your availability and we will send the session brief and contract.`],
        slides: [`Slides and materials for ${name}`, `${g}\n\nAhead of "${name}" on ${when}, could you share your slides, readings and any case materials by ${fmtY(addDays(t.due_date, 5))}? This gives us time to print workbooks and prepare the participant pack.`],
        brief: [`Arrangements for ${name}, ${fmt(s.start_date)}`, `${g}\n\nHere are the arrangements for "${name}":\n— Date: ${when}\n— Time: ${s.time_text || "to be confirmed"}\n— Venue: ${where}\n— Participants: ${s.participants}\n\nPlease let us know your AV needs and travel details.`],
        remind: [`See you on ${fmtW(s.start_date)}`, `${g}\n\nA reminder that "${name}" begins on ${fmtW(s.start_date)} at ${s.time_text || "the scheduled time"}, ${where}. The room and materials will be ready for you.`],
        test: [`Zoom test before ${name}`, `${g}\n\nCould we run a short Zoom test the day before "${name}"? We will send the link and host details.`],
        coach: [`Coaching sessions: ${s.title}`, `${g}\n\nWe would like to confirm the coaching slots for ${s.title} from ${when}. Please share the times that suit you.`],
        letter: [`Invitation to teach on ${s.title}`, `${g}\n\nOn behalf of CEIBS Africa, I am delighted to invite you to teach "${name}" on ${s.title}, scheduled for ${when}, ${where}.\n\nPlease confirm your availability by ${fmtY(addDays(t.due_date, 7))}. On confirmation we will share the session brief, course outline template and contract.`],
        outline: [`Course outline and readings for ${name}`, `${g}\n\nAhead of "${name}" (${when}), could you share the course outline and reading list by ${fmtY(addDays(t.due_date, 5))}? We upload materials to Canvas ten days before the session so participants can prepare.`],
        guests: [`Invitation: ${name}`, `${g}\n\nWe would be honoured to have you at "${name}" on ${when}, ${where}. Please confirm your availability.`] }[k] || [name, `${g}\n\nAn update on "${name}", ${when}.`];
      [subj, body] = M;
    } else if (who === "PAX") {
      to = `Participants · ${s.title}${paxN(s) ? ` (${paxN(s)})` : ""}`;
      const M = { fees: [`Fee reminder: ${s.title}`, `Dear participant,\n\nA reminder that fees for ${s.title} are due ahead of "${name}" on ${when}. Please settle the outstanding balance or share proof of payment with the Finance team.`],
        fees2: [`Final fee reminder: ${s.title}`, `Dear participant,\n\nOur records show an outstanding balance for ${s.title}. Please settle it before "${name}" on ${fmtW(s.start_date)} so your place is confirmed.`],
        canvas: [`Reading materials now on Canvas: ${name}`, `Dear participant,\n\nThe course outline and reading materials for "${name}" (${when}) are now on Canvas. Please read them before the session.`],
        join: [`Joining instructions: ${name}`, `Dear participant,\n\nWe look forward to welcoming you to "${name}" on ${when}.\n— Time: ${s.time_text || "to be confirmed"}\n— Venue: ${where}\n\nPre-reading is attached. Please arrive thirty minutes early for registration.`],
        remind: [`Reminder: ${name} on ${fmtW(s.start_date)}`, `Dear participant,\n\nA reminder that "${name}" begins on ${fmtW(s.start_date)} at ${s.time_text || "the scheduled time"}, ${where}.`],
        eval: [`Thank you, and your feedback on ${name}`, `Dear participant,\n\nThank you for taking part in "${name}". Please take three minutes to complete the evaluation. Session resources are attached.`] }[k] || [`${name}: update`, `Dear participant,\n\nAn update on "${name}" (${when}).`];
      [subj, body] = M;
    } else if (who === "CLIENT") {
      to = `Client · ${s.title}`; subj = k === "clientrep" ? `Programme report and invoice: ${name}` : k === "invoice" ? `Invoice for ${s.title}, ${fmt(s.start_date)}` : `Confirming nominations for ${name}`;
      body = `Dear client team,\n\n${k === "clientrep" ? `Please find the programme report and invoice for "${name}" (${when}).` : k === "invoice" ? `Please find the invoice for your booking on ${when}. A deposit secures the date.` : `Please confirm the names and roles of your nominated participants for "${name}" on ${when}.`}`;
    } else {
      const sup = S.suppliers.find(x => x.key === who); to = (sup && sup.supplier) ? `${sup.supplier} (${EXT[who]})` : EXT[who];
      subj = { CATER: `Catering order: ${name}, ${fmt(s.start_date)}`, PRINT: `Print job: ${name}`, TRAVEL: `Travel booking: ${city(s) || s.location}, ${fmt(s.start_date)}`, HANDLER: `${s.title}: ${t.title.toLowerCase()}` }[who] || name;
      body = { CATER: `Hello,\n\nPlease confirm catering for "${name}":\n— Dates: ${when}\n— Headcount: ${paxN(s) ? paxN(s) + " participants, plus faculty and staff" : "to follow"}\n— Service: morning tea, lunch, afternoon tea\n— Venue: ${s.location}\n\nPlease note any dietary options and send your invoice.`,
        PRINT: `Hello,\n\nWe will send print files for "${name}" (${when}): participant workbooks, name tents and an attendance register. Quantity: ${paxN(s) ? paxN(s) + 10 : "to follow"}. Please confirm turnaround.`,
        TRAVEL: `Hello,\n\nPlease quote flights and hotel for faculty and staff travelling to ${city(s)} for "${name}" (${when}).`,
        HANDLER: `Hello,\n\nRegarding ${s.title} (${when}): ${t.title}.` }[who] || "";
    }
    out.push({ id: `${t.id}_${who}`, t, s, who, to, subj, body: body + sign, send: t.due_date });
  }
  return out;
}
function vLetters() {
  let L = S.tasks.filter(t => live(t) && t.status === "open" && t.due_date >= addDays(TODAY, -7) && diff(t.due_date, TODAY) <= 30).flatMap(letters).sort((a, b) => a.send.localeCompare(b.send));
  const f = S.lf; L = L.filter(m => f === "all" || (f === "SUP" ? ["CATER", "PRINT", "TRAVEL", "HANDLER", "VENUE"].includes(m.who) : m.who === f));
  return `<p class="kicker">Correspondence</p><h1 class="page">Letters & reminders</h1><p class="dek">Faculty, participants, clients and vendors never log in. The programme office writes to them, and the Hub prepares each letter from the plan with the session details filled in. Review, copy, and send from Outlook.</p>
  <div class="toolbar"><div class="seg" role="group" aria-label="Audience">${[["all", "All"], ["FAC", "Faculty"], ["PAX", "Participants"], ["CLIENT", "Clients"], ["SUP", "Suppliers"]].map(([k, l]) => `<button data-lf="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div><span class="sp"></span><span class="muted">${L.length} in the next 30 days</span></div>
  ${L.slice(0, 40).map(m => `<article class="letter"><div class="lh"><span class="tag ${m.send < TODAY ? "over" : diff(m.send, TODAY) <= 7 ? "soon" : ""}">${m.send < TODAY ? "Late · " : ""}Send ${fmtW(m.send)}</span><span>To <b style="color:var(--ink)">${esc(m.to)}</b></span><button class="link" data-session="${m.s.id}">${esc(sName(m.s))}</button></div>
   <h4>${esc(m.subj)}</h4><pre id="L-${m.id}">${esc(m.body)}</pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-copy="${m.id}">Copy letter</button><a class="btn sm" href="mailto:?subject=${encodeURIComponent(m.subj)}&body=${encodeURIComponent(m.body)}">Open in email</a><button class="btn sm" data-sent="${m.t.id}">Mark sent</button></div></article>`).join("") || '<p class="empty">No letters due for this audience.</p>'}`;
}

/* ============ Activity ============ */
function vActivity() {
  const lbl = a => { if (a.entity === "task") { const t = S.tasks.find(x => x.id === a.entity_id); return t ? `<button class="link" data-session="${t.session_id}">${esc(t.title)}</button>` : esc(a.detail || a.entity_id); } const s = SID[a.entity_id]; return s ? `<button class="link" data-session="${s.id}">${esc(sFull(s))}</button>` : esc(a.entity_id); };
  return `<p class="kicker">Audit trail</p><h1 class="page">Activity</h1><p class="dek">Every change, who made it and when. Updates arrive live as colleagues work.</p>
  <ul class="feed">${S.activity.map(a => `<li><span class="mono muted">${new Date(a.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span><span><b>${esc(a.who_name || "Someone")}</b> ${esc(a.action)} ${a.entity === "session" ? "session " : ""}${lbl(a)}${a.detail && a.action !== "added" ? ` <span class="muted">(${esc(a.detail)})</span>` : ""}</span></li>`).join("") || '<li><span></span><span class="muted">No changes yet. Tick a task and it appears here.</span></li>'}</ul>`;
}

/* ============ Data check ============ */
function vCheck() {
  const hol = new Set(S.sessions.filter(isHol).flatMap(h => { const o = []; for (let d = h.start_date; d <= h.end_date; d = addDays(d, 1)) o.push(d); return o; }));
  const up = sess().filter(s => s.end_date >= TODAY);
  const clash = up.filter(s => { if (nDays(s) > 20) return false; for (let d = s.start_date; d <= s.end_date; d = addDays(d, 1)) if (hol.has(d)) return true; return false; });
  const fb = []; for (const a of up) for (const b of up) if (a.id < b.id && a.programme !== b.programme && nDays(a) < 20 && nDays(b) < 20 && a.start_date <= b.end_date && a.end_date >= b.start_date) for (const n of facultyIn(a.faculty)) if (facultyIn(b.faculty).includes(n)) fb.push([n, a, b]);
  const tbc = up.filter(s => /tbc/i.test(s.faculty) && ["Module", "Event"].includes(s.type)), notes = S.sessions.filter(s => s.note);
  return `<p class="kicker">Quality</p><h1 class="page">Data check</h1><p class="dek">The Hub is only as good as the calendar behind it. These entries need a decision or a correction.</p>
  <div class="cols even"><section><h2 class="sec">Clashes · ${clash.length + fb.length}</h2><table><tbody>${clash.map(s => `<tr><td class="mono" style="width:120px">${fmtY(s.start_date)}</td><td><button class="link" data-session="${s.id}">${esc(sFull(s))}</button><div class="is">Falls on a public holiday or the summer break</div></td></tr>`).join("")}${fb.map(([n, a, b]) => `<tr><td class="mono">${fmtY(b.start_date)}</td><td><b>${esc(n)}</b> is booked twice<div class="is"><button class="link" data-session="${a.id}">${esc(a.programme)}</button> and <button class="link" data-session="${b.id}">${esc(b.programme)}</button></div></td></tr>`).join("")}</tbody></table></section>
  <section><h2 class="sec">Faculty TBC · ${tbc.length}</h2><table><tbody>${tbc.map(s => { const t = S.tasks.find(x => x.session_id === s.id && x.step_key === "fac"); return `<tr><td><button class="link" data-session="${s.id}">${esc(sName(s))}</button><div class="is">${esc(s.programme)} · ${fmtY(s.start_date)}</div></td><td class="mono" style="${t && t.due_date < TODAY ? "color:var(--red)" : ""}">${t ? "secure by " + fmtY(t.due_date) : ""}</td></tr>`; }).join("")}</tbody></table></section></div>
  <h2 class="sec" style="margin-top:34px">Corrected from the source spreadsheet · ${notes.length}</h2><div class="tw"><table><thead><tr><th>Date used</th><th>Entry</th><th>Note</th></tr></thead><tbody>${notes.map(s => `<tr><td class="mono">${fmtY(s.start_date)}</td><td>${isHol(s) ? esc(s.title) : `<button class="link" data-session="${s.id}">${esc(sFull(s))}</button>`}</td><td>${esc(s.note)}</td></tr>`).join("")}</tbody></table></div>`;
}

/* ============ Playbooks ============ */
function vPlaybooks() {
  const G = {}; for (const p of S.playbook) (G[p.type] || (G[p.type] = [])).push(p);
  return `<p class="kicker">Rules</p><h1 class="page">Playbooks</h1><p class="dek">Each session type has a playbook of tasks counted back from the session date: the same workflow for module 1, module 2 and module 6, with only faculty, outline and materials changing. The Hub adjusts it automatically: virtual sessions drop catering and printing, sessions outside Accra add travel, client programmes add client steps, and faculty TBC moves sourcing earlier.</p>
  ${Object.entries(G).map(([k, R]) => `<h2 class="sec" style="margin-top:28px">${esc(k === "Module" ? "Teaching module" : k)}</h2><p class="muted" style="margin:0 0 10px">${R.length} steps · used by ${sess().filter(s => s.type === k).length} sessions</p><div class="tw"><table><thead><tr><th>When</th><th>Task</th><th>Team</th><th>Responsible</th><th>Approves</th><th>Calendar</th></tr></thead><tbody>${R.map(r => `<tr><td class="mono">${r.off === 0 ? "Day one" : r.off < 0 ? `${-r.off} days before` : `${r.off} days after`}</td><td>${esc(r.title)}</td><td><span class="tag tteam">${teamName(r.owner)}</span></td><td>${esc(roleName(r.owner))}</td><td>${esc(r.approver ? roleName(r.approver) : "—")}</td><td><span class="tag ${r.calendar === "Coordinator" ? "coord" : ""}">${r.calendar}</span></td></tr>`).join("")}</tbody></table></div>`).join("")}`;
}

/* ============ My account ============ */
function vMe() {
  const feed = `${SB_URL}/functions/v1/calendar?t=${S.me.cal_token}`, web = feed.replace(/^https:/, "webcal:");
  return `<p class="kicker">My account</p><h1 class="page">${esc(S.me.full_name || S.me.email)}</h1><p class="dek">${esc(TEAMS[teamOf(S.me.role)].name)} team · ${esc(ROLES[S.me.role])}${isAdmin() ? " · Administrator" : ""} · ${esc(S.me.email)}</p>
  <div class="cols even"><section><h2 class="sec">Reminders on your phone</h2><p class="muted">Subscribe once and your tasks appear in your own calendar, with an alert at 9am the day before and two days before. The calendar refreshes itself as the plan changes.</p>
   <ol class="steps"><li><b>iPhone or Mac:</b> <a href="${web}">tap to subscribe</a> and choose Subscribe.</li><li><b>Outlook (CEIBS or Office 365):</b> <a href="https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(feed)}&name=${encodeURIComponent("Programme Hub · " + ROLES[S.me.role])}" target="_blank" rel="noopener">open Outlook</a> and press Import.</li><li><b>Google Calendar or Android:</b> <a href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(web)}" target="_blank" rel="noopener">add to Google Calendar</a>.</li><li><b>Anything else:</b> copy this private link into "Subscribe to calendar".</li></ol>
   <div class="copybox" style="margin-top:12px"><span id="feed">${esc(feed)}</span><button class="btn sm" data-copytext="feed">Copy</button></div>
   <p class="muted" style="font-size:13px">This link is personal. Don't share it; anyone with it can see your task list.</p></section>
  <section><h2 class="sec">Your details</h2><form id="meform"><div class="field"><label for="mn">Name</label><input class="input" id="mn" value="${esc(S.me.full_name)}"></div><button class="btn" type="submit">Save name</button></form>
   <hr class="rule"><h2 class="sec">Change password</h2><form id="pwform"><div class="field"><label for="np">New password</label><input class="input" id="np" type="password" autocomplete="new-password"></div><div class="err" id="pwerr"></div><button class="btn" type="submit">Change password</button></form>
   <hr class="rule"><button class="btn" id="signout">Sign out</button></section></div>`;
}
