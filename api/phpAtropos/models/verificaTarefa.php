<?php
class VerificaTarefa{
    private $conn;
    private $table_name = "tb02_tarefa";
    private $table_user = "tb01_usuario";
    public function __construct($db){
        $this->conn = $db;
    }
    function getTarefasVencimento(){
        $query = "SELECT * FROM {$this->table_name} 
        JOIN {$this->table_user} ON tb02_id_usu = tb01_id
        WHERE  tb02_data = DATE(CONVERT_TZ(NOW(), '+00:00', '-03:00') + INTERVAL 1 DAY) AND tb02_concluido != 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    function getUsuarios()
    {
        $query = "SELECT tb01_email, tb01_nome FROM {$this->table_user}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>