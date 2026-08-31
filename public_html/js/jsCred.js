//Verifica se ainda esta logado------------------------------------------------------------------------------------------------------------------------------
function verificaUsu(){
    const usuarioSalvo = localStorage.getItem("usuario");
    if(usuarioSalvo){
        window.location.replace("atropos.html");
    }else{
        window.location.replace("index.html");
    }
}