# Pitch Script: Certificates of Trust (SIH26073)

Full run is about 12 min (10 min of slides and 2 min of live demo). **Bold** marks the words to hit. Text in [brackets] is a stage direction, not something to say.
Short on time? Cut slides 10 and 11 to one sentence each and keep slides 7, 8 and 12 whole. Formulation is the heaviest rubric item (25%).

---

## Fix before you present
1. **Slide 12 numbers are planning targets, not measurements** (0.948, 0.45%, 2.1 h…). A maths panel will ask "did you run this?" Replace them with the measured numbers below, or say "targets" out loud.
2. **Slide 2:** 6,505 gauges and 935 stations are, as far as I know, KSNDMC figures for all of **Karnataka**, not Bengaluru alone. Say "across Karnataka" unless your source says otherwise.
3. **Slide 1:** the team name, members and contact fields are still placeholders.
4. **Slide 11** mentions KNN-CAD, but the prototype only runs the 3σ baseline. Drop it or call it planned.
5. Live data changes every hour, so run `node metrics.mjs` again just before you go on stage.

---

## Slide 1: Title (20 s)
[Don't read the table out. Look at the panel.]

> "Good morning. One question before we begin: if a rain gauge in Bengaluru tells you it's **zero millimetres** right now… do you believe it?
> Most systems do. In the next ten minutes we'll show you why that's dangerous, and how mathematics can attach a **certificate of trust** to every single reading. We're team ___, problem SIH26073."

## Slide 2: Problem Definition (45 s)
> "KSNDMC runs thousands of rain gauges and hundreds of weather stations across Karnataka. Every 15 minutes they report temperature, humidity, pressure, rain and wind, and BBMP closes underpasses based on those numbers.
> But these instruments live outdoors. Leaves clog the rain bucket, lightning spikes the voltage, and sensors age and drift.
> So the real question isn't *'is this number unusual?'* In a Bengaluru monsoon, everything is unusual. The question is: **is the sensor lying, or is the sky really doing this?**
> A jammed gauge saying 0 mm during a cloudburst is **worse than no gauge at all**, because the flood model *trusts* it.
> Our job is to label every reading as a fault or as real weather, name which of four fault types it is, give the reason, and keep false alarms under 1%."

## Slide 3: Why Static Rules Fail (60 s)
> "The industry standard is the textbook rule: mean ± 3σ. It fails in three ways.
>
> **One: the Ambani problem.** [left card] Put ten of us in a room and the average salary is maybe fifty thousand. Mukesh Ambani walks in and the *average* is now in crores, but the *median* doesn't move. Mathematicians call this the **breakdown point**. The mean breaks with a single bad value, which is 0%. The median survives until half the data is garbage, which is 50%.
> At a weather station, one 62 °C voltage spike inflates σ and the 3σ band balloons. For the next 24 hours every *other* fault hides inside that fat band. **The fault camouflages the faults.**
>
> **Two: the cloudburst.** A real storm puts rainfall 6σ above normal, so a 3σ rule deletes it as an error. We've just blinded the flood system on the one day it mattered.
>
> **Three: the clock.** Bengaluru is 19° at dawn and 30° at 3 pm, every single day. That isn't an anomaly, it's the sun. Raw 3σ counts it as variance, so the bands get too wide to notice a sensor drifting 0.08° an hour.
>
> So we need maths that is **robust**, that **knows the clock**, and that **knows physics**."

## Slide 4: Mathematical Formulation (60 s)
> "Let's make it precise. Every 15 minutes the station gives us **x_t**, five numbers: T, H, P, R, W. That's one point in five-dimensional space. Our output is **ŷ_t**, a 0 or 1 for fault or no fault, plus a **reason code r_t** naming which of the four faults it is.
>
> The objective is to **maximise F1**, the balance between catching faults and not crying wolf, **subject to** two constraints: false-positive rate at most 1%, and expected detection delay below a bound.
> Why constraints and not just accuracy? Because an alarm that cries wolf ten times a day gets **switched off**. That α_max = 1% is our promise to the operator.
>
> The decision variable θ is just **four thresholds**. That's four knobs, each with a physical meaning, tuned on a validation window we never test on.
> The constraints come from physics at 920 m. Pressure must lie between 880 and 940 hPa. Bengaluru sits high, so a sea-level reading of 1013 would *itself* be a fault.
> The assumption is that once you remove the trend and the 24-hour cycle, what's left is roughly stationary, and less than half of any window is broken. That's exactly the 50% the median can tolerate."

## Slide 5: Fault Taxonomy (60 s)
> "We model every reading as a sum. Think of it as a song.
> **μ**, the trend, is the slow bass line. **S**, sines and cosines with a 24-hour period, is the daily beat. **η**, weather chaos, is the improvisation. **ε** is the hiss of noise. And **f**, the sensor fault, is the **scratch on the record**.
> A healthy sensor means f = 0, so our whole job is to estimate f.
>
> Faults come in four shapes, each with its own equation:
> 1. **Spike:** a delta function. One hour, huge, then gone. A lightning surge or a bit-flip.
> 2. **Flatline:** x stuck at a constant, so the 6-hour variance is exactly zero. **Real weather never holds its breath for six hours.** Rain is the exception, since 0 mm for a week is just a dry week, so we don't run this test on rain.
> 3. **Drift:** a ramp, α·(t − t₀). An ageing sensor or a dirty radiation shield, small enough each hour to look innocent.
> 4. **Inconsistency:** every channel is in range on its own, but together they break physics. Thirty-eight millimetres of rain at 28% humidity is a **wet desert**, and wet deserts don't exist.
>
> Four faults and four equations mean we need four different detectors."

## Slide 6: Proposed Method (45 s)
> "The pipeline is tiered like a hospital: triage first, specialists only when needed.
> **Tier 1** is physics and the flatline test. It's cheap enough to run on the sensor's own microcontroller.
> **Tier 2** is robust statistics: MAD, CUSUM and MCD. This is the core.
> **Tier 3** is chaos theory and conformal tests. It separates real chaos from faults and gives a guaranteed false-alarm rate.
> **Tier 4** is a satellite oracle from ISRO and NASA, a second opinion for when the ground reports something extreme.
>
> There are three reasons for this design. Our estimators have a **50% breakdown point**, so the faults can't hide the faults. **Every flag carries its own equation, score and threshold**, so there's no black box. And the cost is **O(W + d²)** per reading. With d = 5 that's a 5×5 matrix, which runs on a ₹300 chip.
> The baseline is the industry standard, static range checks plus 3σ Shewhart limits, run on the same test data."

## Slide 7: Core Mathematics (90 s). This is where the 25% is won.
> "Four ideas from four mathematicians.
>
> **One: robust residual control.** First we subtract what the clock already predicts: the trend, plus the median for that hour of day. What's left, e_t, is the *surprise*. We measure it with MAD, the median absolute deviation, multiplied by **0.6745**. That's Φ⁻¹(0.75), the constant that makes MAD a fair estimate of σ for a normal curve. A modified Z above 3.5 means a spike.
> For drift we use **Page's CUSUM**, from 1954 factory quality control. Think of Bengaluru traffic. One signal that runs 30 seconds slow means nothing. But if *every* signal runs 30 seconds slow, after 20 signals you're ten minutes late. CUSUM is that running 'minutes late' counter: **C = max(0, C + z − κ)**. κ = 0.5 is the slack we forgive each hour, so honest noise drains back to zero while a steady drift keeps filling the bucket until it crosses h = 5.
>
> **Two: Minimum Covariance Determinant**, from Rousseeuw. Here the question is whether this *combination* of values is plausible. Someone 6'4" is fine. Someone who weighs 45 kg is fine. Someone who is 6'4" *and* 45 kg needs a doctor. **Mahalanobis distance is a ruler that knows how variables move together.** For healthy data, D² follows a **chi-square distribution with 5 degrees of freedom**, so D² > 20.5 happens by chance only once in a thousand hours. We build that ruler with MCD, the subset with the smallest determinant, so faults can't bend it.
>
> **Three: Clausius–Clapeyron.** This is pure physics and needs zero training data. Warm air holds about **7% more water per degree**, so if the air warms and nobody adds water, relative humidity **must** fall. If a sensor reports both rising with no rain, physics vetoes it.
>
> **Four: the conformal test martingale**, from Vovk, building on Ville in 1939. Picture a betting game where we bet against 'this sensor is healthy'. If the sensor really is healthy, **Ville's inequality** says the chance our winnings *ever* reach 1/α is at most α. Set α = 1% and the false-alarm rate is **guaranteed**, with no Gaussian assumption and no distribution assumed at all. That's the guarantee the operator gets in writing."

## Slide 8: Chaos Is Not a Fault (75 s). This is your originality slide.
> "Now the hardest part. Weather is chaotic, so how do you tell chaos apart from a broken sensor?
> The answer is that **chaos is not random. Chaos has shape.** [left plot]
>
> **Takens' theorem, 1981:** take one sensor, say temperature, and stack it with its own past: x(t), x(t−τ), x(t−2τ)… With m ≥ 2d + 1 dimensions, this rebuilds the shape of the *whole hidden atmosphere*. It's like a cardiologist reading the entire heart from **one ECG lead**.
>
> Real weather, even a storm, traces this smooth manifold. [left]
> A spike gets **flung off** the manifold as an isolated point in space. [middle]
> A flatline **collapses everything to one point**, like a flat line on an ECG. [right]
>
> The **Lyapunov exponent** measures how fast nearby paths separate. Real chaos gives a positive but finite value. A spike blows up. A flatline goes negative, because everything dies to a point.
> **Cao's test** answers *noise or chaos?* E₂ stays at 1 for pure noise and moves away from 1 for deterministic chaos.
>
> So a storm is chaos we **keep**. **A fault is geometry that breaks.**"

## Slide 9: Satellite Oracle (60 s)
> "Now the scariest case. The gauge says 0 mm. Is it a dry afternoon, or a gauge clogged with leaves in the middle of a cloudburst? The ground alone can't tell, so **we ask the sky.**
> ISRO's **INSAT-3DR** scans India every 15 minutes, and its 10.7-micron infrared channel sees cloud-top temperature. **215 Kelvin is minus 58 °C**, which means a tall, angry thunderstorm cloud. NASA–JAXA's **GPM IMERG** estimates rain from microwave measurements.
> The maths has three parts: align their clock to ours, turn a 4 km pixel into a single point using **co-kriging** with elevation, then fuse the witnesses.
>
> We fuse with **Dempster–Shafer**, not plain Bayes. Think of a courtroom. Bayes forces every witness to answer yes or no. Dempster–Shafer lets a witness say **'I don't know'** and keeps that uncertainty on the books instead of hiding it.
> Here's a worked example. The gauge reads 0 mm, the cloud top is 215 K, the satellites estimate 34 and 28.5 mm per hour, and the temperature has dropped 4.8 °C, the classic cool air that falls with rain. Belief that the gauge is stuck comes out at **0.916**, above our 0.90 bar. The verdict is **RAIN_GAUGE_CLOGGED**, and the real rain is protected."

## Slide 10: Data Strategy (40 s)
> "For data we use real Bengaluru hourly weather from **ERA5 via Open-Meteo**, which is physically consistent and so works as our clean reference. The full system adds KSNDMC, IMD, INSAT and GPM.
> The problem is that nobody publishes labelled sensor faults. So we do what crash-test engineers do: **we don't wait for real crashes, we build the dummy.** We inject the four fault equations from slide 5 into real weather with a fixed seed, so we know the truth hour by hour.
> Gaps of 3 hours or less: we interpolate the *residual* and add the daily cycle back, so we never draw a straight line across the afternoon heat peak. Gaps over 3 hours: we don't guess, we mark COMM_LOSS.
> The split is chronological: 60% calibrate, 20% tune, 20% test, never shuffled. **Shuffling a time series is like studying with the answer key**, because the future leaks into the past."

## Slide 11: Validation Plan (40 s)
> "We measure everything. **Precision** asks: when we shout, are we right? **Recall** asks how many of all the faults we caught. F1 balances the two. **FPR** is how often we cry wolf. **Detection delay** is the hours from fault start to first flag. For robustness, we randomly delete 5, 10 and 20% of the data and see how much F1 drops.
> We'll also tell you where we break. A brown-out that shifts T, H and P *together, along their natural correlation*, looks like weather to Mahalanobis, so only CUSUM catches it later. And a fault at the exact moment a storm starts can hide in the storm's variance. **We'd rather tell you than have you find it.**
> Everything is seeded at 42 and deterministic, so anyone can rerun our numbers."

## Slide 12: Benchmark (60 s)
Numbers measured today with `node metrics.mjs` (Bengaluru Central, last 31 days of live data, seed 42, 9 injected fault events in a 152 h test window):

| | Baseline 3σ | Ours |
|---|---|---|
| Precision | 0.55 | **0.78** |
| Recall | 0.17 | **0.43** |
| F1 | 0.26 | **0.55** |
| F1 with 20% data missing | 0.24 | **0.59** |
| Fault events caught | 7 / 9 | **9 / 9** |
| Flatlines caught | **0 / 2** | **2 / 2** |
| Persistent faults: caught, mean delay | 1 / 3, 33 h | **3 / 3, 10.7 h** |

Don't claim "0.45% FPR, 3.4× fewer". The measured hourly FPR is about 9–10% for both methods (see Q&A).

> "We ran it on the last month of **real** Bengaluru weather with nine injected fault events.
> The baseline's F1 is 0.26 and ours is 0.55, **more than double**. When we raise a flag we're right 78% of the time, against 55%.
> At the event level, which is what an operator actually cares about, **we caught all nine. The baseline caught seven, and the two it missed were both flatlines**: a jammed sensor, the exact failure that hides a cloudburst. 3σ is *structurally blind* to it, because a stuck value has no deviation.
> On slow faults we caught all three persistent faults in about 11 hours on average. The baseline caught one of three, after 33 hours.
> Knock out 20% of the data at random and our F1 holds while the baseline's falls to 0.24.
> [point at the table: these are example certificates in the exact format the system writes] Look at the last row: 42 mm of rain, *more* than the fake 38 mm two rows up, and we **keep** it. Why? Humidity is 96% and pressure dropped 4 hPa.
> **A real storm brings its friends. A fault comes alone.**"

## Slide 13: Prototype and Live Demo (2 min)
[Open https://girish-0.github.io/Mweather/ BEFORE the talk. If the Wi-Fi dies, use CSV upload.]

> "Everything you've just seen is running live, with no dummy data. This is Bengaluru Central, pulled from Open-Meteo a minute ago."
>
> [hero] "Here's the current temperature and the verdict for this hour: sensor healthy, all five channels trusted."
>
> [timeline] "The white curve is the real last seven days. The faint line is what the clock *expected*. The gap between them is the residual e_t we've been talking about."
>
> [toggle **Inject Faults**] "Now let's break it, seeded at 42: spikes, flatlines, a drift, two wet deserts and a five-hour gap."
>
> [hover a rose dot] "Every dot is a certificate: observed value, expected value, score against threshold, and one sentence in plain English."
>
> [Baseline vs Ours panel] "These numbers are being computed right now, in this browser."
>
> [click the Whitefield pin] "Switch to a different station and the whole pipeline reruns in under a second, with no GPU and no cloud."
>
> [Download QC Report] "The operator gets a CSV. The raw data is untouched, with one extra column: QC_FLAG."
>
> "Today the prototype runs Tiers 1 and 2, the multivariate check and the storm gate. The chaos and satellite tiers are designed with full equations, and they're what we build next. The roadmap: **Phase 2** puts Tier 1 on an ESP32, under 5 ms and 10 KB of memory, with a one-byte flag on every packet. **Phase 3** goes city-wide: stations check their neighbours, and the satellite oracle steps in when they disagree."

## Slide 14: Risks and Close (45 s)
> "Our limits, stated honestly. Real labelled faults are rare, so we inject physically modelled ones, and a loose wire can be messier. Compute cost is tiny: O(W + d²), under 2 ms, and the satellite only wakes up when the ground escalates. A fault at storm onset can hide, so Dempster–Shafer keeps that doubt *visible* instead of pretending.
> And there's one ethical line we will not cross: **we never delete data.** Deleting a real cloudburst blinds the flood alert. We only flag, with a reason, and a human decides."
>
> [Slow down. Pause before the last line.]
>
> "So back to the question we started with. The gauge says zero millimetres. Do you believe it?
> With our system **you don't have to believe. You can check the certificate.**
> Thank you."

---

## Q&A cheat sheet
- **"Did you build the chaos and satellite tiers?"** Not yet. The prototype runs bounds, flatline, MAD, CUSUM, Mahalanobis and the storm gate. Tiers 3–4 and Isolation Forest are designed with equations and are next on the roadmap.
- **"Why 3.5?"** It's the Iglewicz–Hoaglin recommendation for the modified Z-score. We then raise it on the validation split until the FPR target is met, never on the test split.
- **"Why 0.6745?"** It's Φ⁻¹(0.75). For normal data, MAD / 0.6745 is a consistent estimator of σ.
- **"Why χ² with 5 degrees of freedom?"** Whitening by Σ⁻¹ turns the 5-D residual into 5 independent standard normals, and the sum of their squares is χ²₅. Its 0.999 quantile is 20.515.
- **"Why not plain Euclidean distance?"** The units differ (hPa vs % vs mm) and the channels are correlated. Σ⁻¹ fixes both at once.
- **"Your FPR isn't 1%."** True for now. The test window is only about 150 h with 87 clean hours, so each single false alarm adds about 1.1% to the FPR. A longer calibration history is the fix, and the 1% figure is our constraint, not a claim.
- **"Why κ = 0.5, h = 5?"** These are standard CUSUM settings for detecting a 1σ shift quickly while keeping false alarms rare. We tune h on validation.
- **"What is d in Takens' m ≥ 2d + 1?"** d is the dimension of the attractor. The bound guarantees the reconstruction is a faithful embedding with no self-crossings.
- **"Why Dempster–Shafer over Bayes?"** Bayes needs priors for everything. DS assigns mass to 'unknown' explicitly, so missing or conflicting satellite evidence stays as doubt instead of being forced into a guess.
