(() => {
  const D = window.CARDIO_DATA;
  const M = D.model;
  const COLS = M.columns;

  /* ---------------------------------------------------------------
     Feature metadata: plain-English labels + descriptions
  --------------------------------------------------------------- */
  const FEATURE_META = {
    age:      { label: 'Age',                     unit: 'years',  type: 'range', step: 1,
                desc: "The patient's age in years. Cardiovascular risk generally trends upward with age." },
    sex:      { label: 'Sex',                      type: 'select', options: [[0,'Female'],[1,'Male']],
                desc: 'Biological sex, encoded as male / female in this dataset.' },
    cp:       { label: 'Chest Pain Type',          type: 'select',
                options: [[0,'Typical angina'],[1,'Atypical angina'],[2,'Non-anginal pain'],[3,'Asymptomatic']],
                desc: 'The character of chest pain reported. Atypical or asymptomatic presentations are common in the higher-risk group in this data.' },
    trestbps: { label: 'Resting Blood Pressure',   unit: 'mm Hg',  type: 'range', step: 1,
                desc: 'Blood pressure on admission to hospital, at rest.' },
    chol:     { label: 'Serum Cholesterol',        unit: 'mg/dl',  type: 'range', step: 1,
                desc: 'Total cholesterol measured from a blood sample.' },
    fbs:      { label: 'Fasting Blood Sugar',      type: 'select', options: [[0,'≤ 120 mg/dl'],[1,'> 120 mg/dl']],
                desc: 'Whether fasting blood sugar exceeds 120 mg/dl, a marker sometimes associated with diabetes.' },
    restecg:  { label: 'Resting ECG',              type: 'select',
                options: [[0,'Normal'],[1,'ST-T abnormality'],[2,'Probable LV hypertrophy']],
                desc: "Resting electrocardiogram results, capturing the heart's electrical activity at rest." },
    thalach:  { label: 'Max Heart Rate',           unit: 'bpm',    type: 'range', step: 1,
                desc: 'The highest heart rate achieved during a treadmill stress test.' },
    exang:    { label: 'Exercise-Induced Angina',  type: 'select', options: [[0,'No'],[1,'Yes']],
                desc: 'Whether physical exertion triggered chest pain during testing.' },
    oldpeak:  { label: 'ST Depression (Oldpeak)',  unit: 'mm',     type: 'range', step: 0.1,
                desc: 'ST-segment depression on the ECG induced by exercise, relative to rest — a classic marker of reduced blood flow to the heart.' },
    slope:    { label: 'ST Segment Slope',         type: 'select', options: [[0,'Upsloping'],[1,'Flat'],[2,'Downsloping']],
                desc: 'The slope of the ST segment at peak exercise. A flat or downsloping pattern is more often associated with disease.' },
    ca:       { label: 'Major Vessels (Fluoroscopy)', type: 'select', options: [[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4']],
                desc: 'Number of major coronary vessels visibly narrowed, seen via fluoroscopy with dye — more affected vessels generally signals more disease.' },
    thal:     { label: 'Thalassemia Test',         type: 'select',
                options: [[0,'Unknown'],[1,'Normal'],[2,'Fixed defect'],[3,'Reversible defect']],
                desc: 'Result of a thallium stress test assessing blood flow to the heart muscle.' },
  };

  /* ---------------------------------------------------------------
     Core model math — reimplements the trained LogisticRegression
     exactly: z = (x - mean) / scale ; logit = intercept + Σ(coef·z)
  --------------------------------------------------------------- */
  function contributions(patient) {
    const contribs = {};
    let logit = M.lr_intercept;
    COLS.forEach(c => {
      const z = (patient[c] - M.scaler_mean[c]) / M.scaler_scale[c];
      const contrib = M.lr_coef[c] * z;
      contribs[c] = contrib;
      logit += contrib;
    });
    const prob = 1 / (1 + Math.exp(-logit));
    return { prob, contribs, logit };
  }

  /* ---------------------------------------------------------------
     Utility
  --------------------------------------------------------------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  function fmt(n, d = 1) { return Number(n).toFixed(d); }

  /* =================================================================
     HERO: animated counters + ECG waveform
  ================================================================= */
  function animateCounters() {
    $$('.hero-stat-num, .hero-stat-num-decimal').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isDecimal = el.classList.contains('hero-stat-num-decimal');
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = isDecimal ? val.toFixed(1) : Math.round(val);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function buildEcgPath(width, height, mid) {
    // a stylized heartbeat trace repeated across the width
    const beats = 6;
    const segW = width / beats;
    let d = `M0,${mid}`;
    for (let i = 0; i < beats; i++) {
      const x0 = i * segW;
      d += ` L${x0 + segW*0.30},${mid}`;
      d += ` L${x0 + segW*0.36},${mid - height*0.12}`;
      d += ` L${x0 + segW*0.40},${mid + height*0.06}`;
      d += ` L${x0 + segW*0.46},${mid - height*0.62}`;
      d += ` L${x0 + segW*0.52},${mid + height*0.42}`;
      d += ` L${x0 + segW*0.58},${mid - height*0.06}`;
      d += ` L${x0 + segW*0.68},${mid}`;
      d += ` L${x0 + segW},${mid}`;
    }
    return d;
  }

  function initHeroEcg() {
    const path = $('#hero-ecg-path');
    if (!path) return;
    path.setAttribute('d', buildEcgPath(1400, 260, 150));
    // gentle draw-in
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.16,.8,.24,1)';
      path.style.strokeDashoffset = 0;
    });
  }

  /* =================================================================
     DATASET CHIPS
  ================================================================= */
  function initDatasetChips() {
    const wrap = $('#dataset-chips');
    const target1 = D.points.filter(p => p.target === 1).length;
    const target0 = D.points.length - target1;
    const chips = [
      `<strong>${D.points.length}</strong> patients`,
      `<strong>${target1}</strong> higher-risk diagnoses`,
      `<strong>${target0}</strong> lower-risk diagnoses`,
      `<strong>${COLS.length}</strong> input features`,
      `age <strong>${D.ranges.age.min|0}–${D.ranges.age.max|0}</strong>`,
      `test accuracy up to <strong>${fmt(Math.max(...Object.values(M.metrics).map(m=>m.accuracy))*100,1)}%</strong>`,
    ];
    wrap.innerHTML = chips.map(c => `<span class="chip">${c}</span>`).join('');
  }

  /* =================================================================
     SCATTER: age vs max heart rate, all 303 patients
  ================================================================= */
  function initScatter() {
    const svg = $('#scatter-svg');
    const detail = $('#explorer-detail');
    const W = 720, H = 480, PAD = 48;

    const ages = D.points.map(p => p.age);
    const hrs = D.points.map(p => p.thalach);
    const xMin = Math.min(...ages) - 2, xMax = Math.max(...ages) + 2;
    const yMin = Math.min(...hrs) - 5, yMax = Math.max(...hrs) + 5;

    const sx = v => PAD + (v - xMin) / (xMax - xMin) * (W - PAD * 2);
    const sy = v => (H - PAD) - (v - yMin) / (yMax - yMin) * (H - PAD * 2);

    let svgMarkup = '';
    // gridlines
    for (let i = 0; i <= 4; i++) {
      const gy = PAD + i * (H - PAD * 2) / 4;
      svgMarkup += `<line class="scatter-grid-line" x1="${PAD}" y1="${gy}" x2="${W-PAD}" y2="${gy}"/>`;
    }
    // axis labels
    svgMarkup += `<text class="scatter-axis-label" x="${PAD}" y="${H-18}">${xMin|0}</text>`;
    svgMarkup += `<text class="scatter-axis-label" x="${W-PAD-24}" y="${H-18}">${xMax|0} yrs</text>`;
    svgMarkup += `<text class="scatter-axis-label" x="6" y="${PAD}">${yMax|0}</text>`;
    svgMarkup += `<text class="scatter-axis-label" x="6" y="${H-PAD}">${yMin|0} bpm</text>`;

    D.points.forEach((p, i) => {
      const cx = sx(p.age), cy = sy(p.thalach);
      const color = p.target === 1 ? 'var(--risk)' : 'var(--calm)';
      svgMarkup += `<circle class="scatter-pt" data-i="${i}" cx="${cx}" cy="${cy}" r="4.2" fill="${color}" fill-opacity="0.75" stroke="${color}" stroke-opacity="0.9" stroke-width="1"/>`;
    });
    svg.innerHTML = svgMarkup;

    const cpLabels = ['Typical angina','Atypical angina','Non-anginal pain','Asymptomatic'];
    $$('.scatter-pt', svg).forEach(circle => {
      const p = D.points[+circle.dataset.i];
      circle.addEventListener('pointerenter', () => {
        circle.setAttribute('r', 7);
        const badge = p.target === 1 ? '<span class="detail-badge risk">Higher-risk diagnosis</span>' : '<span class="detail-badge calm">Lower-risk diagnosis</span>';
        detail.innerHTML = `
          ${badge}
          <div class="detail-row"><span>Age</span><span>${p.age}</span></div>
          <div class="detail-row"><span>Sex</span><span>${p.sex ? 'Male' : 'Female'}</span></div>
          <div class="detail-row"><span>Chest pain</span><span>${cpLabels[p.cp] ?? p.cp}</span></div>
          <div class="detail-row"><span>Resting BP</span><span>${p.trestbps} mm Hg</span></div>
          <div class="detail-row"><span>Cholesterol</span><span>${p.chol} mg/dl</span></div>
          <div class="detail-row"><span>Max heart rate</span><span>${p.thalach} bpm</span></div>
          <div class="detail-row"><span>Exercise angina</span><span>${p.exang ? 'Yes' : 'No'}</span></div>
        `;
      });
      circle.addEventListener('pointerleave', () => { circle.setAttribute('r', 4.2); });
    });
  }

  /* =================================================================
     FEATURE IMPORTANCE (from actual trained Random Forest)
  ================================================================= */
  function initImportance() {
    const wrap = $('#importance-list');
    const entries = Object.entries(M.rf_importances).sort((a,b) => b[1]-a[1]);
    const max = entries[0][1];
    wrap.innerHTML = entries.map(([key, val]) => {
      const meta = FEATURE_META[key] || { label: key, desc: '' };
      const pct = (val / max) * 100;
      return `
        <div class="importance-row" tabindex="0">
          <span class="importance-name">${meta.label}</span>
          <div class="importance-track"><div class="importance-fill" data-w="${pct}" style="width:0%"></div></div>
          <span class="importance-val">${fmt(val*100,1)}%</span>
          <p class="importance-desc">${meta.desc}</p>
        </div>`;
    }).join('');
  }

  function revealImportanceBars() {
    $$('.importance-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }

  /* =================================================================
     EXPLAINABILITY — a concrete example patient
  ================================================================= */
  function initExplain() {
    const wrap = $('#explain-wrap');
    const patient = D.example.features;
    const { prob, contribs } = contributions(patient);

    const sorted = Object.entries(contribs).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]));
    const up = sorted.filter(([,v]) => v > 0);
    const down = sorted.filter(([,v]) => v < 0);
    const maxAbs = Math.max(...sorted.map(([,v]) => Math.abs(v)));

    function rows(list) {
      return list.map(([key, val]) => {
        const meta = FEATURE_META[key] || { label: key };
        const pct = (Math.abs(val) / maxAbs) * 100;
        const cls = val > 0 ? 'up' : 'down';
        return `
          <div class="explain-bar-row">
            <div class="explain-bar-label"><span>${meta.label}</span><span>${val > 0 ? '+' : ''}${fmt(val,2)}</span></div>
            <div class="explain-bar-track"><div class="explain-bar-fill ${cls}" data-w="${pct}" style="width:0%"></div></div>
          </div>`;
      }).join('');
    }

    wrap.innerHTML = `
      <div class="explain-card">
        <div class="explain-head">
          <span class="explain-risk">Example patient — 40yo male, atypical chest pain, exercise-induced angina<br>Predicted risk: <strong>${Math.round(prob*100)}%</strong></span>
        </div>
        <div class="explain-cols">
          <div>
            <p class="explain-col-title up">Pushing risk higher</p>
            ${rows(up)}
          </div>
          <div>
            <p class="explain-col-title down">Pushing risk lower</p>
            ${rows(down)}
          </div>
        </div>
      </div>`;
  }

  function revealExplainBars() {
    $$('.explain-bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }

  /* =================================================================
     SIMULATOR — "Become the patient"
  ================================================================= */
  let simState = {};

  function defaultPatient() {
    const p = {};
    COLS.forEach(c => { p[c] = D.ranges[c].median; });
    return p;
  }

  function initSimulator() {
    simState = defaultPatient();
    const wrap = $('#sim-controls');

    wrap.innerHTML = COLS.map(key => {
      const meta = FEATURE_META[key];
      const r = D.ranges[key];
      if (meta.type === 'select') {
        const opts = meta.options.map(([v,label]) => `<option value="${v}" ${v===simState[key]?'selected':''}>${label}</option>`).join('');
        return `
          <div class="sim-control">
            <label class="sim-control-label" for="ctrl-${key}"><strong>${meta.label}</strong></label>
            <select class="sim-select" id="ctrl-${key}" data-key="${key}">${opts}</select>
          </div>`;
      }
      return `
        <div class="sim-control">
          <label class="sim-control-label" for="ctrl-${key}"><strong>${meta.label}</strong><span class="sim-control-val" id="val-${key}">${fmt(simState[key], meta.step < 1 ? 1 : 0)}${meta.unit ? ' '+meta.unit : ''}</span></label>
          <input type="range" id="ctrl-${key}" data-key="${key}" min="${r.min}" max="${r.max}" step="${meta.step}" value="${simState[key]}">
        </div>`;
    }).join('');

    wrap.addEventListener('input', onSimInput);
    updateSimulator(null, null);
  }

  let lastChangedKey = null, lastChangedDelta = 0;

  function onSimInput(e) {
    const key = e.target.dataset.key;
    if (!key) return;
    const meta = FEATURE_META[key];
    const val = parseFloat(e.target.value);
    const prevProb = contributions(simState).prob;
    lastChangedDelta = val - simState[key];
    simState[key] = val;
    if (meta.type === 'range') {
      $(`#val-${key}`).textContent = fmt(val, meta.step < 1 ? 1 : 0) + (meta.unit ? ' ' + meta.unit : '');
    }
    lastChangedKey = key;
    updateSimulator(prevProb, key);
  }

  function updateSimulator(prevProb, changedKey) {
    const { prob, contribs } = contributions(simState);
    const pct = Math.round(prob * 100);

    // gauge
    const circumference = 2 * Math.PI * 100;
    const offset = circumference * (1 - prob);
    const fillEl = $('#gauge-fill');
    fillEl.style.strokeDasharray = circumference;
    fillEl.style.strokeDashoffset = offset;
    const gaugeColor = prob > 0.66 ? 'var(--risk)' : prob > 0.4 ? '#f0a25c' : 'var(--calm)';
    fillEl.style.stroke = gaugeColor;

    $('#sim-risk-num').textContent = pct;

    // pulse line speed/amplitude reflects risk
    drawSimPulse(prob);

    // what changed text
    const whatEl = $('#sim-whatchanged');
    if (changedKey && prevProb !== null) {
      const meta = FEATURE_META[changedKey];
      const delta = prob - prevProb;
      const dir = delta > 0.002 ? 'increased' : delta < -0.002 ? 'decreased' : "didn't meaningfully change";
      whatEl.innerHTML = `Changing <strong>${meta.label}</strong> ${dir} the model's predicted probability${Math.abs(delta) > 0.002 ? ` by ${fmt(Math.abs(delta)*100,1)} points` : ''}.`;
    } else {
      whatEl.innerHTML = `Showing the model's estimate for the <strong>median patient</strong> in this dataset. Move a control to explore.`;
    }

    // contribution bars — top 6 by magnitude
    const sorted = Object.entries(contribs).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8);
    const maxAbs = Math.max(...sorted.map(([,v]) => Math.abs(v)), 0.001);
    const contribWrap = $('#sim-contrib');
    contribWrap.innerHTML = sorted.map(([key, val]) => {
      const meta = FEATURE_META[key];
      const pct2 = (Math.abs(val) / maxAbs) * 50;
      const isUp = val > 0;
      const left = isUp ? 50 : 50 - pct2;
      const color = isUp ? 'var(--risk)' : 'var(--calm)';
      return `
        <div class="sim-contrib-row">
          <span class="sim-contrib-name">${meta.label}</span>
          <div class="sim-contrib-bar-wrap">
            <div class="sim-contrib-bar" style="left:${left}%; width:${pct2}%; background:${color};"></div>
          </div>
        </div>`;
    }).join('');
  }

  function drawSimPulse(prob) {
    const path = $('#sim-pulse-path');
    const width = 240, mid = 30;
    const spike = 14 + prob * 22;
    const d = `M0,${mid} L90,${mid} L100,${mid-spike*0.3} L108,${mid+spike*0.5} L118,${mid-spike} L128,${mid+spike*0.35} L138,${mid} L${width},${mid}`;
    path.setAttribute('d', d);
  }

  /* =================================================================
     MODEL COMPARISON TABLE
  ================================================================= */
  function initModelTable() {
    const wrap = $('#model-table');
    const metrics = M.metrics;
    const best = Object.entries(metrics).sort((a,b) => b[1].roc_auc - a[1].roc_auc)[0][0];

    let html = `
      <div class="model-row head">
        <span>Model</span><span>Accuracy</span><span>Precision</span><span>Recall</span><span>F1 Score</span>
      </div>`;

    html += Object.entries(metrics).map(([name, m]) => `
      <div class="model-row">
        <div class="model-name">${name}${name === best ? '<span class="best-tag">highest ROC-AUC</span>' : ''}</div>
        ${['accuracy','precision','recall','f1'].map(k => `
          <div class="model-metric">
            <span class="model-metric-val">${fmt(m[k]*100,1)}%</span>
            <div class="model-metric-track"><div class="model-metric-fill" data-w="${m[k]*100}" style="width:0%"></div></div>
          </div>`).join('')}
      </div>`).join('');

    wrap.innerHTML = html;
  }

  function revealModelBars() {
    $$('.model-metric-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }

  /* =================================================================
     SCROLL: pulse progress + section reveals
  ================================================================= */
  function initScrollPulse() {
    const fillPath = $('#pulse-path-fill');
    const total = document.body.scrollHeight - window.innerHeight;
    function onScroll() {
      const p = Math.min(1, Math.max(0, window.scrollY / total));
      fillPath.style.strokeDasharray = `${p * 1000} 1000`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initReveals() {
    const targets = $$('.section-inner, .explorer-grid, .sim-grid, .findings-grid, .explain-wrap');
    targets.forEach(t => t.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.querySelector('#importance-list') || entry.target.id === undefined) {}
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => io.observe(t));

    // targeted reveals for animated bars
    const bars = [
      { id: 'importance', fn: revealImportanceBars },
      { id: 'explain', fn: revealExplainBars },
      { id: 'models', fn: revealModelBars },
    ];
    bars.forEach(({ id, fn }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { fn(); obs.disconnect(); }
        });
      }, { threshold: 0.2 });
      obs.observe(el);
    });
  }

  /* =================================================================
     INIT
  ================================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initHeroEcg();
    animateCounters();
    initDatasetChips();
    initScatter();
    initImportance();
    initExplain();
    initSimulator();
    initModelTable();
    initScrollPulse();
    initReveals();
  });
})();
