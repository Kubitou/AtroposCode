//Carrega onload e tela de carregamento------------------------------------------------------------------------------------------------------------------------------
window.addEventListener("load", async () => {
  const loadingOverlay = document.getElementById("loadingOverlay");
  const content = document.getElementById("content");
  const customExit = document.getElementById("customExit");
  const confirmExitBtn = document.getElementById("confirmExitBtn");
  const backBtn = document.getElementById("backBtn");

  const usuarioSalvo = localStorage.getItem("idUsuario");
  if (!usuarioSalvo) {
    window.location.href = "index.html";
    return;
  }

  try {
    await Promise.all([puxaUsu()]);
    await fadeOut(loadingOverlay, 500);
    content.style.display = "block";

    if (!sessionStorage.getItem("historyStateAdded")) {
      history.pushState({ page: "current" }, "", window.location.href);
      sessionStorage.setItem("historyStateAdded", "true");
    }

    window.addEventListener("popstate", () => {
      history.pushState({ page: "current" }, "", window.location.href);
      customExit.style.display = "flex";
    });

    confirmExitBtn.addEventListener("click", () => {
    Object.keys(localStorage).forEach((key) => {
      localStorage.removeItem(key);
    });
      window.location.href = "index.html";
    });

    backBtn.addEventListener("click", () => {
      customExit.style.display = "none";
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    alert("Ocorreu um erro ao carregar a página. Tente novamente.");
  }
});
//Fade out da tela de carregamento ------------------------------------------------------------------------------------------------------------------------------
function fadeOut(element, duration) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = "0";

    setTimeout(() => {
      element.style.display = "none";
      resolve();
    }, duration);
  });
}

//Variaveis globais ------------------------------------------------------------------------------------------------------------------------------
let idLocalStorage;
var tarefas = [];
var tarefasConcluidas = [];

// Transforma os ids ------------------------------------------------------------------------------------------------------------------------------

function getIdLocalStorage(d, m, a) {
  const dia = d.toString().padStart(2, "0");
  const mes = m.toString().padStart(2, "0");
  const ano = a.toString();
  return dia + mes + ano;
}

// Transforma as datas para salvar no banco ------------------------------------------------------------------------------------------------------------------------------

function formatarDataParaBanco(ano, mes, dia) {
  const mesFormatado = mes.toString().padStart(2, "0");
  const diaFormatado = dia.toString().padStart(2, "0");

  return `${ano}-${mesFormatado}-${diaFormatado}`;
}

// Dropdown imgNav ------------------------------------------------------------------------------------------------------------------------------

function toggleDropdownImgNav(element) {
  const dropdownImg = element.querySelector(".dropdown-imgnav");
  dropdownImg.style.display =
    dropdownImg.style.display === "flex" ? "none" : "flex";
}

//Elementos navBar ------------------------------------------------------------------------------------------------------------------------------

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("customExit").style.display = "flex";
});

function deslogar() {
  document.getElementById("customExit").style.display = "flex";
}
function acessaTrofeu() {
  window.location.href = "trofeus.html";
}

// Puxa usuario ------------------------------------------------------------------------------------------------------------------------------

const elems = {
  nomeUsuario: document.getElementById("nomeUsuario"),
  nomeUsuarioMob: document.getElementById("nomeUsuarioMob"),
  nomeUsuarioPerf: document.getElementById("nomeUsuarioPerf"),
  pontosLabelPerf: document.getElementById("labelPontosPerf"),
  emailPerf: document.getElementById("emailPerf"),
  imgPerf: document.getElementById("imgPerf"),
  imgNav: document.getElementById("imgNav"),
  imgNavMob: document.getElementById("imgNavMob"),
};

let idUsu;

async function puxaUsu() {
  try {
    const idUsuario = localStorage.getItem("idUsuario");
    if (!idUsuario) {
      console.warn("ID de usuário não encontrado no localStorage.");
      return;
    }

    const resp = await fetch(
      `https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario&action=getUser&id=${idUsuario}`
    );

    if (!resp.ok) {
      console.error("Erro ao buscar usuário:", await resp.text());
      return;
    }

    const data = await resp.json();
    if (!data || data.message === "Usuário não encontrado.") {
      console.warn("Usuário não encontrado no banco de dados.");
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(data));

    idUsu = data;

    const foto = localStorage.getItem("foto") || "img/imgPerfDef.png";

    elems.nomeUsuario.innerText = idUsu.nome || "";
    elems.nomeUsuarioMob.innerText = idUsu.nome || "";
    elems.nomeUsuarioPerf.innerText = idUsu.nome || "";
    elems.emailPerf.innerText = idUsu.email || "";
    elems.pontosLabelPerf.innerText = idUsu.pontos || 0;

    const caminhoFoto = await montaCaminhoImagem(idUsu.id);

    elems.imgPerf.src = await caminhoFoto;
    elems.imgNav.src = await caminhoFoto;
    elems.imgNavMob.src = await caminhoFoto;

    await carregaTarefaBanco(idUsuario);
    ofensiva();
    if (idUsu.novoDia) {
      console.log("Novo dia detectado. Verificando tarefas vencidas...");
      await verificarEDescontarPontos();
    } else {
      console.log("Verificação já feita hoje (" + idUsu.dataVerificacao + ")");
    }
  } catch (error) {
    console.error("Erro ao puxar usuário:", error);
  }
}

//Monta o caminho da imagem para colocar no usuario ------------------------------------------------------------------------------------------------------------------------------

async function montaCaminhoImagem(id) {
  const extensoes = ["jpg", "jpeg", "png"];
  for (let ext of extensoes) {
    const url = `https://atropotasks.com.br/api/phpAtropos/imagens/usuario${id}.${ext}?v=${Date.now()}`;
    try {
      const resp = await fetch(url, { method: "HEAD" });
      if (resp.ok) return url;
    } catch (e) {}
  }
  return "img/imgPerfDef.png";
}

// Abre e fecha elementos do perfil -------------------------------------------------------------------------------------------------------------------------

function abrirPerfil() {
  var caixaPerfil = document.querySelector(".caixa, .perfil");
  caixaPerfil.style.display = "flex";
}

function fecharPerf() {
  var caixaPerfil = document.querySelector(".caixa, .perfil");
  caixaPerfil.style.display = "none";
}

function abrirExcluirUsu() {
  var excluirUsu = document.querySelector(".excluirUsuario");
  excluirUsu.style.display = "flex";
}

function fecharExcluirUsu() {
  var excluirUsu = document.querySelector(".excluirUsuario");
  excluirUsu.style.display = "none";
}

