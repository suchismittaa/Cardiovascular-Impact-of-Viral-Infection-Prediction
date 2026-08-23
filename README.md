# Cardiovascular Risk Prediction — Interactive Portfolio Demo

An interactive, portfolio-facing companion to the "Cardiovascular Impact of Viral
Infection Prediction" research project. It sits on top of the existing research
(dataset, notebook, report) without changing any of it, and turns the actual
findings into a scroll-driven, explorable experience.

## What this is

A static site — plain HTML, CSS, and vanilla JS, no framework, no build step.
Every number on the page (dataset size, model accuracy/precision/recall/F1,
Random Forest feature importances, logistic regression coefficients) is
computed directly from `heart.csv` and embedded as data — nothing is invented.

**No backend.** The "Become the patient" simulator runs the *actual* trained
logistic regression model client-side: the exported standardization
parameters (mean/scale) and coefficients are baked into `assets/data.js`, and
`script.js` reimplements the same arithmetic scikit-learn does at inference
time (`z = (x − mean) / scale`, `logit = intercept + Σ(coefᵢ · zᵢ)`,
`prob = sigmoid(logit)`). It's not an approximation of the model — it's the
model's own math, run in the browser.

## Files

```
index.html            the page
styles.css             design system + layout
script.js               all interactivity (charts, simulator, scroll effects)
assets/data.js          embedded dataset + trained-model parameters (JSON)
assets/heart.csv         the source dataset, for reference
assets/Research_Paper.ipynb   the original notebook, linked from the page
assets/Final-Project-Report.pdf  the original report, linked from the page
```

## Run it locally

No install needed — it's static.

```bash
cd cardio-portfolio-demo
python3 -m http.server 8000
# open http://localhost:8000
```

or with Node:

```bash
npx serve .
```

## Regenerating the embedded data (optional)

If you retrain the model or update `heart.csv`, regenerate `assets/data.js`
by re-running the same train/test split and export used here (80/20 split,
`random_state=42`, `StandardScaler`, `LogisticRegression` + `RandomForestClassifier`)
and re-serializing `columns`, `metrics`, `rf_importances`, `lr_intercept`,
`lr_coef`, `scaler_mean`, `scaler_scale` into the `model` key of that file,
alongside `ranges` (per-feature min/max/median, for slider bounds) and
`points` (the 303 rows used in the scatter plot).

## Deploy to Vercel

This is a zero-config static site.

1. Push this folder to a GitHub repo (or the relevant subfolder of your portfolio repo).
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: **Other** (or leave auto-detected — there's nothing to build).
4. Root directory: point it at this folder if it's nested in a larger repo.
5. Deploy. No environment variables, no serverless functions, no database.

Or via CLI:

```bash
npm i -g vercel
cd cardio-portfolio-demo
vercel --prod
```

## Notes on scope

The source project's title references viral infection as a research
motivation, but `heart.csv` is the standard Cleveland heart-disease dataset —
it contains only clinical/diagnostic features, no viral-infection variables.
This demo is scoped honestly to what the data supports: cardiovascular
disease prediction from clinical features. That's stated explicitly on the
page itself (see the "scope note" in the Dataset section) rather than left
implicit.
