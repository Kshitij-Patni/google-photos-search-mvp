/* =========================================================
   Recall-based search engine (client-side simulation)
   Dimensions come from user research — what people actually remember:
     who   – people / faces         (100% recall, 60% rely on faces)
     what  – event / occasion       (100% recall, 50% success alone)
     when  – tentative timeline     (100% recall, 66.7% success)
     where – place / background     (100% recall)
     wear  – clothing / colours     (80% recall, but 25% success → low weight)
   ========================================================= */

const DIMS = {
  who:   { label: 'Who',   icon: 'person',         color: 'var(--c-who)',   prompt: 'who was there' },
  what:  { label: 'What',  icon: 'celebration',    color: 'var(--c-what)',  prompt: 'the occasion' },
  when:  { label: 'When',  icon: 'calendar_month', color: 'var(--c-when)',  prompt: 'roughly when' },
  where: { label: 'Where', icon: 'landscape',      color: 'var(--c-where)', prompt: 'where / what was around' },
  wear:  { label: 'Wearing', icon: 'apparel',      color: 'var(--c-wear)',  prompt: 'what they wore' },
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Lexicon ---------- */
const LEXICON = (() => {
  const L = [];
  PEOPLE.forEach((p) => p.aliases.forEach((a) => L.push({ phrase: a, dim: 'who', value: p.id })));
  Object.entries(EVENTS).forEach(([k, e]) => e.aliases.forEach((a) => L.push({ phrase: a, dim: 'what', value: k })));
  Object.entries(WHERE_WORDS).forEach(([k, arr]) => arr.forEach((a) => L.push({ phrase: a, dim: 'where', value: k })));
  Object.entries(CLOTHING_WORDS).forEach(([k, arr]) => arr.forEach((a) => L.push({ phrase: a, dim: 'wear', value: k })));
  // time
  ['this year', 'last year', 'last winter', 'last summer', 'last monsoon', 'recently', 'recent', 'last month', 'this month']
    .forEach((a) => L.push({ phrase: a, dim: 'when', value: a }));
  Object.keys(SEASONS).forEach((s) => L.push({ phrase: s, dim: 'when', value: s }));
  MONTH_FULL.forEach((m, i) => L.push({ phrase: m, dim: 'when', value: 'm' + (i + 1) }));
  MONTHS.forEach((m, i) => L.push({ phrase: m, dim: 'when', value: 'm' + (i + 1) }));
  L.push({ phrase: 'sept', dim: 'when', value: 'm9' });
  return L.sort((a, b) => b.phrase.length - a.phrase.length);
})();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ---------- Parse ---------- */
function parseQuery(q) {
  const raw = q || '';
  // keep string length identical so indices map back to the raw text
  const norm = raw.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9'é ]/g, ' ');
  const taken = new Array(norm.length).fill(false);
  const matches = [];

  const claim = (start, end, m) => {
    for (let i = start; i < end; i++) if (taken[i]) return false;
    for (let i = start; i < end; i++) taken[i] = true;
    matches.push({ ...m, start, end, text: raw.slice(start, end) });
    return true;
  };

  // years first
  for (const m of norm.matchAll(/(?<![a-z0-9])(20\d\d)(?![a-z0-9])/g)) {
    claim(m.index, m.index + m[0].length, { dim: 'when', value: 'y' + m[1], phrase: m[1] });
  }
  for (const entry of LEXICON) {
    const re = new RegExp(`(?<![a-z0-9])${escapeRe(entry.phrase)}('s|s)?(?![a-z0-9])`, 'g');
    for (const m of norm.matchAll(re)) claim(m.index, m.index + m[0].length, entry);
  }
  matches.sort((a, b) => a.start - b.start);

  const uniq = (arr) => [...new Set(arr)];
  const pick = (d) => uniq(matches.filter((m) => m.dim === d).map((m) => m.value));

  const whenVals = pick('when');
  const now = DEMO_NOW, Y = now.getFullYear();
  const when = { years: [], months: [], ranges: [], vals: whenVals };
  whenVals.forEach((v) => {
    if (/^y\d{4}$/.test(v)) when.years.push(+v.slice(1));
    else if (/^m\d+$/.test(v)) when.months.push(+v.slice(1));
    else if (SEASONS[v]) when.months.push(...SEASONS[v]);
    else if (v === 'this year') when.years.push(Y);
    else if (v === 'last year') when.years.push(Y - 1);
    else if (v === 'last winter') when.ranges.push([new Date(Y - 1, 11, 1), new Date(Y, 2, 0)]);
    else if (v === 'last summer') when.ranges.push([new Date(Y - (now.getMonth() >= 6 ? 0 : 1), 3, 1), new Date(Y - (now.getMonth() >= 6 ? 0 : 1), 6, 0)]);
    else if (v === 'last monsoon') when.ranges.push([new Date(Y - (now.getMonth() >= 9 ? 0 : 1), 6, 1), new Date(Y - (now.getMonth() >= 9 ? 0 : 1), 9, 0)]);
    else if (v === 'recent' || v === 'recently') when.ranges.push([new Date(now - 90 * 864e5), now]);
    else if (v === 'last month') when.ranges.push([new Date(Y, now.getMonth() - 1, 1), new Date(Y, now.getMonth(), 0)]);
    else if (v === 'this month') when.ranges.push([new Date(Y, now.getMonth(), 1), now]);
  });

  // words we didn't understand (ignore filler words)
  const FILLER = new Set(['a', 'an', 'the', 'and', 'with', 'of', 'at', 'in', 'on', 'from', 'to', 'for', 'photo', 'photos', 'pic', 'pics', 'picture', 'pictures', 'image', 'images', 'my', 'our', 'i', 'we', 'was', 'were', 'wearing', 'wore', 'show', 'find', 'during', 'near', 'around', 'some', 'all', 'by', 'us', 'together', 'where', 'when', 'who', 'what', 's', 'took', 'clicked', 'selfie', 'selfies']);
  const unknown = [];
  for (const m of norm.matchAll(/[a-z0-9'é]+/g)) {
    let free = true;
    for (let i = m.index; i < m.index + m[0].length; i++) if (taken[i]) { free = false; break; }
    const w = m[0].replace(/'s$/, '').replace(/'/g, '');
    if (free && w && !FILLER.has(w)) unknown.push(w);
  }

  const parsed = { raw, matches, who: pick('who'), what: pick('what'), where: pick('where'), wear: pick('wear'), when, unknown };
  parsed.has = {
    who: parsed.who.length > 0, what: parsed.what.length > 0, where: parsed.where.length > 0,
    wear: parsed.wear.length > 0, when: whenVals.length > 0,
  };
  parsed.coreCount = ['who', 'what', 'when', 'where'].filter((d) => parsed.has[d]).length;
  parsed.empty = parsed.coreCount === 0 && !parsed.has.wear;
  return parsed;
}

/* ---------- Labels ---------- */
function valueLabel(dim, v) {
  if (dim === 'who') return (PEOPLE.find((p) => p.id === v) || {}).short || v;
  if (dim === 'what') return (EVENTS[v] || {}).label || v;
  if (dim === 'where') return PLACE_LABEL[v] || cap(v);
  if (dim === 'wear') return v === 'tshirt' ? 'T-shirt' : cap(v);
  if (dim === 'when') {
    if (/^y\d{4}$/.test(v)) return v.slice(1);
    if (/^m\d+$/.test(v)) return cap(MONTHS[+v.slice(1) - 1]);
    return cap(v);
  }
  return v;
}

function clueChips(parsed) {
  const out = [];
  ['who', 'what', 'when', 'where', 'wear'].forEach((d) => {
    const vals = d === 'when' ? parsed.when.vals : parsed[d];
    vals.forEach((v) => out.push({ dim: d, value: v, label: valueLabel(d, v) }));
  });
  return out;
}

/* ---------- Matching ---------- */
function photoTimeOk(photo, when) {
  if (!when.vals.length) return true;
  const d = new Date(photo.date + 'T12:00:00');
  const y = d.getFullYear(), m = d.getMonth() + 1;
  if (when.years.length && !when.years.includes(y)) return false;
  if (when.months.length && !when.months.includes(m)) return false;
  if (when.ranges.length && !when.ranges.some(([a, b]) => d >= a && d <= b)) return false;
  return true;
}

function wearScore(photo, wear) {
  return wear.reduce((s, w) => s + (photo.wear.includes(w) ? 1 : 0), 0);
}

/**
 * @param parsed  output of parseQuery
 * @param pool    photo list to search in (e.g. a single person's photos)
 */
function runSearch(parsed, pool = PHOTOS) {
  let res = pool.slice();
  const clothingOnly = parsed.coreCount === 0 && parsed.has.wear;

  if (parsed.has.who) res = res.filter((p) => parsed.who.every((w) => p.people.includes(w)));
  if (parsed.has.what) res = res.filter((p) => parsed.what.includes(p.event));
  if (parsed.has.where) res = res.filter((p) => parsed.where.some((w) => p.where.includes(w)));
  if (parsed.has.when) res = res.filter((p) => photoTimeOk(p, parsed.when));

  let lowConfidence = false;
  if (clothingOnly) {
    // Clothing-only queries are unreliable (25% success in research) → loose, flagged results
    res = res.filter((p) => wearScore(p, parsed.wear) > 0);
    lowConfidence = true;
  }
  if (parsed.has.wear) {
    res.sort((a, b) => wearScore(b, parsed.wear) - wearScore(a, parsed.wear) || b.date.localeCompare(a.date));
  } else {
    res.sort((a, b) => b.date.localeCompare(a.date));
  }

  // pure free text fallback on titles
  if (parsed.empty && parsed.raw.trim()) {
    const words = parsed.unknown;
    res = pool.filter((p) => words.some((w) => p.title.toLowerCase().includes(w)));
  }
  return { results: res, lowConfidence, clothingOnly };
}

/* ---------- Strength meter (estimates grounded in survey success rates) ---------- */
function searchStrength(parsed) {
  const n = parsed.coreCount, t = parsed.has.when;
  let pct = 0;
  if (n === 0) pct = parsed.has.wear ? 25 : 0;
  else if (n === 1) pct = t ? 67 : 50;
  else if (n === 2) pct = t ? 82 : 64;
  else pct = t ? 93 : 76;
  if (n > 0 && parsed.has.wear) pct = Math.min(96, pct + 3);
  let label = 'Add a clue', level = 0;
  if (pct > 0) { label = 'Weak'; level = 1; }
  if (pct >= 45) { label = 'Fair'; level = 2; }
  if (pct >= 62) { label = 'Good'; level = 3; }
  if (pct >= 80) { label = 'Strong'; level = 4; }
  if (pct >= 90) { label = 'Excellent'; level = 5; }
  return { pct, label, level };
}

/* ---------- Coaching hint: the "prompt" that improves results ---------- */
function searchHint(parsed) {
  if (!parsed.raw.trim()) return { icon: 'lightbulb', tone: 'info', html: 'Describe it like you’d tell a friend: <b>who</b> + <b>occasion</b> + <b>rough time</b>.' };
  if (parsed.coreCount === 0 && parsed.has.wear)
    return { icon: 'warning', tone: 'warn', dim: 'who', html: 'Clothing alone finds the right photo only <b>1 in 4</b> times. Add <b>who</b> or <b>when</b> to be sure.' };
  if (parsed.empty)
    return { icon: 'help', tone: 'warn', dim: 'who', html: 'We couldn’t spot a clue. Try a <b>person</b>, an <b>occasion</b> or a <b>year</b>.' };
  if (!parsed.has.when)
    return { icon: 'calendar_month', tone: 'tip', dim: 'when', html: 'Add a rough time — even “last winter” or “2025”. Searches with a timeline succeed <b>2.7×</b> more often.' };
  if (!parsed.has.who)
    return { icon: 'person', tone: 'tip', dim: 'who', html: 'Who was there? Adding a <b>face</b> narrows results the most.' };
  if (!parsed.has.what && !parsed.has.where)
    return { icon: 'celebration', tone: 'tip', dim: 'what', html: 'Add the <b>occasion</b> or <b>place</b> to pin it down.' };
  return { icon: 'check_circle', tone: 'ok', html: 'Great description — this should find it on the first try.' };
}

/* ---------- Remove a clue from the raw text ---------- */
function removeClue(q, dim, value) {
  const parsed = parseQuery(q);
  const hits = parsed.matches.filter((m) => m.dim === dim && m.value === value).sort((a, b) => b.start - a.start);
  let s = q;
  hits.forEach((h) => { s = s.slice(0, h.start) + s.slice(h.end); });
  return tidy(s);
}

function tidy(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/(,\s*){2,}/g, ', ')
    .replace(/^(\s*(and|with|in|at|on|of|,)\s+)+/i, '')
    .replace(/(\s+(and|with|in|at|on|of|,))+\s*$/i, '')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();
}

function appendClue(q, text) {
  const base = tidy(q || '');
  return base ? `${base} ${text}` : text;
}

/* ---------- Refinement suggestions from the result set ---------- */
function refinements(results, parsed, opts = {}) {
  const out = [];
  const count = (arr) => arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {});
  if (!opts.skipWho) {
    const ppl = count(results.flatMap((p) => p.people).filter((x) => !parsed.who.includes(x) && x !== opts.exclude));
    Object.entries(ppl).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .forEach(([id]) => out.push({ dim: 'who', text: (opts.withPrefix ? 'with ' : '') + valueLabel('who', id), label: valueLabel('who', id), face: PEOPLE.find((p) => p.id === id).face }));
  }
  if (!parsed.has.what) {
    const ev = count(results.map((p) => p.event).filter(Boolean));
    Object.entries(ev).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([k]) => out.push({ dim: 'what', text: EVENTS[k].label.toLowerCase(), label: EVENTS[k].label }));
  }
  if (!parsed.has.when) {
    const yrs = count(results.map((p) => p.date.slice(0, 4)));
    Object.keys(yrs).sort().reverse().slice(0, 3).forEach((y) => out.push({ dim: 'when', text: y, label: y }));
  }
  if (!parsed.has.where) {
    const wh = count(results.flatMap((p) => p.where).filter((w) => PLACE_LABEL[w] || ['beach', 'mountains', 'home', 'cafe', 'night', 'garden', 'street'].includes(w)));
    Object.entries(wh).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([k]) => out.push({ dim: 'where', text: valueLabel('where', k).toLowerCase(), label: valueLabel('where', k) }));
  }
  return out;
}
