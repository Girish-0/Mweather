Build a working prototype website for our ideathon project. Attached image = the visual style to copy (layout, glassmorphism, typography scale, mood). The research/strategy doc is pasted below this prompt — the math in it is the spec. We have ~45 minutes, so: ONE self-contained `index.html` (inline CSS + vanilla JS), no build step, no framework. Only external things allowed: Google Fonts, Leaflet from cdnjs, and the Open-Meteo API.

## Project
"Certificates of Trust" — SIH26073, AI/ML anomaly detection for Automatic Weather Stations in Bengaluru. For every hourly reading it decides: **sensor fault or genuine (even extreme) weather**, and shows the mathematical reason. Raw data is never deleted; flags are appended as QC_FLAG.

## HARD RULE: no dummy data
- Every number on screen is computed from real data fetched at load time. No hardcoded temperatures, cities, metrics or example flags anywhere.
- Data source: Open-Meteo (free, no key, CORS ok):
  `https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&hourly=temperature_2m,relative_humidity_2m,surface_pressure,precipitation,wind_speed_10m&wind_speed_unit=ms&past_days=31&forecast_days=1&timezone=Asia%2FKolkata`
  → 5 channels x_t = (T, H, P, R, W), ~768 hourly rows. Drop hours after "now".
- Also accept a user-uploaded CSV (columns: time,T,H,P,R,W) so real IMD/KSNDMC station data can be run through the same pipeline.
- If the fetch fails: show an honest error state + the CSV upload button. Never fall back to fake numbers.
- If something can't be computed (e.g. metrics without injected faults), show "—" with a one-line reason, not a made-up value.

## Detection pipeline (implement exactly, in JS)
Split chronologically: first 60% = calibration, next 20% = validation, last 20% = test.
1. **Gaps**: missing hour ≤3h → interpolate the deseasonalised residual; >3h → `COMMUNICATION_LOSS`, reset CUSUM.
2. **Stage 1 – bounds**: T∈[-5,50] °C, H∈[0,100] %, P∈[880,940] hPa, R∈[0,150] mm/h, W∈[0,50] m/s → `OUT_OF_RANGE`.
   **Flatline**: rolling variance over k=6 < 1e-6 on T, H, P, and W (only when W>0). Never flatline-test rain (0 mm is normal) → `FLATLINE_FAULT`.
3. **Stage 2 – residuals**: trend = trailing 24h rolling median; seasonal = per-hour-of-day median of (x − trend) over the calibration set; e = x − trend − seasonal.
   **Modified Z**: M = 0.6745·|e − median(e)| / MAD (MAD from calibration). M > 3.5 → `TEMPORAL_SPIKE`. If a channel's MAD is 0 (rain usually is), skip the spike test for that channel instead of dividing by zero.
   **CUSUM** on z = 0.6745·(e − median)/MAD with κ=0.5, h=5 → `CALIBRATION_DRIFT`; reset accumulator after a flag.
4. **Stage 3 – multivariate**: robust centre = channel medians; covariance computed on calibration rows where every |M|<3.5. D² = (e−μ)ᵀ Σ⁻¹ (e−μ) (5×5, write a tiny Gauss-Jordan inverse). D² > 20.515 (χ²₅,0.999) OR (R>10 mm AND H residual < −15%) → `MULTIVARIATE_INCONSISTENCY`.
   **Storm-preservation gate (the core idea)**: if R ≥ 10 mm AND H ≥ 85% AND pressure fell over the last 3h (or T dropped) → label `VALID_EXTREME_WEATHER`, NOT a fault, shown in green. Real storms must never be flagged.
   Skip Isolation Forest in the prototype (mention it as "verification layer, roadmap").
5. Each flag stores: timestamp, channel, observed value, expected (trend+seasonal), score, threshold, reason code, plain-English sentence (e.g. "Night temperature residual +14.4 °C exceeds 3.5·MAD limit").

**Baseline for comparison**: static range + step-change rule + rolling 24h mean/std 3σ on raw data. Same output format.

## Fault-injection demo (this is how we prove it works on real data)
A toggle **"Inject Faults"**. When ON, copy the real series and inject into the TEST window with a seeded PRNG (mulberry32, SEED=42): 3× spike (+12–16 °C on T at night), 2× flatline (T stuck 6–8h during the day), 1× drift (+0.08 °C/h on T for 40h), 2× inconsistency (R=38 mm with H forced to 28%), 1× 5h gap. Keep ground-truth labels.
Then compute LIVE for both Baseline and Ours on the test window: Precision, Recall, F1, FPR, mean detection delay (hours, for flatline + drift). Also F1 with 5/10/20% random dropouts. Show these in a "Baseline vs Ours" panel. These are the numbers we'll put in the slides, so they must be real outputs.

