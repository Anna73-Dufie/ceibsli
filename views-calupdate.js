/* CEIBS Africa Programme Hub · update the 2027 calendar from the latest calendar file (Excel or CSV) */
"use strict";

const CU_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const isoD = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const clean = v => String(v ?? "").replace(/\s+/g, " ").trim();
const normT = v => clean(v).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function loadXLSX() {
  if (window.XLSX) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; s.onload = ok; s.onerror = () => no(new Error("Couldn't load the spreadsheet reader. Check your internet and try again.")); document.head.appendChild(s); });
}

function parseWhen(raw) {
  if (raw instanceof Date && !isNaN(raw)) { const d = isoD(raw); return [d, d, null]; }
  if (typeof raw === "number" && raw > 20000) { const d = new Date(Math.round((raw - 25569) * 864e5)); const s = d.toISOString().slice(0, 10); return [s, s, null]; }
  const t = String(raw ?? "").trim().replace(/[–—]/g, "-"), y = /\b(20\d{2})\b/.exec(t);
  if (!y) return [null, null, "No year in the date"];
  const year = +y[1], part = t.slice(0, y.index).replace(/[ ,.]+$/, "");
  const mm = [...part.matchAll(new RegExp(CU_MONTHS.join("|") + "|" + CU_MONTHS.map(m => m.slice(0, 3)).join("|"), "gi"))];
  const mi = s => CU_MONTHS.findIndex(m => m.startsWith(s.toLowerCase().slice(0, 3)));
  const nums = (part.match(/\d+/g) || []).map(Number);
  if (!mm.length || !nums.length) return [null, null, "Dates to confirm"];
  const a = new Date(year, mi(mm[0][0]), nums[0]), b = new Date(year, mi(mm[mm.length - 1][0]), nums[nums.length - 1]);
  if (isNaN(a) || isNaN(b) || b < a) return [null, null, "Dates to confirm"];
  return [isoD(a), isoD(b), null];
}

function programmeOf(a) {
  if (/Scale/.test(a)) return ["WELA Scale 2027", "WELA Scale"];
  const m = /^WELA-2027 (Accra|Kumasi|Lagos|Abuja)$/.exec(a); if (m) return [`WELA 2027 · ${m[1]}`, "WELA"];
  if (/AMP for Technical/.test(a)) return ["AMP for Technical Professionals 2027", "AMP-TP"];
  if (/^AMP 2027/.test(a)) return ["AMP 2027", "AMP"];
  if (/^ODP/.test(a)) return ["ODP 2027", "ODP"];
  if (/CASC[O0]TEM/.test(a)) return ["CASCOTEM 2027", "CASCOTEM"];
  if (/Shanghai/.test(a)) return ["AMP–ODP China Immersion (Shanghai)", "Immersions"];
  if (/Chinese CEO/.test(a)) return ["Chinese CEO Programme", "Immersions"];
  if (/Chinese EMBA/.test(a)) return ["Chinese EMBA Immersion", "Immersions"];
  if (/GEMBA/.test(a)) return ["GEMBA 2027", "Degree"];
  if (/MBA/.test(a)) return [/study tour/.test(a) ? "MBA Study Tour" : "Finance MBA Immersion", "Degree"];
  if (/^WELA-2027|^AMP\/ODP\/WELA/.test(a)) return ["Joint sessions 2027", "Joint"];
  if (/Alumni/.test(a)) return ["Alumni Reunion 2027", "Alumni"];
  if (/Conference/.test(a)) return ["AFBS Network Rendezvous", "Events"];
  return [a, "Events"];
}
const workflowOf = (topic, audience, fam) => { const t = topic.toLowerCase(); if (/coaching|tsp/.test(t)) return "coaching"; if (fam === "Immersions" || /immersion/.test(t) || /study tour/i.test(audience)) return "immersion"; if (["Alumni", "Events"].includes(fam) || /summit|networking|graduation/.test(t)) return "event"; return "classroom"; };
const modeOf = p => { p = (p || "").toLowerCase(); if (/virtual/.test(p) && /face|hybrid/.test(p)) return "Hybrid"; if (/virtual|zoom/.test(p)) return "Virtual"; if (/hybrid/.test(p)) return "Hybrid"; return "In person"; };
const shortOf = topic => { let m = /M(\d):\s*/.exec(topic); if (m) return `Module ${m[1]}`; m = /Field Session (\d)/i.exec(topic); if (m) return `Field session ${m[1]}`; m = /Capstone Session (\d)/i.exec(topic); if (m) return `Capstone ${m[1]}`; return ""; };

