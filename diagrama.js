function generateDOT(afd) {
  const max = afd.getMaxCredit();
  const prices = afd.getPrices();

  let dot = `
digraph AFD {
  rankdir=LR;
  splines=true;
  nodesep=0.6;
  ranksep=1.2;

  node [shape=circle, style=filled, fillcolor="#0f172a", fontcolor="white"];
  edge [color="#94a3b8"];

  start [shape=point];
  start -> q0;

  // Estados organizados em linha
  { rank=same;
`;

  for (let i = 0; i <= max; i++) {
    dot += `q${i} [label="q${i}\\nR$${i}"];\n`;
  }

  dot += `}\n`;

  // finais
  dot += `
  qA [shape=doublecircle, fillcolor="#22c55e", label="🍭 A"];
  qB [shape=doublecircle, fillcolor="#eab308", label="🍫 B"];
  qC [shape=doublecircle, fillcolor="#ec4899", label="🍬 C"];
`;

  const moedas = [1, 2, 5];

  // transições moeda (cores iguais ao seu diagrama)
  for (let i = 0; i <= max; i++) {
    for (let m of moedas) {
      const to = Math.min(i + m, max);

      let color =
        m === 1 ? "#3b82f6" :
        m === 2 ? "#22c55e" :
                  "#ef4444";

      dot += `q${i} -> q${to} [label="+${m}", color="${color}"];\n`;
    }
  }

  // compras
  for (let i = 0; i <= max; i++) {
    for (let [tipo, preco] of Object.entries(prices)) {
      if (i >= preco) {
        dot += `q${i} -> q${tipo} [label="${tipo}", color="#f59e0b"];\n`;
      }
    }
  }

  dot += `}`;
  return dot;
}