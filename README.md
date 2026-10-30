# Certificates of Trust — SIH26073

Explainable anomaly detection for Bengaluru Automatic Weather Stations: for every hourly reading it decides **sensor fault vs genuine (even extreme) weather** and shows the mathematical reason. Raw data is never deleted; flags are appended as `QC_FLAG`.

**Live prototype:** https://girish-0.github.io/Mweather/

- `index.html` — the whole prototype (vanilla JS, no build). Fetches live hourly data from Open-Meteo, or accepts a CSV (`time,T,H,P,R,W`).
- `metrics.mjs` — runs the same detection code in Node and prints Baseline vs Ours metrics: `node metrics.mjs [lat lon]`.
- `deck/` — pitch deck.

Pipeline: gaps → physical bounds + flatline → seasonal-trend residuals, modified Z (MAD) + CUSUM → Mahalanobis D² + storm-preservation gate. Thresholds start at the spec values (3.5, h=5, χ²₅,₀.₉₉₉) and are raised on the validation split until false-alarm rate ≤ 1%.

Data: Open-Meteo (CC BY 4.0). Map: © OpenStreetMap contributors.
