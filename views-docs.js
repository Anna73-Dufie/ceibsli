/* CEIBS Africa Programme Hub · Templates, Students & fees, People, Admin, My account */
"use strict";

/* ---------- templates ---------- */
const SIGN = k => { const p = P(k); return `\n\nKind regards,\n${p.name}\n${p.title.split(",")[0]}\nCEIBS Africa`; };
const first = n => String(n || "").replace(/^(Prof\.?|Dr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, "").split(/\s+/)[0] || "";
const facultyOf = s => S.faculty.filter(f => (s.faculty || "").toLowerCase().includes(f.name.replace(/^(Prof\.|Dr)\s+/, "").split(" ").pop().toLowerCase()));
const studentsFor = prog => S.students.filter(x => prog === "all" || x.programme === prog || (prog && x.programme && prog.toLowerCase().startsWith(x.programme.toLowerCase())));
const bal = x => Math.max(0, Number(x.fee || 0) - Number(x.paid || 0));
const where = s => s.mode === "Virtual" ? "online (Zoom link to follow)" : s.location;
const TPL = [
  { key: "fee", owner: "anna", name: "Student fee reminder", sub: "To students with a balance", tone: "", pick: "programme", to: "students",
    build: (ctx, r) => ({ subject: `Fee reminder · ${ctx.prog}`, body: `Dear ${r ? first(r.name) : "[student]"},\n\nThis is a friendly reminder that ${r ? `a balance of ${money(bal(r), r.currency)}` : "a balance"} remains on your fees for ${ctx.prog}${r && r.due_date ? `, due on ${fmtY(r.due_date)}` : ""}.\n\nIf you have already paid, please send us the receipt so Finance can confirm it.${SIGN("anna")}` }) },
  { key: "class", owner: "anna", name: "Class reminder", sub: "Date, time, venue and readings", tone: "blue", pick: "session", to: "students",
    build: (ctx, r) => { const s = ctx.s; return { subject: `Reminder: ${s.programme} · ${s.short || s.title}, ${fmtW(s.start_date)}`, body: `Dear ${r ? first(r.name) : "[student]"},\n\nA reminder that ${s.short ? s.short + ", " : ""}"${s.title.replace(/^M\d:\s*/, "")}" takes place on ${range(s)}.\n\nTime: ${s.time_text || "to be confirmed"}\nVenue: ${where(s)}\n\nThe course outline and readings are on Canvas. Please go through them before class and arrive 30 minutes early for registration.${SIGN("anna")}` }; } },
  { key: "invite", owner: "daniel", name: "Faculty invitation letter", sub: "Invite and confirm availability", tone: "", pick: "session", to: "faculty",
    build: (ctx, r) => { const s = ctx.s; return { subject: `Invitation to teach · ${s.programme}`, body: `Dear ${r ? r.name.replace(/ Esq\.$/, "") : "[faculty name]"},\n\nOn behalf of CEIBS Africa, I am pleased to invite you to teach "${s.title.replace(/^M\d:\s*/, "")}" on ${s.programme}, scheduled for ${range(s)}, ${s.time_text || "time to be confirmed"}, ${where(s)}.\n\nPlease confirm your availability. Once confirmed, I will share the session brief and request your course outline and reading list.${SIGN("daniel")}` }; } },
  { key: "outline", owner: "daniel", name: "Course outline request", sub: "Outline and readings for Canvas", tone: "blue", pick: "session", to: "faculty",
    build: (ctx, r) => { const s = ctx.s; return { subject: `Course outline and readings · ${s.short || s.title}`, body: `Dear ${r ? r.name.replace(/ Esq\.$/, "") : "[faculty name]"},\n\nAhead of "${s.title.replace(/^M\d:\s*/, "")}" on ${range(s)}, could you share your course outline and reading list by ${s.start_date ? fmtY(addDays(s.start_date, -21)) : "[date]"}? We upload materials to Canvas two weeks before the session so participants can prepare.${SIGN("daniel")}` }; } },
  { key: "fbrief", owner: "daniel", name: "Faculty logistics brief", sub: "Venue, time and AV", tone: "green", pick: "session", to: "faculty",
    build: (ctx, r) => { const s = ctx.s; return { subject: `Arrangements for ${fmtW(s.start_date)}`, body: `Dear ${r ? r.name.replace(/ Esq\.$/, "") : "[faculty name]"},\n\nHere are the arrangements for "${s.title.replace(/^M\d:\s*/, "")}":\n\nDate: ${range(s)}\nTime: ${s.time_text || "to be confirmed"}\nVenue: ${where(s)}\n\nPlease let me know your AV needs and anything you would like printed for participants.${SIGN("daniel")}` }; } },
  { key: "vendor", owner: "celestine", name: "Vendor booking confirmation", sub: "Catering, printing, transport", tone: "green", pick: "session", to: "vendors",
    build: (ctx, r) => { const s = ctx.s, n = studentsFor(s.programme).length; return { subject: `Booking confirmation · ${s.programme}, ${fmt(s.start_date)}`, body: `Dear ${r ? (r.contact || r.name) : "[vendor]"},\n\nPlease confirm the following booking for CEIBS Africa${r ? ` (${r.service.toLowerCase()})` : ""}:\n\nProgramme: ${s.programme} · ${s.short || s.title}\nDates: ${range(s)}\nTime: ${s.time_text || "to be confirmed"}\nVenue: ${s.location}\nNumbers: ${n ? n + " participants, plus faculty and staff" : "to follow"}\n\nKindly confirm in writing and send your invoice.${SIGN("celestine")}` }; } },
  { key: "paid", owner: "nicholas", name: "Paid list for Anna", sub: "Who has paid and what has cleared", tone: "violet", pick: "programme", to: "anna",
    build: ctx => { const L = studentsFor(ctx.prog); return { subject: `Fee status · ${ctx.prog}`, body: `Hi Anna,\n\nFee status for ${ctx.prog} as at ${fmtY(TODAY)}:\n\n${L.map(x => `• ${x.name}: paid ${money(x.paid, x.currency)} of ${money(x.fee, x.currency)}${bal(x) ? ` · balance ${money(bal(x), x.currency)}` : " · fully paid"}`).join("\n") || "No students recorded yet."}\n\nPlease send reminders to those with a balance.${SIGN("nicholas")}` }; } }
];
function tplVisible() { return TPL.filter(t => t.owner === S.me || isSup()); }
function vTemplates() {
  const L = tplVisible(); if (!L.length) return `<div class="head"><div><h1>Templates</h1><p>No templates for your role yet.</p></div></div>`;
  const t = L.find(x => x.key === S.tpl) || L.find(x => x.owner === S.me) || L[0]; S.tpl = t.key;
  const sel = S.tplSel[t.key] || {}, ups = sess().filter(s => s.start_date && (s.end_date || s.start_date) >= TODAY);
  const progs = [...new Set([...[...new Set(S.students.map(x => x.programme))].sort(), ...programmes().map(g => g.name)].filter(Boolean))];
  let ctx = null, recips = [], picker = "";
  if (t.pick === "session") {
    const s = SID[sel.s] || (t.to === "faculty" && ups.find(x => facultyOf(x).length)) || ups[0]; ctx = s ? { s } : null;
    picker = `<div class="field"><label for="tps">Session</label><select class="select" id="tps" data-tplpick="s">${ups.map(x => `<option value="${x.id}" ${s && x.id === s.id ? "selected" : ""}>${fmt(x.start_date)} · ${esc(x.programme)} · ${esc(x.short || x.title)}</option>`).join("")}</select></div>`;
    if (s) recips = t.to === "students" ? studentsFor(s.programme) : t.to === "faculty" ? facultyOf(s) : S.vendors;
  } else {
    const prog = sel.p || progs[0] || ""; ctx = { prog };
    picker = `<div class="field"><label for="tpp">Programme</label><select class="select" id="tpp" data-tplpick="p">${progs.map(p => `<option ${p === prog ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></div>`;
    recips = t.to === "students" ? studentsFor(prog).filter(x => bal(x) > 0) : t.to === "anna" ? [P("anna")] : [];
  }
  const doc = ctx ? t.build(ctx, recips.length === 1 ? recips[0] : null) : { subject: "", body: "Pick a session." };
  const mail = (r, d) => `mailto:${encodeURIComponent(r.email || "")}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
  const wa = (r, d) => `https://wa.me/${String(r.phone || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(d.body)}`;
  const empty = t.to === "students" ? `No students recorded for this programme yet. ${canFees() ? '<button class="more" data-view="fees">Add or import the fee list</button>' : "Anna, Daniel, Nicholas or Mavis can add them under Students & fees."}` : t.to === "faculty" ? "No faculty named for this session yet (TBC)." : t.to === "vendors" ? `No vendors saved yet. <button class="more" data-ptab="vendors" data-view="people">Add vendors</button>` : "";
  const groups = isSup() ? [["Yours", L.filter(x => x.owner === S.me)], ["Team templates", L.filter(x => x.owner !== S.me)]] : [["Yours", L]];
  return `<div class="head"><div><h1>Templates</h1><p>${isSup() ? "Your templates, plus the team's for oversight." : "Your letters and reminders, filled in from the plan."}</p></div></div>
  <div class="grid" style="grid-template-columns:minmax(0,320px) minmax(0,1fr)"><div>${groups.filter(g => g[1].length).map(([h, G]) => `<div class="label" style="margin:4px 0 10px">${h}</div><div class="tlist" style="margin-bottom:18px">${G.map(x => `<button class="titem" data-tpl="${x.key}" aria-pressed="${x.key === t.key}"><span class="ic ${x.tone}">${ic("doc")}</span><span><b>${esc(x.name)}</b><span>${esc(x.owner === S.me ? x.sub : P(x.owner).short + " · " + x.sub)}</span></span></button>`).join("")}</div>`).join("")}</div>
   <section class="card"><h2 class="ch">${esc(t.name)}</h2><p class="muted" style="margin:4px 0 14px">${esc(P(t.owner).short)} · ${esc(t.sub)}</p>${picker}
    <div class="field"><label>Subject</label><input class="input" value="${esc(doc.subject)}" id="tsubj"></div>
    <label class="sr" for="tbody">Message</label><textarea class="letter" id="tbody">${esc(doc.body)}</textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px"><button class="btn" data-copyid="tbody">${ic("copy")} Copy</button>${t.to === "anna" ? `<a class="btn red" href="${mail(P("anna"), doc)}">${ic("mail")} Email Anna</a>` : ""}</div>
    ${t.to !== "anna" ? `<div class="label">Send to · ${recips.length}</div><div class="recips">${recips.map(r => { const d = ctx ? t.build(ctx, r) : doc; return `<div class="recip"><div><b>${esc(r.name)}</b><span>${esc([r.service, r.programme && t.to === "students" ? (bal(r) ? "Balance " + money(bal(r), r.currency) : "Paid") : "", r.email, r.phone].filter(Boolean).join(" · ")) || "No contact saved"}</span></div>${r.phone ? `<a class="btn sm wa" href="${wa(r, d)}" target="_blank" rel="noopener">${ic("wa")} WhatsApp</a>` : "<span></span>"}${r.email ? `<a class="btn sm" href="${mail(r, d)}">${ic("mail")} Email</a>` : "<span></span>"}</div>`; }).join("") || `<p class="muted" style="padding:10px 0">${empty}</p>`}</div>` : ""}</section></div>`;
}

/* ---------- Students & fees ---------- */
function vFees() {
  const progs = [...new Set(S.students.map(x => x.programme).filter(Boolean))].sort();
  const L = S.students.filter(x => S.stuProg === "all" || x.programme === S.stuProg).filter(x => !S.q || (x.name + " " + x.email + " " + x.phone).toLowerCase().includes(S.q.toLowerCase()));
  const tot = L.reduce((a, x) => a + Number(x.fee || 0), 0), paid = L.reduce((a, x) => a + Number(x.paid || 0), 0), owing = L.filter(x => bal(x) > 0);
  const isA = S.me === "anna", isN = canFees() && !isA && P(S.me).access === "member", edit = isN || isA;
  return `<div class="head"><div><h1>Students & fees</h1><p>${isN ? "Keep each student's payments current. Anna sees the balances and sends the reminders." : isA ? "Nicholas and Mavis keep the payments current. Remind anyone with a balance in one click." : "Fee position across programmes."}</p></div>
   ${edit ? `<div style="display:flex;gap:8px"><button class="btn" data-import="1">Import list</button><button class="btn red" data-addstu="1">Add student</button></div>` : ""}</div>
  <div class="tiles" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div class="tile blue"><div><b>${L.length}</b><span>students</span></div></div><div class="tile green"><div><b style="font-size:24px">${money(paid)}</b><span>paid</span></div></div><div class="tile amber"><div><b style="font-size:24px">${money(tot - paid)}</b><span>outstanding</span></div></div><div class="tile red"><div><b>${owing.length}</b><span>with a balance</span></div></div></div>
  ${S.open.import ? `<section class="card" style="margin-bottom:18px"><h2 class="ch">Import the fee list</h2><p class="muted" style="margin:6px 0 10px">Paste from Excel with these columns, in this order: name, programme, email, phone, fee, paid, due date (YYYY-MM-DD). One student per line.</p><textarea class="textarea" id="imp" style="min-height:140px" placeholder="Ama Mensah	WELA 2027 · Accra	ama@example.com	+233201234567	25000	10000	2027-04-30"></textarea><div class="err" id="imperr"></div><div style="display:flex;gap:8px"><button class="btn red" data-doimport="1">Import</button><button class="btn" data-import="0">Cancel</button></div></section>` : ""}
  <div class="toolbar"><select class="select" style="width:auto" id="stuprog" aria-label="Programme"><option value="all">All programmes</option>${progs.map(p => `<option ${p === S.stuProg ? "selected" : ""}>${esc(p)}</option>`).join("")}</select><input class="input" style="max-width:260px" id="stuq" placeholder="Search students" value="${esc(S.q)}"></div>
  <section class="card" style="padding:8px 12px">${L.length ? `<div class="tw"><table class="stack-sm"><thead><tr><th>Student</th><th>Programme</th><th class="num">Fee</th><th class="num">Paid</th><th class="num">Balance</th><th>Due</th><th>Checked by Finance</th><th></th></tr></thead><tbody>${L.map(x => { const b = bal(x), d = TPL[0].build({ prog: x.programme }, x); return `<tr><td><b>${esc(x.name)}</b><div class="muted" style="font-size:12.5px">${esc([x.email, x.phone].filter(Boolean).join(" · "))}</div></td><td>${esc(x.programme)}</td>
    <td class="num">${isN ? `<input class="input sm num" style="width:100px" type="number" data-stu="${x.id}" data-f="fee" value="${x.fee}" aria-label="Fee">` : money(x.fee, x.currency)}</td>
    <td class="num">${isN ? `<input class="input sm num" style="width:100px" type="number" data-stu="${x.id}" data-f="paid" value="${x.paid}" aria-label="Paid">` : money(x.paid, x.currency)}</td>
    <td class="num" style="font-weight:700;color:${b ? "var(--red)" : "var(--green)"}">${b ? money(b, x.currency) : "Paid"}</td><td>${x.due_date ? fmtY(x.due_date) : "—"}</td>
    <td class="muted" style="font-size:12.5px">${x.verified_at ? `${esc(P(x.verified_by).short)} · ${fmt(x.verified_at.slice(0, 10))}` : "Not yet"}</td>
    <td style="white-space:nowrap">${b && isA ? `${x.phone ? `<a class="btn sm wa" target="_blank" rel="noopener" href="https://wa.me/${x.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(d.body)}">${ic("wa")}</a> ` : ""}${x.email ? `<a class="btn sm" href="mailto:${encodeURIComponent(x.email)}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}">${ic("mail")}</a>` : ""}` : ""}</td></tr>`; }).join("")}</tbody></table></div>`
    : `<p class="empty">${S.students.length ? "No students match." : edit ? "No students yet. Import the fee list from Excel, or add students one by one." : "No students recorded yet."}</p>`}</section>
  ${S.open.addstu ? `<div class="scrim" data-addstu="0"></div><aside class="drawer" style="width:min(480px,100%)"><div class="dh"><h2>Add a student</h2><button class="x" data-addstu="0" aria-label="Close">×</button></div><form class="db form2" id="stuform">
   <div class="field full"><label for="sn">Full name</label><input class="input" id="sn" required></div><div class="field full"><label for="sp">Programme</label><input class="input" id="sp" list="splist" required><datalist id="splist">${programmes().map(g => `<option value="${esc(g.name)}">`).join("")}</datalist></div>
   <div class="field"><label for="se">Email</label><input class="input" id="se" type="email"></div><div class="field"><label for="sph">WhatsApp number</label><input class="input" id="sph" placeholder="+233…"></div>
   <div class="field"><label for="sf">Fee (GHS)</label><input class="input" id="sf" type="number" value="0"></div><div class="field"><label for="spd">Paid (GHS)</label><input class="input" id="spd" type="number" value="0"></div>
   <div class="field full"><label for="sd">Payment due</label><input class="input" id="sd" type="date"></div><div class="err full" id="sterr"></div><div class="full"><button class="btn red" type="submit">Save student</button></div></form></aside>` : ""}`;
}

/* ---------- People ---------- */
function vPeople() {
  const q = S.q.toLowerCase(), tabs = [["team", "Programme team"], ["faculty", "Faculty 2027"], ["vendors", "Vendors"]];
  let body = "";
  if (S.ptab === "team") body = `<div class="pgrid">${S.people.filter(p => !q || (p.name + p.title).toLowerCase().includes(q)).map(p => `<section class="card person"><div class="top2">${av(p.key, "lg")}<div><h3>${esc(p.name)}</h3><div class="ti">${esc(p.title)}</div></div></div><p class="muted" style="font-size:13.5px">${esc(p.does)}</p><a href="mailto:${esc(p.email)}" style="font-size:13.5px">${esc(p.email)}</a></section>`).join("")}</div>`;
  else if (S.ptab === "faculty") {
    const ed = ["daniel", "anna"].includes(S.me), L = S.faculty.filter(f => !q || f.name.toLowerCase().includes(q));
    body = `<section class="card" style="padding:8px 12px"><div class="tw"><table class="stack-sm"><thead><tr><th>Faculty</th><th>2027 sessions</th><th>Next</th><th>Email</th><th>Phone</th></tr></thead><tbody>${L.map(f => { const S2 = sess().filter(s => facultyOf(s).some(x => x.id === f.id)).sort((a, b) => (a.start_date || "9").localeCompare(b.start_date || "9")); const nx = S2.find(s => s.start_date && s.start_date >= TODAY);
      return `<tr><td><b>${esc(f.name)}</b><div class="muted" style="font-size:12.5px">${esc([...new Set(S2.map(s => s.programme))].join(" · "))}</div></td><td>${S2.length}</td><td>${nx ? `<button class="more" style="color:var(--blue);font-weight:500" data-session="${nx.id}">${fmt(nx.start_date)}</button>` : "—"}</td>
      <td>${ed ? `<input class="input sm" data-fac="${f.id}" data-f="email" value="${esc(f.email)}" placeholder="Add email" aria-label="Email">` : esc(f.email || "—")}</td><td>${ed ? `<input class="input sm" data-fac="${f.id}" data-f="phone" value="${esc(f.phone)}" placeholder="Add phone" aria-label="Phone">` : esc(f.phone || "—")}</td></tr>`; }).join("")}</tbody></table></div></section>`;
  } else {
    const ed = ["celestine", "anna"].includes(S.me), L = S.vendors.filter(v => !q || (v.name + v.service).toLowerCase().includes(q));
    body = `${ed ? `<form id="vform" class="card form2" style="margin-bottom:16px;grid-template-columns:repeat(5,minmax(0,1fr)) auto;align-items:end;gap:0 10px"><div class="field"><label for="vn">Vendor</label><input class="input" id="vn" required></div><div class="field"><label for="vs">Service</label><select class="select" id="vs">${["Catering", "Printing", "Transport", "Venue", "AV", "Other"].map(x => `<option>${x}</option>`).join("")}</select></div><div class="field"><label for="vc">Contact person</label><input class="input" id="vc"></div><div class="field"><label for="vp">WhatsApp</label><input class="input" id="vp"></div><div class="field"><label for="ve">Email</label><input class="input" id="ve" type="email"></div><div class="field"><button class="btn red" type="submit">Add</button></div></form>` : ""}
    <section class="card" style="padding:8px 12px">${L.length ? `<div class="tw"><table class="stack-sm"><thead><tr><th>Vendor</th><th>Service</th><th>Contact</th><th>WhatsApp</th><th>Email</th></tr></thead><tbody>${L.map(v => `<tr><td><b>${esc(v.name)}</b></td><td>${esc(v.service)}</td>${["contact", "phone", "email"].map(f => `<td>${ed ? `<input class="input sm" data-ven="${v.id}" data-f="${f}" value="${esc(v[f])}" aria-label="${f}">` : esc(v[f] || "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<p class="empty">No vendors saved yet.${ed ? " Add your caterers, printers and transport above." : ""}</p>`}</section>`;
  }
  return `<div class="head"><div><h1>People</h1><p>The programme team, 2027 faculty and our vendors.</p></div></div>
  <div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l]) => `<button data-ptab="${k}" aria-pressed="${S.ptab === k}">${l}</button>`).join("")}</div><span class="sp"></span><input class="input" style="max-width:260px" id="pq" placeholder="Filter by name" value="${esc(S.q)}"></div>${body}`;
}

/* ---------- Admin (Anna only) ---------- */
const ROLE_FOR = { anna: "COORD", daniel: "COORD", celestine: "LOG", nicholas: "FIN", gordon: "ED" };
const SUGGEST = [
  { name: "Mavis Akrofi", short: "Mavis", title: "Finance and Administration Manager", email: "amavis@ceibs.edu", does: "Finance and administration; verifies student payments with Nicholas", fees: true },
  { name: "Prince Dela Fiador", short: "Dela", title: "Marketing and Digital Media Executive", email: "fprince@ceibs.edu", does: "Programme marketing, social media and digital campaigns", fees: false },
  { name: "Sylvia Sam Sinkari", short: "Sylvia", title: "Business Development Consultant", email: "ssylvia@ceibs.edu", does: "Business development and prospective participant enquiries", fees: false },
  { name: "Rebecca Etriakor", short: "Rebecca", title: "Executive Assistant", email: "erebecca@ceibs.edu", does: "Executive support to the Executive Director", fees: false }
];
const PALETTE = ["#B45309", "#DB2777", "#0891B2", "#4D7C0F", "#9333EA", "#C2410C", "#0E7490", "#BE123C"];
function personForm(p) {
  const v = k => esc(p[k] ?? ""), isNew = !p.key, left = SUGGEST.filter(x => !S.people.some(y => y.email.toLowerCase() === x.email));
  return `<div class="scrim" data-pform="0"></div><aside class="drawer" style="width:min(560px,100%)" role="dialog" aria-modal="true" aria-labelledby="pft"><div class="dh"><h2 id="pft">${isNew ? "Add a team member" : "Edit " + esc(p.short)}</h2><button class="x" data-pform="0" aria-label="Close">×</button></div><div class="db">
   ${isNew && left.length ? `<div class="label">Quick add</div><div class="tlist" style="margin-bottom:18px">${left.map((x, i) => `<button class="titem" type="button" data-suggest="${SUGGEST.indexOf(x)}"><span class="av" style="--c:${PALETTE[i]}">${esc(x.short[0])}</span><span><b>${esc(x.name)}</b><span>${esc(x.title)} · ${esc(x.email)}</span></span></button>`).join("")}</div><div class="label">Or someone else</div>` : ""}
   <form id="pform" class="form2" data-key="${v("key")}">
    <div class="field"><label for="pf-name">Full name</label><input class="input" id="pf-name" value="${v("name")}" required></div>
    <div class="field"><label for="pf-short">Name shown in the Hub</label><input class="input" id="pf-short" value="${v("short")}" placeholder="e.g. Mavis" required></div>
    <div class="field full"><label for="pf-title">Position</label><input class="input" id="pf-title" value="${v("title")}" required></div>
    <div class="field full"><label for="pf-email">CEIBS email</label><input class="input" id="pf-email" type="email" value="${v("email")}" required ${isNew ? "" : "readonly"}></div>
    <div class="field full"><label for="pf-does">What they do in the programmes</label><input class="input" id="pf-does" value="${v("does")}"></div>
    <div class="field"><label for="pf-access">Access</label><select class="select" id="pf-access" ${p.access === "admin" ? "disabled" : ""}>${p.access === "admin" ? '<option value="admin">Admin</option>' : ""}<option value="member" ${p.access === "member" ? "selected" : ""}>Team member · sees their own work</option><option value="supervisor" ${p.access === "supervisor" ? "selected" : ""}>Supervisor · sees and edits everything</option></select></div>
    <label class="field" style="flex-direction:row;align-items:center;gap:10px;margin-top:26px"><input type="checkbox" id="pf-fees" ${p.fees ? "checked" : ""}> Can see Students & fees</label>
    <div class="err full" id="pferr"></div>
    <div class="full" style="display:flex;justify-content:flex-end;gap:8px"><button class="btn red" type="submit">${isNew ? "Add to the team" : "Save"}</button></div>
    ${!isNew && p.access !== "admin" ? (() => { const n = S.tasks.filter(t => t.owner === p.key || t.approver === p.key).length; return `<div class="full" style="border-top:1px solid var(--line);margin-top:18px;padding-top:16px"><div class="label">Remove ${esc(p.short)}</div>${n ? `<p class="muted" style="font-size:13.5px;margin-bottom:10px">${esc(p.short)} has ${n} tasks. Choose who takes them over; done tasks keep their history.</p><div class="field"><label for="pf-to">Hand their work to</label><select class="select" id="pf-to">${S.people.filter(x => x.key !== p.key).map(x => `<option value="${x.key}">${esc(x.short)} · ${esc(x.title.split(",")[0])}</option>`).join("")}</select></div>` : `<p class="muted" style="font-size:13.5px;margin-bottom:10px">${esc(p.short)} has no tasks, so nothing needs handing over.</p>`}<button class="btn" type="button" style="border-color:var(--red);color:var(--red)" data-rmperson="${v("key")}">Remove ${esc(p.short)} from the Hub</button><p class="muted" style="font-size:12.5px;margin-top:8px">Their sign-in stops working straight away.</p></div>`; })() : ""}
   </form><p class="muted" style="font-size:12.5px;margin-top:14px">${isNew ? "New people start with no tasks. Give them steps in Workflows (Edit, then pick their name) and every session updates. Then create their account so they can sign in." : "To give someone work, open Workflows and change the owner of a step."}</p></div></aside>`;
}
function tempPw() { const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; let s = "Hub-"; for (const x of crypto.getRandomValues(new Uint32Array(10))) s += a[x % a.length]; return s; }
function vAdmin() {
  if (!isAdmin()) return vOverview();
  const acc = k => S.accounts.find(a => a.key === k) || {};
  return `<div class="head"><div><h1>Admin</h1><p>Only you can see this page. Add team members, create accounts, reset passwords and add photos.</p></div><button class="btn red" data-pform="new">Add a team member</button></div>
  ${S.resets.length ? `<section class="card" style="margin-bottom:18px;border-color:#F3C3CB;background:#FFF8F9"><h2 class="ch" style="margin-bottom:6px">Password help requested</h2><p class="muted" style="margin-bottom:10px">A reset link was emailed to them. If it hasn't arrived, reset it here and send them the new password.</p>${S.resets.map(r => { const p = P(r.person), a = (S.accounts.find(x => x.key === r.person) || {}); return `<div class="trow" style="grid-template-columns:auto minmax(0,1fr) auto auto">${av(r.person)}<div><div class="nm">${esc(p.name)}</div><div class="ti">Asked ${new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div>${a.member_id ? `<button class="btn sm red" data-resetacc="${r.person}">Reset password</button>` : `<button class="btn sm red" data-createacc="${r.person}">Create account</button>`}<button class="btn sm" data-resolve="${r.id}">Dismiss</button></div>`; }).join("")}</section>` : ""}
  <section class="card" style="padding:8px 12px"><div class="tw"><table class="stack-sm"><thead><tr><th>Person</th><th>Email</th><th>Access</th><th>Account</th><th></th></tr></thead><tbody>${S.people.map(p => { const a = acc(p.key); return `<tr><td><div class="who">${av(p.key)}<span><b>${esc(p.name)}</b><div class="muted" style="font-size:12.5px">${esc(p.title)}</div></span></div></td><td>${esc(p.email)}</td>
    <td>${{ admin: "Admin", supervisor: "Supervisor", member: "Team member" }[p.access]}</td>
    <td>${!a.member_id ? '<span class="pill grey">No account</span>' : a.signed_in ? (a.must_reset ? '<span class="pill amber">Must set password</span>' : '<span class="pill green">Active</span>') : '<span class="pill blue">Invited</span>'}</td>
    <td style="white-space:nowrap"><button class="btn sm" data-pform="${p.key}">Edit</button> <label class="btn sm" style="cursor:pointer">Photo<input type="file" accept="image/*" data-photo="${p.key}" hidden></label> ${!a.member_id ? `<button class="btn sm red" data-createacc="${p.key}">Create account</button>` : p.key !== S.me ? `<button class="btn sm" data-resetacc="${p.key}">Reset password</button>` : ""}</td></tr>`; }).join("")}</tbody></table></div></section>
  <div id="adminmsg" class="callout blue" style="margin-top:16px" hidden></div>${S.pform ? personForm(S.pform === "new" ? { access: "member", fees: false } : P(S.pform)) : ""}`;
}

/* ---------- My account ---------- */
function vAccount() {
  const p = P(S.me), feed = `${SB_URL}/functions/v1/calendar?t=${S.member.cal_token}`, web = feed.replace(/^https:/, "webcal:");
  return `<div class="head"><div><h1>My account</h1><p>${esc(p.name)} · ${esc(p.title)}</p></div></div>
  <div class="grid g2"><section class="card"><h2 class="ch" style="margin-bottom:12px">Your photo</h2><div style="display:flex;gap:16px;align-items:center">${av(S.me, "lg")}<label class="btn" style="cursor:pointer">Upload a photo<input type="file" accept="image/*" data-photo="${S.me}" hidden></label></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><h2 class="ch" style="margin-bottom:12px">Change password</h2><form id="pwform"><div class="field"><label for="np">New password</label><input class="input" id="np" type="password" autocomplete="new-password"></div><div class="err" id="pwerr"></div><button class="btn" type="submit">Change password</button></form>
    <hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><button class="btn" id="signout2">Sign out</button></section>
   <section class="card"><h2 class="ch" style="margin-bottom:8px">Reminders on your phone</h2><p class="muted" style="margin-bottom:14px">Subscribe once and your Hub tasks appear in your own calendar, with an alert the day before and two days before.</p>
    <div style="display:flex;flex-direction:column;gap:8px"><a class="btn" href="${web}">iPhone or Mac</a><a class="btn" target="_blank" rel="noopener" href="https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(feed)}&name=${encodeURIComponent("Programme Hub")}">Outlook (CEIBS email)</a><a class="btn" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(web)}">Google Calendar or Android</a></div>
    <p class="muted" style="font-size:12.5px;margin-top:12px">This link is personal; please don't share it.</p></section></div>`;
}
