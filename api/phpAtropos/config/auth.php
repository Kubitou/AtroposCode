<?php

function iniciarSessao(){
    if(session_status() == PHP_SESSION_NONE){
        session_start();
    }
}

function autenticarUsuario($id){
    iniciarSessao();

    $_SESSION['usuario_id'] = (int) $id;
}

function usuarioAutenticado(){
    iniciarSessao();

    return $_SESSION['usuario_id'] ?? null;
}

function exigirAutenticacao(){
    $id = usuarioAutenticado();
    if($id === null){
        http_response_code(401);
        echo json_encode(['erro' => 'Usuário não autenticado']);
        exit;
    }
    return $id;
}

function encerrarSessao(){
    iniciarSessao();
    
    $_SESSION = [];

    if(ini_get("session.use_cookies")){
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    session_destroy();
}


?>