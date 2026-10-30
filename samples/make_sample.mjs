// Builds bengaluru_43295_2025-09-10.csv from Meteostat hourly data for IMD Bangalore (WMO 43295, 12.97N 77.58E, 920 m).
// Meteostat columns (UTC): date,hour,temp,dwpt,rhum,prcp,snow,wdir,wspd(km/h),wpgt,pres(sea-level hPa),tsun,coco
// usage: node samples/make_sample.mjs > samples/bengaluru_43295_2025-09-10.csv
import { gunzipSync } from 'node:zlib';

const Z = 920;   // station elevation, m
const buf = Buffer.from(await (await fetch('https://bulk.meteostat.net/v2/hourly/43295.csv.gz')).arrayBuffer());
const out = ['time,T,H,P,R,W'];
for (const line of gunzipSync(buf).toString().split('\n')) {
  const [date, hour, temp, , rhum, prcp, , , wspd, , pres] = line.split(',');
  if (!(date >= '2025-09-01' && date < '2025-11-01')) continue;
  const n = v => v === '' || v == null ? null : +v;
  const T = n(temp), slp = n(pres), w = n(wspd);
  // sea-level -> station pressure (hypsometric, mean layer temperature T + 0.0065·Z/2)
  const P = slp != null && T != null ? slp * Math.exp(-Z / (29.27 * (T + 273.15 + 0.00325 * Z))) : null;
  const f = (v, d) => v == null ? '' : v.toFixed(d);
  const ist = new Date(Date.parse(`${date}T${hour.padStart(2, '0')}:00Z`) + 19800e3).toISOString().slice(0, 16);   // Meteostat is UTC -> IST
  out.push([ist, f(T, 1), f(n(rhum), 0), f(P, 1), f(n(prcp), 1), f(w == null ? null : w / 3.6, 1)].join(','));
}
console.log(out.join('\n'));
