<?php
require_once ROOT_PATH . 'config/cors.php';
require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'models/usuarios.php';
require_once ROOT_PATH . 'config/auth.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$usuario = new Usuario($db);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'getUser' && isset($_GET['id'])) {
            $idUsuario = exigirAutenticacao();

            $usuarioData = $usuario->getUserById($idUsuario);
            if ($usuarioData) {
                http_response_code(200);
                echo json_encode($usuarioData);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Usuário não encontrado."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Parâmetros inválidos."]);
        }
        break;

    case 'DELETE':
        $idAutenticado = exigirAutenticacao();
        $usuario->id = $idAutenticado;
        if ($usuario->delete()) {
            http_response_code(200);
            echo json_encode(array("message" => "Usuario excluído com sucesso."));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Falha na exclusão de dados."));
        }
        break;

    case 'PUT':

        $idAutenticado = exigirAutenticacao();

        $data = json_decode(file_get_contents("php://input"));

        $usuario->id = $idAutenticado;

        // Alteração de senha
        if (isset($data->senhaNova)) {

            $usuario->newPass = $data->senhaNova;
            $usuario->oldPass = $data->senhaAntiga ?? null;

            $resultado = $usuario->changePassword();

            if ($resultado === true) {
                http_response_code(200);
                echo json_encode([
                    "message" => "Senha alterada com sucesso."
                ]);
            } elseif ($resultado === "incorrect_password") {
                http_response_code(401);
                echo json_encode([
                    "message" => "Senha antiga incorreta"
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    "message" => "Não foi possível alterar a senha."
                ]);
            }

            exit;
        }

        // Alteração de dados do perfil
        if (isset($data->nome)) {
            $usuario->name = $data->nome;
        }

        if (isset($data->email)) {
            $usuario->email = $data->email;
        }

        $resultado = $usuario->update();

        if ($resultado === true) {
            http_response_code(200);
            echo json_encode([
                "message" => "Usuario atualizado com sucesso."
            ]);
        } elseif ($resultado === "duplicate") {
            http_response_code(409);
            echo json_encode([
                "message" => "Este email já está cadastrado"
            ]);
        } elseif ($resultado === "not_found") {
            http_response_code(404);
            echo json_encode([
                "message" => "Usuário não encontrado"
            ]);
        } else {
            http_response_code(503);
            echo json_encode([
                "message" => "Falha na atualização de dados."
            ]);
        }

        break;

    case 'POST':
        if (isset($_GET['action']) && $_GET['action'] === 'login') {
            $data = json_decode(file_get_contents("php://input"), true);
            $email = $data["email"] ?? "";
            $senha = $data["senha"] ?? "";
            $resultado = $usuario->login($email, $senha);

            if ($resultado) {
                iniciarSessao();
                session_regenerate_id(true);

                $_SESSION['usuario_id'] = (int) $resultado;

                http_response_code(200);
                echo json_encode([
                    "status" => "ok",
                    "id" => $resultado,
                    "message" => "Login realizado com sucesso."
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Email ou senha inválidos."]);
            }
            exit;
        }

        if (isset($_GET["action"]) && $_GET["action"] === "descontaUsu") {
            $idUsuario = exigirAutenticacao();
            $data = json_decode(file_get_contents("php://input"), true);
            $points = $data["discPoints"];
            $result = $usuario->discountUserPoints($idUsuario, $points);
            if ($result) {
                http_response_code(200);
                echo json_encode([
                    'message' => 'Pontos descontados com sucesso',
                    'pontos' => $result
                ]);
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Falha no descoto de pontos."));
            }
            exit;
        }
        if (isset($_GET["action"]) && $_GET["action"] === "novaSemana") {
            $id = exigirAutenticacao();
            $data = json_decode(file_get_contents("php://input"), true);
            $newWeek = $data["novaSemana"] ?? null;

            if (!$id || $newWeek === null) {
                http_response_code(400);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Dados insuficientes."
                ]);
                exit;
            }

            if ($result) {
                http_response_code(200);
                echo json_encode([
                    "sucesso" => true,
                    "semana" => $newWeek,
                    "mensagem" => "Semana atualizada com sucesso."
                ]);
            } else {
                http_response_code(503);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Falha ao atualizar semana."
                ]);
            }
            exit;
        } else {
            $data = json_decode(file_get_contents("php://input"));
            $usuario->name = $data->nome;
            $usuario->email = $data->email;
            $usuario->senha = $data->senha;

            $resultado = $usuario->create();

            if ($resultado === true) {
                http_response_code(200);
                echo json_encode(array("message" => "Usuario cadastrado com sucesso."));
            } elseif ($resultado === "duplicate") {
                http_response_code(409);
                echo json_encode(array("message" => "Este email já está cadastrado"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Falha na inclusão de dados."));
            }
        }
        break;

}
?>