/* read the workbook into calendar rows */
async function readCalendarFile(file) {
  await loadXLSX();
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const name = wb.SheetNames.find(n => /2027/.test(n) && /calend|schedul/i.test(n)) || wb.SheetNames.find(n => /2027/.test(n)) || wb.SheetNames[0];
  const grid = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null });
  let h = grid.findIndex(r => r && r.some(c => /^\s*date\s*$/i.test(String(c ?? ""))));
  const head = h >= 0 ? grid[h].map(c => String(c ?? "").toLowerCase()) : [];
  const col = (re, def) => { const i = head.findIndex(c => re.test(c)); return i >= 0 ? i : def; };
  const C = { date: col(/date/, 0), aud: col(/audience|cohort/, 1), prog: col(/programme|program/, 2), topic: col(/topic|module|session/, 3), time: col(/^time/, 4), dur: col(/duration/, 5), plat: col(/platform|mode|format/, 6), loc: col(/location|venue/, 7), fac: col(/faculty|facilitator|speaker/, 8) };
  const rows = [];
  grid.forEach((r, i) => {
    if (i <= h || !r || !r.some(c => c !== null && String(c).trim() !== "")) return;
    const g = k => r[C[k]];
    if (g("date") === null || String(g("date")).trim() === "") { if (rows.length) rows[rows.length - 1].audience += " / " + clean(g("aud")); return; }
    rows.push({ row: i + 1, raw: g("date"), audience: clean(g("aud")), topic: clean(g("topic")), time: clean(g("time")), duration: clean(g("dur")), platform: clean(g("plat")), location: clean(g("loc")), faculty: clean(g("fac")) });
  });
  return { sheet: name, rows };
}

/* turn rows into sessions and compare with what is in the Hub */
function diffCalendar(rows) {
  const want = [], skipped = [];
  for (const r of rows) {
    let [start, end, err] = parseWhen(r.raw); const note = [];
    if (start && start.slice(0, 4) === "2026") { start = "2027" + start.slice(4); end = "2027" + end.slice(4); note.push("The sheet shows 2026 for this date; moved to 2027. Please confirm."); }
    if (start && start.slice(0, 4) !== "2027") { skipped.push(`Row ${r.row}: not a 2027 date`); continue; }
    if (err) note.push(err + ".");
    let time = r.time; if (/11:00\s*pm/i.test(time) && /1 hour/i.test(r.duration)) time = time.replace(/11:00\s*pm/i, "11:00am");
    const holiday = /holiday|break|closure/i.test(r.audience) && (!r.topic || normT(r.topic) === normT(r.audience));
    if (holiday) { want.push({ row: r.row, kind: "holiday", programme: "Holidays", family: "Holiday", audience: "", title: r.audience.replace(/ Holiday$/i, ""), short: "", start_date: start, end_date: end, time_text: "", mode: "In person", location: "", faculty: "", workflow: "classroom", check_note: note.join(" ") }); continue; }
    if (!r.topic && !r.audience) continue;
    const [programme, family] = programmeOf(r.audience);
    want.push({ row: r.row, kind: "session", programme, family, audience: r.audience, title: r.topic || r.audience, short: shortOf(r.topic), start_date: start, end_date: end, time_text: time, mode: modeOf(r.platform), location: r.location || "Accra, Ghana", faculty: (r.faculty || "TBC").replace(/,$/, ""), workflow: workflowOf(r.topic, r.audience, family), check_note: note.join(" ") });
  }
  const pool = S.sessions.filter(s => s.kind === "session" || s.kind === "holiday");
  const key = s => s.kind === "holiday" ? "h|" + normT(s.title) : normT(s.programme) + "|" + normT(s.title);
  const used = new Set(), dist = (a, b) => !a || !b ? 9999 : Math.abs(diff(a, b));
  const changed = [], added = [], seen = new Set(); let same = 0;
  for (const w of want) {
    const sig = key(w) + "|" + w.start_date + "|" + w.end_date; if (seen.has(sig)) { skipped.push(`Row ${w.row}: repeats an earlier row`); continue; } seen.add(sig);
    const c = pool.filter(s => !used.has(s.id) && key(s) === key(w)).sort((a, b) => dist(a.start_date, w.start_date) - dist(b.start_date, w.start_date))[0];
    if (!c) { added.push(w); continue; }
    used.add(c.id);
    const F = [["start_date", "Start"], ["end_date", "End"], ["time_text", "Time"], ["mode", "Format"], ["location", "Location"], ["faculty", "Faculty"]];
    const ch = F.filter(([f]) => clean(c[f]) !== clean(w[f]) && !(f === "time_text" && !w[f])).map(([f, l]) => ({ f, l, from: c[f], to: w[f] }));
    if (ch.length) changed.push({ s: c, w, ch }); else same++;
  }
  const missing = pool.filter(s => !used.has(s.id) && (s.src_row != null || /^[SH]\d+$/.test(s.id)));
  return { changed, added, missing, same, skipped };
}

