<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('ROOT_PATH', dirname(dirname(__DIR__)) . '/api/phpAtropos/');

$rota = $_GET['rota'] ?? '';
$pasta = $_GET['pasta'] ?? '';

$rotaSanitizada = preg_replace('/[^a-zA-Z0-9_-]/', '', $rota);
$pastaSanitizada = preg_replace('/[^a-zA-Z0-9_-]/', '', $pasta);

if ($pastaSanitizada === 'controle' && $rotaSanitizada === 'ctVerificaTarefa') {
    require_once ROOT_PATH . "controle/ctVerificaTarefa.php";
    require_once ROOT_PATH . "models/verificaTarefa.php";
    require_once ROOT_PATH . "email/sendEmailAviso.php";
    require_once ROOT_PATH . "config/database.php";

    $database = new Database();
    $db = $database->getConnection();

    if (!isset($_GET['key']) || $_GET['key'] !== 'giDgl9Wd3RejuxbRcyKcLSWQ') {
        http_response_code(403);
        echo json_encode(['erro' => 'Acesso negado']);
        exit;
    }

    $controller = new CtVerificaTarefa($db);
    $controller->verificaTarefaAtrasadas();
    $controller->enviarEmailOfensiva();

    echo json_encode(['sucesso' => true, 'message' => 'Tarefas verificadas e e-mails enviados']);
    exit;
}
// ------------------------------------------------------------------------

$caminho = ROOT_PATH;
if ($pastaSanitizada) {
    $caminho .= "{$pastaSanitizada}/";
}
$caminho .= "{$rotaSanitizada}.php";

if (!file_exists($caminho)) {
    http_response_code(404);
    echo json_encode(['erro' => "Arquivo não encontrado: {$caminho}"]);
    exit;
}

require_once $caminho;
?>