/* CEIBS Africa Programme Hub · events */
"use strict";
function after() { }
async function uploadPhoto(key, file) {
  if (!file) return;
  let img; try { img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); } catch (_) { return toast("That file isn't a photo the browser can read. Try a JPG or PNG."); }
  const n = 320, c = document.createElement("canvas"); c.width = c.height = n; const s = Math.min(img.width, img.height);
  c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, n, n);
  const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.85)), path = `${key}/${Date.now()}.jpg`;
  toast("Uploading photo…"); const up = await sb.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: false }); if (up.error) return toast("Photo not saved: " + up.error.message);
  const url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  const { error } = await sb.rpc("hub_set_photo", { p_key: key, p_url: url }); if (error) return toast(error.message);
  P(key).photo_url = url; toast("Photo saved"); render();
}
function parseImport(txt) {
  const rows = [], bad = [];
  for (const line of txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean)) {
    const c = line.includes("\t") ? line.split("\t") : line.split(",");
    if (/^name$/i.test((c[0] || "").trim())) continue;
    const [name, programme, email, phone, fee, paid, due] = c.map(x => (x || "").trim());
    if (!name) { bad.push(line); continue; }
    rows.push({ name, programme: programme || "", email: email || "", phone: phone || "", fee: Number(String(fee || 0).replace(/[^\d.]/g, "")) || 0, paid: Number(String(paid || 0).replace(/[^\d.]/g, "")) || 0, due_date: /^\d{4}-\d{2}-\d{2}$/.test(due || "") ? due : null });
  }
  return { rows, bad };
}
document.addEventListener("click", async e => {
  if (S.search && !e.target.closest(".search")) { S.search = ""; if (!e.target.closest("[data-session],[data-teamof]")) { render(); return; } }
  if (S.menu && !e.target.closest(".me")) { S.menu = false; render(); }
  if (e.target.closest("#signout,#signout2")) { await sb.auth.signOut(); return; }
  const t = e.target.closest("[data-nav],[data-menu],[data-view],[data-session],[data-teamof],[data-close],[data-viewsheet],[data-edit],[data-new],[data-delsession],[data-month],[data-fam],[data-calview],[data-pgm],[data-mod],[data-worktab],[data-addnote],[data-teamwin],[data-wf],[data-editstep],[data-savestep],[data-brief],[data-tpl],[data-copyid],[data-import],[data-doimport],[data-addstu],[data-ptab],[data-createacc],[data-resetacc],[data-pform],[data-suggest],[data-rmperson]");
  if (!t) return; const d = t.dataset;
  if (d.nav !== undefined) { S.nav = d.nav === "1" ? !S.nav : false; render(); return; }
  if (d.menu) { S.menu = !S.menu; render(); return; }
  if (d.view) { e.preventDefault(); if (d.ptab) S.ptab = d.ptab; if (d.bteam) S.briefFor = d.bteam; closeDrawer(); S.q = ""; go(d.view); return; }
  if (d.pgm !== undefined) { closeDrawer(); S.pgm = d.pgm || null; if (d.mod) S.mod = d.mod; if (S.view !== "programmes") { S.view = "programmes"; } render(); window.scrollTo(0, 0); return; }
  if (d.session) { S.search = ""; openDrawer(d.session); render(); return; }
  if (d.teamof) { S.search = ""; go("team"); setTimeout(() => { const n = document.getElementById("tp-" + d.teamof); if (n) n.scrollIntoView({ block: "center" }); }, 50); return; }
  if (d.close) { closeDrawer(); return; }
  if (d.viewsheet) { S.drawerMode = "view"; renderDrawer(); return; }
  if (d.edit) { openDrawer(d.edit, "edit"); return; }
  if (d.new) { openDrawer("new"); return; }
  if (d.delsession) { if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = `Tap again to delete it and its ${tasksOf(d.delsession).length} tasks`; t.classList.add("red"); t.style.color = "#fff"; return; } const { error } = await sb.from("hub_sessions").delete().eq("id", d.delsession); if (error) return toast(error.message); S.sessions = S.sessions.filter(x => x.id !== d.delsession); S.tasks = S.tasks.filter(x => x.session_id !== d.delsession); delete SID[d.delsession]; closeDrawer(); render(); toast("Session deleted"); return; }
  if (d.month) { S.month = Number(d.month); render(); return; }
  if (d.fam) { S.fam = d.fam; render(); return; }
  if (d.calview) { S.calView = d.calview; render(); return; }
  if (d.mod) { S.mod = d.mod; render(); return; }
  if (d.addnote) { S.open["n:" + d.addnote] = true; render(); const n = document.getElementById("n-" + d.addnote); if (n) n.focus(); return; }
  if (d.worktab) { S.workTab = d.worktab; render(); return; }
  if (d.teamwin) { S.team = d.teamwin; render(); return; }
  if (d.wf) { S.wf = d.wf; render(); return; }
  if (d.editstep) { S.open["st:" + S.wf + d.editstep] = true; render(); return; }
  if (d.savestep) {
    const k = d.savestep, off = Number($("#off-" + k).value), owner = $("#own-" + k).value;
    const { error } = await sb.from("hub_steps").update({ off, owner }).eq("workflow", S.wf).eq("key", k); if (error) return toast(error.message);
    Object.assign(S.steps.find(s => s.workflow === S.wf && s.key === k), { off, owner }); S.open["st:" + S.wf + k] = false; render();
    toast("Updating every open task…"); const r = await sb.rpc("hub_regen_workflow", { p_workflow: S.wf }); if (r.error) return toast(r.error.message);
    const { data } = await sb.from("hub_tasks").select("*").order("due").range(0, 4999); if (data) S.tasks = data; render(); toast("Workflow updated"); return;
  }
  if (d.brief) { S.briefFor = d.brief; render(); return; }
  if (d.tpl) { S.tpl = d.tpl; render(); return; }
  if (d.copyid) { const n = document.getElementById(d.copyid); try { await navigator.clipboard.writeText(n.value || n.textContent); toast("Copied"); } catch (_) { n.select && n.select(); toast("Select the text and copy it"); } return; }
  if (d.import !== undefined) { S.open.import = d.import === "1"; render(); return; }
  if (d.doimport) {
    const { rows, bad } = parseImport($("#imp").value); if (!rows.length) return $("#imperr").textContent = "Nothing to import. Check the columns.";
    const { data, error } = await sb.from("hub_students").insert(rows).select(); if (error) return $("#imperr").textContent = error.message;
    S.students = S.students.concat(data || []); S.open.import = false; render(); toast(`${rows.length} students imported${bad.length ? `, ${bad.length} lines skipped` : ""}`); return;
  }
  if (d.addstu !== undefined) { S.open.addstu = d.addstu === "1"; render(); return; }
  if (d.ptab) { S.ptab = d.ptab; S.q = ""; render(); return; }
  if (d.pform !== undefined) { S.pform = d.pform === "0" ? null : d.pform; render(); return; }
  if (d.suggest) { const x = SUGGEST[Number(d.suggest)]; $("#pf-name").value = x.name; $("#pf-short").value = x.short; $("#pf-title").value = x.title; $("#pf-email").value = x.email; $("#pf-does").value = x.does; $("#pf-fees").checked = x.fees; $("#pf-access").value = "member"; $("#pf-name").focus(); return; }
  if (d.rmperson) { if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Tap again to remove"; return; } const to = $("#pf-to") ? $("#pf-to").value : null, who = P(d.rmperson).short; const { data, error } = await sb.rpc("hub_remove_person", { p_key: d.rmperson, p_to: to }); if (error) return toast(error.message); if (data !== "removed") { $("#pferr").textContent = data; return; }
    if (to) { for (const x of S.tasks) { if (x.owner === d.rmperson) x.owner = to; if (x.approver === d.rmperson) x.approver = to; } for (const x of S.steps) { if (x.owner === d.rmperson) x.owner = to; if (x.approver === d.rmperson) x.approver = to; } }
    S.people = S.people.filter(x => x.key !== d.rmperson); S.accounts = S.accounts.filter(x => x.key !== d.rmperson); S.pform = null; render(); toast(to ? `${who} removed. Their work is now with ${P(to).short}.` : `${who} removed`); return; }
  if (d.createacc || d.resetacc) {
    const p = P(d.createacc || d.resetacc), pw = tempPw(), box = $("#adminmsg");
    if (d.createacc) { const { error } = await sb.rpc("admin_add_member", { p_email: p.email, p_name: p.name, p_role: ROLE_FOR[p.key] || "COORD", p_password: pw, p_admin: false }); if (error) return toast(error.message); }
    else { const a = S.accounts.find(x => x.key === p.key); const { error } = await sb.rpc("admin_reset_password", { p_member: a.member_id, p_password: pw }); if (error) return toast(error.message); }
    const { data } = await sb.rpc("hub_accounts"); S.accounts = data || S.accounts; render();
    const msg = `Hi ${p.short},\n\nYou now have access to the CEIBS Africa Programme Hub.\n\nOpen: ${location.origin}\nEmail: ${p.email}\nTemporary password: ${pw}\n\nYou'll choose your own password the first time you sign in. On your phone, open the link and use "Add to Home Screen".\n\nAnna`;
    const b = $("#adminmsg"); b.hidden = false; b.innerHTML = `<b>${esc(p.short)}: ${d.createacc ? "account created" : "password reset"}.</b> Send this to them:<textarea class="letter" id="invmsg" readonly style="min-height:180px;background:#fff">${esc(msg)}</textarea><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-copyid="invmsg">${ic("copy")} Copy</button><a class="btn" href="mailto:${esc(p.email)}?subject=${encodeURIComponent("Your Programme Hub access")}&body=${encodeURIComponent(msg)}">${ic("mail")} Email</a></div>`;
    return;
  }
});
document.addEventListener("change", async e => {
  const el = e.target;
  if (el.dataset.status) { const v = el.value; return setTask(el.dataset.status, { status: v }, v === "done" ? "Done. The team can see it." : "Updated"); }
  if (el.dataset.note !== undefined && el.dataset.note) { return setTask(el.dataset.note, { note: el.value.trim() }, "Note saved"); }
  if (el.dataset.tplpick) { S.tplSel[S.tpl] = { ...(S.tplSel[S.tpl] || {}), [el.dataset.tplpick]: el.value }; render(); return; }
  if (el.id === "stuprog") { S.stuProg = el.value; render(); return; }
  if (el.dataset.stu) { const v = Number(el.value) || 0; const { data, error } = await sb.from("hub_students").update({ [el.dataset.f]: v }).eq("id", el.dataset.stu).select().single(); if (error) return toast(error.message); Object.assign(S.students.find(x => x.id === el.dataset.stu), data); toast("Saved"); render(); return; }
  if (el.dataset.fac || el.dataset.ven) { const tb = el.dataset.fac ? "hub_faculty" : "hub_vendors", id = Number(el.dataset.fac || el.dataset.ven), arr = el.dataset.fac ? S.faculty : S.vendors; const { error } = await sb.from(tb).update({ [el.dataset.f]: el.value.trim() }).eq("id", id); if (error) return toast(error.message); arr.find(x => x.id === id)[el.dataset.f] = el.value.trim(); toast("Saved"); return; }
  if (el.dataset.photo) { await uploadPhoto(el.dataset.photo, el.files[0]); return; }
});
document.addEventListener("input", e => {
  const el = e.target;
  if (el.id === "gs") { S.search = el.value; render(); }
  else if (el.id === "pq" || el.id === "stuq") { S.q = el.value; render(); }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (f.id === "sform") return saveSession(e);
  if (f.id === "pwform") { e.preventDefault(); const p = $("#np").value; if (p.length < 10) return $("#pwerr").textContent = "Use at least 10 characters."; const { error } = await sb.auth.updateUser({ password: p }); if (error) return $("#pwerr").textContent = error.message; $("#np").value = ""; $("#pwerr").textContent = ""; toast("Password changed"); return; }
  if (f.id === "pform") {
    e.preventDefault(); const key = f.dataset.key, email = $("#pf-email").value.trim().toLowerCase();
    const row = { name: $("#pf-name").value.trim(), short: $("#pf-short").value.trim(), title: $("#pf-title").value.trim(), does: $("#pf-does").value.trim(), fees: $("#pf-fees").checked };
    if (!key) row.access = $("#pf-access").value; else if (P(key).access !== "admin") row.access = $("#pf-access").value;
    if (!row.name || !row.short || !row.title || !email) return $("#pferr").textContent = "Name, position and email are needed.";
    if (key) { const { data, error } = await sb.from("hub_people").update(row).eq("key", key).select().single(); if (error) return $("#pferr").textContent = error.message; Object.assign(P(key), data); S.pform = null; render(); toast("Saved"); return; }
    if (S.people.some(x => x.email.toLowerCase() === email)) return $("#pferr").textContent = "That email is already on the team.";
    let k = row.short.toLowerCase().replace(/[^a-z]/g, "") || "person"; while (S.people.some(x => x.key === k)) k += "2";
    Object.assign(row, { key: k, email, colour: PALETTE[S.people.length % PALETTE.length], sort: Math.max(0, ...S.people.map(x => x.sort || 0)) + 1 });
    const { data, error } = await sb.from("hub_people").insert(row).select().single(); if (error) return $("#pferr").textContent = error.message;
    S.people.push(data); S.pform = null; render(); toast(`${data.short} added. Now create their account.`); return;
  }
  if (f.id === "stuform") { e.preventDefault(); const row = { name: $("#sn").value.trim(), programme: $("#sp").value.trim(), email: $("#se").value.trim(), phone: $("#sph").value.trim(), fee: Number($("#sf").value) || 0, paid: Number($("#spd").value) || 0, due_date: $("#sd").value || null }; const { data, error } = await sb.from("hub_students").insert(row).select().single(); if (error) return $("#sterr").textContent = error.message; S.students.push(data); S.open.addstu = false; render(); toast("Student added"); return; }
  if (f.id === "vform") { e.preventDefault(); const row = { name: $("#vn").value.trim(), service: $("#vs").value, contact: $("#vc").value.trim(), phone: $("#vp").value.trim(), email: $("#ve").value.trim() }; const { data, error } = await sb.from("hub_vendors").insert(row).select().single(); if (error) return toast(error.message); S.vendors.push(data); render(); toast("Vendor added"); return; }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { if (S.drawer) closeDrawer(); else if (S.search) { S.search = ""; render(); } } });
boot();
