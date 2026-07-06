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
        // Tag background and rep counter carry paper-colored text, so they use the
        // darker AA-safe accent-text token. The HUD bar is decorative (aria-hidden)
        // and stays on the brighter data-accent for visual consistency with headlines.
        tag.style.background = section.dataset.accentText;
        repCount.style.color = section.dataset.accentText;
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
