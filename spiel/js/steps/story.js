/* OSI-Agenten – erzählende Schritte: story (Sprechblasen nacheinander), lesson (Lektion), sealed (versiegelte Bonus-Akte). */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, Kit = window.OSIKit;
  const B = G.bausteine, R = G.renderer;
  const { esc, $ } = Kit.util;

  R.story = (box, st, e, ctx) => {
    const sz = st.szenen;
    let shown = ctx.done ? sz.length : 1;
    const draw = neu => {
      // erst abschließen, dann zeichnen – sonst zeigt das Board die neuen Stempel (setzt) noch nicht
      if (shown >= sz.length) ctx.fertig();
      box.innerHTML = `<div class="card story">
        ${st.bild ? `<img class="scene-img" src="img/${st.bild}" alt="">` : ''}
        ${st.titel ? `<h2>${esc(st.titel)}</h2>` : ''}
        <div class="dialoge">${sz.slice(0, shown).map((s, i) => B.dialogHtml(s, neu == null ? i : 0, neu != null && i < neu)).join('')}</div>
        ${st.board && shown >= sz.length ? G.boardHtml() : ''}
        <div class="btnrow">${shown < sz.length ? `<button class="btn gross" id="dl-next">Weiter <span class="small">${shown} / ${sz.length}</span></button>` : '<button class="btn gross" id="st-weiter">Weiter</button>'}</div></div>`;
      B.bindEggs(box);
      const n = $('#dl-next', box);
      if (n) n.onclick = () => { shown++; A.play('klick'); draw(shown - 1); G.zeige($('.btnrow', box)); };
      const w = $('#st-weiter', box);
      if (w) w.onclick = ctx.weiter;
      B.tasten(box, { enter: '#dl-next, #st-weiter' });
    };
    A.play('funk');
    draw();
  };

  R.lesson = (box, st, e, ctx) => {
    box.innerHTML = `<div class="card lesson">
      ${st.tag ? `<div class="tag">${esc(st.tag)}</div>` : ''}
      <h2>${esc(st.titel)}</h2>
      ${st.html}
      ${st.kalle ? B.kalleBox(st.kalle) : ''}
      ${B.weiterButton(ctx.done ? 'Weiter' : 'Verstanden')}</div>`;
    B.bindEggs(box);
    $('#st-weiter', box).onclick = ctx.weiter;
  };

  R.sealed = (box, st, e) => {
    const frei = G.save.unlocked.alle || G.save.unlocked[st.id];
    box.innerHTML = `<div class="card ${frei ? '' : 'sealed'}">
      <div class="tag">★ BONUS · AUSSENEINSATZ</div>
      <h2>${esc(st.titel)}</h2>
      ${frei ? (st.inhalt || '<p>Die Unterlagen für diesen Außeneinsatz bekommt ihr von eurer Lehrkraft.</p>') : `<p>${st.teaser}</p>
      <div class="merk"><b>🔒 Versiegelt.</b> Diese Akte wird von der Zentrale freigegeben, sobald die Einsatzunterlagen bereitliegen. Ihr müsst sie nicht lösen, um weiterzukommen.</div>`}
      ${B.weiterButton()}</div>`;
    $('#st-weiter', box).onclick = () => G.naechsterStep(e, st);
  };
})();
