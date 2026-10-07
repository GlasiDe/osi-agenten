/* OSI-Agenten – Sortierer (Begriffe in Kisten: Klick-Klick oder Drag & Drop) und Kapselungs-Puzzle. */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, OSI = window.OSI, Kit = window.OSIKit;
  const B = G.bausteine, R = G.renderer;
  const { esc, strip, $, $$, layerColor } = Kit.util;

  // ---------------------------------------------------------------- Sortierer
  R.sort = (box, st, e, ctx) => {
    let selected = null;
    // ziel kann eine Liste sein – dann steht der Begriff in der Kiste, in die er gelegt wurde
    const kisteVon = it => { const s = G.itemState(it.id); return String(s.bin != null ? s.bin : [].concat(it.ziel)[0]); };

    const draw = () => {
      const offen = st.items.filter(it => !G.itemState(it.id).ok);
      const fertig = st.items.length - offen.length;
      box.innerHTML = `<div class="card aufgabe sortierer">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">${fertig} / ${st.items.length}</span></div>
        <div class="fortschritt"><i style="width:${Math.round(fertig / st.items.length * 100)}%"></i></div>
        ${st.intro ? `<div class="intro">${st.intro}</div>` : ''}
        <div class="hinweiszeile">Begriff anklicken und dann die passende Kiste anklicken – oder per Drag & Drop hineinziehen.</div>
        <div class="pool" id="pool">${offen.map(it => `<button type="button" class="chip ${selected === it.id ? 'sel' : ''}" draggable="true" data-id="${it.id}">${esc(it.text)}</button>`).join('') || '<span class="pool-leer">🎉 Alles einsortiert!</span>'}</div>
        <div class="bins ${st.spalten ? 'cols' : ''}">${st.bins.map(b => {
          const drin = st.items.filter(it => G.itemState(it.id).ok && kisteVon(it) === String(b.id));
          return `<div class="bin ${st.spalten ? 'cols-bin' : ''}" data-bin="${b.id}" ${b.farbe ? `style="--k:${layerColor(b.farbe)}"` : ''} role="button" tabindex="0">
            <div class="blabel">${b.farbe ? `<span class="lchip" style="background:${layerColor(b.farbe)}">${esc(b.kurz || b.id)}</span> ` : ''}${esc(b.label)}${b.sub ? `<small>${esc(b.sub)}</small>` : ''}</div>
            <div class="bitems">${drin.map(it => `<span class="chip placed" title="${esc(strip(it.erklaerung || ''))}">${esc(it.text)}</span>`).join('')}</div></div>`;
        }).join('')}</div>
        <div id="sfb"></div>
        <div class="btnrow">${offen.length ? `<button class="hintbtn" id="s-hint" ${selected ? '' : 'disabled'}>💡 Tipp zum ausgewählten Begriff <span class="small">${G.uebung ? '(Übung – kein ⭐)' : '(kostet Punkte)'}</span></button>` : '<button class="btn gross" id="st-weiter">Weiter</button>'}</div>
      </div>`;
      if (!offen.length) { ctx.fertig(); $('#st-weiter', box).onclick = ctx.weiter; pruefeFehlerfrei(); B.tasten(box, { enter: '#st-weiter' }); }
      $$('.chip[data-id]', box).forEach(c => {
        c.onclick = () => { selected = selected === c.dataset.id ? null : c.dataset.id; A.play('klick'); draw(); };
        c.ondragstart = ev => { selected = c.dataset.id; ev.dataTransfer.setData('text/plain', c.dataset.id); };
      });
      $$('.bin', box).forEach(b => {
        b.onclick = () => { if (selected) drop(selected, b.dataset.bin); };
        b.onkeydown = ev => { if ((ev.key === 'Enter' || ev.key === ' ') && selected) { ev.preventDefault(); drop(selected, b.dataset.bin); } };
        b.ondragover = ev => { ev.preventDefault(); b.classList.add('over'); };
        b.ondragleave = () => b.classList.remove('over');
        b.ondrop = ev => { ev.preventDefault(); b.classList.remove('over'); const id = ev.dataTransfer.getData('text/plain') || selected; if (id) drop(id, b.dataset.bin); };
      });
      const hb = $('#s-hint', box);
      if (hb) hb.onclick = () => {
        const it = st.items.find(x => x.id === selected);
        if (!it) return;
        G.hinweisNutzen(it.id);
        $('#sfb', box).innerHTML = `<div class="hint"><img src="img/${OSI.figuren.kalle.bild}" alt=""><div><b class="kalle-name">Tipp zu „${esc(it.text)}“:</b> ${it.hinweis || 'Überlegt, mit welchen Adressen oder Signalen das zu tun hat.'}</div></div>`;
      };
    };

    const drop = (id, bin) => {
      const it = st.items.find(x => x.id === id);
      if (!it || G.itemState(id).ok) return;
      if ([].concat(it.ziel).map(String).includes(String(bin))) {
        const kiste = $(`.bin[data-bin="${bin}"]`, box);
        const p = G.richtig(id, st.punkte || 8, kiste);
        G.itemState(id).bin = String(bin); G.persist();
        selected = null;
        draw();
        Kit.fx.anstoss($(`.bin[data-bin="${bin}"]`, box), 'pop');
        B.feedback($('#sfb', box), true, it.erklaerung || '', p, `${B.lob()} „${esc(it.text)}“`);
      } else {
        G.falsch(id, bin);
        Kit.fx.anstoss($(`.chip[data-id="${id}"]`, box), 'shake');
        Kit.fx.anstoss($(`.bin[data-bin="${bin}"]`, box), 'shake');
        B.feedback($('#sfb', box), false, it.falschtipp || '', 0, `„${esc(it.text)}“ gehört nicht dorthin.`);
      }
    };
    const pruefeFehlerfrei = () => {
      if (!G.uebung && st.abzeichenFehlerfrei && st.items.every(it => G.itemState(it.id).f === 0 && G.itemState(it.id).h === 0)) G.abzeichen(st.abzeichenFehlerfrei);
    };
    draw();
  };

  // ---------------------------------------------------------------- Kapselungs-Puzzle
  R.kapsel = (box, st, e, ctx) => {
    let pi = st.phasen.findIndex(ph => !G.itemState(ph.id).ok);
    if (pi < 0) pi = st.phasen.length;
    let zustand = null, schritt = 0;

    const startPhase = () => {
      const ph = st.phasen[pi];
      zustand = { teile: ph.start.map(x => Object.assign({}, x)), bits: !!ph.startBits, fertig: false };
      schritt = 0;
    };
    const vis = () => zustand.bits
      ? `<div class="bits">${'0110100101001110 1010011101010010 0100101010111010 '.repeat(3)}…</div><div class="small muted">(Signale auf der Leitung)</div>`
      : `<div class="frame-vis">${zustand.teile.map(t => `<div class="${t.cls}">${esc(t.text)}</div>`).join('')}</div>`;

    const draw = () => {
      if (pi >= st.phasen.length) {
        box.innerHTML = `<div class="card aufgabe"><h2>${esc(st.titel)}</h2><div class="feedback ok"><div class="feedback-kopf"><span class="feedback-icon">✔</span><b>Beide Richtungen gemeistert!</b></div><div class="feedback-text">${st.abschluss || ''}</div></div>${B.weiterButton()}</div>`;
        ctx.fertig();
        $('#st-weiter', box).onclick = ctx.weiter;
        B.tasten(box, { enter: '#st-weiter' });
        return;
      }
      const ph = st.phasen[pi];
      if (!zustand) startPhase();
      box.innerHTML = `<div class="card aufgabe">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">Teil ${pi + 1} / ${st.phasen.length}</span></div>
        <div class="fortschritt"><i style="width:${Math.round(schritt / ph.korrekt.length * 100)}%"></i></div>
        <h3>${esc(ph.titel)}</h3><div>${ph.text}</div>
        <div class="kapsel-stage">${vis()}</div>
        <div class="hinweiszeile mitte">${zustand.fertig ? '' : `Schritt ${schritt + 1} von ${ph.korrekt.length}: Was passiert als Nächstes?`}</div>
        <div class="kapsel-opts">${zustand.fertig ? '' : ph.optionen.map(o => `<button class="opt" data-k="${o.key}" ${o.benutzt ? 'disabled' : ''}>${o.label}</button>`).join('')}</div>
        <div id="kfb"></div><div id="khint"></div></div>`;
      $$('.opt', box).forEach(b => b.onclick = () => klick(b.dataset.k, b));
      if (!zustand.fertig) B.hinweisBlock({ id: ph.id, hinweise: ph.hinweise }, $('#khint', box));
    };

    const klick = (k, el) => {
      const ph = st.phasen[pi];
      const o = ph.optionen.find(x => x.key === k);
      if (k !== ph.korrekt[schritt]) {
        G.falsch(ph.id, k);
        if (el) { el.classList.add('wrong'); Kit.fx.anstoss(el, 'shake'); setTimeout(() => el.classList.remove('wrong'), 600); }
        G.zeige(B.feedback($('#kfb', box), false, o.falsch || '', 0, 'Nicht in dieser Reihenfolge.'));
        return;
      }
      A.play('klick');
      if (o.wrap) { if (o.wrap.l) zustand.teile.unshift(o.wrap.l); if (o.wrap.r) zustand.teile.push(o.wrap.r); }
      if (o.unwrap) { zustand.teile.shift(); if (zustand.teile.length && zustand.teile[zustand.teile.length - 1].cls === 'fcs') zustand.teile.pop(); }
      if (o.bits === true) zustand.bits = true;
      if (o.bits === false) zustand.bits = false;
      if (o.ersetze) zustand.teile = o.ersetze.map(x => Object.assign({}, x));
      schritt++;
      if (schritt < ph.korrekt.length) {
        draw();
        B.feedback($('#kfb', box), true, '', 0, o.ok || 'Richtig.');
        return;
      }
      zustand.fertig = true;
      const p = G.richtig(ph.id, ph.punkte || 20, $('.kapsel-stage', box));
      draw();
      Kit.fx.anstoss($('.frame-vis, .bits', box), 'pop');
      const fb = B.feedback($('#kfb', box), true, ph.erklaerung, p, `${esc(ph.titel)} geschafft!`);
      B.knopf(fb, 'k-next', 'Weiter', () => { pi++; zustand = null; draw(); });
    };
    draw();
  };
})();
