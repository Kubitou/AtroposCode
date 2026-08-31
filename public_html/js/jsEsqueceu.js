let validacaoInputs = document.getElementsByClassName("validacaoInputs")[0];
let token = "";
let valido = 0;

let indexPasso;

//Verifica em qual passo está para não perder o progresso ------------------------------------------------------------------------------------------------------------------------------

function carregaPasso(){
  if(localStorage.getItem("indexPasso") == 1){
    document.getElementById("passoEmail").classList.add('hidden');
    document.getElementById("passoCodigo").classList.remove('hidden');    
  }
  if(localStorage.getItem("indexPasso") == 2){
    document.getElementById("passoEmail").classList.add('hidden');
    document.getElementById("passoSenha").classList.remove('hidden');
    document.getElementById("passoCodigo").classList.add('hidden');
    }
}

function enviarForm(event) {
  event.preventDefault();

  enviaEmail();
  emailParaValidacao();

}
// Função de enviar o email -------------------------------------------------------------------------------------------------------------------------

async function enviaEmail(){
  let email = document.getElementById("email").value;
  let emailInput = document.getElementById("email")

  const erroEmail = document.getElementById("erroEmail");
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (regex.test(emailInput.value)) {
    erroEmail.style.display = "none";
  } else {
    erroEmail.style.display = "block";
    defineAlert("Digite um e-mail válido", 'aviso');
    return;
  }
  const url = "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctEsqueceu";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({email})
    });
    if(!resp.ok){
      let erro = await resp.json();
      defineAlert(erro.message, 'errado');
      return;
    }
  } catch (e) {
    defineAlert("Erro de conexão com o servidor: " + e.message, 'errado');
  }
}
// Troca a tela -------------------------------------------------------------------------------------------------------------------------
function emailParaValidacao(){
  indexPasso = 1;
  localStorage.setItem("indexPasso", indexPasso);
  document.getElementById("passoCodigo").classList.remove('hidden');
  document.getElementById("passoEmail").classList.add('hidden');
}
// Volta a tela -------------------------------------------------------------------------------------------------------------------------

function voltarParaEmail(){
  document.getElementById("passoEmail").classList.remove('hidden');
  document.getElementById("passoCodigo").classList.add('hidden');
  document.getElementById("email").value = "";
}

// função para trocar os inputs -------------------------------------------------------------------------------------------------------------------------

validacaoInputs.onkeyup = function(e) {
    let target = e.srcElement || e.target;
    let maxLength = parseInt(target.getAttribute("maxlength"), 5);
    let myLength = target.value.length;

    if (myLength >= maxLength) {
        let next = target;
        while (next = next.nextElementSibling) {
            if (next == null) break;
            if (next.tagName.toLowerCase() === "input") {
                next.focus();
                break;
            }
           
        }
    }
    else if (myLength === 0) {
        let previous = target;
        while (previous = previous.previousElementSibling) {
            if (previous == null) break;
            if (previous.tagName.toLowerCase() === "input") {
                previous.focus();
                break;
            }
        }
    }
};

// validação do codigo -------------------------------------------------------------------------------------------------------------------------

document.getElementById("btnEnviarCodigo").addEventListener("click", async() => {
    let codigo = "";
    document.querySelectorAll(".validacaoInputs input").forEach(inp => {
        codigo += inp.value;
    });
    if(isNaN(codigo) || codigo.length !== 4){
      defineAlert("Digite os 4 números do código corretamente", 'aviso');
      valido = 0;
      return;
    }

    const url = `https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctEsqueceu&token=${codigo}`;
    try {
    const resp = await fetch(url, {
      method: "GET"
    });
    if(!resp.ok){
      let erro = await resp.json();
      defineAlert(erro.message, 'errado');
      valido = 0;
      return;
    }
    let data = await resp.json();
    token = data.resetToken;
    valido = 1;

    indexPasso = 2;
    localStorage.setItem("indexPasso", indexPasso);
    document.getElementById("passoSenha").classList.remove('hidden');
    document.getElementById("passoCodigo").classList.add('hidden');
  } catch (e) {
    defineAlert("Erro de conexão com o servidor: " + e.message, 'errado');
  }
}
);

// Verifica a senha -------------------------------------------------------------------------------------------------------------------------
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

// Envia senha nova para o banco -------------------------------------------------------------------------------------------------------------------------
async function enviaSenhaNova(){
  let novaSenha = document.getElementById("senhaNova").value
  let novaSenhaConfirmada = document.getElementById("senhaConfirmar").value

  const temNumero = /\d/.test(novaSenha);
  const temMaiuscula = /[A-Z]/.test(novaSenha);
  const temEspecial = /[\W_]/.test(novaSenha);
  const tem8Caracteres = novaSenha.length >= 8;

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

  if (novaSenha != novaSenhaConfirmada) {
    defineAlert("As senhas não são iguais", 'aviso');
    return;
  }
  const dados = {
    tokenReset: token,
    novaSenha: novaSenhaConfirmada
  };
  const url = "https://atropotasks.com.br/api/router.php?pasta=controle&rota=ctEsqueceu";
  try {
    const resp = await fetch(url, {
      method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(dados),
    });
    if(!resp.ok){
      let erro = await resp.json();
      defineAlert(erro.message, 'errado');
      return;
    }
    defineAlert("Senha alterada com sucesso!", 'certo');
    window.location.replace("index.html");
  } catch (e) {
    defineAlert("Erro de conexão com o servidor: " + e.message, 'errado');
  }

}

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


function voltarParaIndex() {
  localStorage.removeItem("indexPasso");
  window.location.replace("index.html");
}

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