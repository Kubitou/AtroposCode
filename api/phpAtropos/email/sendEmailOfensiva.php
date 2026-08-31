<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

class sendEmailOfensiva
{
    public static function enviarOfensiva($para, $assunto = null, $mensagem = null)
    {
        if (!$assunto) {
            $assunto = "🔥 Não perca sua ofensiva diária no Atropos!";
        }

        // Mensagem padrão
        if (!$mensagem) {
            $mensagem = "
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
  <meta charset='UTF-8'>
  <title>Lembrete de Acesso</title>
</head>
<body style='margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f7f7f9;'>
  <table align='center' cellpadding='0' cellspacing='0' width='100%'
     style='max-width:600px; background:#ffffff; border-radius:10px;
            box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;'>

    <!-- Cabeçalho -->
    <tr>
      <td style='background-color:#2f1d3d; color:#ffffff; text-align:center;
                 padding:25px 15px; font-size:26px; font-weight:bold; letter-spacing:1px;'>
        Atropos
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style='padding:30px; color:#333333;'>
        <h2 style='margin-top:0; color:#2f1d3d;'>Você ainda não entrou hoje!</h2>
        <p>Passando aqui para te lembrar de acessar o Atropos hoje 😉</p>

        <p style='margin-top:15px; color:#444; line-height:1.6;'>
          Manter a presença diária ajuda você a fortalecer seus hábitos,
          evitar atrasos e garantir que sua ofensiva continue ativa.
        </p>

        <div style='border-left:6px solid #2f1d3d; padding:15px 20px;
                    margin:25px 0; background:#f9f9fb; border-radius:6px;'>
          <p style='margin:0; font-size:18px; font-weight:bold; color:#2f1d3d;'>
            Continue evoluindo — não deixe sua sequência parar hoje!
          </p>
        </div>

        <p style='text-align:center; margin:35px 0;'>
          <a href='https://atropotasks.com.br'
             style='background:#2f1d3d; color:#ffffff; padding:14px 28px; text-decoration:none;
                    border-radius:6px; font-weight:bold;'>
             Acessar Agora
          </a>
        </p>

        <p style='color:#777;'>Pequenos hábitos constroem grandes resultados ✨</p>
        <p style='margin-top:30px;'>Com determinação,<br><strong>Equipe Atropos</strong></p>
      </td>
    </tr>

    <!-- Rodapé -->
    <tr>
      <td style='background-color:#f0f0f0; text-align:center; padding:15px;
                 font-size:12px; color:#666666;'>
        © " . date('Y') . " Atropos. Todos os direitos reservados.
      </td>
    </tr>
  </table>
</body>
</html>";
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = getenv('EMAIL_HOST') ?: 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = getenv('EMAIL_USERNAME');
            $mail->Password = getenv('EMAIL_PASS');
            $mail->SMTPSecure = 'tls';
            $mail->Port = getenv('EMAIL_PORT') ?: 587;

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->setFrom(getenv('EMAIL_USERNAME'), 'Atropos');
            $mail->addAddress($para);

            $mail->isHTML(true);
            $mail->Subject = $assunto;
            $mail->Body = $mensagem;

            $mail->send();
            echo "Email enviado para $para\n";
        } catch (Exception $e) {
            echo "Erro ao enviar email: {$mail->ErrorInfo}\n";
        }
    }
}
?>