## Layout (map each element of the reference image)
Full-viewport dark rounded card over a moody storm-cloud background (CSS gradient + subtle noise, or an Unsplash cloud photo with gradient fallback). Glass panels: `background: rgba(255,255,255,.06); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,.12); border-radius: 28px`.

**Left glass column (like WeatherWise sidebar)**
- Logo text "Certificates of Trust" with the thin underline arc.
- "Station Health" card (replaces "Status"): chip "↑ x.x% flagged" (real flag rate, last 24h); the gradient curve gauge (cyan→amber→rose) with a dot at the current anomaly level and a white pill label: **Healthy / Suspicious / Faulty** (thresholds on flag rate: <1% / <5% / ≥5%). Link "See diagnostic log ›" opens the log drawer.
- "Select Station": the circular globe → a circle-masked Leaflet dark map (CARTO dark tiles) of Bengaluru with pins for Bengaluru Central (12.9716,77.5946), Whitefield (12.9698,77.7500), Yelahanka (13.1007,77.5963), Electronic City (12.8452,77.6602). Clicking a pin refetches Open-Meteo for those coords and reruns everything. Pin colour = that station's health. The pill below shows the selected station name.

**Top bar (right side)**
- 📍 "Bengaluru Central, Karnataka (Thursday, 30 October)" — real date, selected station.
- Round search button → opens a date-range / timestamp jump (native `<input type="datetime-local">`) to inspect any hour.
- Pill button **"Download QC Report"** (replaces "Download App") → CSV of all rows with QC_FLAG, reason, score.

**Hero (centre)**
- Huge thin current value (latest real T, e.g. "24°") with H/L pills = today's real max/min.
- Big two-line headline (like "Stormy with partly cloudy") = the verdict for the selected hour, e.g. "Sensor healthy / all 5 channels trusted", or "Genuine storm / not a fault", or "Temperature spike / sensor fault". Second line dimmer.
- Channel switcher pills under it: T · H · P · R · W.

**Right column**
- Short tagline paragraph: "Every reading Bengaluru's flood network acts on should carry a mathematical certificate of trust."
- "Recent Flags" + "See All ›" (replaces "Recently Searched"): two glass cards for the 2 most recent flags — icon per reason code, value in large type, reason code as title, time as dim subtitle. Click → select that hour. If there are no flags, show one card "No faults in last 72h" (that's a real result, fine).
- Below: the **Baseline vs Ours** metrics panel (compact glass table), visible when Inject Faults is ON, otherwise "Turn on Inject Faults to measure detection".
- "Inject Faults" toggle sits here.

**Bottom timeline (the wave)**
- Day labels across the top (last 7 days, real weekdays), smooth white SVG curve of the selected channel's hourly values (Catmull-Rom path), daily mean values below in big thin numbers like "28°".
- Flags = small coloured dots on the curve (rose = fault, amber = drift, green = valid extreme weather). Hover tooltip shows the full certificate (observed, expected, score vs threshold, reason sentence).
- Selected hour = glowing white dot + dashed vertical line, exactly like "Wednesday" in the reference. Click anywhere on the curve to select. ←/→ arrow keys step hours.
- Optional faint second line: expected (trend+seasonal) so the residual is visible.

**Diagnostic log drawer** (slides in from right): table — Timestamp | Channel | Observed | Expected | Score vs threshold | Reason code | Explanation. Filter chips per reason code. This is the "why was it flagged" deliverable.

## Visual tokens (match our pitch deck)
- Fonts: Inter (200/300/400/500) for everything, JetBrains Mono for scores/reason codes.
- Text #C9D3DF, dim #8A99AD; accents: cyan #38BDF8, amber #F59E0B, rose #FB7185, green #34D399.
- Huge numbers weight 200; headline ~64px weight 300 with second line at 55% opacity.
- Must look right at 1440×900 (projector) and not break at laptop width.

## Priority order (stop wherever time runs out — each step must leave a working page)
1. Fetch + pipeline + console.table of flags.
2. Hero + timeline wave with flag dots + selected-hour verdict.
3. Recent flags cards + diagnostic log + CSV download.
4. Inject Faults + Baseline vs Ours metrics.
5. Station map + health gauge.
6. Polish / animations.

After building, print in the chat: the measured Precision/Recall/F1/FPR/delay for Baseline vs Ours with SEED=42 on the Bengaluru Central station, so we can paste them into the deck.

--- RESEARCH DOC BELOW ---
(paste mathx_ideathon_problem_statement_and_strategy.md here)
