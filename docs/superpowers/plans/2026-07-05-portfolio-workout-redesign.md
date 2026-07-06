# "The Workout" Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the single-page portfolio as "The Workout" — six training blocks with a scroll-driven stick-figure training buddy — per the approved spec at `docs/superpowers/specs/2026-07-05-portfolio-workout-redesign-design.md`.

**Architecture:** Full in-place rewrite of the three existing files (`index.html`, `css/style.css`, `js/script.js`). All animation is CSS keyframes on an inline SVG skeleton; one passive scroll listener drives buddy position, pose switching, accent recoloring, and the progress HUD. No build step.

**Tech Stack:** Vanilla HTML5 + CSS3 + ES6 JavaScript. No libraries, no web fonts, no build tools.

## Global Constraints

- Stack: vanilla HTML/CSS/JS only — remove the Lucide icon script and Google Fonts links from the old page; add no new dependencies.
- Palette (exact): `--paper:#D1CACC`, `--ink:#0F0F0F`, `--paper-dim:#c2babd`, `--paper-dimmer:#b3aaae`, `--ember:#C73E1D`, `--gold:#B07D2B`, `--plum:#7A4A9E`, `--green:#33582F`, `--green-light:#8FBF85`.
- Typeface everywhere: `'Helvetica Neue', Helvetica, Arial, sans-serif`.
- H1 scale: `clamp(48px, 9vw, 130px)`, weight 900, uppercase, `letter-spacing:-0.04em`, `line-height:.92`.
- Unfinished content must render as visible `[placeholder …]` text — never hide or omit it.
- Preserve existing external links exactly: `mailto:utkarshbajaj2401@gmail.com`, `https://www.linkedin.com/in/utkarsh-bajaj/`, `https://github.com/Ubajaj1`, `https://strava.app.link/wY9V4pSLNYb`, `https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS`, `https://github.com/Ubajaj1/GreenPES`, `https://github.com/Ubajaj1/DataScore`, `https://github.com/Ubajaj1/AI-Daily-Post-Generator`, `https://github.com/Ubajaj1/fitness-tracker`.
- Photos (exact paths, note case): `assets/images/photographs/IMG_3695.jpg`, `assets/images/photographs/IMG_3696.jpg`, `assets/images/photographs/IMG_1986.JPG`, `assets/images/photographs/IMG_1878.JPG`.
- This is a static site with no test framework: each task's "test" is a stated verification command (grep / `node --check` / browser check) run before committing. To view the page locally use `python3 -m http.server 8080` from the repo root (or open `index.html` via `file://` — the page makes no network requests).
- Commit at the end of every task.

---

### Task 1: Rewrite `index.html`

**Files:**
- Modify: `index.html` (full replacement)

**Interfaces:**
- Produces (consumed by Tasks 2–5):
  - Section contract: each `<section>` carries `id`, `data-pose` (one of `pose-warmup|pose-squat|pose-pushup|pose-press|pose-run|pose-stretch`), `data-tag` (buddy label text), `data-accent` (hex), and optionally `data-reps="true"` + `data-tempo` (ms per rep).
  - Element ids used by JS: `buddy`, `buddyTag`, `repCount`, `pbar`, `pct`, `indexToggle`, `indexMenu`.
  - Class names styled by CSS: `top`, `logo`, `session-meta`, `index-toggle`, `index-menu`, `hud`, `bar`, `buddy-track`, `buddy`, `tag`, `reps`, `block-label`, `acc`, `outline`, `under`, `tri-under`, `dot-ember`, `dot-plum`, `dot-green`, `f-ember`, `f-plum`, `f-green`, `lede`, `sets`, `set-row`, `set-num`, `set-name`, `set-meta`, `set-reps`, `reps-detail`, `rep-item`, `n`, `accessory`, `accessory-row`, `board`, `board-row`, `b-event`, `b-entry`, `chip`, `done`, `review`, `up`, `photo-grid`, `stats`, `stat`, `invert`, `s-strength`, `s-comp`, `s-skill`, `s-cardio`, `cooldown-links`, `footer`.
  - SVG skeleton classes: `head`, `body-g`, `larm`, `rarm`, `lleg`, `rleg`, `lshin`, `rshin`.

