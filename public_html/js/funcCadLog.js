//onload tela de carregamento ------------------------------------------------------------------------------------------------------------------------------
window.addEventListener("load", async() => {
  const loadingOverlay = document.getElementById("loadingOverlay");
  const content = document.getElementById("content");
  try{
  await fadeOut(loadingOverlay, 300);
  content.style.display = "block";
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    alert("Ocorreu um erro ao carregar a página. Tente novamente.");
  }
});

function fadeOut(element, duration) {
  console.log(element);
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = "0";

      element.style.display = "none";
     resolve();
  });
}


// Para abrir e fechar os formulários de login e cadastro --------------------------------------------------------------------------------
function abrirLogin() {
  document.getElementById("loginOverlay").style.display = "flex";
}

function fecharLogin() {
  document.getElementById("loginOverlay").style.display = "none";
}

function abrirCadastro() {
  document.getElementById("cadastroOverlay").style.display = "flex";
}

function fecharCadastro() {
  document.getElementById("cadastroOverlay").style.display = "none";
}

// Função de cadastro ----------------------------------------------------------------------------------------------------------------------

function verificaSenha() {
  const qtdeCaracteres = document.getElementById("senhaCad").value.length;
  const temNumero = /\d/.test(document.getElementById("senhaCad").value);
  const temMaiuscula = /[A-Z]/.test(document.getElementById("senhaCad").value);
  const temEspecial = /[\W_]/.test(document.getElementById("senhaCad").value);

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

async function cadastrar(event) {
  const botao = event.target;
  if(botao){
    botao.disabled = true;
  }
  // Variaveis ----------------------------------------------------------------------------------------------------------------------------------
  let nomeUsu = document.getElementById("nomeUsu").value;
  let emailCad = document.getElementById("emailCad").value;
  let senhaCad = document.getElementById("senhaCad").value;
  let confSenha = document.getElementById("confSenha").value;
  let emailInput = document.getElementById("emailCad");
  let erroEmail = document.getElementById("erroEmail");

  // Validações ----------------------------------------------------------------------------------------------------------------------------------

  const temNumero = /\d/.test(senhaCad);
  const temMaiuscula = /[A-Z]/.test(senhaCad);
  const temEspecial = /[\W_]/.test(senhaCad);
  const tem8Caracteres = senhaCad.length >= 8;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (regex.test(emailInput.value)) {
    erroEmail.style.display = "none";
  } else {
    erroEmail.style.display = "block";
    defineAlert("Digite um e-mail válido", 'aviso');
    botao.disabled = false;
    return;
  }

  // Array para armazenar mensagens de erro ------------------------------------------------------------------------------------------

  let erros = [];

  if (!tem8Caracteres) {
    erros.push("• Pelo menos 8 caracteres");
  }
  if (!temNumero) {
    erros.push("• Pelo menos um número");
  }
  if (!temMaiuscula) {
    erros.push("• Pelo menos uma letra maiúscula");
  }
  if (!temEspecial) {
    erros.push("• Pelo menos um caractere especial (ex: !, @, #, etc)");
  }

  if (erros.length > 0) {
    defineAlert("A senha deve conter:\n" + erros.join("\n"), 'aviso');
    return;
  }

  if (confSenha != senhaCad) {
    defineAlert("As senhas não são iguais", 'aviso');
    botao.disabled = false;
    return;
  }

  // Enviar dados para o banco ------------------------------------------------------------------------------------------------------------

  const dados = {
    nome: nomeUsu,
    email: emailCad,
    senha: senhaCad,
  };

  const url = "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario&action=cadastro";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      defineAlert("Cadastro realizado com sucesso!", 'certo');
      enviarEmail(nomeUsu, emailCad);
      fecharCadastro();
      abrirLogin();
    } else if (response.status === 409) {
      defineAlert("Este e-mail já está cadastrado!", 'aviso');
    } else {
      defineAlert("Erro ao cadastrar usuário.", 'errado');
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor", 'errado');
  }finally{
    botao.disabled = false;
  }
}
//Envia o email cad ------------------------------------------------------------------------------------------------------------------------------

async function enviarEmail(nomeUsuario, emailDestino) {
  const url = "https://atropotasks.com.br/api/router.php?pasta=email&rota=sendEmailCad";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: nomeUsuario,
        email: emailDestino
      })
    });

    if (!response.ok) {
      console.error("Erro ao enviar email:", response.status);
    }
  } catch (error) {
    console.error("Erro de conexão ao enviar email:", error);
  }
}

// Função de login -------------------------------------------------------------------------------------------------------------------------
async function login(event) {
  const botao = event.target;
  if(botao){
    botao.disabled = true;
  }
  const emailLog = document.getElementById("emailLog").value;
  const senhaLog = document.getElementById("senhaLog").value;

  const dados = { email: emailLog, senha: senhaLog };

  try {
    const response = await fetch(
      "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctUsuario&action=login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      defineAlert(data.message || "Erro ao fazer login.", 'errado');
      return;
    }

    if (data.status === "ok") {
      localStorage.setItem("idUsuario", data.id);
      window.location.href = "/atropos.html";
    } else {
      defineAlert(data.message || "Login inválido!", 'errado');
    }
  } catch (error) {
    console.error("Erro:", error);
    defineAlert("Erro na conexão com o servidor", 'errado');
  }finally{
    botao.disabled = false;
  }
}

function esqueceuSenha(){
  window.location.replace("esqueceu.html");
}

// Função para mostrar e esconder a senha ---------------------------------------------------------------------------------------------------

function mostraSenhaLog() {
  const senhaLog = document.getElementById("senhaLog");
  const olhoSenhaLog = document.getElementById("olhoSenhaLog");

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

// Função para mostrar e esconder a senha ---------------------------------------------------------------------------------------------------

function mostraSenhaCad() {
  const senhaCad = document.getElementById("senhaCad");
  const olhoSenhaCad = document.getElementById("olhoSenhaCad");

  if (senhaCad.type === "password") {
    senhaCad.type = "text";
    olhoSenhaCad.classList.remove("fa-eye");
    olhoSenhaCad.classList.add("fa-eye-slash");
  } else {
    senhaCad.type = "password";
    olhoSenhaCad.classList.remove("fa-eye-slash");
    olhoSenhaCad.classList.add("fa-eye");
  }
}

// Responsividade do menu -------------------------------------------------------------------------------------------------------------------

const menuToggle = document.querySelector(".menu-toggle");
const navbar = document.querySelector(".navbar");

menuToggle.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

// Alerts personalizados -------------------------------------------------------------------------------------------------------------------------

function defineAlert(content, type){
  const customAlert = document.getElementById('customAlert');
  const alertContentP = document.getElementById('alertContentP');
  const imgAlert = document.querySelector('.imgAlert');

  switch (type) {
    case 'certo':
      imgAlert.src = "img/certo.png"  
    break;
    case 'aviso':
      imgAlert.src = "img/aviso.png"  
    break;
    case 'errado':
      imgAlert.src = "img/errado.png"  
    break;
  }

  alertContentP.innerText = content;
  customAlert.style.display = "flex";
}

document.getElementById('confirmBtn').addEventListener('click', function(){
    customAlert.style.display = 'none';
});