function abreAlterarNome() {
  var alterarNome = document.querySelector(".alterarNome");
  alterarNome.style.display = "flex";
}

function fecharAlterarNome() {
  var alterarNome = document.querySelector(".alterarNome");
  alterarNome.style.display = "none";
  document.getElementById("novoNome").value = "";
}

function abreAlterarEmail() {
  var alterarEmail = document.querySelector(".alterarEmail");
  alterarEmail.style.display = "flex";
}

function fecharAlterarEmail() {
  var alterarEmail = document.querySelector(".alterarEmail");
  alterarEmail.style.display = "none";
  document.getElementById("novoEmail").value = "";
}

function abreAlterarSenha() {
  var alterarSenha = document.querySelector(".alterarSenha");
  alterarSenha.style.display = "flex";
}

function fecharAlterarSenha() {
  var alterarSenha = document.querySelector(".alterarSenha");
  alterarSenha.style.display = "none";
}

// abre a caixa da ofensiva -------------------------------------------------------------------------------------------------------------------------

function abreOfensiva() {
  var ofensiva = document.querySelector(".ofensiva");
  ofensiva.style.display = "flex";
}

function fecharOfensiva() {
  var ofensiva = document.querySelector(".ofensiva");
  ofensiva.style.display = "none";
}

//verifica a senha nova -------------------------------------------------------------------------------------------------------------------------

function verificaSenha() {
  const qtdeCaracteres = document.getElementById("senhaNova").value.length;
  const temNumero = /\d/.test(document.getElementById("senhaNova").value);
  const temMaiuscula = /[A-Z]/.test(document.getElementById("senhaNova").value);
  const temEspecial = /[\W_]/.test(document.getElementById("senhaNova").value);

  if (qtdeCaracteres >= 8) {
    document.getElementById("8cacracteres").style.color = "green";
  } else {
    document.getElementById("8cacracteres").style.color = "red";
  }
  document.getElementById("maiusculo").style.color = temMaiuscula
    ? "green"
    : "red";
  document.getElementById("umNumero").style.color = temNumero ? "green" : "red";
  document.getElementById("caractereEsp").style.color = temEspecial
    ? "green"
    : "red";
}

// Função para mostrar e esconder a senha ---------------------------------------------------------------------------------------------------

function mostraSenha() {
  const senhaLog = document.getElementById("senhaNova");
  const olhoSenhaLog = document.getElementById("olhoSenhaNova");

  if (senhaLog.type === "password") {
    senhaLog.type = "text";
    olhoSenhaLog.classList.remove("fa-eye");
    olhoSenhaLog.classList.add("fa-eye-slash");
  } else {
    senhaLog.type = "password";
    olhoSenhaLog.classList.remove("fa-eye-slash");
    olhoSenhaLog.classList.add("fa-eye");
  }
}

// Troca a imagem -------------------------------------------------------------------------------------------------------------------

document.getElementById("imgTroca").addEventListener("click", function () {
  document.getElementById("imgInput").click();
});

async function previewImage(event) {
  const input = document.getElementById("imgInput");
  const file = input.files[0];
  if (!file) return defineAlert("Nenhum Arquivo Selecionado!", "aviso");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", idUsu.id);

  try {
    const response = await fetch(
      "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUpload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (data.success) {
      localStorage.setItem("foto", data.filePath);
      puxaUsu();
      defineAlert("Imagem alterada com sucesso!", "certo");
    } else {
      defineAlert("Erro ao alterar imagem: " + data.message, "errado");
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor.", "errado");
  }
}

// Função para alterar nome -------------------------------------------------------------------------------------------------------------------------

function alterarNome() {
  let novoNome = document.getElementById("novoNome").value;

  if (!novoNome) {
    defineAlert("Preencha o novo nome", "aviso");
    return;
  }
  return novoNome;
}

// Função para alterar email -------------------------------------------------------------------------------------------------------------------------

function alterarEmail() {
  let novoEmail = document.getElementById("novoEmail").value;

  if (!novoEmail) {
    defineAlert("Preencha o novo Email", "aviso");
    return;
  }
  return novoEmail;
}

// Função para alterar senha -------------------------------------------------------------------------------------------------------------------------

function atualizaSenha() {
  let senhaAntiga = document.getElementById("senhaAntiga").value;
  let senhaNova = document.getElementById("senhaNova").value;
  let id = idUsu.id;

  if (!senhaAntiga) {
    defineAlert("Preencha a senha antiga", "aviso");
    return;
  } else if (!senhaNova) {
    defineAlert("Preencha a senha nova", "aviso");
    return;
  }

  const dadoSenha = {
    senhaAntiga: senhaAntiga,
    senhaNova: senhaNova,
  };
  return dadoSenha;
}

//Atualiza usuario ------------------------------------------------------------------------------------------------------------------------------

async function updateUsuario(tipo, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.disabled = true;
  }
  usuario = JSON.parse(localStorage.getItem("usuario"));
  let id_usu = idUsu.id;
  let dadosUsuario = {
    id: id_usu,
  };

  switch (tipo) {
    case "nome":
      let novoNome = alterarNome();
      if (!novoNome) return;
      dadosUsuario.nome = novoNome;
      break;
    case "email":
      let novoEmail = alterarEmail();
      if (!novoEmail) return;
      dadosUsuario.email = novoEmail;
      break;
    case "senha":
      let dadoSenha = atualizaSenha();
      if (!dadoSenha) return;
      dadosUsuario.senhaAntiga = dadoSenha.senhaAntiga;
      dadosUsuario.senhaNova = dadoSenha.senhaNova;
      break;
  }
  try {
    const response = await fetch(
      "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosUsuario),
      }
    );
    if (response.ok) {
      await puxaUsu();
      fecharAlterarNome();
      fecharAlterarEmail();
      fecharAlterarSenha();
    } else {
      const data = await response.json();
      console.error("Erro:", data.message);
      defineAlert("Erro ao atualizar usuário: " + data.message, "errado");
    }
  } catch (error) {
    defineAlert("Erro na conexão com o servidor", "errado");
  } finally{
    event.target.disabled = false;
  }
}

// Função para excluir usuario -------------------------------------------------------------------------------------------------------------------------