- [ ] **Step 1: Replace the entire contents of `index.html` with:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Utkarsh Bajaj | AI/ML Engineer — Training Log</title>
    <meta name="description" content="Portfolio of Utkarsh Bajaj — AI/ML Engineer, researcher, photographer, and half-marathon runner. One workout session: six blocks.">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Session progress HUD -->
    <div class="hud" aria-hidden="true">
        Session progress <span id="pct">0%</span>
        <div class="bar"><i id="pbar"></i></div>
    </div>

    <!-- Training buddy -->
    <div class="buddy-track" aria-hidden="true">
        <div class="buddy pose-warmup" id="buddy">
            <div class="reps" id="repCount"></div>
            <svg viewBox="0 0 100 140">
                <g class="body-g">
                    <circle class="head" cx="50" cy="22" r="9"/>
                    <line x1="50" y1="31" x2="50" y2="78"/>
                    <line class="larm" x1="50" y1="42" x2="50" y2="70"/>
                    <line class="rarm" x1="50" y1="42" x2="50" y2="70"/>
                    <g class="lleg">
                        <line x1="50" y1="78" x2="50" y2="96"/>
                        <g class="lshin"><line x1="50" y1="96" x2="50" y2="114"/></g>
                    </g>
                    <g class="rleg">
                        <line x1="50" y1="78" x2="50" y2="96"/>
                        <g class="rshin"><line x1="50" y1="96" x2="50" y2="114"/></g>
                    </g>
                </g>
            </svg>
            <span class="tag" id="buddyTag">WARM-UP</span>
        </div>
    </div>

    <header class="top">
        <div class="logo">UB. TRAINING LOG</div>
        <div class="session-meta">Session 2026-07 &nbsp;·&nbsp; 6 blocks &nbsp;·&nbsp; scroll to begin</div>
        <button class="index-toggle" id="indexToggle" aria-expanded="false" aria-controls="indexMenu">Index</button>
        <nav class="index-menu" id="indexMenu" hidden>
            <a href="#warmup">01 — Warm-up</a>
            <a href="#strength">02 — Strength · AI Work</a>
            <a href="#competition">03 — Competition · Research</a>
            <a href="#skill">04 — Skill Work · Photography</a>
            <a href="#cardio">05 — Cardio · Running</a>
            <a href="#cooldown">06 — Cool-down · Contact</a>
        </nav>
    </header>

    <!-- BLOCK 01: WARM-UP / HERO -->
    <section id="warmup" data-pose="pose-warmup" data-tag="WARM-UP · JACKS" data-accent="#0F0F0F">
        <div class="block-label">Block 01 — Warm-up · 2 min easy</div>
        <h1>Every<br><span class="outline">discipline</span><br>is a <span class="tri-under">workout</span><span class="dot-ember">.</span></h1>
        <p class="lede">I'm Utkarsh — an AI/ML engineer at Amazon who <span class="f-ember">trains models</span>, <span class="f-plum">frames photographs</span>, and <span class="f-green">runs half marathons</span>. Same method everywhere: show up, do the reps, get stronger. This is my training log.</p>
    </section>

    <!-- BLOCK 02: STRENGTH = AI WORK -->
    <section id="strength" class="s-strength" data-pose="pose-squat" data-tag="SQUATS · AI WORK" data-accent="#C73E1D" data-reps="true" data-tempo="1600">
        <div class="block-label">Block 02 — Strength · AI Engineering — 6 sets</div>
        <h1>Heavy<br><span class="acc">compound</span><br>work<span class="outline">.</span></h1>
        <p class="lede">The big lifts. Each <b>set</b> is a project — open one and the <b>reps</b> are the deep-dive: problem, idea, build, result.</p>

        <div class="sets">
            <button class="set-row" aria-expanded="false" aria-controls="reps-greenpes">
                <span class="set-num">SET 01</span>
                <span class="set-name">GreenPES</span>
                <span class="set-meta">Open source · Sustainable LLMs</span>
                <span class="set-reps">5 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-greenpes" hidden>
                <div class="rep-item"><span class="n">REP 1</span> The problem: LLM deployments waste tokens, cost, and carbon.</div>
                <div class="rep-item"><span class="n">REP 2</span> The idea: the first standardized metric for sustainable LLM deployment.</div>
                <div class="rep-item"><span class="n">REP 3</span> The build: an optimizer balancing response quality against token efficiency.</div>
                <div class="rep-item"><span class="n">REP 4</span> The result: lower compute cost and carbon footprint without sacrificing performance.</div>
                <div class="rep-item"><span class="n">REP 5</span> <a href="https://github.com/Ubajaj1/GreenPES" target="_blank" rel="noopener">View on GitHub ↗</a></div>
            </div>

            <button class="set-row" aria-expanded="false" aria-controls="reps-datascore">
                <span class="set-num">SET 02</span>
                <span class="set-name">DataScore</span>
                <span class="set-meta">Open source · Data quality for fine-tuning</span>
                <span class="set-reps">5 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-datascore" hidden>
                <div class="rep-item"><span class="n">REP 1</span> The problem: teams discover bad training data only after an expensive fine-tune.</div>
                <div class="rep-item"><span class="n">REP 2</span> The idea: score dataset quality before training and predict downstream performance.</div>
                <div class="rep-item"><span class="n">REP 3</span> The build: a predictive data-quality framework for LLM fine-tuning datasets.</div>
                <div class="rep-item"><span class="n">REP 4</span> The result: targeted data curation for optimal fine-tuning outcomes.</div>
                <div class="rep-item"><span class="n">REP 5</span> <a href="https://github.com/Ubajaj1/DataScore" target="_blank" rel="noopener">View on GitHub ↗</a></div>
            </div>

            <button class="set-row" aria-expanded="false" aria-controls="reps-pythia">
                <span class="set-num">SET 03</span>
                <span class="set-name">Pythia</span>
                <span class="set-meta">Presented @ AI Tinkerers Toronto</span>
                <span class="set-reps">3 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-pythia" hidden>
                <div class="rep-item"><span class="n">REP 1</span> [placeholder — what Pythia does, one sentence]</div>
                <div class="rep-item"><span class="n">REP 2</span> [placeholder — how it works / what was demoed]</div>
                <div class="rep-item"><span class="n">REP 3</span> [placeholder — link]</div>
            </div>

            <button class="set-row" aria-expanded="false" aria-controls="reps-inputguard">
                <span class="set-num">SET 04</span>
                <span class="set-name">InputGuard</span>
                <span class="set-meta">Heading to INFORMS 2026</span>
                <span class="set-reps">3 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-inputguard" hidden>
                <div class="rep-item"><span class="n">REP 1</span> [placeholder — what InputGuard does, one sentence]</div>
                <div class="rep-item"><span class="n">REP 2</span> [placeholder — approach / result]</div>
                <div class="rep-item"><span class="n">REP 3</span> [placeholder — link]</div>
            </div>

            <button class="set-row" aria-expanded="false" aria-controls="reps-datamind">
                <span class="set-num">SET 05</span>
                <span class="set-name">DataMind</span>
                <span class="set-meta">Amazon · GenAI RAG · 600+ hrs saved/yr</span>
                <span class="set-reps">4 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-datamind" hidden>
                <div class="rep-item"><span class="n">REP 1</span> The problem: engineers burned hours hunting internal data answers.</div>
                <div class="rep-item"><span class="n">REP 2</span> The build: an AWS Bedrock-based GenAI RAG platform.</div>
                <div class="rep-item"><span class="n">REP 3</span> The result: 51+ monthly active users, 600+ engineering hours saved annually.</div>
                <div class="rep-item"><span class="n">REP 4</span> Internal tool @ Amazon — no public link.</div>
            </div>

            <button class="set-row" aria-expanded="false" aria-controls="reps-finny">
                <span class="set-num">SET 06</span>
                <span class="set-name">Finny</span>
                <span class="set-meta">Amazon · LLM agents · ICLR Workshop '26</span>
                <span class="set-reps">4 reps ↓</span>
            </button>
            <div class="reps-detail" id="reps-finny" hidden>
                <div class="rep-item"><span class="n">REP 1</span> The build: an LLM-powered forecast fine-tuning recommendation engine.</div>
                <div class="rep-item"><span class="n">REP 2</span> The result: manual analysis time down 70%, interactive Streamlit dashboarding.</div>
                <div class="rep-item"><span class="n">REP 3</span> Published at ICLR Workshop 2026. [placeholder — paper link]</div>
                <div class="rep-item"><span class="n">REP 4</span> Internal tool @ Amazon.</div>
            </div>
        </div>

        <div class="accessory">
            <div class="block-label">Accessory work</div>
            <a class="accessory-row" href="https://github.com/Ubajaj1/AI-Daily-Post-Generator" target="_blank" rel="noopener">
                <span>AI Daily Post Generator</span><span>Python · GenAI</span><span>GitHub ↗</span>
            </a>
            <a class="accessory-row" href="https://github.com/Ubajaj1/fitness-tracker" target="_blank" rel="noopener">
                <span>Fitness Tracker</span><span>Full stack · Data viz</span><span>GitHub ↗</span>
            </a>
        </div>
    </section>

    <!-- BLOCK 03: COMPETITION = RESEARCH SEASON -->
    <section id="competition" class="s-comp" data-pose="pose-pushup" data-tag="PUSH-UPS · RESEARCH" data-accent="#B07D2B" data-reps="true" data-tempo="1200">
        <div class="block-label">Block 03 — Competition · Research Season 2026</div>
        <h1>The record<br><span class="acc">board</span><span class="outline">.</span></h1>
        <p class="lede">Every paper is a race entered: some finished, some still on course, some on the start line.</p>
        <div class="board">
            <a class="board-row" href="#" target="_blank" rel="noopener">
                <span class="b-event">ICLR Workshop '26</span>
                <span class="b-entry">Finny — LLM-powered forecast fine-tuning [placeholder — paper title/link]</span>
                <span class="chip done">Published ✓</span>
            </a>
            <a class="board-row" href="#" target="_blank" rel="noopener">
                <span class="b-event">AI Tinkerers Toronto</span>
                <span class="b-entry">Pythia — [placeholder one-liner]</span>
                <span class="chip done">Presented ✓</span>
            </a>
            <a class="board-row" href="#" target="_blank" rel="noopener">
                <span class="b-event">ACML 2026</span>
                <span class="b-entry">Prompt Sensitivity Evaluation Methods — [placeholder title]</span>
                <span class="chip review">Under review</span>
            </a>
            <a class="board-row" href="#" target="_blank" rel="noopener">
                <span class="b-event">ICTAI 2026</span>
                <span class="b-entry">LLM Leaderboard &amp; Benchmark Analysis — [placeholder]</span>
                <span class="chip review">Under review</span>
            </a>
            <a class="board-row" href="#" target="_blank" rel="noopener">
                <span class="b-event">INFORMS 2026</span>
                <span class="b-entry">InputGuard — [placeholder one-liner]</span>
                <span class="chip up">Upcoming talk</span>
            </a>
        </div>
    </section>

    <!-- BLOCK 04: SKILL WORK = PHOTOGRAPHY -->
    <section id="skill" class="s-skill" data-pose="pose-press" data-tag="SKILL WORK · LENS" data-accent="#7A4A9E">
        <div class="block-label">Block 04 — Skill work · Photography</div>
        <h1>Technique<span class="acc">,</span><br>not just<br><span class="acc">strength</span>.</h1>
        <p class="lede">Precision work. <b>Composition is form</b> — you don't muscle a photograph, you practice it. <a href="https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS" target="_blank" rel="noopener">Full gallery ↗</a></p>
        <div class="photo-grid">
            <a href="https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS" target="_blank" rel="noopener"><img src="assets/images/photographs/IMG_3695.jpg" alt="Photograph by Utkarsh Bajaj"></a>
            <a href="https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS" target="_blank" rel="noopener"><img src="assets/images/photographs/IMG_3696.jpg" alt="Photograph by Utkarsh Bajaj"></a>
            <a href="https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS" target="_blank" rel="noopener"><img src="assets/images/photographs/IMG_1986.JPG" alt="Photograph by Utkarsh Bajaj"></a>
            <a href="https://photos.google.com/album/AF1QipPl7im7h8D27Uxw9sEFoFsXOW4wX1V_eUc8vCVS" target="_blank" rel="noopener"><img src="assets/images/photographs/IMG_1878.JPG" alt="Photograph by Utkarsh Bajaj"></a>
        </div>
    </section>

    <!-- BLOCK 05: CARDIO = RUNNING (inverted) -->
    <section id="cardio" class="invert s-cardio" data-pose="pose-run" data-tag="CARDIO · 21.1K" data-accent="#8FBF85">
        <div class="block-label">Block 05 — Cardio · Half marathons</div>
        <h1>The long<br><span class="acc">run</span><span class="outline">.</span></h1>
        <p class="lede">New Delhi · Toronto · San Diego · New York · Seattle. Consistency beats intensity — in training and in engineering. <a href="https://strava.app.link/wY9V4pSLNYb" target="_blank" rel="noopener">Follow on Strava ↗</a></p>
        <div class="stats">
            <div class="stat"><div class="n">5</div><div class="l">Cities</div></div>
            <div class="stat"><div class="n">21.1</div><div class="l">KM / race</div></div>
            <div class="stat"><div class="n">105.5</div><div class="l">Race KM total</div></div>
        </div>
    </section>

    <!-- BLOCK 06: COOL-DOWN = CONTACT -->
    <section id="cooldown" data-pose="pose-stretch" data-tag="COOL-DOWN" data-accent="#0F0F0F">
        <div class="block-label">Block 06 — Cool-down · Stretch &amp; connect</div>
        <h1>Session<br>complete<span class="dot-ember">.</span><span class="dot-plum">.</span><span class="dot-green">.</span></h1>
        <p class="lede">Good work today. Want to talk AI, photography, or training plans?</p>
        <div class="cooldown-links">
            <a href="mailto:utkarshbajaj2401@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/utkarsh-bajaj/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/Ubajaj1" target="_blank" rel="noopener">GitHub</a>
            <a href="https://strava.app.link/wY9V4pSLNYb" target="_blank" rel="noopener">Strava</a>
        </div>
        <footer class="footer">© 2026 Utkarsh Bajaj — session logged.</footer>
    </section>

    <script src="js/script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify structure**

