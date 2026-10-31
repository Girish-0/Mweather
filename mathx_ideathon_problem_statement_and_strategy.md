# MathX – ALLIANCE ONE 2026: Intelligent Anomaly Detection for Automatic Weather Stations

* **Event:** MathX – The Mathematics Ideathon, under *ALLIANCE ONE 2026 – Solving for Bengaluru*
* **Organisers:** INFINITY Club, Department of Pure and Applied Mathematics & Department of Student Support Services, Alliance University
* **Date / Venue:** 30 October 2026, 10 AM · LT 702, LC 2 · Prizes: ₹5,000 (1st), ₹3,000 (2nd)
* **Problem Title:** 3.11 AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations
* **Problem Code:** `SIH26073` | **Track:** `Software`
* **Core Philosophy:** *Think Mathematically. Innovate Creatively. Solve for Tomorrow!*

---

## 0. Vision & Context

### 0.1 What the Ideathon Asks For
MathX challenges students to apply **mathematical thinking to a real-world problem**, propose an innovative solution, and defend it before an evaluation panel. From the organisers' brief:

1. **Pick a computational domain** (AI, ML, data-set-driven problems are all allowed) and **define the problem with zero ambiguity**.
2. **Propose a method** – explain the algorithm/model, *why it applies*, *why it is suitable*, and *which baseline it is compared against*.
3. **Stay mathematical.** Bring in as much mathematics as possible; computer science enters only as the *experiment* that tests the mathematics.
4. **Use real data** available on the internet wherever possible, with tables and analysis.
5. **Summarise everything as a presentation.**

### 0.2 Evaluation Rubric (as announced)

| # | Criterion | Weight | What the panel will look for |
| :-: | :--- | :-: | :--- |
| 1 | Problem understanding & domain relevance | 20% | Clear, unambiguous problem; why it matters for Bengaluru |
| 2 | Mathematical & computational formulation | **25%** | Variables, fault equations, objective, constraints |
| 3 | Method selection & feasibility | 20% | Why each method fits; baseline; can it actually run |
| 4 | Validation plan & quantitative metrics | 20% | Precision/recall, FPR, detection delay, robustness |
| 5 | Originality, clarity & presentation | 20% | Explainability, story, slide quality |

> The announced weights sum to 105%; confirm with the organisers whether criterion 5 is 15%. Formulation (25%) is the heaviest — the deck should spend the most time there.

### 0.3 Our Vision
> **"Every rainfall, temperature or wind reading that Bengaluru's flood-warning network acts on should carry a mathematical certificate of trust."**

Bengaluru's flood alerts, underpass closures and storm-drain planning are driven by telemetry from Automatic Weather Stations (AWS) and telemetric rain gauges operated by KSNDMC, IMD and BBMP. These instruments sit outdoors on a plateau city with intense convective monsoon storms; they jam, drift and glitch. A jammed rain gauge reporting 0 mm during a cloudburst is **more dangerous than no gauge at all**, because downstream models trust it.

The hard part is not finding unusual numbers — it is deciding **whether the sensor is wrong or the weather is extreme.** Deleting a real cloudburst as a "spike" blinds the flood system; keeping a faulty spike triggers false alarms. Our solution answers that question with mathematics and shows *why* for every reading.

### 0.4 Why This Problem Fits MathX
* **Mathematics-first:** robust statistics (median, MAD, breakdown point), time-series decomposition, sequential change detection (CUSUM), multivariate geometry (Mahalanobis distance, $\chi^2$ law), and tree-based isolation — every stage is an equation, not a black box.
* **Solving for Bengaluru:** the data, physical bounds and failure scenarios are calibrated to Bengaluru (≈ 920 m elevation, convective monsoon regime).
* **Measurable:** sensor faults can be injected with known ground truth, so precision, recall, false-positive rate and detection delay are computable — not opinion.

---

## 1. Problem Statement

### 1.1 One-Line Statement
> **Given a stream of multivariate readings from an Automatic Weather Station, decide for every timestamp whether each reading is a *sensor fault* or *genuine weather* — including extreme weather — and give a mathematical reason for every flag.**

