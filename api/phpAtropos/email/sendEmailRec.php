<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

date_default_timezone_set('America/Sao_Paulo');

require __DIR__ . "/../vendor/autoload.php";
require_once __DIR__ . '/../models/usuarios.php';
require_once __DIR__ . '/../models/esqueceu.php';
require_once __DIR__ . '/../config/database.php';


$database = new Database();
$db = $database->getConnection();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendEmailToken($to, $token)
{
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = getenv('EMAIL_HOST') ?: "smtp.gmail.com";
        $mail->SMTPAuth = true;
        $mail->Username = getenv('EMAIL_USERNAME');
        $mail->Password = getenv('EMAIL_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = getenv('EMAIL_PORT') ?: 587;

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->setFrom(getenv('EMAIL_USERNAME'), "Atropos");
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = "Recuperação de Senha - Atropos";

        $mail->Body = "
        <!DOCTYPE html>
        <html lang='pt-BR'>
        <head><meta charset='UTF-8'><title>Recuperação de Senha</title></head>
        <body style='margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f7f7f9;'>
          <table align='center' cellpadding='0' cellspacing='0' width='100%' style='max-width:600px; background:#fff; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;'>
            <tr>
              <td style='background-color:#2f1d3d; color:#fff; text-align:center; padding:25px 15px; font-size:28px; font-weight:bold;'>Atropos</td>
            </tr>
            <tr>
              <td style='padding:30px; color:#333;'>
                <h2 style='margin-top:0;'>Olá, usuario do email $to 👋</h2>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                <p>Use o código abaixo para verificar sua conta e criar uma nova senha:</p>

                <table align='center' cellpadding='0' cellspacing='0' style='margin:20px auto;'>
                  <tr>
                    <td style='background:#4A90E2; color:#fff; font-size:32px; font-weight:bold; padding:15px 25px; border-radius:8px; text-align:center;'>$token</td>
                  </tr>
                </table>

                <p style='margin-top:20px;'>O código expira em <strong>30 minutos</strong>. Não compartilhe este código com ninguém.</p>

                <p style='color:#777; font-size:14px;'>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>

                <p style='margin-top:30px;'>Abraços,<br><strong>Equipe Atropos</strong></p>
              </td>
            </tr>
            <tr>
              <td style='background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#666;'>© " . date("Y") . " Atropos. Todos os direitos reservados.</td>
            </tr>
          </table>
        </body>
        </html>
        ";

        $mail->AltBody = "Olá, usuario do email $to, seu código de verificação é: $token";
        $mail->send();
        return true;

    } catch (Exception $e) {
        return $e->getMessage();
        }
    }

?>