async function excluirDoBancoUsu() {
  let id_usu = idUsu.id;

  try {
    const response = await fetch(
      `https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario&id=${id_usu}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      localStorage.clear();
      window.location.replace("index.html");
    } else {
      defineAlert("Erro ao excluir usuário.", "errado");
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor", "errado");
  }
}

// Ofensiva ------------------------------------------------------------------------------------------------------------------------------

function ofensiva() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  let ofensiva = usuario.ofensiva;

  const hoje = new Date();
  const diaSemanaLocal = hoje.getDay();
  let diaAtual = diaSemanaLocal === 0 ? 6 : diaSemanaLocal - 1;

  const dias = document.querySelectorAll(".semanaOfensivaE img");
  const img = document.getElementById("trofeuAtual");
  const h1Nav = document.getElementById("h1OfensivaNav");
  const h1Body = document.getElementById("h1OfensivaBody");

  const trofeusOfensiva = [
    { limite: 7 },
    { limite: 30 },
    { limite: 60 },
    { limite: 180 },
    { limite: 270 },
    { limite: 365 },
  ];

  if (ofensiva === "perdeu") {
    defineAlert(
      "Você perdeu sua ofensiva por não ter feito o seu diário login ontem. Vamos começar novamente!",
      "aviso"
    );
    ofensiva = 1;
    usuario.ofensiva = ofensiva;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    img.src = `imgTrofeus/ofensiva/7_lock.png`;
    dias.forEach(
      (dia, index) => (dia.src = index === diaAtual ? "img/estrela.png" : "")
    );
    if (h1Nav) h1Nav.innerHTML = ofensiva;
    if (h1Body) h1Body.innerHTML = ofensiva;
    return;
  }
  for (let i = 0; i < trofeusOfensiva.length; i++) {
    let trofeu = trofeusOfensiva[i];
    if (
      ofensiva >= trofeu.limite &&
      ofensiva < (trofeusOfensiva[i + 1]?.limite || Infinity)
    ) {
      img.src = `imgTrofeus/ofensiva/${trofeu.limite}.png`;
      break;
    } else if (ofensiva < trofeu.limite) {
      img.src = `imgTrofeus/ofensiva/${trofeu.limite}_lock.png`;
      break;
    }
  }

  if (h1Nav) h1Nav.innerHTML = ofensiva;
  if (h1Body) h1Body.innerHTML = ofensiva;

  dias.forEach((dia) => (dia.style.color = ""));

  for (let i = 0; i < ofensiva; i++) {
    const diaIndex = diaAtual - i;
    if (diaIndex >= 0) {
      dias[diaIndex].src = "img/estrela.png";
    }
  }
}

// Calendario ------------------------------------------------------------------------------------------------------------------------------

let dataAtual = new Date();
const meses = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function gerarCalendario() {
  // Variaveis ------------------------------------------------------------------------------------------------------------------------------

  const hojeData = new Date();
  const hojeDia = hojeData.getDate();
  const hojeMes = hojeData.getMonth();
  const hojeAno = hojeData.getFullYear();

  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();
  document.getElementById("h1mes").innerText = meses[mes] + " " + ano;
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  // Parte de cima calendario -------------------------------------------------------------------------------------------------------------

  let calendarioHTML = "<table>";
  calendarioHTML += "<tr>";
  for (let i = 0; i < 7; i++) {
    calendarioHTML += `<th>${diasSemana[i]}</th>`;
  }
  calendarioHTML +=
    "</tr>" +
    // Parte dos dias ----------------------------------------------------------------------------------------------------------------------

    "<tr>";
  for (let i = 0; i < primeiroDia.getDay(); i++) {
    calendarioHTML += "<td></td>";
  }
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    if ((primeiroDia.getDay() + dia - 1) % 7 === 0 && dia !== 1) {
      calendarioHTML += "</tr>" + "<tr>";
    }

    let diaStr = String(dia).padStart(2, "0");
    let mesStr = String(mes).padStart(2, "0");
    let idDia = `${diaStr}${mesStr}${ano}`;
    let dadosSalvos = JSON.parse(localStorage.getItem(idDia));
    let estilo = "";
    let estiloHoje = "";
    let coresDiv = "";

    // Estilo hoje ----------------------------------------------------------------------------------------------------------------------

    if (dia === hojeDia && mes === hojeMes && ano === hojeAno) {
      estiloHoje = `border: 2px solid blue; border-radius: 10px`;
    }

    // Gradiente ----------------------------------------------------------------------------------------------------------------------

    if (Array.isArray(dadosSalvos) && dadosSalvos.length > 0) {
      const qtd = dadosSalvos.length;
      const porcentagem = 100 / qtd;

      let gradientes = dadosSalvos
        .map((tarefa, index) => {
          const cor = tarefa.cor || "grey";
          const inicio = +(index * porcentagem).toFixed(2);
          let fim = +((index + 1) * porcentagem).toFixed(2);
          if (index === qtd - 1) fim = 100;
          return `${cor} ${inicio}% ${fim}%`;
        })
        .join(", ");

      // Junta os estilos ----------------------------------------------------------------------------------------------------------------------

      estilo = `style="background: linear-gradient(${gradientes}); color: white; border-radius: 10px; border: 2px solid white; ${estiloHoje}"`;
    } else {
      estilo = `style="background-color:rgba(83, 83, 83, 0); ${estiloHoje}"`;
    }
    calendarioHTML += `<td id="d${dia}" onclick="selecionaDia(${dia}, ${mes}, ${ano})" class="dias" ${estilo}>
        ${dia}
        ${coresDiv}
        </td>`;
  }
  calendarioHTML += "</tr>" + "</table>";
  // Cria dia ----------------------------------------------------------------------------------------------------------------------
  document.getElementById("calendario").innerHTML = calendarioHTML;
  carregarTarefasSalvas();
}

// Muda o mes -------------------------------------------------------------------------------------------------------------------------

function mudarMes(mesDelta) {
  dataAtual.setMonth(dataAtual.getMonth() + mesDelta);
  gerarCalendario();
}
gerarCalendario();

// Seleciona dia -------------------------------------------------------------------------------------------------------------------------

let diaSelecionado = null;
let idSelecionadoAnterior = null;
let indiceCarrossel = 0;
let tarefasDoDia = [];

function selecionaDia(diaSelec, mesSelec, anoSelec, manterIndice = false) {
  // Variaveis -------------------------------------------------------------------------------------------------------------------------

  idLocalStorage = getIdLocalStorage(diaSelec, mesSelec, anoSelec);
  const dadosSalvos = JSON.parse(localStorage.getItem(idLocalStorage)) || [];
  const idDia = `d${diaSelec}`;
  const elemento = document.getElementById(idDia);

  const mostraInfo = document.getElementById("mostraInfo");
  const animacaoCalendario = document.getElementById("fundoCalen");
  animacaoCalendario.classList.add("fundoCalenAnimacao");
  const animacaoLista = document.getElementById("listaMain");
  animacaoLista.classList.add("listaMainAnimacao");

  // Muda cor de volta -------------------------------------------------------------------------------------------------------------------------

  if (diaSelecionado) {
    const elementoAnterior = document.getElementById(diaSelecionado);
    const dadosAnteriores = JSON.parse(
      localStorage.getItem(idSelecionadoAnterior)
    );

    if (Array.isArray(dadosAnteriores) && dadosAnteriores.length > 0) {
      elementoAnterior.style.backgroundColor = dadosAnteriores[0].cor || "grey";
      elementoAnterior.style.color = "#ffffff";
    } else {
      elementoAnterior.style.backgroundColor = "transparent";
      elementoAnterior.style.color = "rgb(0, 0, 0)";
    }
  }

  if (diaSelecionado === idDia) {
    animacaoCalendario.classList.remove("fundoCalenAnimacao");
    animacaoLista.classList.remove("listaMainAnimacao");
    mostraInfo.style.display = "none";
    diaSelecionado = null;
    idSelecionadoAnterior = null;
    return;
  }

  if (dadosSalvos && dadosSalvos.length > 0 && dadosSalvos[0].cor) {
    elemento.style.backgroundColor = dadosSalvos[0].cor;
    elemento.style.color = "#ffffff";
  } else {
    elemento.style.backgroundColor = "#747678";
    elemento.style.color = "#ffffff";
  }

  mostraInfo.style.display = "flex";
  diaSelecionado = idDia;
  idSelecionadoAnterior = idLocalStorage;

  // Parte mostra info-------------------------------------------------------------------------------------------------------------------------

  const data = new Date(anoSelec, mesSelec, diaSelec);
  const diaSemana = diasSemana[data.getDay()];

  // HTML do mostra info -------------------------------------------------------------------------------------------------------------------------

  mostraInfo.innerHTML = `
        <div class="subMostraInfo">
            <div class="divInput">
                <input maxlenght="14" class="inputMateria" id="materia" type="text" placeholder="Nome da tarefa">
            </div>
            <div>
            <div id="bolinha" class="bolinha" onclick="toggleDropdownBola(this)">
                <div class="dropdown-bolinha">
                <div>
                    <div class="cor" style="background-color: blue;" onclick="selecionarCor('blue')"></div>
                    <div class="cor" style="background-color: green;" onclick="selecionarCor('green')"></div>
                    <div class="cor" style="background-color: red;" onclick="selecionarCor('red')"></div>
                    <div class="cor" style="background-color: orange;" onclick="selecionarCor('orange')"></div>
                    <div class="cor" style="background-color: purple;" onclick="selecionarCor('purple')"></div>
                </div>
                <div>
                    <div class="cor" style="background-color: darkturquoise;" onclick="selecionarCor('darkturquoise')"></div>
                    <div class="cor" style="background-color: greenyellow;" onclick="selecionarCor('greenyellow')"></div>
                    <div class="cor" style="background-color: deeppink;" onclick="selecionarCor('deeppink')"></div>
                    <div class="cor" style="background-color: darkorange;" onclick="selecionarCor('darkorange')"></div>
                    <div class="cor" style="background-color: violet;" onclick="selecionarCor('violet')"></div>
                    <div class="divColorPicker">
                      <div id="colorDisplay" class="cor" title="Escolher cor">+</div>
                      <input type="color" id="colorPicker" style="opacity: 0; width: 0; height: 0; position: absolute;">
                    </div>
                </div>
                </div>
            </div>
            </div>
            <div>
            <div onclick="toggleDropdownTres(this)">
                <label class="tresPontinhos">...</label>
                <div class="dropdown-tres">
                    <button class="button-cad" onclick="excluirDoBanco(${diaSelec}, ${mesSelec}, ${anoSelec}, indiceCarrossel)">Excluir</button>
                    <button class="button-cad" onclick="atualizarTarefa(${diaSelec}, ${mesSelec}, ${anoSelec}, event)">Atualizar</button>
                </div>
            </div>
            </div>
        </div>
        <div class="diaSelec">
            <p>${diaSemana}. ${diaSelec} de ${meses[mesSelec]}.</p>
        </div>
        <div class="mainImpor" onclick="toggleDropdownImpor(this)">
        <button class="button-cad importancia">Importância</button>
        <div class="dropdown-impor">
            <label onclick="importancia(10)" class="l1">Grande importância +10pt</label>
            <label onclick="importancia(7)" class="l2">Media importância +7pt</label>
            <label onclick="importancia(4)" class="l3">Pequena impotância +4pt</label>
            <label onclick="importancia(1)" class="l4">nenhuma importância +1pt</label>
        </div>
        </div>
        <div class="textArea">
            <p>Descrição:</p>
            <textarea id="txtArea" placeholder="Descreva" row="50" col="50"></textarea>  
        </div>
        <div class="botoesInfo">
            <button class="button-cad" onclick="limpaInfo()">+</button>
            <button id="btnSalvaData" class="button-cad" onclick="salvaData(${diaSelec}, ${mesSelec}, ${anoSelec}, event)">Salvar</button>
        </div>
        
    `;
  mostraInfo.classList.add("mostraInfo");
  mudaCorPersonalizado();

  //Parte do carrocel-------------------------------------------------------------------------------------------------------------------------

  if (Array.isArray(dadosSalvos)) {
    tarefasDoDia = dadosSalvos;
    tarefasDoDia = dadosSalvos;
    if (!manterIndice) indiceCarrossel = 0;
    if (dadosSalvos.length > 1) {
      mostraInfo.innerHTML += `
            <div class="carrossel-botoes">
                <button class="button-previous" onclick="anteriorTarefa(event)"><</button>
                <button class="button-next" onclick="proximaTarefa(event)">></button>
            </div> 

            <div class="indicadorDoCarrossel">
            
            </div>
            `;
      criarIndicadorCarrossel();
      mudaCorPersonalizado();
    }
    if (manterIndice === false) mostraTarefaAtual();
    carregarTarefasConcluidas();
  } else {
    tarefasDoDia = [];
  }
}

//Mostra tarefa atual do index-------------------------------------------------------------------------------------------------------------------------

function mostraTarefaAtual() {
  if (tarefasDoDia.length === 0) {
    limpaInfo();
    return;
  }
  const tarefa = tarefasDoDia[indiceCarrossel];
  document.getElementById("materia").value = tarefa.materia || "";
  document.getElementById("txtArea").value = tarefa.descricao || "";
  document.getElementById("bolinha").style.backgroundColor =
    tarefa.cor || "transparent";
  pontos = tarefa.importancia || 0;
}

//Muda do index do carrossel -------------------------------------------------------------------------------------------------------------------------

function anteriorTarefa(event) {
  event.stopPropagation();
  if (indiceCarrossel > 0) {
    indiceCarrossel--;
    mostraTarefaAtual();
    atualizarIndicadorCarrossel();
  }
}

function proximaTarefa(event) {
  event.stopPropagation();
  if (indiceCarrossel < tarefasDoDia.length - 1) {
    indiceCarrossel++;
    mostraTarefaAtual();
    atualizarIndicadorCarrossel();
  }
}
// Cria bolinha do carrossel -------------------------------------------------------------------------------------------------------------------------

function criarIndicadorCarrossel() {
  const container = document.querySelector(".indicadorDoCarrossel");

  if (!container) return;
  container.innerHTML = "";

  tarefasDoDia.forEach((_, index) => {
    const bolinhaCarrossel = document.createElement("div");
    bolinhaCarrossel.classList.add("bolinhaCarrossel");
    if (index === indiceCarrossel) {
      bolinhaCarrossel.classList.add("ativo");
    }
    container.appendChild(bolinhaCarrossel);
  });
}

//atualiza o indice (bolinha) -------------------------------------------------------------------------------------------------------------------------

function atualizarIndicadorCarrossel() {
  const bolinhas = document.querySelectorAll(".bolinhaCarrossel");
  bolinhas.forEach((bolinha, index) => {
    bolinha.classList.toggle("ativo", index === indiceCarrossel);
  });
}

// Dropdown bolinha -------------------------------------------------------------------------------------------------------------------------

function toggleDropdownBola(element) {
  const dropdownBola = element.querySelector(".dropdown-bolinha");
  dropdownBola.style.display = "flex";
}

function mudaCorPersonalizado() {
  const input = document.getElementById("colorPicker");
  const divColor = document.getElementById("colorDisplay");

  if (!input || !divColor) return;

  divColor.addEventListener("click", (e) => {
    input.click();
  });

  input.addEventListener("input", (e) => {
    const novaCor = e.target.value;
    divColor.style.backgroundColor = novaCor;
    selecionarCor(novaCor);
  });
}

function selecionarCor(cor) {
  const bolinha = document.getElementById("bolinha");
  bolinha.style.backgroundColor = cor;
}

// Dropdown tres pontinhos -------------------------------------------------------------------------------------------------------------------------

function toggleDropdownTres(element) {
  const dropdownTres = element.querySelector(".dropdown-tres");
  dropdownTres.style.display =
    dropdownTres.style.display === "flex" ? "none" : "flex";
}

// Dropdown importancia -------------------------------------------------------------------------------------------------------------------------

function toggleDropdownImpor(element) {
  const dropdownImpor = element.querySelector(".dropdown-impor");
  dropdownImpor.style.display =
    dropdownImpor.style.display === "flex" ? "none" : "flex";
}

// Limpa os campos -------------------------------------------------------------------------------------------------------------------------

function limpaInfo() {
  const bolinha = document.getElementById("bolinha");
  const materia = document.getElementById("materia");
  const txtArea = document.getElementById("txtArea");

  if (bolinha) bolinha.style.backgroundColor = "grey";
  if (materia) materia.value = "";
  if (txtArea) txtArea.value = "";
}
// Importancia -------------------------------------------------------------------------------------------------------------------------

var pontos = 0;

function importancia(impor) {
  pontos = impor;
}

// Salva no localStorage e no banco -------------------------------------------------------------------------------------------------------------------------

async function salvaData(d, m, a, event) {
  event.preventDefault();
  event.stopPropagation();

  const botao = event.target; 
  botao.disabled = true;

  try {
    var nomeMat = document.getElementById("materia").value;
    var txtArea = document.getElementById("txtArea").value;
    var corBolinha = document.getElementById("bolinha").style.backgroundColor;
    var id_usu = idUsu.id;

    let erros = [];
    if (!nomeMat) erros.push("• Preencha o nome da matéria");
    if (!corBolinha || corBolinha === "grey") erros.push("• Preencha a cor da bolinha");
    if (!pontos) erros.push("• Selecione a importância");

    if (erros.length > 0) {
      defineAlert(erros.join("\n"), "errado");
      botao.disabled = false;
      return;
    }

    const idLocalStorage = getIdLocalStorage(d, m, a);
    const listaTarefas = JSON.parse(localStorage.getItem(idLocalStorage)) || [];
    const indiceCarrosselStorage = listaTarefas.length;
    const dataSalvaBanco = formatarDataParaBanco(a, m + 1, d);

    const dadosBanco = {
      materia: nomeMat,
      importancia: pontos,
      descricao: txtArea,
      cor: corBolinha,
      dataTarefa: dataSalvaBanco,
      carrossel: indiceCarrosselStorage,
      timeStamp: Date.now(),
      id_usu,
    };

    const url = "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosBanco),
    });

    if (response.ok) {
      carregaTarefaBanco(localStorage.getItem("idUsuario"));
      limpaInfo();
      document.getElementById("mostraInfo").style.display = "none";
      document.getElementById("listaTarefasConcluidas").innerHTML = "";
      diaSelecionado = null;
      idSelecionadoAnterior = null;
    } else {
      defineAlert("Erro ao cadastrar tarefa.", "errado");
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor.", "errado");
  } finally {
    botao.disabled = false;
  }
}


// Carrega do banco -------------------------------------------------------------------------------------------------------------------------

async function carregaTarefaBanco(idUsu) {
  // conexão com o banco -------------------------------------------------------------------------------------------------------------------------

  let url = `https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa&id_usu=${idUsu}`;
  try {
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.tarefa || !Array.isArray(data.tarefa)) {
      console.error("Estrutura de dados inválida:", data);
      return;
    }
    // Carrega as tarefas do banco -------------------------------------------------------------------------------------------------------------------------
    for (let i = 0; i < data.tarefa.length; i++) {
      const tarefa = data.tarefa[i];
      const diaMesAno = tarefa.tb02_data;
      let partes = diaMesAno.split("-");
      const idBanco = tarefa.tb02_id;
      if (partes.length !== 3) {
        console.error("Formato de data inválido:", diaMesAno);
        continue;
      }

      let a = parseInt(partes[0]);
      let m = parseInt(partes[1]) - 1;
      let d = parseInt(partes[2]);
      const chaveLocalStorage = getIdLocalStorage(d, m, a);

      const dadosTarefa = {
        id: tarefa.tb02_timeStamp,
        materia: tarefa.tb02_materia,
        descricao: tarefa.tb02_descricao,
        cor: tarefa.tb02_cor,
        importancia: tarefa.tb02_importancia,
        dia: d,
        mes: m,
        ano: a,
        timestamp: tarefa.tb02_timeStamp,
        indexCarrocel: tarefa.tb02_carrossel || 0,
        idBanco: idBanco,
        concluido: tarefa.tb02_concluido,
      };
      // Verifica se a tarefa já existe no localStorage -------------------------------------------------------------------------------------------------------------------------

      let listaTarefas =
        JSON.parse(localStorage.getItem(chaveLocalStorage)) || [];
      const existe = listaTarefas.some((t) => t.id === dadosTarefa.id);

      if (!existe) {
        if (dadosTarefa.concluido == 1) {
          if (!tarefasConcluidas.some((t) => t.id === dadosTarefa.id))
            tarefasConcluidas.push(dadosTarefa);
          continue;
        } else {
          listaTarefas.push(dadosTarefa);
          localStorage.setItem(chaveLocalStorage, JSON.stringify(listaTarefas));
        }
      }
    }

    // Recarrega o calendário e a lista de tarefas -------------------------------------------------------------------------------------------------------------------------

    console.log("Todas as tarefas foram carregadas");
    gerarCalendario();
    carregarTarefasSalvas();
    carregarTarefasConcluidas();
    if (data.usuario && data.usuario.pontos) {
      idUsu.pontos = data.usuario.pontos;
      localStorage.setItem("usuario", JSON.stringify(idUsu));
      if (elems.pontosLabelPerf) {
        elems.pontosLabelPerf.innerText = data.usuario.pontos;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar tarefas do banco:", error);
  }
}

// verifica se ha tarefas vencidas -------------------------------------------------------------------------------------------------------------------------

async function verificaTarefasVencidas() {
  const hoje = new Date();
  const dataAtual = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  let total = 0;
  let tarefasAlteradas = false;

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (!/^\d{8}$/.test(chave)) continue;

    let listaTarefas;
    try {
      listaTarefas = JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
      continue;
    }

    let alterou = false;

    for (const tarefa of listaTarefas) {
      const dataTarefa = new Date(tarefa.ano, tarefa.mes, tarefa.dia);

      if (dataTarefa < dataAtual && Number(tarefa.concluido) !== 1) {
        total += Number(tarefa.importancia);

        if (Number(tarefa.importancia) !== 0) {
          tarefa.importancia = 0;
          alterou = true;
          tarefasAlteradas = true;

          try {
            const resp = await fetch(
              "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa&action=descontar",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: tarefa.idBanco }),
              }
            );

            const result = await resp.json();
            console.log("Tarefa descontada:", result);
          } catch (err) {
            console.error("Erro ao descontar tarefa:", err);
          }
        }
      }
    }

    if (alterou) {
      localStorage.setItem(chave, JSON.stringify(listaTarefas));
    }
  }

  if (tarefasAlteradas) {
    console.log("Recarregando tarefas após desconto...");
    await carregaTarefaBanco(localStorage.getItem("idUsuario"));
  }

  return total;
}

// Soma o total de pontos de tarefas atrasadas -------------------------------------------------------------------------------------------------------------------------

async function verificarEDescontarPontos() {
  const pontos = await verificaTarefasVencidas();
  if (pontos > 0) {
    defineAlert(
      "Você perdeu " + pontos + " pontos por tarefas atrasadas!",
      "aviso"
    );
    descontarPontos(pontos);
  } else {
    console.log("Nenhuma tarefa atrasada encontrada.");
  }
}

// Desconta os pontos do usuario -------------------------------------------------------------------------------------------------------------------------

async function descontarPontos(pontos) {
  let idUsuario = localStorage.getItem("idUsuario");
  let url =
    "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario&action=descontaUsu";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: idUsuario,
        discPoints: pontos,
      }),
    });

    if (!resp.ok) {
      console.error("Erro HTTP ao descontar pontos:", resp.status);
      return;
    }

    const result = await resp.json();

    if (result && result.pontos !== undefined) {
      let usuario = JSON.parse(localStorage.getItem("usuario")) || {};
      usuario.pontos = result.pontos;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      const pontosElem = document.getElementById("labelPontosPerf");
      if (pontosElem) pontosElem.textContent = result.pontos;
    }
  } catch (err) {
    console.error("Erro ao descontar pontos:", err);
  }
}

// Lista de tarefas -------------------------------------------------------------------------------------------------------------------------

function carregarTarefasSalvas() {
  var lista = document.getElementById("lista");
  tarefas = [];

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave != "idUsuario" && chave != "token" && chave != "usuario") {
      const item = localStorage.getItem(chave);
      let dados;
      try {
        dados = JSON.parse(item);
      } catch (e) {
        continue;
      }

      if (Array.isArray(dados)) {
        dados.forEach((tarefa) => {
          if (
            tarefa.materia &&
            tarefa.importancia !== undefined &&
            tarefa.concluido != 1
          ) {
            tarefas.push({
              chave,
              dados: tarefa,
            });
          }
        });
      }
    }

    renderizarTarefas();
    organizaDia();
  }
}

function renderizarTarefas(listaTarefas = tarefas) {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";
  listaTarefas.forEach((item, i) => {
    const dados = item.dados;
    let indexGeral;
    if(!item.indexOriginal){
      indexGeral = i;
    }else{
      indexGeral = item.indexOriginal;
    }
    lista.innerHTML += `
      <div onclick="abrePainelConcluir(${indexGeral})"
           style="background-color: ${dados.cor}" 
           id="listaCaixa${i}" 
           class="listaSubMain">
        <div class="listaElements">
            <h1>${dados.materia}</h1>
            <p>+${dados.importancia}pts</p>
        </div>
        <div class="subTitulo">
            <p>${dados.descricao}</p>
            <p>${dados.dia} de ${meses[dados.mes]}.</p>
        </div>
      </div>
    `;
  });
}

// Carrega as tarefas concluidas -------------------------------------------------------------------------------------------------------------------------

function carregarTarefasConcluidas() {
  document.getElementById("listaTarefasConcluidas").innerHTML = "";
  let listaTarefasConcluidas = document.getElementById(
    "listaTarefasConcluidas"
  );
  tarefasConcluidas.forEach((item, i) => {
    const dados = item;
    listaTarefasConcluidas.innerHTML += `
      <div style="background-color: ${
        dados.cor
      }" id="listaCaixa${i}" class="listaSubMain">
          <div class="listaElements">
              <h1>${dados.materia}</h1>
              <p>+${dados.importancia}pts</p>
          </div>
          <div class="subTitulo">
              <p>${dados.descricao}</p>
              <p>${dados.dia} de ${meses[dados.mes]}.</p>
          </div>
      </div>
  `;
  });
}
function abreTarefasConcluidas() {
  document.querySelector(".tarefasConcluidas").style.display = "flex";
  carregarTarefasConcluidas();
}
function fecharTarefasConcluidas() {
  document.querySelector(".tarefasConcluidas").style.display = "none";
  document.getElementById("listaTarefasConcluidas").innerHTML = "";
}

// Organiza as tarefas -------------------------------------------------------------------------------------------------------------------------

function organizaRecente() {
  tarefas.sort((a, b) => {
    if (a.dados.timestamp && b.dados.timestamp) {
      return b.dados.timestamp - a.dados.timestamp;
    } else {
      return a.chave.localeCompare(b.chave);
    }
  });
  renderizarTarefas();
}

function organizaImportancia() {
  tarefas.sort((a, b) => b.dados.importancia - a.dados.importancia);
  renderizarTarefas();
}

function organizaDia() {
  tarefas.sort((a, b) => {
    if (a.dados.ano !== b.dados.ano) {
      return a.dados.ano - b.dados.ano;
    }
    if (a.dados.mes !== b.dados.mes) {
      return a.dados.mes - b.dados.mes;
    }
    return a.dados.dia - b.dados.dia;
  });
  renderizarTarefas();
}

function procuraTarefaInput(event) {
  const valor = event.target.value.toLowerCase();

  const filtradas = tarefas
    .map((t, indexOriginal) => ({ ...t, indexOriginal }))
    .filter(
      (t) =>
        t.dados.materia.toLowerCase().includes(valor) ||
        t.dados.descricao.toLowerCase().includes(valor)
    );

  renderizarTarefas(filtradas);
}
//dropdow ajusta-----------------------------------------------------------------------------------------------------------------------------------

function toggleDropdownAjusta(element) {
  const dropdownAjusta = element.querySelector(".dropdown-ajusta");
  dropdownAjusta.style.display =
    dropdownAjusta.style.display === "flex" ? "none" : "flex";
}

// Exlui a data com dados -------------------------------------------------------------------------------------------------------------------------

async function excluirDoBanco(d, m, a, indice) {
  var chave = getIdLocalStorage(d, m, a);
  let tarefa = JSON.parse(localStorage.getItem(chave));

  if (!Array.isArray(tarefa) || !tarefa[indice]) return;

  const url = `https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa&id=${tarefa[indice].idBanco}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      excluirDoLocal(d, m, a, indice);
    } else {
      defineAlert("Erro ao excluir tarefa", "errado");
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor", "errado");
  }
}

