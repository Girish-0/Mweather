// Runs index.html's detection core in Node on live Open-Meteo data and prints the deck numbers.
// usage: node metrics.mjs [lat lon]
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const K = new Function(core + '; return { OM_URL, parseOpenMeteo, toGrid, detect, runInjected, inv, fmtTime };')();

// self-check: Gauss-Jordan inverse
const A = [[4,1,0,0,2],[1,3,0,1,0],[0,0,2,0,0],[0,1,0,5,1],[2,0,0,1,6]], Ai = K.inv(A);
A.forEach((r,i) => r.forEach((_,j) => assert(Math.abs(r.reduce((s,v,k) => s + v * Ai[k][j], 0) - (i === j)) < 1e-9)));

const [lat, lon] = process.argv.length > 3 ? process.argv.slice(2) : [12.9716, 77.5946];
const rows = K.toGrid(K.parseOpenMeteo(await (await fetch(K.OM_URL(lat, lon))).json()));
const real = K.detect(rows), I = K.runInjected(rows), { ours, base, drop } = I.metrics;
console.log(`rows ${rows.length}: ${K.fmtTime(rows[0].ts)} → ${K.fmtTime(rows.at(-1).ts)} IST; test window ${rows.length - I.t0} h`);
console.log(`real-data flags: ${real.flags.length}`, Object.fromEntries(Object.entries(Object.groupBy(real.flags, f => f.reason + "|" + "*THPRW"[f.c+1])).map(([k,v]) => [k, v.length])));
console.log('injected events:', I.events.map(e => `${e.type}@${K.fmtTime(rows[e.s].ts)}×${e.len}h`).join(', '));
const f = (x, d = 3) => isNaN(x) ? '—' : x.toFixed(d);
console.table({
  Baseline: { Precision: f(base.P), Recall: f(base.R), F1: f(base.F1), FPR: f(base.FPR * 100, 2) + '%', 'Delay h': base.hit ? `${f(base.delay, 1)} (${base.hit}/${base.of})` : `missed (0/${base.of})`, TP: base.tp, FP: base.fp, FN: base.fn, TN: base.tn },
  Ours:     { Precision: f(ours.P), Recall: f(ours.R), F1: f(ours.F1), FPR: f(ours.FPR * 100, 2) + '%', 'Delay h': ours.hit ? `${f(ours.delay, 1)} (${ours.hit}/${ours.of})` : `missed (0/${ours.of})`, TP: ours.tp, FP: ours.fp, FN: ours.fn, TN: ours.tn },
});
console.table(Object.fromEntries(drop.map(d => [`F1 @ ${d.p}% dropout`, { Baseline: f(d.base), Ours: f(d.ours) }])));
const ev = {}; I.events.forEach(e => { let o = false, b = false; for (let t = e.s; t < e.s + e.len; t++){ o ||= I.res.byRow[t].some(f => f.reason !== 'VALID_EXTREME_WEATHER'); b ||= I.base.byRow[t].length > 0; }
  const k = ev[e.type] ??= { events: 0, Ours: 0, Baseline: 0 }; k.events++; k.Ours += o; k.Baseline += b; });
console.table(ev);
console.log('validation-tuned thresholds:', JSON.stringify(I.res.thr));
