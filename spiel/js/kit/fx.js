/* OSI-Agenten – Animationen im Duolingo-Stil. Alles respektiert „Bewegung reduzieren“ (prefers-reduced-motion). */
(function () {
  'use strict';
  const Kit = window.OSIKit = window.OSIKit || {};
  const { reducedMotion, esc } = Kit.util;

  // Klasse neu auslösen (Animation erneut abspielen)
  function anstoss(el, klasse) {
    if (!el) return;
    el.classList.remove(klasse); void el.offsetWidth; el.classList.add(klasse);
    el.addEventListener('animationend', () => el.classList.remove(klasse), { once: true });
  }

  function konfetti(menge = 90) {
    if (reducedMotion()) return;
    const w = document.createElement('div');
    w.className = 'konfetti';
    const farben = ['var(--green)', 'var(--blue)', 'var(--gold)', 'var(--red)', 'var(--purple)', 'var(--brand)'];
    w.innerHTML = Array.from({ length: menge }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${farben[i % farben.length]};animation-delay:${(Math.random() * 1.2).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 1.8).toFixed(2)}s;--dreh:${Math.round(Math.random() * 720 - 360)}deg;--drift:${Math.round(Math.random() * 120 - 60)}px"></i>`).join('');
    document.body.appendChild(w);
    setTimeout(() => w.remove(), 5000);
  }

  // Zahl hochzählen (z. B. Punkte am Kapitel-Ende)
  function zaehlen(el, ziel, dauer = 900) {
    if (!el) return;
    if (reducedMotion() || !ziel) { el.textContent = ziel; return; }
    const t0 = performance.now();
    const f = now => {
      const t = Math.min(1, (now - t0) / dauer);
      el.textContent = Math.round(ziel * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  // „+10 XP“ fliegt von einem Element zur XP-Anzeige in der Kopfleiste
  function xpFlug(vonEl, text, zielSel = '#tb-xp') {
    const ziel = document.querySelector(zielSel);
    if (!vonEl || !ziel) return;
    const a = vonEl.getBoundingClientRect(), b = ziel.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'xp-flug';
    d.textContent = text;
    d.style.left = (a.left + a.width / 2) + 'px';
    d.style.top = (a.top + a.height / 2) + 'px';
    document.body.appendChild(d);
    if (reducedMotion()) { setTimeout(() => d.remove(), 600); anstoss(ziel, 'puls'); return; }
    d.animate([
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%,-140%) scale(1.15)', opacity: 1, offset: .3 },
      { transform: `translate(calc(-50% + ${b.left + b.width / 2 - a.left - a.width / 2}px), calc(-50% + ${b.top + b.height / 2 - a.top - a.height / 2}px)) scale(.5)`, opacity: .2 }
    ], { duration: 950, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { d.remove(); anstoss(ziel, 'puls'); };
  }

  // Vollbild-Belohnung (Beförderung, Kapitel geschafft …) mit Strahlenkranz; schließt per Klick oder nach Zeit
  function belohnung({ icon, titel, text, figur, dauer = 4200 }) {
    const o = document.createElement('div');
    o.className = 'belohnung';
    o.setAttribute('role', 'status');
    o.innerHTML = `<div class="belohnung-box"><div class="belohnung-strahlen" aria-hidden="true"></div>
      <div class="belohnung-icon">${figur || esc(icon || '🎉')}</div><div class="belohnung-titel">${esc(titel)}</div>${text ? `<div class="belohnung-text">${text}</div>` : ''}
      <div class="belohnung-tipp">Tippen zum Weitermachen</div></div>`;
    const zu = () => { o.classList.add('weg'); setTimeout(() => o.remove(), 250); };
    o.addEventListener('click', zu);
    document.body.appendChild(o);
    setTimeout(zu, dauer);
    return o;
  }

  Kit.fx = { anstoss, konfetti, zaehlen, xpFlug, belohnung };
})();
