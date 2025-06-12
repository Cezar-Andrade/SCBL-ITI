<?php
    require 'database.php';

    date_default_timezone_set("America/Mexico_City");

    $username = $_POST["username"];
    $password = $_POST["pass"];

    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
    $stmt->bindParam(1, $username);
    $stmt->execute();
        
    if ($stmt->rowCount() > 0){
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (password_verify($password, $data["Contrasena"])){
            $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = (SELECT IDUsuario FROM usuarios WHERE NombreUsuario = ?)");
            $stmt->bindParam(1, $username);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                session_start();
                session_regenerate_id(true);
                
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $_SESSION["userID"] = $data["IDUsuario"];
                $_SESSION["type"] = $data["Permisos"];
                
                header("Content-Type: application/json");
                echo json_encode(["status" => "valid", "redirect" => "admin/menu"]);
            } else {
                header("Content-Type: application/json");
                echo json_encode(["status" => "not-allowed"]);
            }
        }else{
            header("Content-Type: application/json");
            echo json_encode(["status" => "not-valid"]);
        }
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-does-not-exist"]);
    }
?>