Run: `grep -c '<section' index.html && grep -c 'set-row' index.html && grep -c 'board-row' index.html && grep -c 'lucide' index.html; true`
Expected: `6`, `6`, `5`, `0` (grep exits 1 on the last — that is the pass condition: no lucide left).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rewrite index.html as six-block Workout structure"
```

*(The page is unstyled until Task 2 — expected.)*

---

### Task 2: CSS part 1 — design system, header, typography, section scaffolding

**Files:**
- Modify: `css/style.css` (full replacement; Tasks 3, 4, 6 append to it)

**Interfaces:**
- Consumes: class names and data attributes from Task 1.
- Produces: `:root` tokens and section-scoped `--accent` used by all later CSS; `.hud`/`.bar` styled here and recolored by JS in Task 5.

- [ ] **Step 1: Replace the entire contents of `css/style.css` with:**

```css
/* ============ THE WORKOUT — design system ============ */
:root {
    --paper: #D1CACC;
    --ink: #0F0F0F;
    --paper-dim: #c2babd;
    --paper-dimmer: #b3aaae;
    --ember: #C73E1D;
    --gold: #B07D2B;
    --plum: #7A4A9E;
    --green: #33582F;
    --green-light: #8FBF85;
    --buddy-reserve: 108px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
}

a { color: inherit; }

