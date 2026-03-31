/**
 * ui.js
 * Responsável por toda manipulação do DOM e feedback visual.
 * Não contém lógica do AFD – apenas renderização e animações.
 */

'use strict';

const UI = (() => {

  /* ── Referências DOM ──────────────────── */
  const creditDisplay = () => document.getElementById('creditDisplay');
  const stateDisplay  = () => document.getElementById('stateDisplay');
  const logBox        = () => document.getElementById('logBox');
  const transBody     = () => document.getElementById('transBody');
  const trayContent   = () => document.getElementById('trayContent');
  const overlay       = () => document.getElementById('overlay');
  const msgBox        = () => document.getElementById('msgBox');
  const msgEmoji      = () => document.getElementById('msgEmoji');
  const msgTitle      = () => document.getElementById('msgTitle');
  const msgDetail     = () => document.getElementById('msgDetail');
  const msgCloseBtn   = () => document.getElementById('msgCloseBtn');

  /* ── Stars background ─────────────────── */
  function initStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 100}%;
        --dur:    ${2 + Math.random() * 4}s;
        --delay:  ${Math.random() * 4}s;
        --bright: ${0.3 + Math.random() * 0.7};
      `;
      container.appendChild(star);
    }
  }

  /* ── Transition table ─────────────────── */
  function buildTransTable(maxCredit, prices) {
    const body = transBody();
    body.innerHTML = '';

    for (let v = 0; v <= maxCredit; v++) {
      const row = document.createElement('tr');
      row.id = `row_${v}`;

      const options = Object.entries(prices)
        .filter(([, p]) => v >= p)
        .map(([k]) => `q${k}`)
        .join(' | ');

      row.innerHTML = `
        <td>q${v}</td>
        <td>R$ ${v},00</td>
        <td>q${Math.min(v + 1, maxCredit)}</td>
        <td>q${Math.min(v + 2, maxCredit)}</td>
        <td>q${Math.min(v + 5, maxCredit)}</td>
        <td>${options || '–'}</td>
      `;
      body.appendChild(row);
    }
  }

  function updateTableHighlight(currentCredit) {
    document.querySelectorAll('.transition-table tr')
      .forEach(r => r.classList.remove('current-row'));
    const row = document.getElementById(`row_${currentCredit}`);
    if (row) {
      row.classList.add('current-row');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* ── Credit screen ────────────────────── */
  function updateCreditScreen(credit) {
    const cd = creditDisplay();
    cd.textContent = AFD.fmt(credit);
    cd.classList.remove('bump');
    void cd.offsetWidth;
    cd.classList.add('bump');

    stateDisplay().textContent =
      `ESTADO: ${AFD.stateLabel(credit)}  |  ${AFD.fmt(credit)}`;
  }

  /* ── Candy slots ──────────────────────── */
  function updateCandySlots(credit, onSelect) {
    const prices = AFD.getPrices();
    ['A', 'B', 'C'].forEach(c => {
      const icon   = document.getElementById(`candy${c}`);
      const status = document.getElementById(`status${c}`);
      if (credit >= prices[c]) {
        icon.className = 'candy-icon available';
        icon.onclick   = () => onSelect(c);
        status.className   = 'candy-status ok';
        status.textContent = 'OK!';
      } else {
        icon.className = 'candy-icon unavailable';
        icon.onclick   = null;
        status.className   = 'candy-status no';
        status.textContent = 'BLOQ';
      }
    });
  }

  /* ── Log ──────────────────────────────── */
  function addLog(msg, isNew = true) {
    const box = logBox();
    const entry = document.createElement('div');
    entry.className = `log-entry${isNew ? ' new' : ''}`;
    entry.textContent = '> ' + msg;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
  }

  function clearLog() {
    logBox().innerHTML = '';
  }

  /* ── Delivery tray ────────────────────── */
  function showTray(emoji, change) {
    const tray = trayContent();
    tray.innerHTML = '';

    const item = document.createElement('div');
    item.className   = 'tray-item';
    item.textContent = emoji;
    tray.appendChild(item);

    if (change > 0) {
      const coins = document.createElement('div');
      coins.className   = 'tray-item';
      coins.textContent = '🪙'.repeat(Math.min(change, 5));
      coins.style.fontSize = '24px';
      tray.appendChild(coins);
    }
  }

  function clearTray() {
    trayContent().innerHTML = '';
  }

  /* ── Flying coin animation ────────────── */
  function spawnFlyingCoin(value) {
    const emojis = { 1: '🪙', 2: '💰', 5: '💵' };
    const el = document.createElement('div');
    el.className   = 'flying-coin';
    el.textContent = emojis[value] || '💰';
    el.style.left  = (Math.random() * 200 + 80) + 'px';
    el.style.top   = (window.innerHeight * 0.5) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  /* ── Message overlay ──────────────────── */
  function showSuccessOverlay(type, change, creditUsed) {
    const info = AFD.getCandyInfo()[type];

    msgEmoji().innerHTML =
      `<span class="cat-container"><span class="cat-wave">😺</span></span>` +
      `<span style="font-size:76px;display:block;margin-top:-8px">${info.emoji}</span>`;

    msgTitle().textContent = `${info.name} LIBERADO!`;

    const trocoLine = change > 0
      ? `<br><span class="troco-highlight">🪙 TROCO: ${AFD.fmt(change)}</span>`
      : `<br><span style="color:var(--neon-green);font-size:22px;font-weight:bold">✅ VALOR EXATO – SEM TROCO</span>`;

    msgDetail().innerHTML =
      `Preço: <strong>${AFD.fmt(info.price)}</strong><br>` +
      `Crédito inserido: ${AFD.fmt(creditUsed)}` +
      trocoLine;

    msgBox().className        = 'message-box';
    msgCloseBtn().textContent = '▶ NOVA COMPRA';
    overlay().classList.add('show');
  }

  function showErrorOverlay(type, currentCredit, missing) {
    const info = AFD.getCandyInfo()[type];
    msgEmoji().innerHTML   = '🚫';
    msgTitle().textContent = 'CRÉDITO INSUFICIENTE';
    msgDetail().innerHTML  =
      `${info.name} custa ${AFD.fmt(info.price)}<br>` +
      `Crédito atual: ${AFD.fmt(currentCredit)}<br>` +
      `<span style="color:var(--neon-pink);font-size:26px;font-weight:bold">⚠️ Faltam: ${AFD.fmt(missing)}</span>`;

    msgBox().className        = 'message-box error';
    msgCloseBtn().textContent = '◀ VOLTAR';
    overlay().classList.add('show');
  }

  function hideOverlay() {
    overlay().classList.remove('show');
  }

  function isErrorOverlay() {
    return msgBox().classList.contains('error');
  }

  /* ── Public API ───────────────────────── */
  return {
    initStars,
    buildTransTable,
    updateTableHighlight,
    updateCreditScreen,
    updateCandySlots,
    addLog,
    clearLog,
    showTray,
    clearTray,
    spawnFlyingCoin,
    showSuccessOverlay,
    showErrorOverlay,
    hideOverlay,
    isErrorOverlay,
  };

})();
