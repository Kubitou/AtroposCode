<?php

require_once ROOT_PATH . 'config/cors.php';
date_default_timezone_set("America/Sao_Paulo");

require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'models/usuarios.php';
require_once ROOT_PATH . 'models/esqueceu.php';
require __DIR__ . '/../email/sendEmailRec.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$usuario = new Usuario($db);
$esqueceu = new Esqueceu($db);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['token'])) {
            $input = $_GET['token'];
            $digitedToken = $input;
            $esqueceu->digitedToken = $digitedToken;
            try {
            $result = $esqueceu->validation();
            echo json_encode([
                "success" => true,
                "message" => "Token válido",
                "resetToken" => $result["token"]
            ]);
        } catch (Exception $e) {
        http_response_code("401");
        echo json_encode([
                "success" => false,
                "message" => $e->getMessage()
        ]);
        }
        }
        break;
    case 'POST':
        try {
            $input = json_decode(file_get_contents("php://input"), true);

            $to = $input["email"];
            if (!$usuario->emailExist($to)) {
                echo json_encode(["success" => false, "message" => "Email não cadastrado"]);
                exit;
            }
            $tokenEmail = random_int(1000, 9999);
            $date = date("Y-m-d H:i:s");
            $esqueceu->token = $tokenEmail;
            $esqueceu->validity = $date;
            $esqueceu->email = $to;
            $esqueceu->getId();

            $result = sendEmailToken($to, $tokenEmail);
            if ($result === true) {
                echo json_encode(["success" => true, "message" => "Token enviado com sucesso para o email informado."]);
            } else {
                echo json_encode(["success" => false, "message" => "Erro ao enviar email: $result"]);
            }            
            echo json_encode(["success" => true, "message" => "Token gerado e salvo no banco"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        break;
    case "PUT":
        try {
            $input = json_decode(file_get_contents("php://input"), true);

            $tokenResetPass = $input["tokenReset"];
            $newPass = $input["novaSenha"];

            $esqueceu->resetTokenPass = $tokenResetPass;
            $esqueceu->newPass = $newPass;

            $result = $esqueceu->updatePass();
            if ($result === true) {
                http_response_code(200);
                echo json_encode(["message" => "Senha alterada com sucesso"]);
            }else{
                http_response_code(400);
                echo json_encode(["message" => "Falha na atualização da senha"]);
            }
        } catch (Exception $e) {
             echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        break;
}


?>