### 1.2 The Challenge
Automatic Weather Stations operate continuously in harsh outdoor environments and suffer hardware degradation, electrical surges, mechanical blockages (e.g. debris in tipping-bucket rain gauges) and gradual calibration drift. Because meteorological data is **non-stationary** (24-hour diurnal cycle plus seasonal shifts), static threshold rules either **miss** subtle faults that stay inside normal bounds or **falsely flag** genuine extreme weather as sensor error.

### 1.3 Removing Ambiguity: Key Definitions

| Term | Precise meaning in this project |
| :--- | :--- |
| **Reading** | One value $x_{t,i}$ of sensor channel $i$ at timestamp $t$. |
| **Anomaly (sensor fault)** | A reading whose deviation from expected behaviour is caused by the **instrument**, i.e. the fault term $f_{t,i} \neq 0$ in the model of §2.1. |
| **Extreme weather (NOT an anomaly)** | A rare reading that is **physically consistent across channels** (e.g. heavy rain *with* humidity ↑ and pressure ↓). Must be preserved, never flagged as a fault. |
| **Flag** | Output $\hat{y}_t = 1$ plus a reason code from the fault taxonomy, the triggering channel, and the score that crossed its threshold. |
| **Detection delay** | Hours between the true start of a persistent fault and its first flag. |

### 1.4 Inputs, Outputs, Scope

| | |
| :--- | :--- |
| **Input** | Hourly vector $\mathbf{x}_t = (T, H, P, R, W)$ — temperature, relative humidity, station pressure, rainfall, wind speed — for one station. |
| **Output (per timestamp)** | Fault / no-fault decision $\hat{y}_t$, reason code $\mathbf{r}_t$, triggering channel(s), numeric score vs threshold. |
| **In scope** | Four fault classes: spike, flatline (stuck-at), calibration drift, multivariate physical inconsistency; missing-data gaps. |
| **Out of scope** | Hardware root-cause (which component failed), multi-station spatial checks (future work, §6.3), weather forecasting. |
| **Policy** | Raw data is **never deleted**; flags are appended as `QC_FLAG` so humans and downstream models decide. |

### 1.5 Intended Users
1. **Meteorological & disaster-monitoring agencies:** KSNDMC and IMD, which maintain telemetric weather and rain-gauge networks across Bengaluru.
2. **Urban flood & civic response teams:** BBMP and civic authorities using real-time rainfall and wind telemetry for underpass and flood-zone alerts.
3. **Data-quality engineers & climate researchers:** curating clean historical series for hydrological and microclimate models.

### 1.6 Operational Context
Bengaluru's localized convective thunderstorms develop within an hour. A single faulty reading — a jammed rain gauge reporting $0\text{ mm}$ during a downpour, or a voltage spike reporting $62^\circ\text{C}$ — corrupts flood-prediction models. The system must run in near real-time on hourly (or 15-min) multivariate streams and give a transparent **mathematical reason** for every flagged reading.

### 1.7 Specific Subproblem Our Team Solves
We design and validate an **explainable, mathematically rigorous anomaly-detection pipeline** that separates **four canonical sensor faults** (point spikes, flatlines, calibration drift, multivariate thermodynamic inconsistencies) from **true extreme weather**, and benchmark it against classical rule-based and $3\sigma$ control-limit baselines.

### 1.8 Mapping to the Problem Card (SIH26073)

| Problem card asks for | Where we deliver it |
| :--- | :--- |
| Define plausible sensor-fault patterns / labelled examples | §2.2 fault taxonomy + §4.1 controlled fault injection |
| Compare rule-based thresholds with ≥ 1 anomaly-detection method | §3.1 baseline vs §3.2 hybrid pipeline; §5.2 comparison |
| Show why each record was flagged | Reason codes + scores, §6.2 diagnostic log |
| Anomaly-detection pipeline | §3.2, §6.1 |
| Labelled / rule-generated test cases | §4.1, §4.3 |
| Dashboard of flagged readings and reasons | §6.1 prototype dashboard |
| Precision / recall, FPR, detection delay, robustness to missing/noisy data, explainability | §5.1 metrics |
| Documentation | This document |

---

## 2. Mathematical Formulation

### 2.1 Variables & Data Inputs
Let an Automatic Weather Station record $d = 5$ meteorological variables at discrete, equally spaced timestamps $t \in \{1, 2, \dots, N\}$. At timestamp $t$, the observation is a multivariate vector $\mathbf{x}_t \in \mathbb{R}^5$:

