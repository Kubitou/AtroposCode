<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
  $input = json_decode(file_get_contents("php://input"), true);

  $nome = $input["nome"];
  $to = $input["email"];
  $mail->isSMTP();
  $mail->SMTPDebug = 2;
  $mail->Debugoutput = 'error_log';

  $mail->Host = getenv('EMAIL_HOST') ?: "smtp.gmail.com";
  $mail->SMTPAuth = true;
  $mail->Username = getenv('EMAIL_USERNAME');
  $mail->Password = getenv('EMAIL_PASS');
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = getenv('EMAIL_PORT');


  $mail->CharSet = 'UTF-8';
  $mail->Encoding = 'base64';
  $mail->setFrom(getenv('EMAIL_USERNAME'), "Atropos");
  $mail->addAddress($to, $nome);

  $mail->isHTML(true);
  $mail->Subject = "Bem-vindo ao Atropos, $nome!";

  $mail->Body = "
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
  <meta charset='UTF-8'>
  <title>Bem-vindo ao Atropos</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f7f7f9;'>
  <table align='center' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px; background:#ffffff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;'>
    <tr>
      <td style='background-color:#2f1d3d; color:#ffffff; text-align:center; padding:25px 15px; font-size:28px; font-weight:bold; letter-spacing:1px;'>
        Atropos
      </td>
    </tr>
    <tr>
      <td style='padding:30px; color:#333333;'>
        <h2 style='margin-top:0;'>Olá, $nome 👋</h2>
        <p>Seja muito bem-vindo ao <strong>Atropos</strong>! ✨</p>
        <p>Agora você tem o poder de organizar seu tempo, planejar suas tarefas e alcançar suas metas com foco e praticidade.</p>
        <p style='margin:30px 0; text-align:center;'>
          <a href='https://atropotasks.com.br' 
            style='background:#2f1d3d; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:5px; font-weight:bold;'>
            Acessar o Atropos
          </a>
        </p>
        <p style='color:#777777;'>Se precisar de ajuda, nossa equipe está sempre pronta para te apoiar 💪</p>
        <p style='margin-top:30px;'>Abraços,<br><strong>Equipe Atropos</strong></p>
      </td>
    </tr>
    <tr>
      <td style='background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#666666;'>
        © " . date('Y') . " Atropos. Todos os direitos reservados.
      </td>
    </tr>
  </table>
</body>
</html>";

  if ($mail->send()) {
    echo json_encode(["success" => true, "message" => "Email enviado para $nome ($to)!"]);
  } else {
    echo json_encode(["success" => false, "message" => $mail->ErrorInfo]);
  }

} catch (Exception $e) {
  echo json_encode(["success" => false, "message" => "Erro ao enviar email: {$mail->ErrorInfo}"]);
}
