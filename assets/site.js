'use strict';
/* Alaska Launcher website: pixel terrain, latest-release lookup, copy checksum. No tracking. */
(() => {
  const REPO = 'ahmad64654/AlaskaLauncher';

  // ---------------------------------------------------------- pixel terrain (matches the launcher's banner)
  function seeded(seed) {
    let a = seed | 0;
    return () => { a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  }
  function terrain(seed) {
    const rnd = seeded(seed);
    const W = 1200; const H = 420; const step = 24; const id = `s${seed}`;
    let o = `<svg class="terrain" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice"><defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset=".6" stop-color="var(--sky2)"/><stop offset="1" stop-color="var(--sky3)"/></linearGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ee0c2" stop-opacity="0"/><stop offset=".7" stop-color="#3ee0c2" stop-opacity=".5"/><stop offset="1" stop-color="#8fbf6a" stop-opacity="0"/></linearGradient>
      </defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
    for (let i = 0; i < 40; i++) {
      const sz = rnd() < 0.2 ? 4 : 2;
      o += `<rect class="star" x="${Math.round(rnd() * W)}" y="${Math.round(rnd() * 190)}" width="${sz}" height="${sz}" style="animation-delay:${(rnd() * 4).toFixed(1)}s"/>`;
    }
    o += '<g class="ribbons"><g class="ribbon">';
    for (let x = -80; x < W + 80; x += 8) {
      const y = Math.round((20 + Math.sin(x / 170) * 26 + Math.sin(x / 61) * 7) / 4) * 4;
      o += `<rect x="${x}" y="${y}" width="5" height="120" fill="url(#${id}r)" fill-opacity="${(0.25 + 0.75 * Math.abs(Math.sin(x / 230))).toFixed(2)}"/>`;
    }
    o += '</g></g>';
    o += `<rect x="884" y="84" width="88" height="88" fill="var(--sun)" opacity=".9"/><rect x="864" y="64" width="128" height="128" fill="var(--sun)" opacity=".15"/>`;
    const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="12" width="92" height="14"/><rect x="14" y="0" width="46" height="14"/><rect x="60" y="6" width="24" height="8"/></g>`;
    o += `<g class="cloud">${cloud(140, 70, 1)}${cloud(600, 40, 0.7)}${cloud(1000, 120, 0.8)}</g>`;
    [['l1', 255, 50], ['l2', 310, 40], ['l3', 360, 26]].forEach(([cls, base, amp], n) => {
      let h = base;
      o += `<g class="layer ${cls}" fill="var(--t${n + 1})">`;
      for (let x = -48; x < W + 48; x += step) {
        h += Math.round((rnd() - 0.5) * 3) * 12;
        h = Math.max(base - amp, Math.min(base + amp, h));
        o += `<rect x="${x}" y="${h}" width="${step + 1}" height="${H - h + 10}"/>`;
        if (n === 0 && h <= base - amp + 12) o += `<rect class="snow" x="${x}" y="${h}" width="${step + 1}" height="8"/>`;
      }
      o += '</g>';
    });
    return `${o}</svg>`;
  }
  const hero = document.getElementById('hero-sky');
  const fin = document.getElementById('final-sky');
  if (hero) hero.innerHTML = terrain(11);
  if (fin) fin.innerHTML = terrain(23);

  // ---------------------------------------------------------- latest release → download links, version, size, checksum
  const fmtMB = (b) => `${Math.round(b / 1e6)} MB`; // decimal MB, as Windows Explorer and GitHub show it
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const asset = (rel.assets || []).find((a) => /\.exe$/i.test(a.name));
      if (!asset) return;
      document.querySelectorAll('[data-download]').forEach((a) => { a.href = asset.browser_download_url; });
      const version = String(rel.tag_name || '').replace(/^v/, '');
      document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = version; });
      document.querySelectorAll('[data-size]').forEach((el) => { el.textContent = fmtMB(asset.size); });
      document.querySelectorAll('[data-file]').forEach((el) => { el.textContent = asset.name; });
      const digest = asset.digest && /^sha256:([0-9a-f]{64})$/i.exec(asset.digest);
      if (digest) document.getElementById('sha').textContent = digest[1].toUpperCase();
    })
    .catch(() => { /* offline or rate-limited: the static links still point to the latest release page */ });

  // ---------------------------------------------------------- copy checksum
  const btn = document.getElementById('copy-sha');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(document.getElementById('sha').textContent.trim());
        btn.textContent = 'Copied';
      } catch { btn.textContent = 'Select & copy'; }
      setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
    });
  }
})();
