# Portfolio Redesign: "The Workout" — Design Spec

**Date:** 2026-07-05
**Status:** Approved concept (validated interactively via mockups v1–v5 in `.superpowers/brainstorm/`)
**Reference mockup:** `.superpowers/brainstorm/16955-1783263206/content/workout-concept-v5.html`

## 1. Concept

The portfolio is presented as **one workout session** ("training log"). Every part of
Utkarsh's life maps to a training block: AI projects are strength sets, research papers
are competition results, photography is skill work, running is cardio. A stick-figure
**training buddy** rides alongside the scrollbar and performs the exercise of whichever
block is on screen. Scrolling the page = completing the session.

Visual language inspired by kriss.ai (Awwwards): warm greige paper, near-black ink,
flat color, heavy uppercase grotesque type, hairline rules. No gradients (except the
flat-segment tri-color underline), no glassmorphism, no glow.

## 2. Constraints

- **Stack:** vanilla HTML + CSS + JS, single page, no build step, no libraries.
  (Replaces current `index.html`, `css/style.css`, `js/script.js` in place.)
- **Assets:** reuse existing photos in `assets/images/photographs/` and project
  screenshots where useful. No new binary assets required.
- **Typography:** Helvetica Neue / Helvetica / Arial system stack (matches approved
  mockups; zero font-loading cost). Headline weight 900, uppercase, tight tracking
  (−0.04em), line-height 0.92. Type scale for h1: `clamp(48px, 9vw, 130px)`.
- **Performance:** CSS keyframe animations only; a single passive scroll listener
  drives the buddy, progress bar, and active-block detection.

## 3. Color system

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#D1CACC` | page background |
| `--ink` | `#0F0F0F` | text, rules, labels, default accent |
| `--paper-dim` / `--paper-dimmer` | `#c2babd` / `#b3aaae` | expanded rep panels, photo placeholders, progress track |
| `--ember` | `#C73E1D` | Block 02 Strength (AI projects) |
| `--gold` | `#B07D2B` | Block 03 Competition (research) |
| `--plum` | `#7A4A9E` | Block 04 Skill work (photography) |
| `--green` | `#33582F` | Block 05 Cardio (running); lightened to `--green-light` `#8FBF85` on the inverted section |

Rules: warm-up and cool-down blocks stay ink-only. Each colored block exposes its
accent as a section-scoped `--accent` custom property; all accent styling (headline
words, rep numbers, hover floods, chips) reads `var(--accent)`. The hero title carries
a three-segment underline (ember/plum/green) under "WORKOUT" and color-codes the three
crafts in the intro sentence; the cool-down headline ends with three colored dots.

## 4. Page structure (six blocks)

Sticky top bar: `UB. TRAINING LOG` left; `Session <YYYY-MM> · 6 blocks · scroll to begin`
right. 2px ink bottom border. Blocks separated by 2px ink rules; each block min-height
~90vh with generous padding (right padding reserves ~108px for the buddy track).

### Block 01 — Warm-up (hero)
- Label chip: `BLOCK 01 — WARM-UP · 2 MIN EASY`.
- H1: `EVERY / DISCIPLINE / IS A WORKOUT.` — "DISCIPLINE" outlined
  (`-webkit-text-stroke`), "WORKOUT" tri-color underline, ember period.
- Lede paragraph with color-coded phrases (*trains models* ember, *frames photographs*
  plum, *runs half marathons* green).
- Buddy exercise: **jumping jacks**.

### Block 02 — Strength · AI Engineering — 6 sets (ember)
- H1: `HEAVY / COMPOUND / WORK.` ("COMPOUND" in ember).
- Six **set rows** (grid: SET number / name / meta / rep count), 1px ink dividers,
  hover floods the row with ember + paper text + slight indent:
  1. GreenPES — Open source · Sustainable LLMs
  2. DataScore — Open source · Data quality for fine-tuning
  3. Pythia — Presented @ AI Tinkerers Toronto — `[placeholder description]`
  4. InputGuard — Heading to INFORMS 2026 — `[placeholder description]`
  5. DataMind — Amazon · GenAI RAG · 600+ hrs saved/yr
  6. Finny — Amazon · LLM agents · −70% analysis time · ICLR Workshop '26
- Clicking a set expands its **reps panel** (dimmed paper background): REP 1..n =
  problem → idea → build → result → link. GreenPES/DataScore/DataMind/Finny reps
  seeded from current site copy; Pythia/InputGuard reps are placeholders.
- **Accessory sets** (small-print rows after SET 06, no expand): AI Daily Post
  Generator, Fitness Tracker — name + GitHub link only.
- Buddy exercise: **squats** (side view: hips drop, knees bend, arms out front,
  1.6s tempo with pause at bottom) + on-card **rep counter** cycling 1–8.

### Block 03 — Competition · Research Season 2026 (gold)
- H1: `THE RECORD / BOARD.` ("BOARD" in gold).
- **Record board** rows (grid: event / entry / status chip):
  | Event | Entry | Chip |
  |---|---|---|
  | ICLR Workshop '26 | Finny — `[placeholder]` | `PUBLISHED ✓` (filled gold) |
  | AI Tinkerers Toronto | Pythia — `[placeholder]` | `PRESENTED ✓` (filled gold) |
  | ACML 2026 | Prompt Sensitivity Evaluation Methods — `[placeholder title]` | `UNDER REVIEW` (gold outline, 2s opacity pulse) |
  | ICTAI 2026 | LLM Leaderboard & Benchmark Analysis — `[placeholder]` | `UNDER REVIEW` (pulsing) |
  | INFORMS 2026 | InputGuard — `[placeholder]` | `UPCOMING TALK` (dashed border, ink) |
