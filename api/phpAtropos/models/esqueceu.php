<?php
class Esqueceu
{
    private $conn;
    private $table_name = "tb03_validacao";
    private $table_usuario = "tb01_usuario";

    public $id;
    public $token;
    public $email;
    public $validity;
    public $digitedToken;

    public $resetTokenPass;
    public $newPass;


    public function __construct($db)
    {
        $this->conn = $db;
    }

    function getId()
    {
        $query = "SELECT tb01_id FROM {$this->table_usuario} WHERE tb01_email=:email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email, PDO::PARAM_STR);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception("Email não encontrado no banco.");
        }

        $this->id = $row["tb01_id"];
        $this->create();
    }
    function create()
    {
        $query = "INSERT INTO {$this->table_name} (tb03_id_usu, tb03_token, tb03_validade) VALUES (:id, :token, :date)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmt->bindParam(":token", $this->token, PDO::PARAM_INT);
        $stmt->bindParam(":date", $this->validity);
        $stmt->execute();
    }
    function validation()
    {
        $query = "SELECT tb03_id_usu FROM {$this->table_name} WHERE tb03_token =:token AND tb03_validade >= SUBDATE(NOW(), INTERVAL 30 MINUTE)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $this->digitedToken, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("token errado ou token expirado");
        }
        $resetToken = bin2hex(random_bytes(16));

        $update = "UPDATE {$this->table_name} SET tb03_token_reset = :resetToken WHERE tb03_token = :token";
        $stmtUp = $this->conn->prepare($update);
        $stmtUp->bindParam(":resetToken", $resetToken, PDO::PARAM_STR);
        $stmtUp->bindParam(":token", $this->digitedToken);
        $stmtUp->execute();

        return ["token" => $resetToken];
    }

    function updatePass()
    {
        $newHash = password_hash($this->newPass, PASSWORD_DEFAULT);
        $queryFind = "SELECT tb03_id_usu FROM {$this->table_name} WHERE tb03_token_reset = :token";
        $stmtFind = $this->conn->prepare($queryFind);
        $stmtFind->bindParam(":token", $this->resetTokenPass, PDO::PARAM_STR);
        $stmtFind->execute();
        $row = $stmtFind->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->id = $row['tb03_id_usu'];

        $query = "UPDATE {$this->table_usuario} JOIN {$this->table_name} ON tb01_id = tb03_id_usu SET tb01_senha = :newPass WHERE tb03_token_reset = :tokenResetPass;";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":newPass", $newHash, PDO::PARAM_STR);
        $stmt->bindParam(":tokenResetPass", $this->resetTokenPass, PDO::PARAM_STR);

        $updateSuccess = $stmt->execute();

        if ($updateSuccess) {
            $delete = "DELETE FROM {$this->table_name} WHERE tb03_id_usu = :id_usu;";
            $stmtDel = $this->conn->prepare($delete);
            $stmtDel->bindParam(":id_usu", $this->id, PDO::PARAM_INT);
            $deleteSuccess = $stmtDel->execute();
            return $deleteSuccess;
        }

        return false;
    }
}
?>