const showVal = (f, v) => !v ? "—" : /date/.test(f) ? fmt(v) : esc(v);

function vCalUpdate() {
  if (!canPlan()) return `<div class="head"><div><h1>Update the calendar</h1><p>Only Daniel, Anna and Prof. Gordon can update the calendar.</p></div></div>`;
  const U = S.calup;
  const intro = `<div class="head"><div><h1>Update the calendar</h1><p>When dates, faculty or venues change, upload the latest 2027 calendar file. You'll see every change before anything is saved.</p></div><button class="btn" data-view="calendar">Back to calendar</button></div>`;
  if (!U || U.busy) return intro + `<section class="card cu-drop ${U && U.busy ? "busy" : ""}"><input type="file" id="calfile" accept=".xlsx,.xls,.csv" hidden>
     <label for="calfile" class="cu-zone"><span class="cu-ic">${svgI('<path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', 30)}</span>
      <b>${U && U.busy ? "Reading the file…" : "Choose the calendar file"}</b><span class="muted">Excel (.xlsx) or CSV, with the same columns as the 2027 calendar: Date, Audience, Programme, Topic, Time, Duration, Platform, Location, Faculty.</span></label>
     ${U && U.err ? `<div class="err" style="margin-top:12px">${esc(U.err)}</div>` : ""}</section>
     <section class="card" style="margin-top:18px"><h2 class="ch">What happens</h2><ol class="cu-steps"><li>The Hub reads the 2027 sheet and matches each row to a session it already has.</li><li>You see what changed: new dates, times, venues or faculty, any new sessions, and sessions no longer in the file.</li><li>Tick what to apply. When a date moves, every task for that session moves with it, apart from tasks already done or dates someone set by hand.</li></ol></section>`;
  const n = U.changed.filter(x => x.on).length + U.added.filter(x => x.on).length + U.missing.filter(x => x.on).length;
  const sec = (title, sub, list, kind, render) => list.length ? `<section class="card cu-sec"><div class="ch-row"><h2 class="ch">${title} <span class="h-count">${list.length}</span></h2><button class="more" data-cuall="${kind}">${list.every(x => x.on) ? "Untick all" : "Tick all"}</button></div><p class="muted h-sub">${sub}</p>${list.map((x, i) => `<label class="cu-row"><input type="checkbox" data-cutick="${kind}:${i}" ${x.on ? "checked" : ""}><span class="cu-bar" style="--c:${famC((x.s || x.w || x).family)}"></span><div>${render(x)}</div></label>`).join("")}</section>` : "";
  return intro + `<div class="cu-sum"><div><b>${esc(U.name)}</b><span class="muted">Sheet “${esc(U.sheet)}” · ${U.rows} rows read</span></div>
     <div class="cu-pills"><span class="pill blue">${U.changed.length} changed</span><span class="pill green">${U.added.length} new</span><span class="pill amber">${U.missing.length} not in file</span><span class="pill">${U.same} unchanged</span></div>
     <div style="display:flex;gap:8px"><button class="btn" data-cureset="1">Choose another file</button><button class="btn red" data-cuapply="1" ${n ? "" : "disabled"}>Apply ${plural(n, "change")}</button></div></div>
   ${!U.changed.length && !U.added.length && !U.missing.length ? `<section class="card"><p class="empty">The file matches the calendar in the Hub. Nothing to update.</p></section>` : ""}
   ${sec("Changed", "Sessions already in the Hub whose details are different in the file.", U.changed, "c", x => `<h4>${esc(x.s.kind === "holiday" ? x.s.title : x.s.programme + " · " + (x.s.short || x.s.title))}</h4><div class="cu-ch">${x.ch.map(c => `<span><em>${c.l}</em> <s>${showVal(c.f, c.from)}</s> → <b>${showVal(c.f, c.to)}</b></span>`).join("")}</div>${x.ch.some(c => /date/.test(c.f)) ? `<div class="muted" style="font-size:12px;margin-top:4px">${tasksOf(x.s.id).filter(isOpen).length} open tasks will move with the new date.</div>` : ""}`)}
   ${sec("New sessions", "In the file but not in the Hub yet. Tasks are created from the matching workflow.", U.added, "a", x => `<h4>${esc(x.w.kind === "holiday" ? x.w.title + " (holiday)" : x.w.programme + " · " + x.w.title)}</h4><div class="meta muted" style="font-size:12.5px">${x.w.start_date ? esc(fmtL(x.w.start_date)) + (x.w.end_date && x.w.end_date !== x.w.start_date ? " – " + esc(fmtL(x.w.end_date)) : "") : "Dates to confirm"} · ${esc(x.w.mode)} · ${esc(x.w.location || "")}${x.w.kind === "session" ? " · " + esc(x.w.faculty) : ""}</div>`)}
   ${sec("No longer in the file", "These are in the Hub but not in the new file. Left as they are unless you tick them, then they're removed with their tasks.", U.missing, "m", x => `<h4>${esc(x.kind === "holiday" ? x.title : x.programme + " · " + (x.short || x.title))}</h4><div class="muted" style="font-size:12.5px">${x.start_date ? esc(range(x)) : "No date"} · ${plural(tasksOf(x.id).length, "task")}${tasksOf(x.id).some(t => t.status === "done") ? " · some already done" : ""}</div>`)}
   ${U.skipped.length ? `<p class="muted" style="font-size:12.5px;margin-top:6px">Skipped: ${esc(U.skipped.join("; "))}.</p>` : ""}`;
}