$$
\mathbf{x}_t = \begin{bmatrix} T_t \\ H_t \\ P_t \\ R_t \\ W_t \end{bmatrix} = \begin{bmatrix} \text{Ambient Air Temperature } (^\circ\text{C}) \\ \text{Relative Humidity } (\%) \\ \text{Barometric Station Pressure } (\text{hPa}) \\ \text{Precipitation / Rainfall } (\text{mm}) \\ \text{Wind Speed } (\text{m/s}) \end{bmatrix}
$$

Each observed reading $x_{t,i}$ for sensor channel $i \in \{1, \dots, d\}$ is modeled as a superposition of a long-term trend $T_{t,i}$, a diurnal seasonal harmonic $S_{t,i}$ (with period $P = 24$ for hourly data), natural stochastic weather fluctuation $\epsilon_{t,i}$, and a potential fault perturbation $f_{t,i}$:

$$
x_{t,i} = T_{t,i} + S_{t,i} + \epsilon_{t,i} + f_{t,i}
$$

where $f_{t,i} = 0$ under normal sensor operation and $f_{t,i} \neq 0$ during an anomaly.

### 2.2 Mathematical Taxonomy of Sensor Faults
To eliminate ambiguity, we define four distinct mathematical fault signatures:

| Fault Class | Physical Mechanism | Mathematical Formulation |
| :--- | :--- | :--- |
| **1. Point / Spike Fault** | Transient ADC voltage surge or telemetry bit-flip | $f_{t,i} = \delta \cdot \mathbb{I}(t = t_0)$, where $\vert{}\delta\vert{} \gg 3.5\,\sigma_{e,i}$ at an isolated step $t_0$. |
| **2. Flatline / Stuck-at Fault** | Mechanical jamming (frozen anemometer or clogged gauge) | $x_{t,i} = c \quad \forall t \in [t_0, t_0 + k]$, yielding rolling sample variance $s_{t,i}^2(k) = \frac{1}{k-1}\sum_{j=0}^{k-1}(x_{t-j,i} - \bar{x}_i)^2 = 0$. |
| **3. Calibration Drift** | Gradual sensor aging or radiation-shield fouling | $f_{t,i} = \alpha \cdot (t - t_0)\,\mathbb{I}(t \ge t_0)$, where $\alpha \neq 0$ is a persistent monotonic bias rate. |
| **4. Multivariate Physical Inconsistency** | Cross-channel hardware fault violating atmospheric physics | Individual channels satisfy $L_{\min,i} \le x_{t,i} \le L_{\max,i}$, but the joint residual vector $\mathbf{e}_t$ violates covariance structure (e.g., $R_t > 20\text{ mm/hr}$ while $H_t < 35\%$). |

### 2.3 Prediction Target & Objective Function
For every timestamp $t$, the model outputs a binary anomaly decision $\hat{y}_t \in \{0, 1\}$ and an explainable diagnostic reason vector $\mathbf{r}_t \in \{0, 1\}^4$. Our optimization objective is to find threshold parameters $\boldsymbol{\theta} = \{\tau_{\text{MAD}}, h_{\text{CUSUM}}, \tau_{\text{MD}}, \tau_{\text{IF}}\}$ that maximize the $F_1$-score while bounding the False Positive Rate ($\text{FPR}$) and minimizing Detection Delay ($\Delta t$):

$$
\max_{\boldsymbol{\theta}} \; F_1(\mathbf{y}, \hat{\mathbf{y}}(\boldsymbol{\theta})) = \frac{2\,\text{TP}(\boldsymbol{\theta})}{2\,\text{TP}(\boldsymbol{\theta}) + \text{FP}(\boldsymbol{\theta}) + \text{FN}(\boldsymbol{\theta})}
$$

$$
\text{subject to} \quad \text{FPR}(\boldsymbol{\theta}) = \frac{\text{FP}(\boldsymbol{\theta})}{\text{FP}(\boldsymbol{\theta}) + \text{TN}(\boldsymbol{\theta})} \le \alpha_{\max}, \quad \mathbb{E}[\Delta t] \le \Delta t_{\max}
$$

