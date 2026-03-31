/**
 * afd.js
 * Lógica do Autômato Finito Determinístico (AFD)
 *
 * ∑  = { 1, 2, 5, A, B, C }
 * Q  = { q0, q1, ..., q13 }
 * q0 = estado inicial
 * F  = { qA, qB, qC }
 * δ  = função de transição definida abaixo
 */

'use strict';

const AFD = (() => {

  /* ── Constantes ──────────────────────── */
  const PRICES = { A: 6, B: 7, C: 8 };

  const CANDY_INFO = {
    A: { emoji: '🍭', name: 'DOCE A', price: 6 },
    B: { emoji: '🍫', name: 'DOCE B', price: 7 },
    C: { emoji: '🍬', name: 'DOCE C', price: 8 },
  };

  /** Valor máximo acumulável: R$5 + R$5 + R$5 = R$13 cobrindo todos os preços */
  const MAX_CREDIT = 13;

  /* ── Estado interno ───────────────────── */
  let credit = 0;
  let visitedStates = new Set([0]);

  /* ── Função de transição δ(q, σ) ─────── */
  function delta(currentCredit, input) {
    if (typeof input === 'number') {
      // Transição por inserção de moeda/nota
      return Math.min(currentCredit + input, MAX_CREDIT);
    }
    // Transição por seleção de doce (verificada pelo chamador)
    return `q${input}`;
  }

  /* ── API pública ──────────────────────── */

  function getCredit()        { return credit; }
  function getVisited()       { return visitedStates; }
  function getMaxCredit()     { return MAX_CREDIT; }
  function getPrices()        { return PRICES; }
  function getCandyInfo()     { return CANDY_INFO; }

  /**
   * Insere uma nota/moeda e retorna a transição realizada.
   * @param {number} value - 1, 2 ou 5
   * @returns {{ from: number, to: number, input: number }}
   */
  function insertCoin(value) {
    const from = credit;
    const to   = delta(credit, value);
    credit = to;
    visitedStates.add(credit);
    return { from, to, input: value };
  }

  /**
   * Tenta selecionar um doce.
   * @param {'A'|'B'|'C'} type
   * @returns {{ success: boolean, candy: object, change: number, missing: number }}
   */
  function selectCandy(type) {
    const price = PRICES[type];
    if (credit < price) {
      return {
        success: false,
        candy:   CANDY_INFO[type],
        change:  0,
        missing: price - credit,
      };
    }
    const change = credit - price;
    return {
      success: true,
      candy:   CANDY_INFO[type],
      change,
      missing: 0,
      creditUsed: credit,
    };
  }

  /** Reinicia a máquina para o estado inicial q0 */
  function reset() {
    credit = 0;
    visitedStates = new Set([0]);
  }

  /** Formata um valor inteiro como string monetária brasileira */
  function fmt(value) {
    return `R$ ${value},00`;
  }

  /** Retorna o label do estado atual */
  function stateLabel(v) {
    return `q${v}`;
  }

  return {
    getCredit,
    getVisited,
    getMaxCredit,
    getPrices,
    getCandyInfo,
    insertCoin,
    selectCandy,
    reset,
    fmt,
    stateLabel,
  };

})();
