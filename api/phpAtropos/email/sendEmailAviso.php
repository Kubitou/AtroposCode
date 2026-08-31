<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

class sendEmailAviso
{
    public static function enviarAviso($para, $tituloTarefa, $dataVencimento, $cor)
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = getenv('EMAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = getenv('EMAIL_USERNAME');
            $mail->Password = getenv('EMAIL_PASS');
            $mail->SMTPSecure = 'tls';
            $mail->Port = getenv('EMAIL_PORT');

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->setFrom(getenv('EMAIL_USERNAME'), 'Atropos');
            $mail->addAddress($para);

            $mail->isHTML(true);
            $mail->Subject = "⏰ Lembrete: sua tarefa está prestes a vencer!";

            $mail->Body = "
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
  <meta charset='UTF-8'>
  <title>Aviso de Tarefa</title>
</head>
<body style='margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f7f7f9;'>
  <table align='center' cellpadding='0' cellspacing='0' width='100%' 
         style='max-width:600px; background:#ffffff; border-radius:10px; 
                box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;'>

    <!-- Cabeçalho -->
    <tr>
      <td style='background-color:$cor; color:#ffffff; text-align:center; 
                 padding:25px 15px; font-size:26px; font-weight:bold; letter-spacing:1px;'>
        Atropos
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style='padding:30px; color:#333333;'>
        <h2 style='margin-top:0; color:$cor;'>Lembrete de Tarefa</h2>
        <p>Você possui uma tarefa prestes a vencer:</p>

        <div style='border-left:6px solid $cor; padding:15px 20px; 
                    margin:20px 0; background:#f9f9fb; border-radius:6px;'>
          <p style='margin:0; font-size:18px; font-weight:bold; color:#2f1d3d;'>$tituloTarefa</p>
          <p style='margin:5px 0 0; color:#555;'>Data de vencimento: 
            <strong style='color:$cor;'>$dataVencimento</strong>
          </p>
        </div>

        <p style='margin-top:10px;'>Mantenha seu foco — conclua essa tarefa antes do prazo e continue progredindo 💪</p>

        <p style='text-align:center; margin:35px 0;'>
          <a href='https://atropotasks.com.br' 
             style='background:$cor; color:#ffffff; padding:14px 28px; text-decoration:none; 
                    border-radius:6px; font-weight:bold;'>
             Ver Tarefas
          </a>
        </p>

        <p style='color:#777;'>Pequenas ações diárias constroem grandes resultados ✨</p>
        <p style='margin-top:30px;'>Com foco,<br><strong>Equipe Atropos</strong></p>
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

            $mail->send();
            echo "Email enviado para $para\n";
        } catch (Exception $e) {
            echo "Erro ao enviar email: {$mail->ErrorInfo}\n";
        }
    }
}
?>