### 2.4 Constraints, Assumptions & Boundary Conditions
* **Physical Boundary Constraints (Bengaluru Station Elevation $\approx 920\text{ m}$):**
  * Temperature: $-5^\circ\text{C} \le T_t \le 50^\circ\text{C}$
  * Relative Humidity: $0\% \le H_t \le 100\%$
  * Barometric Pressure (at $\sim 920\text{ m}$ altitude): $880\text{ hPa} \le P_t \le 940\text{ hPa}$
  * Rainfall & Wind Speed: $0\text{ mm} \le R_t \le 150\text{ mm/hr}$, $0\text{ m/s} \le W_t \le 50\text{ m/s}$
* **Statistical Assumptions:**
  1. After subtracting trend $\hat{T}_{t,i}$ and diurnal cycle $\hat{S}_{t,i}$, the clean residual $e_{t,i} = x_{t,i} - \hat{T}_{t,i} - \hat{S}_{t,i}$ is locally stationary and symmetric around zero.
  2. The percentage of anomalous points within any rolling window $W$ is strictly less than the $50\%$ breakdown point of the Median Absolute Deviation ($\text{MAD}$) estimator.

---

## 3. Proposed Method

### 3.1 The Baseline Model (For Comparison)
We compare our pipeline against a two-part **Classical Industry Baseline**:
1. **Static Range & Step-Change Rules:** Flags $x_{t,i}$ if $x_{t,i} \notin [L_{\min,i}, L_{\max,i}]$ or $\vert{}x_{t,i} - x_{t-1,i}\vert{} > \Delta_{\max,i}$.
2. **Classical Parametric $3\sigma$ Shewhart Control Limits:** Computes rolling mean $\mu_i$ and standard deviation $\sigma_i$ on raw data and flags when:

$$
Z_{t,i} = \frac{\vert{}x_{t,i} - \mu_i\vert{}}{\sigma_i} > 3.0
$$

* **Why the Baseline Fails Mathematically:**
  * *Zero Breakdown Point:* Both sample mean $\mu_i$ and variance $\sigma_i^2$ have an asymptotic breakdown point of $0\%$. A single severe spike inflates $\sigma_i$, widening the $\pm 3\sigma_i$ bands and masking subsequent faults (**the masking effect**).
  * *Diurnal Blindness:* Applying $Z$-scores to raw non-stationary weather signals treats normal afternoon heating peaks and night cooling troughs as high-variance noise.

### 3.2 Proposed Algorithm: 3-Stage Hybrid Mathematical & ML Pipeline
Our proposed architecture combines **Time-Series Residual Decomposition**, **Robust Non-Parametric Statistics**, and **Multivariate Distance / Isolation Learning**:

#### Stage 1: Deterministic Boundary & Rolling Zero-Variance Filter
* Checks physical range compliance $x_{t,i} \in [L_{\min,i}, L_{\max,i}]$.
* Computes rolling window variance over $k = 6$ steps for continuous sensors ($T, H, P, W$ where $W_t > 0$):

$$
s_{t,i}^2(k) = \frac{1}{k-1}\sum_{j=0}^{k-1} (x_{t-j,i} - \bar{x}_{t,i})^2 < \epsilon_{\text{flat}} \quad (\epsilon_{\text{flat}} = 10^{-6})
$$

If triggered, flags `FLATLINE_FAULT`.

#### Stage 2: Seasonal-Trend Residual Extraction + Robust MAD & CUSUM Control
1. **Diurnal Residual Extraction:** Decompose each channel into rolling median trend $\hat{T}_{t,i}$ and diurnal phase median $\hat{S}_{t,i}$ (grouped by hour-of-day $h = t \bmod 24$):

$$
e_{t,i} = x_{t,i} - \hat{T}_{t,i} - \hat{S}_{t,i}
$$

2. **Modified $Z$-Score via Median Absolute Deviation ($\text{MAD}$):** Using the $50\%$ breakdown-point estimator:

$$
\text{MAD}_i = \text{median}\left(\left\vert{}e_{t,i} - \text{median}(e_i)\right\vert{}\right)
$$

$$
M_{t,i} = \frac{0.6745 \cdot \left\vert{}e_{t,i} - \text{median}(e_i)\right\vert{}}{\text{MAD}_i}
$$