// Exlui do localStorage -------------------------------------------------------------------------------------------------------------------------

function excluirDoLocal(d, m, a, indice) {
  var chave = getIdLocalStorage(d, m, a);
  let tarefas = JSON.parse(localStorage.getItem(chave));

  if (!Array.isArray(tarefas)) return;

  if (indice >= 0 && indice < tarefas.length) {
    tarefas.splice(indice, 1);

    if (tarefas.length > 0) {
      localStorage.setItem(chave, JSON.stringify(tarefas));
    } else {
      localStorage.removeItem(chave);
    }

    gerarCalendario();
    carregarTarefasSalvas();
    carregarTarefasConcluidas();
    const mostraInfo = document.getElementById("mostraInfo");
    mostraInfo.style.display = "none";
  } else {
    console.warn(
      `Índice ${indice} inválido para array de tamanho ${tarefas.length}`
    );
    carregaTarefaBanco(localStorage.getItem("idUsuario"));
  }
}

// Atualiza a tarefa -------------------------------------------------------------------------------------------------------------------------

async function atualizarTarefa(d, m, a, event) {
  // Variaveis -------------------------------------------------------------------------------------------------------------------------
  const botao = event.target;
  if (botao) {
    botao.disabled = true;
  }

  var nomeMat = document.getElementById("materia").value;
  var txtArea = document.getElementById("txtArea").value;
  var corBolinha = document.getElementById("bolinha").style.backgroundColor;
  var diaSalva = d;
  var mesSalva = m;
  var anoSalva = a;
  var indiceCarrosselStorage = indiceCarrossel;

  let erros = [];
  if (!nomeMat) erros.push("• Preencha o nome da materia");
  if (!corBolinha || corBolinha == "grey")
    erros.push("• Preencha a cor da bolinha");
  if (!pontos) erros.push("• Selecione a importância");

  if (erros.length > 0) {
    defineAlert(erros.join("\n"), "errado");
    botao.disabled = false;
    return;
  }

  // Pega a tarefa do localStorage -------------------------------------------------------------------------------------------------------------------------

  var chave = getIdLocalStorage(d, m, a);
  let tarefas = JSON.parse(localStorage.getItem(chave));
  if (!Array.isArray(tarefas)) return;
  const idBanco = tarefas[indiceCarrossel]?.idBanco;
  if (!idBanco) {
    defineAlert("Erro: idBanco da tarefa não encontrado!", "errado");
    botao.disabled = false;
    return;
  }

  // Cria objeto completo para atualizar o localStorage -------------------------------------------------------------------------------------------------------------------------

  const dadosCompletos = {
    dia: diaSalva,
    mes: mesSalva,
    ano: anoSalva,
    indexCarrocel: indiceCarrosselStorage,
    materia: nomeMat,
    descricao: txtArea,
    cor: corBolinha,
    importancia: pontos,
    timestamp: Date.now(),
    idBanco: idBanco,
  };

  // Prepara dados para enviar ao PHP -------------------------------------------------------------------------------------------------------------------------

  const dadosParaPHP = {
    id: idBanco,
    materia: nomeMat,
    descricao: txtArea,
    cor: corBolinha,
    importancia: pontos,
    dataTarefa: formatarDataParaBanco(anoSalva, mesSalva + 1, diaSalva),
    carrossel: indiceCarrosselStorage,
    timeStamp: Date.now(),
  };

  // Envia dados para o PHP -------------------------------------------------------------------------------------------------------------------------

  try {
    const response = await fetch(
      "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaPHP),
      }
    );

    const resp = await response.json();

    if (resp.message.includes("sucesso")) {
      const chave = getIdLocalStorage(diaSalva, mesSalva, anoSalva);
      let tarefas = JSON.parse(localStorage.getItem(chave)) || [];
      tarefas[indiceCarrosselStorage] = dadosCompletos;
      localStorage.setItem(chave, JSON.stringify(tarefas));
      excluirDoLocal(d, m, a, indiceCarrossel);
      carregaTarefaBanco(localStorage.getItem("idUsuario"));

      gerarCalendario();
      carregarTarefasSalvas();
      tarefasDoDia = tarefas;
      mostraTarefaAtual();
      defineAlert("Tarefa atualizada com sucesso!", "certo");
    } else {
      defineAlert("Erro ao atualizar no banco!", "errado");
    }
  } catch (err) {
    defineAlert("Erro no fetch: " + err, "errado");
  }finally{
    botao.disabled = false;
  }
}