/* ============ HUD ============ */
.hud {
    position: fixed; top: 12px; right: var(--buddy-reserve); z-index: 50;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    text-align: right; line-height: 1.8;
}
.hud .bar { width: 140px; height: 4px; background: var(--paper-dimmer); margin-top: 4px; }
.hud .bar i { display: block; height: 100%; background: var(--ink); width: 0%; transition: background .4s; }

/* ============ Header ============ */
header.top {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px var(--buddy-reserve) 16px 40px;
    border-bottom: 2px solid var(--ink);
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    position: sticky; top: 0; background: var(--paper); z-index: 30;
}
header.top .logo { font-weight: 900; font-size: 14px; }

.index-toggle {
    display: none;
    background: none; border: 2px solid var(--ink); color: var(--ink);
    font: inherit; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 6px 14px; cursor: pointer;
}
.index-menu {
    position: absolute; top: 100%; left: 0; right: 0;
    background: var(--paper); border-bottom: 2px solid var(--ink);
    display: flex; flex-direction: column;
}
.index-menu a {
    padding: 14px 40px; text-decoration: none; font-weight: 700;
    border-top: 1px solid var(--ink);
}
.index-menu a:hover { background: var(--ink); color: var(--paper); }
.index-menu[hidden] { display: none; }

/* ============ Sections ============ */
section {
    padding: 80px var(--buddy-reserve) 80px 40px;
    border-bottom: 2px solid var(--ink);
    min-height: 90vh;
    --accent: var(--ink);
}
section.s-strength { --accent: var(--ember); }
section.s-comp { --accent: var(--gold); }
section.s-skill { --accent: var(--plum); }
section.s-cardio { --accent: var(--green); }