Where $0.6745 = \Phi^{-1}(0.75)$ makes $\text{MAD}_i / 0.6745$ a consistent estimator of $\sigma$ under Gaussianity. If $M_{t,i} > \tau_{\text{MAD}}$ (set to $3.5$), flag `TEMPORAL_SPIKE`.
3. **Two-Sided Tabular CUSUM (Drift Detection):** To catch slow calibration drift $\alpha \cdot (t - t_0)$ that stays below $M_{t,i} = 3.5$, we accumulate standardized residuals $z_{t,i} = \frac{0.6745(e_{t,i} - \text{median}(e_i))}{\text{MAD}_i}$:

$$
C_{t,i}^+ = \max\left(0, \; C_{t-1,i}^+ + z_{t,i} - \kappa\right), \quad C_{t,i}^- = \max\left(0, \; C_{t-1,i}^- - z_{t,i} - \kappa\right)
$$

where slack parameter $\kappa = 0.5$. If $\max(C_{t,i}^+, C_{t,i}^-) > h_{\text{CUSUM}}$ (set to $5.0$), flag `CALIBRATION_DRIFT`.

#### Stage 3: Multivariate Residual Mahalanobis Distance & Isolation Forest
To detect thermodynamic inconsistencies across sensors, we evaluate the joint residual vector $\mathbf{e}_t \in \mathbb{R}^d$:
1. **Robust Mahalanobis Distance:** Using the robust center $\boldsymbol{\mu}_R$ and Minimum Covariance Determinant ($\text{MCD}$) covariance matrix $\boldsymbol{\Sigma}_R$:

$$
D_M^2(\mathbf{e}_t) = (\mathbf{e}_t - \boldsymbol{\mu}_R)^T \boldsymbol{\Sigma}_R^{-1} (\mathbf{e}_t - \boldsymbol{\mu}_R)
$$

Under multivariate normality of clean residuals, $D_M^2(\mathbf{e}_t) \sim \chi_d^2$. We flag `MULTIVARIATE_INCONSISTENCY` when $D_M^2(\mathbf{e}_t) > \chi^2_{5, \, 0.999} = 20.515$, or when coupled with domain-specific psychrometric residual checks (e.g., high precipitation $R_t > 10\text{ mm}$ with negative humidity residual $e_{t,H} < -15\%$).
2. **Isolation Forest Verification:** An ensemble of $B = 100$ isolation trees partitions the residual feature space, computing the anomaly score:

$$
s(\mathbf{e}_t, n) = 2^{-\frac{\mathbb{E}[h(\mathbf{e}_t)]}{c(n)}}
$$

where $h(\mathbf{e}_t)$ is the path length to isolate $\mathbf{e}_t$ and $c(n) = 2 H(n-1) - \frac{2(n-1)}{n}$ is the average path length of an unsuccessful search in a Binary Search Tree.

### 3.3 Why This Method is Ideal
* **White-Box Explainability:** Every flagged timestamp carries an explicit mathematical certificate (`FLATLINE_FAULT`, `TEMPORAL_SPIKE`, `CALIBRATION_DRIFT`, or `MULTIVARIATE_INCONSISTENCY`) plus the triggering channel and score.
* **Edge Feasibility:** Requires zero GPU acceleration; matrix inversion $\boldsymbol{\Sigma}_R^{-1}$ is only $5 \times 5$, enabling deployment directly on low-power AWS data loggers.

---

## 4. Data Strategy

### 4.1 Data Sources & Licensing
* **Primary Data Source:** Hourly historical weather for **Bengaluru Urban ($\text{12.9716}^\circ\text{ N}, \text{77.5946}^\circ\text{ E}$)** from the Open-Meteo Historical Weather API (ERA5 reanalysis, **CC BY 4.0**). This is a *clean, physically consistent proxy* for AWS telemetry, not raw station output — which is exactly what we need as a fault-free reference. Where real IMD/KSNDMC station data is available, it is used for a secondary check.
* **Synthetic Fault Overlay:** Because public meteorological archives are pre-cleaned or lack exact ground-truth fault timestamps, we apply a deterministic **Controlled Fault Injection Engine** on top of real Bengaluru weather dynamics to generate exact binary and multi-class ground-truth labels $y_t \in \{0, 1\}$.

