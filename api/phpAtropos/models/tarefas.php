<?php
class Tarefa {
    private $conn;
    private $table_name = "tb02_tarefa";
    private $table_usu = "tb01_usuario";

    public $id;
    public $materia;
    public $importancia;
    public $cor;
    public $descricao;
    public $dataTarefa;
    public $carrossel;
    public $timeStamp;
    public $concluido;
    public $id_usu;
    public $points;

    public function __construct($db){
        $this->conn = $db;
    }

    function read() {
        $query = "SELECT * FROM $this->table_name WHERE tb02_id_usu = :id_usu";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_usu', $this->id_usu);
        $stmt->execute();
        if($stmt->rowCount() > 0){
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $row;
        }
        return [];
    }
    function create(){
        $retorno = false;
        $query = "INSERT INTO $this->table_name 
        (tb02_materia, 
        tb02_importancia, 
        tb02_cor, 
        tb02_descricao, 
        tb02_data, 
        tb02_carrossel, 
        tb02_timeStamp, 
        tb02_concluido,
        tb02_id_usu) VALUES (
        :materia,
        :importancia,
        :cor, 
        :descricao, 
        :dataTarefa, 
        :carrossel, 
        :timeStamp,
        :concluido,
        :id_usu)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":materia", $this->materia);
        $stmt->bindParam(":importancia", $this->importancia);
        $stmt->bindParam(":cor", $this->cor);
        $stmt->bindParam(":descricao", $this->descricao);
        $stmt->bindParam(":dataTarefa", $this->dataTarefa);
        $stmt->bindParam(":carrossel", $this->carrossel);
        $stmt->bindParam(":timeStamp", $this->timeStamp);
        $stmt->bindParam(":concluido", $this->concluido);
        $stmt->bindParam(":id_usu", $this->id_usu);
        if($stmt->execute()){
            $this->id = $this->conn->lastInsertId();
            $retorno = true;
        }
        return $retorno;
    }

    function update(){
        // Ownership reforçado na própria query: só atualiza se a tarefa (id)
        // também pertencer ao usuário informado em id_usu. Se outro usuário
        // tentar editar essa tarefa, 0 linhas são afetadas.
        $query = "UPDATE $this->table_name SET 
        tb02_materia=:materia, 
        tb02_importancia=:importancia, 
        tb02_cor=:cor, 
        tb02_descricao=:descricao, 
        tb02_data=:dataTarefa,
        tb02_carrossel=:carrossel,
        tb02_timeStamp=:timeStamp
        WHERE
        tb02_id=:id AND tb02_id_usu=:id_usu
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":materia", $this->materia);
        $stmt->bindParam(":importancia", $this->importancia);
        $stmt->bindParam(":cor", $this->cor);
        $stmt->bindParam(":descricao", $this->descricao);
        $stmt->bindParam(":dataTarefa", $this->dataTarefa);
        $stmt->bindParam(":carrossel", $this->carrossel);
        $stmt->bindParam(":timeStamp", $this->timeStamp);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":id_usu", $this->id_usu);
        if(!$stmt->execute()){
            print_r($stmt->errorInfo());
            return false;
        }
        return $stmt->rowCount() > 0;
    }

    function delete(){
        // Idem: só apaga se a tarefa pertencer ao usuário informado em id_usu.
        $query = "DELETE FROM $this->table_name WHERE tb02_id=:id AND tb02_id_usu=:id_usu";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":id_usu", $this->id_usu);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    function conclude(){
        // Ownership: a tarefa (id) precisa pertencer ao usuário (id_usu) que está
        // concluindo. Antes disso não era checado -- um usuário podia mandar o
        // próprio id_usu (pra ganhar os pontos) junto com o id de uma tarefa de
        // outra pessoa, "concluindo" a tarefa alheia e roubando os pontos dela.
        $check = "SELECT tb02_concluido FROM {$this->table_name} WHERE tb02_id = :id AND tb02_id_usu = :idUsu;";
        $stmtCheck = $this->conn->prepare($check);
        $stmtCheck->bindParam(":id", $this->id);
        $stmtCheck->bindParam(":idUsu", $this->id_usu);
        $stmtCheck->execute();
        $rowCheck = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$rowCheck || $rowCheck["tb02_concluido"] == 1) {
            return false;
        }

        $selectUsu = "SELECT tb01_pontos FROM {$this->table_usu} WHERE tb01_id = :idUsu;";
        $stmtUsu = $this->conn->prepare($selectUsu);
        $stmtUsu->bindParam(":idUsu", $this->id_usu);
        $stmtUsu->execute();

        $rowUsu = $stmtUsu->fetch(PDO::FETCH_ASSOC);

        $total = $this->points + $rowUsu["tb01_pontos"];

        $updatePoints = "UPDATE {$this->table_usu} SET tb01_pontos = :total WHERE tb01_id = :idUsu;";
        $stmtUp = $this->conn->prepare($updatePoints);
        $stmtUp->bindParam(":total", $total);
        $stmtUp->bindParam(":idUsu", $this->id_usu);
        $stmtUp->execute();

        $updateConclude = "UPDATE {$this->table_name} SET tb02_concluido = 1 WHERE tb02_id = :id AND tb02_id_usu = :idUsu AND tb02_concluido = 0;";
        $stmtUpCon = $this->conn->prepare($updateConclude);
        $stmtUpCon->bindParam(":id", $this->id);
        $stmtUpCon->bindParam(":idUsu", $this->id_usu);
        $stmtUpCon->execute();

        $selectPoints = "SELECT tb01_pontos FROM {$this->table_usu} WHERE tb01_id = :idUsu;"; 
        $stmtPoints = $this->conn->prepare($selectPoints);
        $stmtPoints->bindParam(":idUsu", $this->id_usu);
        $stmtPoints->execute();

        $rowPoint = $stmtPoints->fetch(PDO::FETCH_ASSOC);
        return $rowPoint["tb01_pontos"];
    }
    function discount(){
        // Ownership: só desconta a importância da tarefa se ela pertencer
        // ao usuário informado em id_usu.
        $query = "UPDATE {$this->table_name} SET tb02_importancia = 0 WHERE tb02_id = :id AND tb02_id_usu = :id_usu;";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":id_usu", $this->id_usu);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
            
?>