.block-label {
    display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    background: var(--ink); color: var(--paper); padding: 4px 10px; margin-bottom: 20px;
}

/* ============ Typography ============ */
h1 {
    font-size: clamp(48px, 9vw, 130px);
    font-weight: 900; line-height: .92; letter-spacing: -.04em; text-transform: uppercase;
}
h1 .outline { color: transparent; -webkit-text-stroke: 2px var(--ink); }
h1 .acc { color: var(--accent); }
h1 .under {
    text-decoration: underline; text-decoration-thickness: 6px;
    text-underline-offset: 10px; text-decoration-color: var(--accent);
}
h1 .tri-under { position: relative; }
h1 .tri-under::after {
    content: ""; position: absolute; left: 2%; right: 2%; bottom: -.06em; height: .07em;
    background: linear-gradient(90deg, var(--ember) 0 33.4%, var(--plum) 33.4% 66.7%, var(--green) 66.7% 100%);
}
.dot-ember { color: var(--ember); }
.dot-plum { color: var(--plum); }
.dot-green { color: var(--green); }

.lede { max-width: 460px; font-size: 15px; line-height: 1.6; margin-top: 28px; color: #3a3436; }
.lede b { color: var(--accent); }
.lede .f-ember { color: var(--ember); font-weight: 700; }
.lede .f-plum { color: var(--plum); font-weight: 700; }
.lede .f-green { color: var(--green); font-weight: 700; }
```

- [ ] **Step 2: Verify**

Run: `grep -c -- '--accent' css/style.css`
Expected: a number ≥ 8. Then open `http://localhost:8080` — greige page, styled sticky header, giant hero type with tri-color underline. (Set rows/board/buddy still unstyled.)

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: workout design system, header, and typography"
```

---

### Task 3: CSS part 2 — sets, record board, photos, stats, cool-down

**Files:**
- Modify: `css/style.css` (append to end)

**Interfaces:**
- Consumes: tokens and `--accent` from Task 2; markup from Task 1.
- Produces: `.reps-detail[hidden]` display contract used by JS toggle in Task 5.

- [ ] **Step 1: Append to `css/style.css`:**

```css
/* ============ Strength sets ============ */
.sets { margin-top: 48px; border-top: 2px solid var(--ink); }
.set-row {
    display: grid; grid-template-columns: 120px 1fr 220px 90px;
    align-items: center; gap: 16px; width: 100%;
    padding: 20px 0; border: none; border-bottom: 1px solid var(--ink);
    background: none; color: inherit; font: inherit; text-align: left;
    cursor: pointer; transition: all .2s;
}
.set-row:hover, .set-row:focus-visible { background: var(--accent); color: var(--paper); padding-left: 12px; }
.set-row:hover .set-reps, .set-row:focus-visible .set-reps { color: var(--paper); }
.set-num { font-size: 12px; font-weight: 900; letter-spacing: 1px; }
.set-name { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
.set-meta { font-size: 11px; opacity: .65; text-transform: uppercase; letter-spacing: 1px; }
.set-reps { font-size: 11px; font-weight: 700; text-align: right; color: var(--accent); }

.reps-detail { padding: 24px 0 32px 120px; border-bottom: 1px solid var(--ink); background: var(--paper-dim); }
.reps-detail[hidden] { display: none; }
.rep-item { display: flex; gap: 14px; font-size: 13px; padding: 7px 0; align-items: baseline; }
.rep-item .n { font-weight: 900; font-size: 12px; min-width: 52px; color: var(--accent); }

/* ============ Accessory work ============ */
.accessory { margin-top: 64px; }
.accessory-row {
    display: grid; grid-template-columns: 1fr 220px 90px; gap: 16px;
    padding: 12px 0; border-bottom: 1px solid var(--ink);
    font-size: 13px; font-weight: 700; text-decoration: none;
    text-transform: uppercase; letter-spacing: 1px; transition: all .2s;
}
.accessory-row span:nth-child(2) { opacity: .6; font-weight: 400; }
.accessory-row span:last-child { text-align: right; }
.accessory-row:hover { background: var(--accent); color: var(--paper); padding-left: 12px; }

/* ============ Record board ============ */
.board { margin-top: 48px; border-top: 2px solid var(--ink); }
.board-row {
    display: grid; grid-template-columns: 230px 1fr 170px; gap: 16px;
    padding: 18px 0; border-bottom: 1px solid var(--ink); align-items: center;
    text-decoration: none; transition: background .2s;
}
.board-row:hover { background: var(--paper-dim); }
.b-event { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
.b-entry { font-size: 13px; opacity: .8; }
.chip {
    justify-self: end; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 6px 12px; border: 2px solid var(--accent); text-align: center;
}
.chip.done { background: var(--accent); color: var(--paper); }
.chip.review { color: var(--accent); animation: chip-pulse 2s ease-in-out infinite; }
.chip.up { border-style: dashed; color: var(--ink); }
@keyframes chip-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

/* ============ Photo grid ============ */
.photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 48px; }
.photo-grid a {
    display: block; aspect-ratio: 3 / 4; border: 1px solid var(--ink);
    overflow: hidden; transition: all .2s;
}
.photo-grid a:hover { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent) inset; }
.photo-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ============ Inverted (cardio) ============ */
section.invert { background: var(--ink); color: var(--paper); }
section.invert h1 .outline { -webkit-text-stroke: 2px var(--paper); }
section.invert h1 .acc { color: var(--green-light); }
section.invert .block-label { background: var(--paper); color: var(--ink); }
section.invert .lede { color: #a89fa3; }

.stats { display: flex; gap: 60px; margin-top: 48px; flex-wrap: wrap; }
.stat .n { font-size: 64px; font-weight: 900; letter-spacing: -3px; color: var(--green-light); }
.stat .l { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; opacity: .6; }

/* ============ Cool-down ============ */
.cooldown-links { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; }
.cooldown-links a {
    border: 2px solid var(--ink); padding: 14px 28px; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; text-decoration: none; transition: all .2s;
}
.cooldown-links a:hover { background: var(--ink); color: var(--paper); }

.footer { margin-top: 60px; font-size: 11px; opacity: .6; letter-spacing: 1px; text-transform: uppercase; }
```

- [ ] **Step 2: Verify**

Reload `http://localhost:8080`: set rows flood ember on hover; record board chips render (filled / pulsing / dashed); photos fill the 4-up grid; cardio section is inverted with light-green stats. Rep panels stay hidden (JS lands in Task 5).

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: block components — sets, record board, photos, stats, cooldown"
```

---

### Task 4: CSS part 3 — training buddy and pose animations

**Files:**
- Modify: `css/style.css` (append to end)

**Interfaces:**
- Consumes: SVG skeleton classes from Task 1.
- Produces: pose classes `pose-warmup`, `pose-squat`, `pose-pushup`, `pose-press`, `pose-run`, `pose-stretch` — switched by JS in Task 5 on the `#buddy` element.

- [ ] **Step 1: Append to `css/style.css`:**

```css
/* ============ Training buddy ============ */
.buddy-track { position: fixed; right: 14px; top: 0; bottom: 0; width: 78px; z-index: 40; pointer-events: none; }
.buddy {
    position: absolute; right: 0; width: 78px; text-align: center;
    background: var(--paper); border: 2px solid var(--ink);
    padding: 6px 4px 4px;
    transition: top .15s linear;
}
.buddy svg { width: 52px; height: 76px; overflow: visible; transition: transform .4s; }
.buddy .tag {
    font-size: 8px; letter-spacing: 1px; text-transform: uppercase;
    background: var(--ink); color: var(--paper); padding: 3px 4px; margin-top: 3px;
    display: block; white-space: nowrap; overflow: hidden; transition: background .4s;
}
.buddy .reps { font-size: 15px; font-weight: 900; color: var(--ink); height: 18px; transition: color .4s; }

.buddy svg * { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; fill: none; }
.buddy svg .head { fill: var(--ink); }
.buddy svg g, .buddy svg line, .buddy svg circle { transform-box: view-box; transition: transform .3s; }
.larm, .rarm { transform-origin: 50px 42px; }
.lleg, .rleg { transform-origin: 50px 78px; }
.lshin, .rshin { transform-origin: 50px 96px; }
.body-g { transform-origin: 50px 78px; }

/* WARM-UP: jumping jacks */
@keyframes jj-body { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes jj-lleg { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(32deg); } }
@keyframes jj-rleg { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-32deg); } }
@keyframes jj-larm { 0%, 100% { transform: rotate(15deg); } 50% { transform: rotate(165deg); } }
@keyframes jj-rarm { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(-165deg); } }
.pose-warmup .body-g { animation: jj-body .7s ease-in-out infinite; }
.pose-warmup .lleg { animation: jj-lleg .7s ease-in-out infinite; }
.pose-warmup .rleg { animation: jj-rleg .7s ease-in-out infinite; }
.pose-warmup .larm { animation: jj-larm .7s ease-in-out infinite; }
.pose-warmup .rarm { animation: jj-rarm .7s ease-in-out infinite; }

/* STRENGTH: side-view squat */
@keyframes sq-body { 0%, 100% { transform: translateY(0); } 45%, 60% { transform: translateY(15px); } }
@keyframes sq-thigh { 0%, 100% { transform: rotate(0); } 45%, 60% { transform: rotate(-72deg); } }
@keyframes sq-shin { 0%, 100% { transform: rotate(0); } 45%, 60% { transform: rotate(72deg); } }
@keyframes sq-arm { 0%, 100% { transform: rotate(-8deg); } 45%, 60% { transform: rotate(-88deg); } }
.pose-squat .body-g { animation: sq-body 1.6s ease-in-out infinite; }
.pose-squat .lleg, .pose-squat .rleg { animation: sq-thigh 1.6s ease-in-out infinite; }
.pose-squat .lshin, .pose-squat .rshin { animation: sq-shin 1.6s ease-in-out infinite; }
.pose-squat .larm, .pose-squat .rarm { animation: sq-arm 1.6s ease-in-out infinite; }

/* COMPETITION: push-ups (figure rotates to plank, head right) */
.pose-pushup svg { transform: rotate(90deg); }
@keyframes pu-body { 0%, 100% { transform: translateX(4px); } 50% { transform: translateX(16px); } }
@keyframes pu-arm { 0%, 100% { transform: rotate(-88deg); } 50% { transform: rotate(-45deg); } }
.pose-pushup .body-g { animation: pu-body 1.2s ease-in-out infinite; }
.pose-pushup .larm, .pose-pushup .rarm { animation: pu-arm 1.2s ease-in-out infinite; }
.pose-pushup .lleg, .pose-pushup .rleg { transform: rotate(4deg); }

/* SKILL WORK: overhead press */
@keyframes press-l { 0%, 100% { transform: rotate(30deg); } 50% { transform: rotate(160deg); } }
@keyframes press-r { 0%, 100% { transform: rotate(-30deg); } 50% { transform: rotate(-160deg); } }
.pose-press .larm { animation: press-l 1.1s ease-in-out infinite; }
.pose-press .rarm { animation: press-r 1.1s ease-in-out infinite; }

/* CARDIO: run with knee drive */
@keyframes run-lleg { 0%, 100% { transform: rotate(42deg); } 50% { transform: rotate(-30deg); } }
@keyframes run-rleg { 0%, 100% { transform: rotate(-30deg); } 50% { transform: rotate(42deg); } }
@keyframes run-lshin { 0%, 100% { transform: rotate(18deg); } 50% { transform: rotate(55deg); } }
@keyframes run-rshin { 0%, 100% { transform: rotate(55deg); } 50% { transform: rotate(18deg); } }
@keyframes run-larm { 0%, 100% { transform: rotate(-45deg); } 50% { transform: rotate(45deg); } }
@keyframes run-rarm { 0%, 100% { transform: rotate(45deg); } 50% { transform: rotate(-45deg); } }
@keyframes run-bob { 0%, 50%, 100% { transform: translateY(2px); } 25%, 75% { transform: translateY(-4px); } }
.pose-run .body-g { animation: run-bob .5s linear infinite; }
.pose-run .lleg { animation: run-lleg .5s linear infinite; }
.pose-run .rleg { animation: run-rleg .5s linear infinite; }
.pose-run .lshin { animation: run-lshin .5s linear infinite; }
.pose-run .rshin { animation: run-rshin .5s linear infinite; }
.pose-run .larm { animation: run-larm .5s linear infinite; }
.pose-run .rarm { animation: run-rarm .5s linear infinite; }

/* COOL-DOWN: stretch */
@keyframes stretch-body { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-16deg); } }
@keyframes stretch-arm { 0%, 100% { transform: rotate(170deg); } 50% { transform: rotate(205deg); } }
.pose-stretch .body-g { animation: stretch-body 3.2s ease-in-out infinite; }
.pose-stretch .larm { animation: stretch-arm 3.2s ease-in-out infinite; }
.pose-stretch .rarm { transform: rotate(-15deg); }
```

- [ ] **Step 2: Verify**

Reload `http://localhost:8080`: buddy card renders top-right doing jumping jacks (initial class is `pose-warmup`). It won't move or change pose yet — that's Task 5.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: training buddy figure and six pose animations"
```

---

### Task 5: JavaScript — scroll driver, pose switching, toggles

**Files:**
- Modify: `js/script.js` (full replacement)

**Interfaces:**
- Consumes: element ids, data attributes, and pose classes from Tasks 1 and 4; `.reps-detail[hidden]` contract from Task 3.
- Produces: none (leaf task).

- [ ] **Step 1: Replace the entire contents of `js/script.js` with:**

```javascript
(function () {
    'use strict';

    const buddy = document.getElementById('buddy');
    const tag = document.getElementById('buddyTag');
    const repCount = document.getElementById('repCount');
    const pbar = document.getElementById('pbar');
    const pct = document.getElementById('pct');
    const sections = Array.from(document.querySelectorAll('section[data-pose]'));
    const poses = ['pose-warmup', 'pose-squat', 'pose-pushup', 'pose-press', 'pose-run', 'pose-stretch'];

    const mqMobile = window.matchMedia('(max-width: 700px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let repTimer = null;
    let reps = 0;

    function setPose(section) {
        const pose = section.dataset.pose;
        if (buddy.classList.contains(pose)) return;

        poses.forEach(function (c) { buddy.classList.remove(c); });
        buddy.classList.add(pose);
        tag.textContent = section.dataset.tag;
        tag.style.background = section.dataset.accent;
        repCount.style.color = section.dataset.accent;
        pbar.style.background = section.dataset.accent;

        clearInterval(repTimer);
        reps = 0;
        repCount.textContent = '';
        if (section.dataset.reps && !mqReduced.matches) {
            const tempo = parseInt(section.dataset.tempo, 10) || 1600;
            repTimer = setInterval(function () {
                reps = reps % 8 + 1;
                repCount.textContent = reps;
            }, tempo);
        }
    }

    function update() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const p = max > 0 ? doc.scrollTop / max : 0;
        pbar.style.width = (p * 100).toFixed(0) + '%';
        pct.textContent = (p * 100).toFixed(0) + '%';

        if (!mqMobile.matches) {
            const trackH = window.innerHeight - 150;
            buddy.style.top = (10 + p * trackH) + 'px';
        }

        const mid = window.innerHeight * 0.45;
        let active = sections[0];
        for (const s of sections) {
            const r = s.getBoundingClientRect();
            if (r.top <= mid && r.bottom > mid) { active = s; break; }
        }
        setPose(active);
    }

    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Set rows: expand/collapse reps panels
    document.querySelectorAll('.set-row').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            const opening = panel.hasAttribute('hidden');
            if (opening) { panel.removeAttribute('hidden'); }
            else { panel.setAttribute('hidden', ''); }
            btn.setAttribute('aria-expanded', String(opening));
        });
    });

    // Mobile index menu
    const indexToggle = document.getElementById('indexToggle');
    const indexMenu = document.getElementById('indexMenu');
    indexToggle.addEventListener('click', function () {
        const opening = indexMenu.hasAttribute('hidden');
        if (opening) { indexMenu.removeAttribute('hidden'); }
        else { indexMenu.setAttribute('hidden', ''); }
        indexToggle.setAttribute('aria-expanded', String(opening));
    });
    indexMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            indexMenu.setAttribute('hidden', '');
            indexToggle.setAttribute('aria-expanded', 'false');
        });
    });
}());
```

- [ ] **Step 2: Syntax check**

Run: `node --check js/script.js && echo OK`
Expected: `OK`

- [ ] **Step 3: Browser check**

Reload `http://localhost:8080` and scroll end to end. Expected: buddy rides down the right edge; poses switch per block (jacks → squats with rep counter → push-ups with rep counter → press → run → stretch); tag/rep-counter/progress-bar recolor per block; clicking a set row expands its reps and re-clicking collapses it.

