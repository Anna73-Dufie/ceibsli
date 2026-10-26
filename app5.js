"use strict";

/* ============ Admin ============ */
function vAdmin() {
  if (!isAdmin()) return vOverview();
  return `<p class="kicker">Administration</p><h1 class="page">People and access</h1><p class="dek">Invite colleagues with their email address and a temporary password. They choose their own password at first sign-in. Only people listed here can open the Hub.</p>
  <h2 class="sec">Team roster</h2><p class="muted" style="margin:0 0 10px">Who sits in each team. Add an email so the Hub links the person when they are invited.</p>
  <div class="tw" style="margin-bottom:26px"><table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Email</th><th></th></tr></thead><tbody>${S.roster.map(r => `<tr><td><input class="input" data-ro="${r.id}" data-f="full_name" value="${esc(r.full_name)}" aria-label="Name"></td><td><select class="select" data-ro="${r.id}" data-f="team" aria-label="Team">${Object.keys(TEAMS).map(k => `<option value="${k}" ${k === r.team ? "selected" : ""}>${TEAMS[k].name}</option>`).join("")}</select></td><td><select class="select" data-ro="${r.id}" data-f="role" aria-label="Role">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === r.role ? "selected" : ""}>${v}</option>`).join("")}</select></td><td><input class="input" data-ro="${r.id}" data-f="email" value="${esc(r.email || "")}" placeholder="email" aria-label="Email"></td><td style="white-space:nowrap">${r.member_id ? '<span class="tag done">Signed up</span>' : `<button class="btn sm" data-prefill="${r.id}">Invite</button>`} <button class="btn ghost sm" data-rodel="${r.id}">Remove</button></td></tr>`).join("")}</tbody></table></div><p><button class="btn sm" data-roadd="1">Add a person to the roster</button></p>
  <h2 class="sec" style="margin-top:26px">Accounts</h2>
  <div class="cols"><section><div class="tw"><table><thead><tr><th>Person</th><th>Role</th><th></th></tr></thead><tbody>${S.members.map(m => `<tr><td><b>${esc(m.full_name || "—")}</b><div class="is">${esc(m.email)}${m.is_admin ? " · Admin" : ""}</div></td><td><label class="sr" for="r-${m.id}">Role</label><select class="select" id="r-${m.id}" data-role="${m.id}">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === m.role ? "selected" : ""}>${v}</option>`).join("")}</select></td><td style="white-space:nowrap">${m.id === S.me.id ? '<span class="muted">You</span>' : `<button class="btn sm" data-reset="${m.id}">Reset password</button> <button class="btn ghost sm" data-remove="${m.id}">Remove</button>`}</td></tr>`).join("")}</tbody></table></div><div id="teammsg" class="callout info" hidden></div></section>
  <aside><h2 class="sec">Invite someone</h2><form id="invite"><div class="field"><label for="iname">Full name</label><input class="input" id="iname" required></div><div class="field"><label for="iemail">Email</label><input class="input" id="iemail" type="email" required></div>
   <div class="field"><label for="irole">Role</label><select class="select" id="irole">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
   <div class="field"><label for="ipw">Temporary password</label><input class="input" id="ipw" value="${tempPw()}"></div>
   <label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="iadm"> Make them an administrator</label>
   <div class="err" id="ierr"></div><button class="btn primary block" type="submit">Invite</button></form></aside></div>`;
}
function tempPw() { const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; let s = "Hub-"; const r = crypto.getRandomValues(new Uint32Array(10)); for (const x of r) s += a[x % a.length]; return s; }

