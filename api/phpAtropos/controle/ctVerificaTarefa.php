<?php
require_once __DIR__ . '/../models/verificaTarefa.php';
require_once __DIR__ . '/../email/sendEmailAviso.php';
require_once __DIR__ . '/../email/sendEmailOfensiva.php';

class CtVerificaTarefa
{
    private $tarefaModel;

    public function __construct($db)
    {
        $this->tarefaModel = new VerificaTarefa($db);
    }

    function verificaTarefaAtrasadas()
    {
        $tarefas = $this->tarefaModel->getTarefasVencimento();
        foreach ($tarefas as $tarefa) {
            echo ("enviandoEmail");
            $dataTarefa = date('d/m/Y', strtotime($tarefa['tb02_data']));
            sendEmailAviso::enviarAviso($tarefa['tb01_email'], $tarefa['tb02_materia'], $dataTarefa, $tarefa['tb02_cor']);
        }
    }
    function enviarEmailOfensiva()
    {
        $usuarios = $this->tarefaModel->getUsuarios();

        foreach ($usuarios as $u) {
            $email = $u['tb01_email'];
            sendEmailOfensiva::enviarOfensiva($email);
        }
    }
}
?>