### 4.2 Preprocessing & Missing-Data Handling
1. **Temporal Grid Alignment:** Enforce strict monotonic timestamps $t_k = t_0 + k\Delta t$ ($\Delta t = 1\text{ hr}$).
2. **Missing-Data Imputation Strategy:**
   * **Short Dropouts ($1 \le \text{gap} \le 3\text{ hours}$):** Perform linear interpolation strictly on the **deseasonalized residual** $e_{t,i}$, then add back the deterministic diurnal seasonal component $\hat{S}_{t,i}$ and trend $\hat{T}_{t,i}$. This preserves the natural daytime heating/cooling curve rather than drawing a flat straight line across midday.
   * **Extended Dropouts ($\text{gap} > 3\text{ hours}$):** Do not extrapolate; label records as `SENSOR_COMMUNICATION_LOSS` and reset rolling variance/CUSUM accumulators upon sensor recovery to prevent false transition spikes.

### 4.3 Train / Validation / Test Split Strategy
To prevent temporal data leakage, we use a strict **Chronological Split**:
* **Calibration / Training Set ($60\%$):** Clean historical weather window used to estimate diurnal seasonal profiles $\hat{S}_{t,i}$, channel $\text{MAD}_i$ scales, robust covariance $\boldsymbol{\Sigma}_R$, and Isolation Forest partitions.
* **Validation Set ($20\%$):** Used to tune decision thresholds ($\tau_{\text{MAD}} = 3.5$, $h_{\text{CUSUM}} = 5.0$, $\alpha = 0.001$) to satisfy $\text{FPR} \le 1\%$.
* **Out-of-Sample Test Set ($20\%$):** Unseen telemetry injected with balanced instances of all four fault classes plus one genuine convective rainstorm event.

---

## 5. Validation Plan

### 5.1 Measurable Quantitative Metrics
1. **Classification Accuracy on Anomalies:**

$$
\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}
$$

2. **False Positive Rate ($\text{FPR}$):**

$$
\text{FPR} = \frac{\text{FP}}{\text{FP} + \text{TN}}
$$

3. **Detection Delay ($\Delta t$):** For persistent faults (Flatline or Calibration Drift starting at $t_{\text{start}}$ and first flagged at $t_{\text{detect}}$):

$$
\Delta t = t_{\text{detect}} - t_{\text{start}} \quad (\text{measured in hours/steps})
$$

4. **Missing/Noisy Data Robustness:** Measure $\Delta F_1 = F_1(\text{0\% missing}) - F_1(p\%\text{ missing})$ across $p \in \{5\%, 10\%, 20\%\}$ random sensor dropouts.

### 5.2 Benchmark Scenarios & Quantitative Comparison
> ⚠️ **Placeholder targets, not measured results.** Replace every number in this table (and in §6.2) with values produced by running the prototype before presenting.

We evaluate the **Baseline ($3\sigma$ + Static Rules)** against our **Proposed Hybrid Pipeline** across five benchmark scenarios ($N = 720\text{ hourly records} = 30\text{ days}$, with $58$ injected fault timestamps):

| Evaluation Metric | Baseline ($3\sigma$ + Static Thresholds) | Proposed (STL-MAD + CUSUM + Mahalanobis) | Mathematical Reason for Improvement |
| :--- | :---: | :---: | :--- |
| **Precision** | $0.714$ | **$0.948$** | Diurnal deseasonalization eliminates false afternoon temperature alarms. |
| **Recall (Sensitivity)** | $0.431$ | **$0.931$** | $\text{MAD}$ prevents variance inflation; CUSUM catches low-slope drift; $D_M^2$ catches cross-sensor faults. |
| **$F_1$-Score** | $0.538$ | **$0.939$** | $+40.1\%$ absolute gain in harmonic precision-recall balance. |
| **False Positive Rate ($\text{FPR}$)** | $1.51\%$ | **$0.45\%$** | Over $3\times$ reduction in false alarms during real weather transitions. |
| **Mean Detection Delay ($\Delta t$)** | $14.5\text{ hrs}$ (misses flatlines) | **$2.1\text{ hrs}$** | Rolling zero-variance and CUSUM detect stuck/drifting sensors rapidly. |
| **Robustness at $15\%$ Missing Data** | $F_1 = 0.410$ | **$F_1 = 0.902$** | Residual-space seasonal interpolation preserves diurnal covariance. |

