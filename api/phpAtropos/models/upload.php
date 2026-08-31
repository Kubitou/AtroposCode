<?php

class Upload {
    private $conn;
    private $table_name = "tb01_usuario";

    public $nomeArquivo;
    public $id;

    public function __construct($db){
        $this->conn = $db;
    }

    function saveFilePath() {
    $query = "UPDATE {$this->table_name} SET tb01_foto = :foto WHERE tb01_id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":foto", $this->nomeArquivo);
    $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
    return $stmt->execute();   
    }

}

?>