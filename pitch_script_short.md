# Short Pitch Script: Certificates of Trust (about 7 min)

**1. Title**
"If a rain gauge in Bengaluru says **zero millimetres** right now, do you believe it? Most systems do. We'll show you how maths can put a **certificate of trust** on every reading. We're team ___, problem SIH26073."

**2. Problem**
"BBMP closes underpasses based on weather-station readings. But sensors live outdoors: they clog, spike and drift. The real question isn't *is this unusual?* It's **is the sensor lying, or is the sky really doing this?** A jammed gauge reading 0 mm in a cloudburst is worse than no gauge at all."

**3. Why static rules fail**
"The industry uses mean ± 3σ. When **Ambani walks into a room, the average salary jumps but the median doesn't.** The mean breaks with one bad value; the median survives up to 50% bad data. So one spike widens the 3σ band and hides every fault after it. 3σ also deletes real cloudbursts and mistakes the afternoon heat for noise."

**4. Formulation**
"Every 15 minutes we get five numbers, x_t = T, H, P, R, W. We output fault or no fault, plus a reason code. We **maximise F1 with false alarms capped at 1%**, because an alarm that cries wolf gets switched off. There are only four tunable thresholds, and every constraint comes from physics at 920 m."

**5. Fault taxonomy**
"Each reading is like a song: trend is the bass line, the daily cycle is the beat, weather is the improvisation, and the fault f is **the scratch on the record**. Faults come in four shapes: a **spike**, a **flatline**, because real weather never holds its breath for six hours, a slow **drift**, and an **inconsistency**: 38 mm of rain at 28% humidity is a **wet desert**."

**6. Method**
"The pipeline works like a hospital, triage first. Tier 1 is physics. Tier 2 is robust statistics. Tier 3 is chaos theory. Tier 4 is an ISRO/NASA satellite second opinion. Every flag carries its own equation and score, and the whole thing runs on a ₹300 chip."

**7. Core maths**
"**MAD** measures surprise after removing the daily cycle. **CUSUM** works like traffic: one slow signal is nothing, but twenty slow signals and you're ten minutes late. **Mahalanobis distance**: 6'4" is fine, 45 kg is fine, both together is not. **Clausius–Clapeyron**: if the air warms with no water added, humidity *must* fall. A **conformal martingale** guarantees the false-alarm rate without assuming any distribution."

**8. Chaos is not a fault**
"Weather is chaotic, but **chaos has shape**. By Takens' theorem, one sensor's history rebuilds the whole atmosphere, like reading the heart from **one ECG lead**. A storm stays on that shape, a spike gets flung off it, and a flatline collapses to a point. **A storm is chaos we keep. A fault is geometry that breaks.**"

**9. Satellite oracle**
"The gauge says 0 mm. Is the weather dry, or is the gauge clogged? **We ask the sky.** INSAT-3DR sees a −58 °C cloud top, and GPM estimates 28 mm/hr. Dempster–Shafer combines these like a courtroom where witnesses may say *'I don't know'*. Belief that the gauge is stuck: 0.916, so the verdict is **RAIN_GAUGE_CLOGGED**."

**10. Data**
"No one publishes labelled faults, so like crash-test engineers **we build the dummy**: we inject the four fault equations into real Bengaluru weather. Short gaps get interpolated, long gaps get flagged. The split is chronological, because **shuffling a time series is studying with the answer key**."

**11. Validation**
"We measure precision, recall, F1, false alarms, detection delay, and how the scores hold up with 20% of the data missing. We also tell you where we break: a brown-out at storm onset can hide. **We'd rather tell you than have you find it.**"

**12. Benchmark** *(measured numbers, so update the slide)*
"On a month of real Bengaluru data, F1 went from **0.26 to 0.55**. We caught **all 9 fault events**; the baseline missed both flatlines, because a stuck sensor has no deviation for 3σ to see. And a 42 mm storm is **kept**, because humidity and pressure agree. **A real storm brings its friends. A fault comes alone.**"

**13. Live demo** *(open https://girish-0.github.io/Mweather/ beforehand)*
"This is live Bengaluru data. [Inject Faults] Now we break it. [hover a dot] Every dot is a certificate: observed value, expected value, score and reason. [Upload CSV → IMD sample] Here's real IMD observatory data through the same pipeline. [Download] The raw data is untouched, with one extra column: QC_FLAG."

**14. Close**
"We **never delete data**, we only flag it with a reason. So: the gauge says zero. Do you believe it? With our system **you don't have to believe. You can check the certificate.** Thank you."
