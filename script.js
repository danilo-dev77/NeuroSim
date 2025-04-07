
// script.js atualizado para NeuroSim com suporte completo a categorias e ordem

let caso = {};
let acoesRealizadas = [];
let pontuacao = {
  corretas: 0,
  corretasTotal: 0,
  bonus: 0,
  bonusTotal: 0,
  neutras: 0,
  ordemInadequada: 0,
  prejudiciais: 0,
  penalidade: 0
};

function carregarCaso(nomeArquivo) {
  fetch(nomeArquivo)
    .then(response => response.json())
    .then(data => {
      caso = data;
      iniciarCaso();
    });
}

function iniciarCaso() {
  document.getElementById("descricaoCaso").innerText = caso.descricao;
  acoesRealizadas = [];

  pontuacao.corretasTotal = caso["ações essenciais"]?.length || 0;
  pontuacao.bonusTotal = caso["ações bônus"]?.length || 0;

  const menus = {
    "Anamnese": [
      "História da doença atual",
      "Antecedentes pessoais",
      "Uso de medicamentos"
    ],
    "Exame físico": [
      "Estado de consciência",
      "PA e FC",
      "Ausculta cardíaca"
    ],
    "Exames": [
      "Glicemia capilar",
      "Hemograma",
      "ECG"
    ],
    "Medicamentos": [
      "Diazepam EV",
      "Furosemida",
      "Fenitoína",
      "Sedação profunda"
    ],
    "Ações": [
      "Acesso venoso",
      "Monitorização",
      "Intubação",
      "Proteção de vias aéreas"
    ],
    "Finalizar": []
  };

  const container = document.getElementById("menus");
  container.innerHTML = "";

  for (const [menu, acoes] of Object.entries(menus)) {
    const sec = document.createElement("div");
    sec.className = "menuSecao";
    const titulo = document.createElement("h3");
    titulo.innerText = menu;
    sec.appendChild(titulo);

    acoes.forEach(acao => {
      const btn = document.createElement("button");
      btn.innerText = acao;
      btn.onclick = () => executarAcao(acao);
      sec.appendChild(btn);
    });

    if (menu === "Finalizar") {
      const btn = document.createElement("button");
      btn.innerText = "Finalizar Caso";
      btn.onclick = finalizarCaso;
      sec.appendChild(btn);
    }

    container.appendChild(sec);
  }

  atualizarTabela();
}

function classificarAcao(acao) {
  if (caso["ações essenciais"]?.includes(acao)) return "correta";
  if (caso["ações bônus"]?.includes(acao)) return "bonus";
  if (caso["ações prejudiciais"]?.includes(acao)) return "prejudicial";
  return "neutra";
}

function verificarOrdemInadequada(acao) {
  if (!caso["restrições de ordem"]) return null;

  for (const restricao of caso["restrições de ordem"]) {
    if (restricao.ação === acao) {
      const requisitos = restricao["somente após"];
      const aindaFaltam = requisitos.filter(r => !acoesRealizadas.includes(r));
      if (aindaFaltam.length > 0) {
        return restricao.penalidade || -5;
      }
    }
  }
  return null;
}

function executarAcao(acao) {
  if (acoesRealizadas.includes(acao)) return;
  acoesRealizadas.push(acao);

  const penalidade = verificarOrdemInadequada(acao);

  if (penalidade !== null) {
    pontuacao.ordemInadequada++;
    pontuacao.penalidade += penalidade;
  } else {
    const tipo = classificarAcao(acao);
    if (tipo === "correta") pontuacao.corretas++;
    else if (tipo === "bonus") pontuacao.bonus++;
    else if (tipo === "prejudicial") pontuacao.prejudiciais++;
    else pontuacao.neutras++;
  }

  atualizarTabela();
}

function atualizarTabela() {
  document.getElementById("pontuacao").innerHTML = `
    ✅ Corretas: ${pontuacao.corretas} / ${pontuacao.corretasTotal}<br>
    ✨ Bônus: ${pontuacao.bonus} / ${pontuacao.bonusTotal}<br>
    ➖ Neutras: ${pontuacao.neutras}<br>
    ⚠️ Ordem inadequada: ${pontuacao.ordemInadequada}<br>
    ❌ Prejudiciais: ${pontuacao.prejudiciais}<br>
    🧮 Penalidade: ${pontuacao.penalidade}
  `;
}

function finalizarCaso() {
  alert("Caso finalizado! Em breve: seleção de diagnóstico e diferenciais.");
}

carregarCaso("Cases/caso1.json");