- Rows link out to paper/talk URLs when provided (placeholder `#` until then).
- Buddy exercise: **push-ups** (figure rotates to plank, head right, elbow-bend reps)
  + rep counter.

### Block 04 — Skill work · Photography (plum)
- H1: `TECHNIQUE, / NOT JUST / STRENGTH.` (plum accents).
- 4-photo grid (3:4 tiles, 1px ink border, plum inset outline on hover) using real
  images from `assets/images/photographs/`; link out to the existing Google Photos
  gallery.
- Buddy exercise: **overhead press**.

### Block 05 — Cardio · Half marathons (green, inverted)
- Only inverted block: ink background, paper text; accents use `--green-light`.
- H1: `THE LONG / RUN.`
- Stats row: 5 cities · 21.1 km/race · 105.5 race km total; city list line
  (New Delhi · Toronto · San Diego · New York · Seattle); Strava link.
- Buddy exercise: **running** (knee-drive gait, fast 0.5s cycle, body bob).

### Block 06 — Cool-down (contact)
- H1: `SESSION / COMPLETE...` — three dots in ember/plum/green.
- Bordered button links: Email, LinkedIn, GitHub, Strava (invert on hover).
- Footer line with © year.
- Buddy exercise: **stretch** (slow side bend).

## 5. The training buddy

- Fixed 78px card on the right edge: paper background, 2px ink border; contains the
  SVG figure, a rep-counter line above it, and a label tag below
  (e.g. `SQUATS · AI WORK`).
- SVG skeleton: head (filled circle), torso line, two one-segment arms
  (origin at shoulder), two two-segment legs (thigh group origin at hip, nested shin
  group origin at knee). All animation is CSS keyframes on joint rotations; poses are
  exclusive classes (`pose-warmup`, `pose-squat`, `pose-pushup`, `pose-press`,
  `pose-run`, `pose-stretch`).
- **Scroll behavior:** buddy's vertical position = scroll progress mapped onto the
  viewport height (rides beside the scrollbar). Active block = section covering the
  45%-viewport line; on change, swap pose class, retag, and recolor tag background,
  rep counter, and HUD progress bar to the block's accent.
- **Rep counter:** runs only in blocks flagged `data-reps` (Strength, Competition);
  interval matched to the exercise tempo.
- **HUD:** top-right `SESSION PROGRESS n%` with a 4px bar in the active accent.

## 6. Responsive behavior

- ≤900px: set rows and board rows collapse to stacked two-line layout; photo grid
  goes 2×2; stats wrap; h1 scale already fluid via clamp.
- ≤700px: buddy shrinks (~56px card) and docks bottom-right instead of riding the
  scrollbar; right padding reserve removed.
- Mobile nav: sticky header collapses to logo + an "INDEX" toggle that opens an
  anchor list of the six blocks (plain class toggle, no framework). On desktop the
  header shows the session text instead and no menu is needed (single-page scroll).

## 7. Accessibility & motion

- `prefers-reduced-motion: reduce`: all buddy keyframe animations disabled (static
  standing pose), rep timers not started, chip pulse off; scroll-position updates
  remain (no animation, direct positioning).
- Set rows are `<button>`-semantics (keyboard-expandable, `aria-expanded` on the row,
  `hidden` attribute on the collapsed reps panel so state is consistent for screen
  readers and keyboard users).
- Color contrast: the raw accent hues (ember 3.15:1, plum 3.95:1, gold 2.24:1) only
  clear WCAG AA at headline scale (large/bold text, ≥3:1) — they do **not** pass 4.5:1
  and must not be used for small text. Green (5.06:1) is the exception and passes at
  any size. For every ≤15px use — `.set-reps`, `.rep-item .n`, `.lede b`/`.f-ember`/
  `.f-plum`, chip borders/text/fills, and the hover-flood backgrounds on `.set-row` /
  `.accessory-row` — darker `--ember-text` / `--gold-text` / `--plum-text` tokens are
  used instead, each verified ≥ 4.5:1 against `--paper` (and `--paper-dim`, where
  `.rep-item .n` sits). Green sections reuse `--green` as their `--accent-text` since
  it already clears 4.5:1. Body text stays ink.
- Buddy is decorative: `aria-hidden="true"`.

## 8. Content placeholders (to be filled by Utkarsh later)

1. Pythia — one-line description, reps story, GitHub link.
2. InputGuard — one-line description, reps story.
3. Prompt Sensitivity paper — exact title, author position, link.
4. LLM Leaderboard & Benchmark Analysis — one-liner, link.
5. Finny @ ICLR Workshop '26 — paper link.
6. Race PRs/times for the cardio block (optional upgrade: per-city results table).

Placeholders render as visible `[placeholder]` text so they're impossible to forget.

## 9. Files & migration

- `index.html` — full rewrite (six blocks, buddy markup, HUD).
- `css/style.css` — full rewrite (new design system; old variables/gradients removed).
- `js/script.js` — full rewrite (~60 lines: scroll handler, pose switcher, rep timer,
  set-row toggle, mobile index toggle). Custom cursor from the old site is dropped.
- Keep: meta description/title (update wording), favicon-less setup, asset folders,
  README, existing external links (GitHub, LinkedIn, Strava, Google Photos).
- Old sections with no new home: none — everything maps to a block (Other Notable
  Projects → accessory sets).

## 10. Testing

- Manual scroll-through in Chrome + one WebKit browser: pose switches at each block,
  rep counters start/stop, hovers, set expansion, record-board chips.
- Responsive check at 1440 / 1024 / 768 / 390 widths.
- Reduced-motion check via OS setting or DevTools emulation.
- Lighthouse pass: performance ≥ 95 (no fonts, no libs), accessibility ≥ 95.
