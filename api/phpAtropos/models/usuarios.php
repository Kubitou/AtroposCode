<?php
class Usuario
{
    private $conn;
    private $table_name = "tb01_usuario";
    private $table_tasks = "tb02_tarefa";

    private $table_validation = "tb03_validacao";

    public $id;
    public $name;
    public $email;
    public $senha;
    public $newPass;
    public $oldPass;


    public function __construct($db)
    {
        $this->conn = $db;
    }

    function read()
    {
        $query = "SELECT tb01_id, tb01_nome, tb01_email, tb01_pontos, tb01_ofensiva FROM $this->table_name ORDER BY tb01_nome ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }


    function getUserById($id)
    {
        $query = "SELECT 
                tb01_id AS id, 
                tb01_nome AS nome, 
                tb01_email AS email, 
                tb01_pontos AS pontos, 
                tb01_ofensiva AS ofensiva, 
                tb01_foto AS foto, 
                tb01_data_veri AS dataVerificacao
              FROM {$this->table_name} 
              WHERE tb01_id = :id 
              LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $hoje = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
            $dataBanco = !empty($row['dataVerificacao'])
                ? new DateTime($row['dataVerificacao'], new DateTimeZone('America/Sao_Paulo'))
                : null;

            if (!$dataBanco || $hoje->format('Y-m-d') > $dataBanco->format('Y-m-d')) {
                $update = $this->conn->prepare("
                UPDATE {$this->table_name} 
                SET tb01_data_veri = :hoje 
                WHERE tb01_id = :id
            ");
                $update->execute([
                    ':hoje' => $hoje->format('Y-m-d H:i:s'),
                    ':id' => $row['id']
                ]);
                $row['dataVerificacao'] = $hoje->format('Y-m-d H:i:s');
                $row['novoDia'] = true;
                $row['ofensiva'] = $this->calculaOfensiva($hoje, $dataBanco, $row['id']);
            } else {
                $row['novoDia'] = false;
            }

            return $row;
        }

        return false;
    }


    function calculaOfensiva($hoje, $dataBanco, $id)
    {
        if (!$dataBanco)
            return;

        $diff = $hoje->diff($dataBanco)->days;

        if ($diff >= 0 && $diff < 2) {
            $query = "SELECT tb01_ofensiva FROM {$this->table_name} WHERE tb01_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $novaOfensiva = $row['tb01_ofensiva'] + 1;

            $update = $this->conn->prepare("
            UPDATE {$this->table_name}
            SET tb01_ofensiva = :ofensiva
            WHERE tb01_id = :id
        ");
            $update->execute([
                ":ofensiva" => $novaOfensiva,
                ":id" => $id,
            ]);

            return $novaOfensiva;
        }

        if ($diff >= 2) {
            $update = $this->conn->prepare("
            UPDATE {$this->table_name}
            SET tb01_ofensiva = 1
            WHERE tb01_id = :id
        ");
            $update->execute([":id" => $id]);
            return "perdeu";
        }
    }

    function login($email, $senha)
    {
        $query = "SELECT tb01_id, tb01_senha FROM {$this->table_name} WHERE tb01_email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($senha, $row['tb01_senha'])) {
                return $row['tb01_id'];
            }
        }

        return false;
    }


    function emailExist($email, $id = null)
    {
        $query = "SELECT tb01_id FROM $this->table_name WHERE tb01_email = :email";

        if ($id !== null) {
            $query .= " AND tb01_id = :id";
        }
        $query .= " LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        if ($id !== null) {
            $stmt->bindValue(':id', (int) $id, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
    function create()
    {
        if ($this->emailExist($this->email)) {
            return "duplicate";
        }

        $retorno = false;
        $query = "INSERT INTO $this->table_name (tb01_nome, tb01_email, tb01_senha, tb01_pontos, tb01_ofensiva, tb01_data_veri) VALUES (:nome, :email, :senha, 0, 1, :dataVeri)";
        $stmt = $this->conn->prepare($query);

        $this->senha = password_hash($this->senha, PASSWORD_BCRYPT);

        $stmt->bindParam(":nome", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":senha", $this->senha);
        $dataVeri = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');
        $stmt->bindParam(":dataVeri", $dataVeri);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            $retorno = true;
        }
        return $retorno;

    }

    function update()
    {
        if($this->email){
            $this->id = intval($this->id);
            
            $queryCurrent = "SELECT tb01_email FROM {$this->table_name} WHERE tb01_id = :id";
            $stmtCurrent = $this->conn->prepare($queryCurrent);
            $stmtCurrent->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmtCurrent->execute();
            $currentEmail = $stmtCurrent->fetchColumn();
            
            $this->email = trim(strtolower($this->email));
            $currentEmail = trim(strtolower($currentEmail));
            
            if ($currentEmail === $this->email) {
                $queryVerifica = "SELECT tb01_id FROM {$this->table_name} 
                          WHERE tb01_email = :email 
                          AND tb01_id = :id 
                          LIMIT 1";
                $stmtVerifica = $this->conn->prepare($queryVerifica);
                $stmtVerifica->bindParam(':email', $this->email);
                $stmtVerifica->bindParam(':id', $this->id, PDO::PARAM_INT);
                $stmtVerifica->execute();
                if ($stmtVerifica->rowCount() > 0) {
                    return "duplicate";
                }
            }else{
                $queryEmail = "UPDATE {$this->table_name} SET tb01_email = :email WHERE tb01_id = :id";
                $stmtEmail = $this->conn->prepare($queryEmail);
                $stmtEmail->bindParam(":id", $this->id, PDO::PARAM_INT);
                $stmtEmail->bindParam(":email", $this->email);
                return $stmtEmail->execute();
            }
        }else{
            $query = "UPDATE {$this->table_name} SET tb01_nome = :nome WHERE tb01_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
            $stmt->bindParam(":nome", $this->name);
            return $stmt->execute();
        }

       
    }

    function changePassword()
    {
        if ($this->newPass && $this->oldPass) {
            $selectPass = "SELECT tb01_senha FROM {$this->table_name} WHERE tb01_id = :id";
            $stmtPass = $this->conn->prepare($selectPass);
            $stmtPass->bindParam(":id", $this->id, PDO::PARAM_INT);
            $stmtPass->execute();

            $row = $stmtPass->fetch(PDO::FETCH_ASSOC);
            if (!$row)
                return "not_found";

            if (password_verify($this->oldPass, $row["tb01_senha"])) {
                $newHash = password_hash($this->newPass, PASSWORD_DEFAULT);
                $queryHash = "UPDATE {$this->table_name} SET tb01_senha = :newPassword WHERE tb01_id = :id";
                $stmtHash = $this->conn->prepare($queryHash);
                $stmtHash->bindParam(":id", $this->id, PDO::PARAM_INT);
                $stmtHash->bindParam(":newPassword", $newHash);
                return $stmtHash->execute();
            }
            return "incorrect_password";
        }
    }

    function delete()
    {
        $queryImg = "SELECT tb01_foto FROM $this->table_name WHERE tb01_id=:id";
        $stmtImg = $this->conn->prepare($queryImg);
        $stmtImg->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmtImg->execute();
        $row = $stmtImg->fetch(PDO::FETCH_ASSOC);

        if ($row && !empty($row['tb01_foto'])) {
            $filePath = "../imagens/" . $row['tb01_foto'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $queryTasks = "DELETE FROM $this->table_tasks WHERE tb02_id_usu=:id";
        $stmtTasks = $this->conn->prepare($queryTasks);
        $stmtTasks->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmtTasks->execute();

        $queryValidation = "DELETE FROM $this->table_validation WHERE tb03_id_usu=:id";
        $stmtValidation = $this->conn->prepare($queryValidation);
        $stmtValidation->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmtValidation->execute();

        $queryUser = "DELETE FROM $this->table_name WHERE tb01_id=:id";
        $stmtUser = $this->conn->prepare($queryUser);
        $stmtUser->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmtUser->execute();

        return $stmtUser->rowCount() > 0;
    }
    function discountUserPoints($id, $points)
    {
        $selectPoints = "SELECT tb01_pontos FROM {$this->table_name} WHERE tb01_id = :id";
        $stmtPoints = $this->conn->prepare($selectPoints);
        $stmtPoints->bindParam(":id", $id, PDO::PARAM_INT);
        $stmtPoints->execute();
        $dbPoints = $stmtPoints->fetch(PDO::FETCH_ASSOC);

        $totalPoints = $dbPoints["tb01_pontos"] - $points;

        $query = "UPDATE {$this->table_name} SET tb01_pontos = :pontos WHERE tb01_id = :id ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":pontos", $totalPoints);
        $stmt->execute();
        return $totalPoints;
    }
}
?>