- [ ] **Step 4: Commit**

```bash
git add js/script.js
git commit -m "feat: scroll-driven buddy, rep counters, set and menu toggles"
```

---

### Task 6: CSS part 4 — responsive and reduced motion

**Files:**
- Modify: `css/style.css` (append to end)

**Interfaces:**
- Consumes: everything prior. The `.buddy` rule below uses `!important` deliberately: JS sets inline `top` on desktop and this override wins on mobile (JS also skips the write ≤700px).

- [ ] **Step 1: Append to `css/style.css`:**

```css
/* ============ Responsive ============ */
@media (max-width: 900px) {
    .set-row { grid-template-columns: 90px 1fr 80px; }
    .set-row .set-meta { display: none; }
    .reps-detail { padding-left: 24px; }
    .board-row { grid-template-columns: 1fr; gap: 6px; }
    .chip { justify-self: start; }
    .photo-grid { grid-template-columns: repeat(2, 1fr); }
    .accessory-row { grid-template-columns: 1fr 90px; }
    .accessory-row span:nth-child(2) { display: none; }
}

@media (max-width: 700px) {
    :root { --buddy-reserve: 24px; }
    section { padding: 64px 24px; }
    header.top { padding: 14px 24px; }
    .session-meta { display: none; }
    .index-toggle { display: block; }
    .hud { right: 24px; top: auto; bottom: 12px; }

    .buddy-track { top: auto; }
    .buddy {
        top: auto !important;
        bottom: 12px; right: 12px;
        width: 56px; padding: 4px 2px 2px;
        position: fixed;
    }
    .buddy svg { width: 38px; height: 56px; }
    .buddy .reps { font-size: 12px; height: 14px; }
}

/* ============ Reduced motion ============ */
@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .buddy svg *, .buddy svg g, .chip.review { animation: none !important; }
    .buddy { transition: none; }
}
```

