/* OSI-Agenten – Wireshark-Ansicht: Paketliste, Detailbaum und ein eigener Parser für Anzeigefilter. */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, Kit = window.OSIKit;
  const { esc } = Kit.util;

  // ---------------------------------------------------------------- Wireshark-Ansicht mit Anzeigefiltern
  const wsState = {};
  const WS_ALIAS = { 'eth.addr': ['eth.src', 'eth.dst'], 'ip.addr': ['ip.src', 'ip.dst'], 'udp.port': ['udp.srcport', 'udp.dstport'], 'tcp.port': ['tcp.srcport', 'tcp.dstport'] };
  const WS_PROTOS = ['frame', 'eth', 'arp', 'ip', 'icmp', 'udp', 'tcp', 'dns', 'dhcp', 'bootp', 'http', 'tls', 'ssh'];
  const WS_FELDER = ['eth.src', 'eth.dst', 'eth.addr', 'eth.type', 'ip.src', 'ip.dst', 'ip.addr', 'ip.ttl', 'udp.srcport', 'udp.dstport', 'udp.port', 'tcp.srcport', 'tcp.dstport', 'tcp.port',
    'arp.opcode', 'arp.src.hw_mac', 'arp.src.proto_ipv4', 'arp.dst.hw_mac', 'arp.dst.proto_ipv4', 'dhcp.option.dhcp', 'dhcp.hw.mac_addr', 'dhcp.option.dhcp_server_id', 'dhcp.option.router', 'dhcp.option.domain_name_server', 'dhcp.ip.your',
    'dns.qry.name', 'frame.number', 'icmp.type', 'icmp.code', 'tcp.flags.syn', 'tcp.flags.ack', 'tcp.flags.reset', 'tcp.flags.push', 'tcp.flags.fin',
    'http.request.method', 'http.request.uri', 'http.host', 'http.response.code', 'http.cookie', 'http.set_cookie'];
  const WS_MAC = ['eth.src', 'eth.dst', 'eth.addr', 'arp.src.hw_mac', 'arp.dst.hw_mac', 'dhcp.hw.mac_addr'];
  const WS_IP = ['ip.src', 'ip.dst', 'ip.addr', 'arp.src.proto_ipv4', 'arp.dst.proto_ipv4', 'dhcp.option.dhcp_server_id', 'dhcp.option.router', 'dhcp.option.domain_name_server', 'dhcp.ip.your'];
  // Wie Wireshark: Der Wert muss zum Feldtyp passen, sonst ist der Filter ungültig (rot)
  function wsWertPruefen(f, roh) {
    const v = String(roh).replace(/^"|"$/g, '');
    if (WS_MAC.includes(f) && !/^([0-9a-f]{2}[-:]){5}[0-9a-f]{2}$/i.test(v)) {
      if (/^[a-z]+_([0-9a-f]{2}:){2}[0-9a-f]{2}$/i.test(v)) throw new Error(`„${v}“ ist nur der Anzeigename, den Wireshark aus der Herstellerkennung (OUI) bildet. Im Filter braucht ihr die echte MAC-Adresse, z. B. dc:a6:32:5e:19:7a`);
      throw new Error(`„${v}“ ist keine gültige MAC-Adresse für ${f}`);
    }
    if (WS_IP.includes(f) && !(/^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(x => +x <= 255))) throw new Error(`„${v}“ ist keine gültige IPv4-Adresse für ${f}`);
  }
  const wsWert = v => { v = String(v).toLowerCase().replace(/^"|"$/g, ''); return /^([0-9a-f]{2}[-:]){5}[0-9a-f]{2}$/.test(v) ? v.replace(/-/g, ':') : v; };

  // Zerlegt einen Anzeigefilter und liefert eine Prüffunktion (Frame → true/false). Wirft bei Syntaxfehlern.
  function wsFilter(text) {
    const src = String(text || '').trim();
    if (!src) return () => true;
    const tok = [];
    const re = /\s*(==|!=|&&|\|\||!|\(|\)|"[^"]*"|[A-Za-z0-9_.:\-\/]+)/y;
    let pos = 0;
    while (pos < src.length) {
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) { if (/^\s+$/.test(src.slice(pos))) break; throw new Error('Unerwartetes Zeichen: ' + src.slice(pos, pos + 1)); }
      tok.push(m[1]); pos = re.lastIndex;
    }
    let i = 0;
    const peek = () => (tok[i] || '').toLowerCase();
    const orE = () => { let l = andE(); while (peek() === '||' || peek() === 'or') { i++; const a = l, b = andE(); l = p => a(p) || b(p); } return l; };
    const andE = () => { let l = notE(); while (peek() === '&&' || peek() === 'and') { i++; const a = l, b = notE(); l = p => a(p) && b(p); } return l; };
    const notE = () => { if (peek() === '!' || peek() === 'not') { i++; const a = notE(); return p => !a(p); } return prim(); };
    const prim = () => {
      if (peek() === '(') { i++; const e = orE(); if (peek() !== ')') throw new Error('Klammer fehlt'); i++; return e; }
      let f = peek(); i++;
      if (f === 'bootp') f = 'dhcp';
      if (!f || !(WS_PROTOS.includes(f) || WS_FELDER.includes(f))) throw new Error('Unbekanntes Feld oder Protokoll: ' + (f || '(leer)'));
      const werte = p => (WS_ALIAS[f] || [f]).flatMap(k => p.felder[k] == null ? [] : [].concat(p.felder[k])).map(wsWert);
      const op = peek();
      if (['==', 'eq', '!=', 'ne'].includes(op)) {
        // Wie Wireshark: Ein Protokoll (ip, tcp, arp …) ist kein Feld und lässt sich nicht mit einem Wert vergleichen
        if (WS_PROTOS.includes(f)) throw new Error(`„${f}“ ist ein Protokoll, kein Feld – vergleichen könnt ihr nur Felder, z. B. ${f === 'ip' ? 'ip.addr' : f === 'eth' ? 'eth.addr' : f === 'tcp' ? 'tcp.port' : f === 'udp' ? 'udp.port' : f + '.…'} == …`);
        i++;
        if (tok[i] == null || ['&&', '||', ')', 'and', 'or'].includes(peek())) throw new Error('Wert fehlt');
        wsWertPruefen(f, tok[i]);
        const v = wsWert(tok[i++]);
        return op === '==' || op === 'eq' ? p => werte(p).includes(v) : p => { const w = werte(p); return w.length > 0 && !w.includes(v); };
      }
      return p => WS_PROTOS.includes(f) ? p.protos.includes(f) : werte(p).length > 0;
    };
    const fn = orE();
    if (i < tok.length) throw new Error('Unerwartet: ' + tok[i]);
    return fn;
  }
  G.wsFilter = wsFilter;
  const wsTreffer = (pakete, filter) => { const f = wsFilter(filter); return pakete.filter(f).map(p => p.nr); };
  G.wsTreffer = wsTreffer;

  function wiresharkMount(el, cfg, key) {
    const W = wsState[key] || (wsState[key] = { filter: cfg.filter || '', sel: null, offen: {}, fehler: false });
    const draw = () => {
      let sicht = cfg.pakete, fehler = false;
      try { const f = wsFilter(W.filter); sicht = cfg.pakete.filter(f); } catch (e) { fehler = e.message || true; }
      W.fehler = fehler;
      const p = cfg.pakete.find(x => x.nr === W.sel);
      el.innerHTML = `<div class="ws ws-live">
        <div class="ws-bar"><span>Mitschnitt: ${esc(cfg.datei)}</span>${cfg.info ? `<span>${esc(cfg.info)}</span>` : ''}</div>
        <div class="ws-filter ${W.filter.trim() ? (fehler ? 'bad' : 'ok') : ''}"><span class="small">Anzeigefilter:</span>
          <input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" value="${esc(W.filter)}" placeholder="z. B. arp" aria-label="Anzeigefilter">
          <button type="button" class="ws-apply">▶ Anwenden</button><button type="button" class="ws-clear" title="Filter löschen">✕</button></div>
        <div class="ws-list ws-scroll">
          <div class="ws-row head"><span>Nr.</span><span>Zeit</span><span>Quelle</span><span>Ziel</span><span>Prot.</span><span>Länge</span><span>Info</span></div>
          ${fehler ? '' : sicht.map(x => `<div class="ws-row clickable p-${esc(x.prot.toLowerCase())} ${x.nr === W.sel ? 'sel' : ''}" data-nr="${x.nr}"><span>${x.nr}</span><span>${esc(x.zeit)}</span><span>${esc(x.quelle)}</span><span>${esc(x.ziel)}</span><span>${esc(x.prot)}</span><span>${x.laenge}</span><span>${esc(x.info)}</span></div>`).join('')}
        </div>
        <div class="ws-status">${fehler ? `⚠ Ungültiger Filter – Wireshark färbt die Filterzeile rot.${typeof fehler === 'string' ? ' ' + esc(fehler) : ''}` : `Angezeigt: ${sicht.length} von ${cfg.pakete.length} Frames`}${p ? ` · markiert: Frame ${p.nr}` : ''}</div>
        <div class="ws-tree">${p ? p.baum.map((n, i) => `<div class="ws-node"><div class="ws-lbl" data-i="${i}"><span class="tri">${W.offen[i] ? '▾' : '▸'}</span>${esc(n.t)}</div>
          <div class="ws-kids ${W.offen[i] ? '' : 'hidden'}">${n.kids.map(k => `<div>${esc(k)}</div>`).join('')}</div></div>`).join('') : '<div class="small muted" style="padding:4px 10px">Klickt einen Frame in der Liste an, um ihn im Detail zu sehen.</div>'}</div></div>`;
      const inp = el.querySelector('.ws-filter input');
      const anwenden = () => { W.filter = inp.value; A.play('klick'); draw(); const n = el.querySelector('.ws-filter input'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      el.querySelector('.ws-apply').onclick = anwenden;
      inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); anwenden(); } };
      el.querySelector('.ws-clear').onclick = () => { W.filter = ''; draw(); };
      el.querySelectorAll('.ws-row[data-nr]').forEach(r => r.onclick = () => { W.sel = +r.dataset.nr; draw(); });
      el.querySelectorAll('.ws-lbl').forEach(l => l.onclick = () => { W.offen[l.dataset.i] = !W.offen[l.dataset.i]; draw(); });
      const sel = el.querySelector('.ws-row.sel');
      if (sel) { const box = el.querySelector('.ws-scroll'); if (sel.offsetTop < box.scrollTop || sel.offsetTop > box.scrollTop + box.clientHeight - 20) box.scrollTop = sel.offsetTop - 40; }
    };
    draw();
  }
  G.wiresharkMount = wiresharkMount;
  G.wsState = wsState;
})();