/* ============ session sheet ============ */
const PHASES = [["Set-up · more than a month out", -9999, -31], ["Final month", -30, -8], ["Session week", -7, -1], ["Delivery", 0, 0], ["Close-out", 1, 9999]];
function openSheet(id, mode = "view") { S.sheet = id; S.sheetMode = mode; renderSheet(); }
function closeSheet() { S.sheet = null; $("#sheet").innerHTML = ""; }
function renderSheet() {
  const root = $("#sheet");
  if (S.sheet === "new") return root.innerHTML = sheetWrap("New session", "Add a session", sessionForm({}), "");
  const s = SID[S.sheet]; if (!s) return closeSheet();
  if (S.sheetMode === "edit") return root.innerHTML = sheetWrap(s.programme, "Edit session", sessionForm(s), "");
  const L = S.tasks.filter(t => t.session_id === s.id).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const rel = t => diff(t.due_date, s.start_date) < 0 ? diff(t.due_date, s.start_date) : diff(t.due_date, s.end_date) > 0 ? diff(t.due_date, s.end_date) : 0;
  const fac = facultyIn(s.faculty);
  const body = `${s.note ? `<div class="callout"><b>Check the source:</b> ${esc(s.note)}</div>` : ""}
   <dl class="facts"><div><dt>Programme</dt><dd>${esc(s.programme)}</dd></div><div><dt>Type</dt><dd>${esc(s.type)}${s.csp ? " · client" : ""}</dd></div><div><dt>Format</dt><dd>${esc(s.mode)}</dd></div><div><dt>Time</dt><dd>${esc(s.time_text || "TBC")}</dd></div><div><dt>Location</dt><dd>${esc(s.location)}</dd></div><div><dt>Participants</dt><dd>${esc(s.participants)}</dd></div>
   <div style="grid-column:1/-1"><dt>Faculty</dt><dd>${fac.length ? fac.map(n => `<button class="link" data-person="${esc(n)}">${esc(n)}</button>`).join(", ") : esc(s.faculty)}</dd></div></dl>
   ${isHol(s) ? '<p class="muted">Public holiday or closure.</p>' : `${teamStrip(L)}<div class="toolbar"><span class="tag done">${L.filter(done).length} of ${L.length} done</span><span class="sp"></span><button class="btn sm" data-edits="1">Edit session</button>${isAdmin() ? `<button class="btn ghost sm" data-delsession="${s.id}">Delete</button>` : ""}</div>
   ${PHASES.map(([n, lo, hi]) => { const ts = L.filter(t => { const r = rel(t); return r >= lo && r <= hi; }); return ts.length ? `<div class="phase"><h4><span>${n}</span><span class="mono">${ts.length}</span></h4>${ts.map(t => taskRow(t, false, true)).join("")}</div>` : ""; }).join("")}
   <div class="phase"><h4><span>Add a task to this session</span></h4><form id="addtask" class="formgrid"><div class="field full"><label for="at">Task</label><input class="input" id="at" required placeholder="e.g. Book interpreter for day two"></div>
    <div class="field"><label for="ad">Due date</label><input class="input" type="date" id="ad" value="${addDays(s.start_date, -7)}" required></div><div class="field"><label for="ao">Responsible</label><select class="select" id="ao">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === S.me.role ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="ac">Calendar</label><select class="select" id="ac"><option>Team</option><option>Coordinator</option></select></div><div class="field" style="justify-content:flex-end"><button class="btn primary" type="submit">Add task</button></div></form></div>`}`;
  root.innerHTML = sheetWrap(`<span class="dot" style="--c:${famC(s.family)}"></span>${esc(s.programme)}`, esc(sName(s)), body, `${fmtY(s.start_date)}${s.end_date !== s.start_date ? " – " + fmtY(s.end_date) : ""}`);
  const f = $("#addtask"); if (f) f.onsubmit = async e => {
    e.preventDefault(); const row = { id: `${s.id}_u${Date.now().toString(36)}`, session_id: s.id, step_key: "custom", title: $("#at").value.trim(), category: "Added", owner_role: $("#ao").value, calendar: $("#ac").value, due_date: $("#ad").value, custom: true };
    if (!row.title) return; const { data, error } = await sb.from("tasks").insert(row).select().single();
    if (error) return toast("Could not add: " + error.message); if (!S.tasks.some(t => t.id === data.id)) S.tasks.push(data); toast("Task added"); render(); renderSheet();
  };
}
function sheetWrap(kicker, title, body, sub) {
  return `<div class="scrim" data-close="1"></div><aside class="panel" role="dialog" aria-modal="true" aria-labelledby="pt"><div class="panel-h"><div style="min-width:0"><p class="kicker" style="margin:0">${kicker}</p><h2 id="pt">${title}</h2>${sub ? `<div class="mono muted">${sub}</div>` : ""}</div><button class="x" data-close="1" aria-label="Close">×</button></div><div class="panel-b">${body}</div></aside>`;
}
function sessionForm(s) {
  const progs = [...new Set(sess().map(x => x.programme))].sort();
  const v = (k, d = "") => esc(s[k] ?? d);
  return `<form id="sform" class="formgrid">
   <div class="field full"><label for="f-programme">Programme</label><input class="input" id="f-programme" list="plist" value="${v("programme")}" required placeholder="e.g. WELA 2027 · Accra"><datalist id="plist">${progs.map(p => `<option value="${esc(p)}">`).join("")}</datalist></div>
   <div class="field"><label for="f-title">Class or audience</label><input class="input" id="f-title" value="${v("title")}" required placeholder="e.g. WELA-2027 Accra"></div>
   <div class="field"><label for="f-topic">Topic or module</label><input class="input" id="f-topic" value="${v("topic")}" placeholder="e.g. Entrepreneurial Finance"></div>
   <div class="field"><label for="f-type">Type</label><select class="select" id="f-type">${TYPES.map(t => `<option ${t === (s.type || "Module") ? "selected" : ""}>${t}</option>`).join("")}</select></div>
   <div class="field"><label for="f-mode">Format</label><select class="select" id="f-mode">${MODES.map(t => `<option ${t === (s.mode || "In-person") ? "selected" : ""}>${t}</option>`).join("")}</select></div>
   <div class="field"><label for="f-start">Start date</label><input class="input" type="date" id="f-start" value="${v("start_date")}" required></div>
   <div class="field"><label for="f-end">End date</label><input class="input" type="date" id="f-end" value="${v("end_date")}" required></div>
   <div class="field"><label for="f-time">Time</label><input class="input" id="f-time" value="${v("time_text")}" placeholder="9:00 AM – 5:00 PM"></div>
   <div class="field"><label for="f-loc">Location</label><input class="input" id="f-loc" value="${v("location", "Accra, Ghana")}"></div>
   <div class="field"><label for="f-fac">Faculty</label><input class="input" id="f-fac" value="${v("faculty", "TBC")}" list="flist"><datalist id="flist">${S.faculty.map(f => `<option value="${esc(f.name)}">`).join("")}</datalist></div>
   <div class="field"><label for="f-pax">Participants</label><input class="input" id="f-pax" value="${v("participants", "TBC")}"></div>
   <div class="field"><label for="f-fam">Programme line</label><select class="select" id="f-fam">${["WELA", "WELA Scale", "AMP", "AMP-TP", "ODP", "CASCOTEM", "GEMBA", "EMBA", "MBA", "Joint", "Alumni", "Other"].map(t => `<option ${t === (s.family || "Other") ? "selected" : ""}>${t}</option>`).join("")}</select></div>
   <label class="field" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="f-csp" ${s.csp ? "checked" : ""}> Client programme (CSP)</label>
   <div class="callout info full">${s.id ? "Changing the dates, format, location or faculty rebuilds this session's open checklist tasks. Done tasks and tasks people added by hand are kept." : "The Hub builds the full checklist as soon as you save: faculty letter, Canvas, fees, catering, printing, travel and reminders, each dated and assigned to a team."}</div>
   <div class="err full" id="serr"></div>
   <div class="full" style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" type="button" data-close="${s.id ? "" : "1"}" ${s.id ? 'data-viewsheet="1"' : ""}>Cancel</button><button class="btn primary" type="submit">${s.id ? "Save changes" : "Create session and checklist"}</button></div></form>`;
}
async function saveSession(e) {
  e.preventDefault(); const s = S.sheet !== "new" ? SID[S.sheet] : null;
  const row = { programme: $("#f-programme").value.trim(), title: $("#f-title").value.trim(), topic: $("#f-topic").value.trim(), type: $("#f-type").value, mode: $("#f-mode").value,
    start_date: $("#f-start").value, end_date: $("#f-end").value || $("#f-start").value, time_text: $("#f-time").value.trim(), location: $("#f-loc").value.trim() || "TBC",
    faculty: $("#f-fac").value.trim() || "TBC", participants: $("#f-pax").value.trim() || "TBC", family: $("#f-fam").value, csp: $("#f-csp").checked };
  if (!row.programme || !row.title || !row.start_date) return $("#serr").textContent = "Programme, class and start date are needed.";
  if (row.end_date < row.start_date) return $("#serr").textContent = "The end date is before the start date.";
  if (s) {
    const { error } = await sb.from("sessions").update(row).eq("id", s.id); if (error) return $("#serr").textContent = error.message;
    Object.assign(s, row); await refreshTasks(s.id); toast("Session updated; checklist refreshed"); S.sheetMode = "view";
  } else {
    row.id = "U" + Date.now().toString(36).toUpperCase(); row.created_by = S.me.id;
    const { data, error } = await sb.from("sessions").insert(row).select().single(); if (error) return $("#serr").textContent = error.message;
    if (!S.sessions.some(x => x.id === data.id)) S.sessions.push(data); SID = byS(); await refreshTasks(data.id); S.sheet = data.id; S.sheetMode = "view"; toast("Session created with its checklist");
  }
  render(); renderSheet();
}
async function refreshTasks(sid) { const { data } = await sb.from("tasks").select("*").eq("session_id", sid); S.tasks = S.tasks.filter(t => t.session_id !== sid).concat(data || []); }