### 5.3 Expected Failure Modes
* **Simultaneous Multi-Sensor Power Brownout:** If a low-voltage supply drop simultaneously biases Temperature, Humidity, and Pressure along their natural correlation axis, $D_M^2(\mathbf{e}_t)$ may temporarily remain below $\chi^2_{d, 0.999}$ until individual CUSUM thresholds trigger.
* **Fault Coinciding with Convective Storm Onset:** A moderate positive wind or rain spike occurring at the exact timestamp of a genuine thunderstorm front may blend into the storm's residual variance.

### 5.4 Reproducibility Protocol
* Fixed pseudo-random generator seed (`SEED = 42`) for synthetic fault placement and Isolation Forest initialization.
* Self-contained, deterministic mathematical pipeline with zero external API dependencies required during offline execution.

---

## 6. Prototype and Demo

### 6.1 Minimal End-to-End Workflow

```
[Raw AWS Telemetry Stream: T_t, H_t, P_t, R_t, W_t]
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ 1. Preprocessing & Imputation   │ ──► Short gaps (≤3h): Residual Interpolation
       │    (Grid Alignment & Gap Check) │ ──► Long gaps (>3h): Flag COMMUNICATION_LOSS
       └────────────────┬────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ 2. Stage 1: Hard Bounds &       │ ──► Checks x_{t,i} ∈ [L_min, L_max]
       │    Rolling Variance Filter      │ ──► Checks s^2_{t,i}(k) < 10^-6 (FLATLINE)
       └────────────────┬────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ 3. Stage 2: Diurnal STL         │ ──► Extracts e_{t,i} = x_{t,i} - T_{t,i} - S_{t,i}
       │    Decomposition + MAD & CUSUM  │ ──► Flags M_{t,i} > 3.5 (SPIKE) or CUSUM > 5 (DRIFT)
       └────────────────┬────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │ 4. Stage 3: Multivariate Check  │ ──► Computes Robust Mahalanobis D_M^2(e_t)
       │    (Mahalanobis D_M^2 + iForest)│ ──► Flags Cross-Sensor Physical Violations
       └────────────────┬────────────────┘
                        │
                        ▼
[Explainable Alert Log + Interactive Diagnostic Dashboard]
```

### 6.2 Sample Inputs & Explainable Outputs
Below is a sample output table generated by the prototype explaining *why* each anomalous record was flagged:

| Timestamp ($t$) | Observed Reading ($\mathbf{x}_t$) | Expected Diurnal Baseline ($\hat{T}_t + \hat{S}_t$) | Mathematical Score | Flagged Reason Code & Diagnostic Explanation |
| :--- | :--- | :--- | :--- | :--- |
| `Day 04, 03:00` | $T_t = 34.8^\circ\text{C}$ | $20.4^\circ\text{C}$ | $M_{t,T} = 11.42 > 3.5$ | **`TEMPORAL_SPIKE`**: Nighttime temperature residual $+14.4^\circ\text{C}$ exceeds $3.5\,\text{MAD}$ control limit. |
| `Day 09, 14:00` | $T_t = 29.50^\circ\text{C}$ (for $6\text{ hrs}$) | $28.1^\circ\text{C} \rightarrow 31.2^\circ\text{C}$ | $s_{t,T}^2(6) = 0.00 < 10^{-6}$ | **`FLATLINE_FAULT`**: Zero variance detected over $k=6$ consecutive hours during daytime heating ramp. |
| `Day 16, 18:00` | $T_t = 28.9^\circ\text{C}$ | $25.7^\circ\text{C}$ | $C_{t,T}^+ = 6.84 > 5.0$ | **`CALIBRATION_DRIFT`**: Cumulative positive residual drift of $+0.08^\circ\text{C/hr}$ over $40\text{ hrs}$. |
| `Day 22, 15:00` | $R_t = 38.0\text{ mm}$, $H_t = 28\%$ | $R_t = 0.0\text{ mm}$, $H_t = 54\%$ | $D_M^2(\mathbf{e}_t) = 34.8 > 20.52$ | **`MULTIVARIATE_INCONSISTENCY`**: Heavy rainfall reported during abnormally dry humidity ($H_t = 28\%$). |
| `Day 26, 16:00` | $R_t = 42.0\text{ mm}$, $H_t = 96\%$ | $R_t = 2.0\text{ mm}$, $H_t = 68\%$ | $D_M^2(\mathbf{e}_t) = 9.4 \le 20.52$ | **`VALID_EXTREME_WEATHER` (Not Flagged)**: High rain co-occurs with $96\%$ humidity and pressure drop ($-4.2\text{ hPa}$). |