async function applyCalUpdate() {
  const U = S.calup, btn = $("[data-cuapply]"); if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
  let ok = 0, fail = [];
  for (const x of U.changed.filter(x => x.on)) {
    const patch = Object.fromEntries(x.ch.map(c => [c.f, c.to || (/date/.test(c.f) ? null : "")]));
    if (x.w.check_note) patch.check_note = x.w.check_note;
    const { error } = await sb.from("hub_sessions").update(patch).eq("id", x.s.id); error ? fail.push(error.message) : ok++;
  }
  const counts = {}; S.sessions.forEach(s => { counts[s.programme] = (counts[s.programme] || 0) + 1; });
  const stamp = Date.now().toString(36);
  const ins = U.added.filter(x => x.on).map((x, i) => { const w = { ...x.w }; const row = w.row; delete w.row; if (w.kind === "session" && !w.short) { counts[w.programme] = (counts[w.programme] || 0) + 1; w.short = `Session ${counts[w.programme]}`; } return { ...w, id: `U${stamp}${i}`, src_row: row }; });
  if (ins.length) { const { error } = await sb.from("hub_sessions").insert(ins); error ? fail.push(error.message) : ok += ins.length; }
  for (const s of U.missing.filter(x => x.on)) { const { error } = await sb.from("hub_sessions").delete().eq("id", s.id); error ? fail.push(error.message) : ok++; }
  await loadAll(); S.calup = null;
  toast(fail.length ? `${ok} saved. ${fail.length} could not be saved: ${fail[0]}` : `Calendar updated: ${plural(ok, "change")} saved. Tasks have moved with the new dates.`);
  go("calendar");
}

document.addEventListener("change", async e => {
  if (e.target.id === "calfile" && e.target.files[0]) {
    const f = e.target.files[0]; S.calup = { busy: true }; render();
    try {
      const { sheet, rows } = await readCalendarFile(f);
      if (!rows.length) throw new Error("No calendar rows found. Check it's the 2027 calendar sheet with a Date column.");
      const D = diffCalendar(rows);
      S.calup = { name: f.name, sheet, rows: rows.length, same: D.same, skipped: D.skipped, changed: D.changed.map(x => ({ ...x, on: true })), added: D.added.map(w => ({ w, on: true })), missing: D.missing.map(s => ({ ...s, on: false })) };
    } catch (err) { S.calup = { err: err.message || String(err) }; }
    render(); return;
  }
  const t = e.target.dataset && e.target.dataset.cutick; if (!t || !S.calup) return;
  const [k, i] = t.split(":"), L = { c: S.calup.changed, a: S.calup.added, m: S.calup.missing }[k]; L[+i].on = e.target.checked; render();
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cuall],[data-cureset],[data-cuapply]"); if (!b || !S.calup) return;
  if (b.dataset.cureset) { S.calup = null; render(); return; }
  if (b.dataset.cuapply) { applyCalUpdate(); return; }
  const L = { c: S.calup.changed, a: S.calup.added, m: S.calup.missing }[b.dataset.cuall], on = !L.every(x => x.on); L.forEach(x => { x.on = on; }); render();
});
