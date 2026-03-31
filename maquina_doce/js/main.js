/**
 * main.js
 * Controlador principal – conecta a lógica do AFD (afd.js) com a UI (ui.js).
 * Todas as funções chamadas pelo HTML (onclick) ficam aqui.
 */

'use strict';

/* ── Inicialização ──────────────────────── */
(function init() {
  UI.initStars();
  UI.buildTransTable(AFD.getMaxCredit(), AFD.getPrices());

  refreshAll();

  UI.addLog('M = (Q, Σ, δ, q0, F)', false);
  UI.addLog('Σ  = { R$1, R$2, R$5, A, B, C }', false);
  UI.addLog('Q  = { q0 .. q13, qA, qB, qC }',  false);
  UI.addLog('F  = { qA, qB, qC }',              false);
  UI.addLog('q0 ativado. Aguardando entrada...', false);
})();

/* ── Helpers internos ────────────────────── */
function refreshAll() {
  const credit = AFD.getCredit();

  UI.updateCreditScreen(credit);
  UI.updateCandySlots(credit, selectCandy);
  UI.updateTableHighlight(credit);
}

/* ── Ações chamadas pelo HTML ──────────── */

/**
 * Chamado pelos botões de moeda/nota no HTML.
 * @param {number} value - 1, 2 ou 5
 */
function insertCoin(value) {
  const transition = AFD.insertCoin(value);

  UI.spawnFlyingCoin(value);
  UI.addLog(
    `δ(${AFD.stateLabel(transition.from)}, +R$${value},00) → ` +
    `${AFD.stateLabel(transition.to)}  |  Crédito: ${AFD.fmt(transition.to)}`
  );

  refreshAll();
}

/**
 * Chamado ao clicar num doce desbloqueado.
 * @param {'A'|'B'|'C'} type
 */
function selectCandy(type) {
  const result = AFD.selectCandy(type);

  if (!result.success) {
    UI.addLog(
      `ERRO: Crédito insuficiente para ${result.candy.name}. ` +
      `Faltam ${AFD.fmt(result.missing)}.`
    );
    UI.showErrorOverlay(type, AFD.getCredit(), result.missing);
    return;
  }

  const credit = AFD.getCredit();
  UI.addLog(`δ(q${credit}, SEL_${type}) → q${type}  [ESTADO FINAL]`);
  UI.addLog(`SAÍDA: ${result.candy.emoji} ${result.candy.name}  |  Troco: ${AFD.fmt(result.change)}`);

  UI.showTray(result.candy.emoji, result.change);

  setTimeout(() => {
    UI.showSuccessOverlay(type, result.change, result.creditUsed);
  }, 600);
}

/**
 * Chamado pelo botão "Reiniciar Máquina".
 */
function resetMachine() {
  AFD.reset();
  UI.clearTray();
  UI.clearLog();
  UI.addLog('Máquina reiniciada. Estado inicial: q0', false);
  UI.addLog('Insira notas/moedas para começar...', false);
  refreshAll();
}

/**
 * Chamado pelo botão de fechar o overlay de mensagem.
 */
function closeOverlay() {
  const wasError = UI.isErrorOverlay();
  UI.hideOverlay();

  if (!wasError) {
    AFD.reset();
    UI.clearTray();
    UI.addLog('─────────────────────────────', false);
    UI.addLog('Nova compra iniciada. Estado: q0', false);
    refreshAll();
  }
  
}

window.generateDiagram = function() {
  console.log("CLIQUE FUNCIONOU 😄");

  const dot = generateDOT(AFD);

  const encoded = encodeURIComponent(dot);
  const url = `https://dreampuf.github.io/GraphvizOnline/#${encoded}`;

  window.open(url, '_blank');

  UI.addLog(' Diagrama gerado!', false);
};