// Abre painel de concluir -------------------------------------------------------------------------------------------------------------------------

function abrePainelConcluir(index) {
  var caixaConfirmar = document.querySelector(".caixaConfirmar");
  caixaConfirmar.style.display = "flex";
  caixaConfirmar.innerHTML = `
   <div class="confirmar">
      <div>
          <button onclick="fecharPainel()" class="close-btn">×</button>
      </div>
      <h1 id="tituloConf">Deseja concluir essa tarefa?</h1>
      <div class="infoConf">
      <p>${tarefas[index].dados.materia}</p>
      </div>
      <div class="botoesConf">
          <button class="button-cad" id="btnIr" onclick="irParaTarefa(${index})">Ir para tarefa</button>
          <button class="button-cad" id="btnSim" onclick="concluiTarefa(${index})">Sim</button>
          <button class="button-excluirUsu" id="btnNao" onclick="fecharPainel()">Ainda não</button>
      </div>
  </div>
            `;
}
//Conclui a tarefa ------------------------------------------------------------------------------------------------------------------------------
async function concluiTarefa(index) {
  let tarefa = tarefas[index].dados;
  let idTarefa = tarefa.idBanco;
  let pontos = tarefa.importancia;
  let idUsu = localStorage.getItem("idUsuario");

  const dados = {
    id: idTarefa,
    idUsu: idUsu,
    pontos: pontos,
  };

  const url =
    "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctTarefa&action=pontos";

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!response.ok) return;

    const data = await response.json();

    if (data && data.pontos !== undefined) {
      let usuario = JSON.parse(localStorage.getItem("usuario"));
      usuario.pontos = data.pontos;
      localStorage.setItem("usuario", JSON.stringify(usuario));
      const pontosElem = document.getElementById("labelPontosPerf");
      if (pontosElem) pontosElem.textContent = data.pontos;
    }

    let d = tarefa.dia;
    let m = tarefa.mes;
    let a = tarefa.ano;
    const chave = getIdLocalStorage(d, m, a);
    let tarefasDoDia = JSON.parse(localStorage.getItem(chave)) || [];

    const indiceReal = tarefasDoDia.findIndex((t) => t.idBanco === idTarefa);

    if (indiceReal !== -1) {
      excluirDoLocal(d, m, a, indiceReal);
    } else {
      console.warn(
        "Tarefa não encontrada no localStorage, recarregando do banco"
      );
      carregaTarefaBanco(idUsu);
    }

    tarefasConcluidas.push(tarefa);

    var audio = new Audio("sound/correto.mp3");
    audio.play();
    gerarCalendario();
    carregarTarefasConcluidas();
    carregarTarefasSalvas();
    fecharPainel();
    startConfetti();
  } catch (error) {
    console.error("Erro ao concluir tarefa:", error);
  }
}
//Confettes!!!!!! ------------------------------------------------------------------------------------------------------------------------------
function startConfetti(count = 150) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    piece.style.backgroundColor = [
      "#a4d6f3",
      "#ff0000",
      "#d700ff",
      "#0000ff",
      "#ffb000",
      "#ff00e0",
    ][Math.floor(Math.random() * 6)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDuration = Math.random() + 3 + "s";
    piece.style.animationDelay = Math.random() + "s";
    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

// Vai para a tarefa -------------------------------------------------------------------------------------------------------------------------

function irParaTarefa(index) {
  fecharPainel();
  let tarefa = tarefas[index];
  if (!tarefa) return;

  let dados = tarefa.dados;

  selecionaDia(dados.dia, dados.mes, dados.ano, true);
  const chave = getIdLocalStorage(dados.dia, dados.mes, dados.ano);
  let tarefasDoDiaLocal = JSON.parse(localStorage.getItem(chave)) || [];

  const indiceReal = tarefasDoDiaLocal.findIndex(
    (t) => t.idBanco === dados.idBanco || t.id === dados.id
  );

  if (indiceReal !== -1) {
    indiceCarrossel = indiceReal;
  } else {
    indiceCarrossel = dados.indexCarrocel || 0;
  }

  tarefasDoDia = tarefasDoDiaLocal;

  atualizarIndicadorCarrossel();
  mostraTarefaAtual();
  carregarTarefasConcluidas();
}

function fecharPainel() {
  var caixaConfirmar = document.querySelector(".caixaConfirmar");
  caixaConfirmar.style.display = "none";
}

// Fecha os dropdowns quando clicado fora -------------------------------------------------------------------------------------------------------------------------

document.addEventListener("click", function (event) {
  document
    .querySelectorAll(
      ".dropdown-bolinha, .dropdown-tres, .dropdown-impor, .dropdown-imgnav, .dropdown-ajusta, .dropdown-bolinha"
    )
    .forEach((dropdown) => {
      if (
        !dropdown.contains(event.target) &&
        !dropdown.parentElement.contains(event.target)
      ) {
        dropdown.style.display = "none";
      }
    });
});

// Alerts personalizados -------------------------------------------------------------------------------------------------------------------------

function defineAlert(content, type) {
  const customAlert = document.getElementById("customAlert");
  const alertContentP = document.getElementById("alertContentP");
  const imgAlert = document.querySelector(".imgAlert");

  switch (type) {
    case "certo":
      imgAlert.src = "img/certo.png";
      break;
    case "aviso":
      imgAlert.src = "img/aviso.png";
      break;
    case "errado":
      imgAlert.src = "img/errado.png";
      break;
  }

  alertContentP.innerText = content;
  customAlert.style.display = "flex";
}

document.getElementById("confirmBtn").addEventListener("click", () => {
  document.getElementById("customAlert").style.display = "none";
});
