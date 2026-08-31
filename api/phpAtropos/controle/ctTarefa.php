<?php
require_once ROOT_PATH . 'config/cors.php';
require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'models/tarefas.php';
require_once ROOT_PATH . 'config/auth.php';

$database = new Database();
$db = $database->getConnection();

$tarefa = new Tarefa($db);
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        $idAutenticado = exigirAutenticacao();
        $tarefa->id_usu = $idAutenticado;
        $stmt = $tarefa->read();
        echo json_encode([
            "success" => true,
            "tarefa" => $stmt
        ]);
        break;

    case 'DELETE':
        if (isset($_GET["id"])) {
            $idAutenticado = exigirAutenticacao();
            $tarefa->id = $_GET["id"];
            $tarefa->id_usu = $idAutenticado;
            if ($tarefa->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "Tarefa excluído com sucesso."));
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Falha na exclusão de dados."));
            }
        }

        break;

    case 'PUT':
        if (isset($_GET['action']) && $_GET['action'] === 'pontos') {
            $idAutenticado = exigirAutenticacao();
            $data = json_decode(file_get_contents('php://input'), true);
            $tarefa->id = $data['id'];
            $tarefa->id_usu = $idAutenticado;
            $tarefa->points = $data['pontos'];
            $result = $tarefa->conclude();
            if ($result) {
                http_response_code(200);
                echo json_encode([
                'message'=> 'Pontos atualizados com sucesso',
                'pontos' => $result]);
            } else {
                http_response_code(404);
                echo json_encode(array('message' => 'Falha na autalização de pontos'));
            }
            exit;
        } else {
            $idAutenticado = exigirAutenticacao();
            $data = json_decode(file_get_contents('php://input'));
            $tarefa->id = $data->id;
            $tarefa->id_usu = $idAutenticado;
            $tarefa->materia = $data->materia;
            $tarefa->importancia = $data->importancia;
            $tarefa->cor = $data->cor;
            $tarefa->descricao = $data->descricao;
            $tarefa->dataTarefa = $data->dataTarefa;
            $tarefa->carrossel = $data->carrossel;
            $tarefa->timeStamp = $data->timeStamp;
            if ($tarefa->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Tarafa atualizada com sucesso."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Falha na atualização de dados."));
            }
        }
        break;

    case 'POST':
        if(isset($_GET['action']) && $_GET['action'] === 'descontar'){
            $idAutenticado = exigirAutenticacao();
            $data = json_decode(file_get_contents('php://input'));
            $tarefa->id = $data->id;
            $tarefa->id_usu = $idAutenticado;
            $result = $tarefa->discount();
            if($result === true){
                http_response_code(200);
                echo json_encode(['message'=> 'Descontado ponto da tarefa atrasada']);
            }else{
                http_response_code(503);
                echo json_encode(["message" => "Falha no desconto de pontos"]);
            }
            exit;
        }else{
            $idAutenticado = exigirAutenticacao();
            $data = json_decode(file_get_contents("php://input"));
            $tarefa->materia = $data->materia;
            $tarefa->importancia = $data->importancia;
            $tarefa->cor = $data->cor;
            $tarefa->descricao = $data->descricao;
            $tarefa->dataTarefa = $data->dataTarefa;
            $tarefa->carrossel = $data->carrossel;
            $tarefa->timeStamp = $data->timeStamp;
            $tarefa->concluido = 0;
            $tarefa->id_usu = $idAutenticado;
            $resultado = $tarefa->create();

            if ($resultado === true) {
                http_response_code(200);
                echo json_encode([
                    "message" => "Tarefa cadastrada com sucesso.",
                    "timeStamp" => $tarefa->timeStamp,
                ]);

            } else {
                http_response_code(503);
                echo json_encode(["message" => "Falha na inclusão de dados."]);
            }
        }
        break;
}

?>