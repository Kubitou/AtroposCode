//Verifica se usuario ainda esta logado ------------------------------------------------------------------------------------------------------------------------------
function verificaUsu(){
    const usuarioSalvo = localStorage.getItem("usuario");
    if(usuarioSalvo){
        window.location.replace("atropos.html");
    }else{
        window.location.replace("index.html");
    }
}

//Verifica quantos pontos o usuario tem ------------------------------------------------------------------------------------------------------------------------------

function desbloqueia() {
  const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));
  if (!usuarioSalvo) return;

  const pontos = usuarioSalvo.pontos || 0;
  const ofensiva = usuarioSalvo.ofensiva || 0;

  const trofeusPontos = [
    { div: ".divTrofeu100P", id: "trofeu100P", limite: 100 },
    { div: ".divTrofeu250P", id: "trofeu250P", limite: 250 },
    { div: ".divTrofeu500P", id: "trofeu500P", limite: 500 },
    { div: ".divTrofeu750P", id: "trofeu750P", limite: 750 },
    { div: ".divTrofeu1000P", id: "trofeu1000P", limite: 1000 },
  ];

  atualizarTrofeus(trofeusPontos, pontos, "pontos");

  const trofeusOfensiva = [
    { div: ".divTrofeu7", id: "trofeu7", limite: 7 },
    { div: ".divTrofeu30", id: "trofeu30", limite: 30 },
    { div: ".divTrofeu60", id: "trofeu60", limite: 60 },
    { div: ".divTrofeu180", id: "trofeu180", limite: 180 },
    { div: ".divTrofeu270", id: "trofeu270", limite: 270 },
    { div: ".divTrofeu365", id: "trofeu365", limite: 365 },
  ];

  atualizarTrofeus(trofeusOfensiva, ofensiva, "ofensiva");
}

//Desbloqueia os trofeus ------------------------------------------------------------------------------------------------------------------------------

function atualizarTrofeus(lista, valorAtual, tipo) {
  lista.forEach(t => {
    const div = document.querySelector(t.div);
    const img = document.getElementById(t.id);
    const barra = img.nextElementSibling;
    const texto = barra.nextElementSibling;

    const progresso = Math.min((valorAtual / t.limite) * 100, 100);
    barra.value = Math.min(valorAtual, t.limite);
    texto.textContent = `${Math.floor(progresso)}%`;

    if (valorAtual >= t.limite) {
      img.src = `imgTrofeus/${tipo}/${t.limite}.png`;
      div.classList.add("desbloqueado");
    } else {
      const sufixo = tipo === "pontos" ? "_UL.png" : "_lock.png";
      img.src = `imgTrofeus/${tipo}/${t.limite}${sufixo}`;
      div.classList.remove("desbloqueado");
    }
  });
}