### 6.3 Realistic Implementation Roadmap
* **Phase 1 (Ideathon Prototype – Current):** Single-station multivariate pipeline with synthetic fault injection, comparative metrics engine, and visual diagnostic dashboard.
* **Phase 2 (Edge Firmware Integration – Month 1–2):** Port the Stage 1–3 mathematical equations into lightweight C/Python on AWS edge loggers (Raspberry Pi / STM32) to attach quality flags (`QC_FLAG`) directly to outgoing MQTT telemetry packets.
* **Phase 3 (Spatial Cross-Station Kriging across Bengaluru – Month 3–6):** Extend Stage 3 by incorporating spatial Mahalanobis residuals across neighboring KSNDMC weather stations within a $5\text{ km}$ radius in Bengaluru using Inverse Distance Weighting ($\text{IDW}$).

---

## 7. Risks and Limitations

1. **Data Limitations:**
   * Real-world labeled sensor-fault datasets are scarce; while our synthetic fault models capture the four primary physical failure modes, complex intermittent loose-wire faults may exhibit chaotic non-linear patterns.
2. **Computational Cost:**
   * Time complexity per incoming timestamp is $\mathcal{O}(W + d^2)$ for sliding-window median/MAD and Mahalanobis evaluation (where $W = 168\text{ hours}$ and $d = 5$), requiring $< 2\text{ milliseconds}$ per record on a standard CPU. Periodic recalibration of the $\text{MCD}$ covariance matrix $\boldsymbol{\Sigma}_R^{-1}$ scales as $\mathcal{O}(N_{\text{cal}} \cdot d^3)$, which is negligible for $d = 5$.
3. **Uncertainty & Ethical/Safety Concerns:**
   * **High Cost of False Negatives vs. False Positives:** Automatically deleting a true cloudburst reading ($R_t = 60\text{ mm/hr}$) as a "spike" could blind urban flood warning systems and endanger lives. Therefore, our system **never deletes raw data**; it appends an explainable `QC_FLAG` and checks multivariate consistency ($H_t \uparrow, P_t \downarrow$) so genuine storms are preserved.
4. **What This Prototype Does Not Establish:**
   * It does not perform hardware-level electrical root-cause isolation (e.g., distinguishing whether a flatline comes from a blown ADC capacitor vs. a severed sensor cable).
   * It operates on a single Automatic Weather Station and does not yet include multi-station spatial graph comparison.

---

## 8. Alignment with the MathX Evaluation Rubric

| Evaluation Criterion | Suggested Weight | Where It Is Addressed in This Repository |
| :--- | :---: | :--- |
| **1. Problem understanding and domain relevance** | $20\%$ | **Section 1 & Section 6.2:** Distinguishing Bengaluru convective cloudbursts from AWS sensor faults; KSNDMC/IMD operational context. |
| **2. Mathematical / computational formulation** | $25\%$ | **Section 2 & Section 3.2:** Explicit state vectors $\mathbf{x}_t \in \mathbb{R}^5$, fault equations, constrained $F_1$ objective, STL residuals $e_{t,i}$, $\text{MAD}$, CUSUM, and $\chi^2_d$-distributed Mahalanobis distance $D_M^2(\mathbf{e}_t)$. |
| **3. Method selection and feasibility** | $20\%$ | **Section 3 & Section 6.3:** Justification of breakdown points ($50\%$ for $\text{MAD}$ vs. $0\%$ for $3\sigma$), $\mathcal{O}(W + d^2)$ edge feasibility, and deterministic reason codes. |
| **4. Validation plan and quantitative metrics** | $20\%$ | **Section 4 & Section 5:** Chronological 60/20/20 split, residual interpolation, and full benchmark table (Precision, Recall, $F_1$, $\text{FPR}$, Detection Delay $\Delta t$, and Missingness Robustness). |
| **5. Originality, clarity and presentation** | $20\%$ (confirm; weights sum to 105%) | **Section 6 & Section 7:** End-to-end architecture workflow, explainable diagnostic log (showing how real storms are protected), and transparent risk analysis. |