- [ ] **Step 2: Verify**

In DevTools: at 390px width the buddy docks bottom-right small, header shows the INDEX button and the menu opens/closes, board rows stack, photo grid is 2×2. With reduced-motion emulation the buddy stands still and (per Task 5 JS) no rep counter runs.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: responsive layout and reduced-motion support"
```

---

### Task 7: Full verification pass

**Files:**
- Modify: none expected (fixes only if checks fail)

- [ ] **Step 1: Structural checks**

Run:
```bash
grep -c 'placeholder' index.html
node --check js/script.js && echo JS-OK
```
Expected: placeholder count ≥ 10 (all six spec §8 slots render visibly); `JS-OK`.

- [ ] **Step 2: Browser walkthrough (desktop)**

At `http://localhost:8080`, verify each item:
1. Hero: outlined "DISCIPLINE", tri-color underline on "WORKOUT", color-coded lede phrases.
2. Buddy switches through all six poses while riding the scrollbar; rep counters run only in Strength (1.6s) and Competition (1.2s).
3. All six set rows expand/collapse, including via keyboard (Tab + Enter, `aria-expanded` flips).
4. Record board: 2 filled chips, 2 pulsing chips, 1 dashed chip.
5. All external links resolve (GitHub ×4, LinkedIn, Strava, Google Photos, mailto).
6. Photos load — check the browser console for 404s (case-sensitive hosts need `IMG_1986.JPG`/`IMG_1878.JPG` uppercase extensions).

- [ ] **Step 3: Responsive + reduced-motion walkthrough**

Repeat the scroll-through at 1024 / 768 / 390 widths, then with reduced-motion emulation on.

- [ ] **Step 4: Lighthouse audit**

Run Lighthouse from Chrome DevTools (or `npx lighthouse http://localhost:8080 --quiet --only-categories=performance,accessibility`).
Expected: performance ≥ 95 and accessibility ≥ 95 (no fonts, no libraries — if performance dips, check image sizes; if accessibility dips, check contrast and button/aria wiring from Tasks 1 and 5).

- [ ] **Step 5: Fix anything that failed, then commit**

```bash
git add -A
git commit -m "fix: verification pass adjustments"
```
(Skip the commit if nothing changed.)
