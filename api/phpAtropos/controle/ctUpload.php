<?php
require_once ROOT_PATH . 'config/cors.php';
require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'models/upload.php';
require_once ROOT_PATH . 'config/auth.php';

$database = new Database();
$db = $database->getConnection();

$upload = new Upload($db);

$idUsuario = exigirAutenticacao();

if (!isset($_FILES["file"])) {
    echo json_encode(["success" => false, "message" => "Faltam dados no envio."]);
    exit;
}

// Caminho absoluto correto no Hostinger
$target_dir = $_SERVER['DOCUMENT_ROOT'] . '/api/phpAtropos/imagens/';

// Verifica se a pasta existe, se não cria
if (!is_dir($target_dir)) {
    if (!mkdir($target_dir, 0755, true)) {
        echo json_encode(["success" => false, "message" => "Não foi possível criar a pasta de imagens."]);
        exit;
    }
}

$possibleExt = ['jpg', 'jpeg', 'png'];
foreach ($possibleExt as $ext) {
    $filePath = $target_dir . "usuario{$idUsuario}." . $ext;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

$imageFileType = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
$nomeArquivo = "usuario{$idUsuario}.{$imageFileType}";
$target_file = $target_dir . $nomeArquivo;

$check = getimagesize($_FILES["file"]["tmp_name"]);
if ($check === false) {
    echo json_encode(["success" => false, "message" => "Arquivo não é uma imagem."]);
    exit;
}

if (!in_array($imageFileType, ["jpg", "jpeg", "png"])) {
    echo json_encode(["success" => false, "message" => "Apenas JPG, JPEG e PNG são permitidos."]);
    exit;
}

// Criar a imagem fonte
switch ($imageFileType) {
    case "jpg":
    case "jpeg":
        $source = imagecreatefromjpeg($_FILES["file"]["tmp_name"]);
        break;
    case "png":
        $source = imagecreatefrompng($_FILES["file"]["tmp_name"]);
        break;
}

// Redimensionamento
list($largura, $altura) = getimagesize($_FILES["file"]["tmp_name"]);
$novaLargura = 256;
$novaAltura = 256;
$ratio = min($novaLargura / $largura, $novaAltura / $altura);
$novaLarguraFinal = (int)($largura * $ratio);
$novaAlturaFinal = (int)($altura * $ratio);

$novaImagem = imagecreatetruecolor(256, 256);

if ($imageFileType === "png") {
    imagesavealpha($novaImagem, true);
    $transparente = imagecolorallocatealpha($novaImagem, 0, 0, 0, 127);
    imagefill($novaImagem, 0, 0, $transparente);
} else {
    $branco = imagecolorallocate($novaImagem, 255, 255, 255);
    imagefill($novaImagem, 0, 0, $branco);
}

$x = (int) round((256 - $novaLarguraFinal) / 2);
$y = (int) round((256 - $novaAlturaFinal) / 2);

imagecopyresampled(
    $novaImagem, $source,
    $x, $y, 0, 0,
    $novaLarguraFinal, $novaAlturaFinal,
    $largura, $altura
);

// Salvar a imagem
$salvou = false;
switch ($imageFileType) {
    case "jpg":
    case "jpeg":
        $salvou = imagejpeg($novaImagem, $target_file, 90);
        break;
    case "png":
        $salvou = imagepng($novaImagem, $target_file);
        break;
}

imagedestroy($source);
imagedestroy($novaImagem);

if (!$salvou || !file_exists($target_file)) {
    echo json_encode(["success" => false, "message" => "Erro ao salvar a imagem no servidor."]);
    exit;
}

if (filesize($target_file) > 500000) {
    unlink($target_file);
    echo json_encode(["success" => false, "message" => "Arquivo final excede 500KB."]);
    exit;
}

// Atualiza o banco
$upload->nomeArquivo = $nomeArquivo;
$upload->id = $idUsuario;

if ($upload->saveFilePath()) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Upload realizado com sucesso! Imagem redimensionada para 256x256.",
        "filePath" => "https://atropotasks.com.br/api/phpAtropos/imagens/" . $nomeArquivo
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro ao salvar o caminho no banco."]);
}