/* ============ events ============ */
function after() {
  const pq = $("#pq"); if (pq) pq.oninput = () => { S.q = pq.value; const p = pq.selectionStart; render(); const n = $("#pq"); n.focus(); n.setSelectionRange(p, p); };
  const tq = $("#tq"); if (tq) tq.oninput = () => { S.q = tq.value; const p = tq.selectionStart; render(); const n = $("#tq"); n.focus(); n.setSelectionRange(p, p); };
  const who = $("#who"); if (who) who.onchange = () => { S.tWho = who.value; render(); };
  const mf = $("#meform"); if (mf) mf.onsubmit = async e => { e.preventDefault(); const n = $("#mn").value.trim(); const { error } = await sb.from("members").update({ full_name: n }).eq("id", S.me.id); if (error) return toast(error.message); S.me.full_name = n; const m = S.members.find(x => x.id === S.me.id); if (m) m.full_name = n; toast("Name saved"); render(); };
  const pf = $("#pwform"); if (pf) pf.onsubmit = async e => { e.preventDefault(); const p = $("#np").value; if (p.length < 10) return $("#pwerr").textContent = "Use at least 10 characters."; const { error } = await sb.auth.updateUser({ password: p }); if (error) return $("#pwerr").textContent = error.message; $("#np").value = ""; $("#pwerr").textContent = ""; toast("Password changed"); };
  const so = $("#signout"); if (so) so.onclick = () => sb.auth.signOut();
  const inv = $("#invite"); if (inv) inv.onsubmit = async e => {
    e.preventDefault(); const em = $("#iemail").value.trim(), nm = $("#iname").value.trim(), pw = $("#ipw").value;
    if (!em || !nm) return $("#ierr").textContent = "Name and email are needed.";
    const { error } = await sb.rpc("admin_add_member", { p_email: em, p_name: nm, p_role: $("#irole").value, p_password: pw, p_admin: $("#iadm").checked });
    if (error) return $("#ierr").textContent = error.message;
    const { data } = await sb.from("members").select("id,email,full_name,role,is_admin,created_at").order("created_at"); S.members = data || S.members; render();
    const box = $("#teammsg"); box.hidden = false; box.innerHTML = `<b>${esc(nm)} can now sign in.</b> Send them:<br>Link: ${esc(location.origin)}<br>Email: ${esc(em)}<br>Temporary password: <span class="mono">${esc(pw)}</span><br><button class="btn sm" style="margin-top:8px" data-copyinv="1">Copy invitation</button>`;
    box.dataset.text = `Hi ${nm.split(" ")[0]},\n\nYou now have access to the CEIBS Africa Programme Hub.\n\nOpen: ${location.origin}\nEmail: ${em}\nTemporary password: ${pw}\n\nYou'll choose your own password when you first sign in. On your phone, open the link in Safari or Chrome and use "Add to Home Screen".\n\n${S.me.full_name || ""}`;
  };
}
document.addEventListener("click", async e => {
  const t = e.target.closest("[data-view],[data-session],[data-pgm],[data-person],[data-month],[data-layer],[data-range],[data-ptab],[data-lf],[data-close],[data-open],[data-new],[data-edits],[data-viewsheet],[data-na],[data-del],[data-delsession],[data-copy],[data-copytext],[data-copyinv],[data-sent],[data-reset],[data-remove],[data-nav],[data-team],[data-bteam],[data-year],[data-cal],[data-prefill],[data-rodel],[data-roadd]");
  if (!t) return; const d = t.dataset;
  if (d.close === "1") { closeSheet(); return; }
  if (d.nav !== undefined) { S.nav = d.nav === "1" ? !S.nav : false; render(); return; }
  if (d.view) { e.preventDefault(); if (d.range) S.tRange = d.range; if (d.lf) S.lf = d.lf; if (d.bteam) S.bteam = d.bteam; closeSheet(); go(d.view); }
  else if (d.team) { closeSheet(); S.team = d.team; if (S.view !== "teams") go("teams"); else render(); }
  else if (d.bteam) { S.bteam = d.bteam; render(); }
  else if (d.year) { S.year = d.year; render(); }
  else if (d.cal) { S.month = d.cal; go("calendar"); }
  else if (d.prefill) { const r = S.roster.find(x => x.id === Number(d.prefill)); $("#iname").value = r.full_name; $("#iemail").value = r.email || ""; $("#irole").value = r.role; $("#iemail").focus(); $("#iemail").scrollIntoView({ block: "center" }); }
  else if (d.rodel) { if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Tap again"; return; } const { error } = await sb.from("roster").delete().eq("id", Number(d.rodel)); if (error) return toast(error.message); S.roster = S.roster.filter(x => x.id !== Number(d.rodel)); render(); }
  else if (d.roadd) { const { data, error } = await sb.from("roster").insert({ full_name: "New person", team: "PROG", role: "ADM", title: "", sort: S.roster.length + 1 }).select().single(); if (error) return toast(error.message); S.roster.push(data); render(); }
  else if (d.session) { openSheet(d.session); }
  else if (d.pgm !== undefined) { closeSheet(); S.pgm = d.pgm || null; S.view = "programmes"; render(); window.scrollTo(0, 0); }
  else if (d.person !== undefined) { closeSheet(); S.person = d.person || null; S.view = "people"; S.ptab = "faculty"; S.q = ""; render(); window.scrollTo(0, 0); }
  else if (d.month) { if (d.month === "0") S.month = TODAY.slice(0, 7); else { const [y, m] = S.month.split("-").map(Number); S.month = iso(new Date(y, m - 1 + Number(d.month), 1)).slice(0, 7); } render(); }
  else if (d.layer) { S.layers[d.layer] = !S.layers[d.layer]; render(); }
  else if (d.range) { S.tRange = d.range; render(); }
  else if (d.ptab) { S.ptab = d.ptab; S.q = ""; render(); }
  else if (d.lf) { S.lf = d.lf; render(); }
  else if (d.open) { S.open[d.open] = !S.open[d.open]; render(); if (S.sheet) renderSheet(); }
  else if (d.new) { openSheet("new"); }
  else if (d.edits) { S.sheetMode = "edit"; renderSheet(); }
  else if (d.viewsheet) { S.sheetMode = "view"; renderSheet(); }
  else if (d.na) { const tk = S.tasks.find(x => x.id === d.na); S.open[d.na] = false; updateTask(d.na, { status: tk.status === "na" ? "open" : "na" }, "Updated"); }
  else if (d.del) { const { error } = await sb.from("tasks").delete().eq("id", d.del); if (error) return toast(error.message); S.tasks = S.tasks.filter(x => x.id !== d.del); toast("Task deleted"); render(); if (S.sheet) renderSheet(); }
  else if (d.delsession) { if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Tap again to delete session and its tasks"; return; } const { error } = await sb.from("sessions").delete().eq("id", d.delsession); if (error) return toast(error.message); S.sessions = S.sessions.filter(x => x.id !== d.delsession); S.tasks = S.tasks.filter(x => x.session_id !== d.delsession); SID = byS(); closeSheet(); render(); toast("Session deleted"); }
  else if (d.copy || d.copytext || d.copyinv) { const txt = d.copyinv ? $("#teammsg").dataset.text : (d.copy ? $("#L-" + CSS.escape(d.copy)) : $("#" + d.copytext)).textContent; try { await navigator.clipboard.writeText(txt); toast("Copied"); } catch (_) { toast("Select the text and copy it"); } }
  else if (d.sent) { const tk = S.tasks.find(x => x.id === d.sent); updateTask(d.sent, { notes: (tk.notes ? tk.notes + "\n" : "") + `Letter sent ${fmtY(TODAY)}` }, "Noted as sent"); }
  else if (d.reset) { const pw = tempPw(); const { error } = await sb.rpc("admin_reset_password", { p_member: d.reset, p_password: pw }); if (error) return toast(error.message); const m = S.members.find(x => x.id === d.reset); const box = $("#teammsg"); box.hidden = false; box.innerHTML = `Password for <b>${esc(m.full_name || m.email)}</b> reset to <span class="mono">${esc(pw)}</span>. They'll choose a new one at sign-in.`; }
  else if (d.remove) { if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Tap again to remove"; return; } const { error } = await sb.rpc("admin_remove_member", { p_member: d.remove }); if (error) return toast(error.message); S.members = S.members.filter(x => x.id !== d.remove); render(); toast("Removed"); }
});
document.addEventListener("change", async e => {
  const c = e.target.closest("[data-done]"); if (c) return updateTask(c.dataset.done, { status: c.checked ? "done" : "open" }, c.checked ? "Done" : "Reopened");
  const r = e.target.closest("[data-role]"); if (r) { const { error } = await sb.from("members").update({ role: r.value }).eq("id", r.dataset.role); if (error) return toast(error.message); const m = S.members.find(x => x.id === r.dataset.role); m.role = r.value; if (m.id === S.me.id) S.me.role = r.value; toast("Role updated"); render(); return; }
  const ro = e.target.closest("[data-ro]"); if (ro) { const v = ro.value.trim(); const patch = { [ro.dataset.f]: ro.dataset.f === "email" ? (v || null) : v }; if (ro.dataset.f === "role") patch.title = ROLES[v]; const { error } = await sb.from("roster").update(patch).eq("id", Number(ro.dataset.ro)); if (error) return toast(error.message); Object.assign(S.roster.find(x => x.id === Number(ro.dataset.ro)), patch); toast("Saved"); if (ro.dataset.f !== "full_name" && ro.dataset.f !== "email") render(); return; }
  const sp = e.target.closest("[data-sup]"); if (sp) { const { error } = await sb.from("suppliers").update({ [sp.dataset.f]: sp.value.trim() }).eq("key", sp.dataset.sup); if (error) return toast(error.message); const x = S.suppliers.find(y => y.key === sp.dataset.sup); x[sp.dataset.f] = sp.value.trim(); toast("Saved"); }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-edit]");
  if (f) { e.preventDefault(); const id = f.dataset.edit, fd = new FormData(f); S.open[id] = false; updateTask(id, { due_date: fd.get("due_date"), owner_role: fd.get("owner_role"), calendar: fd.get("calendar"), notes: String(fd.get("notes") || "").trim() }, "Saved"); return; }
  if (e.target.id === "sform") saveSession(e);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && S.sheet) closeSheet();
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-open][role=button]")) { e.preventDefault(); e.target.click(); }
});
boot();
