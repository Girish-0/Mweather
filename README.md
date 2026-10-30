# Certificates of Trust — SIH26073

Explainable anomaly detection for Bengaluru Automatic Weather Stations: for every hourly reading it decides **sensor fault vs genuine (even extreme) weather** and shows the mathematical reason. Raw data is never deleted; flags are appended as `QC_FLAG`.

**Live prototype:** https://girish-0.github.io/Mweather/

- `index.html` — the whole prototype (vanilla JS, no build). Fetches live hourly data from Open-Meteo, or accepts a CSV (`time,T,H,P,R,W`).
- `metrics.mjs` — runs the same detection code in Node and prints Baseline vs Ours metrics: `node metrics.mjs [lat lon]`.
- `deck/` — pitch deck.

Pipeline: gaps → physical bounds + flatline → seasonal-trend residuals, modified Z (MAD) + CUSUM → Mahalanobis D² + storm-preservation gate. Thresholds start at the spec values (3.5, h=5, χ²₅,₀.₉₉₉) and are raised on the validation split until false-alarm rate ≤ 1%.

Data: Open-Meteo (CC BY 4.0). Map: © OpenStreetMap contributors.

## Sample CSV (real station data)

[`samples/bengaluru_43295_2025-09-10.csv`](samples/bengaluru_43295_2025-09-10.csv): hourly readings from the IMD Bangalore observatory (WMO 43295, 12.97 N 77.58 E, 920 m), 1 Sep – 31 Oct 2025, 1,446 of 1,464 hours present. Upload it with **Upload CSV** on the prototype.

| Column | Unit | Source / conversion |
|---|---|---|
| `time` | IST, hourly | Meteostat date + hour |
| `T` | °C | air temperature |
| `H` | % | relative humidity |
| `P` | hPa | station pressure, converted from Meteostat sea-level pressure (hypsometric, z = 920 m) |
| `R` | mm/h | precipitation |
| `W` | m/s | wind speed (km/h ÷ 3.6) |

Source: [Meteostat](https://meteostat.net) hourly bulk data, CC BY-NC 4.0. Meteostat fills some gaps with model data. Regenerate with `node samples/make_sample.mjs > samples/bengaluru_43295_2025-09-10.csv`.

Raw IMD AWS / KSNDMC telemetry is not openly downloadable; it is available on request from IMD (aws.imd.gov.in) and KSNDMC.
