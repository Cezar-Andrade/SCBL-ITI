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
            
                $_SESSION["userID"] = $data["IDUsuario"];
                $_SESSION["type"] = "admin";
                
                header("Content-Type: application/json");
                echo json_encode(["status" => "valid", "redirect" => "admin/menu"]);
            } else {
                $stmt = $mysqli->prepare("SELECT * FROM usuarios_bloqueados
                    WHERE IDUsuario = (SELECT IDUsuario FROM usuarios WHERE NombreUsuario = ?) AND FechaFin > ?");
                $stmt->bindParam(1, $username);
                $stmt->bindParam(2, $_POST["fecha"]);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    $data = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "blocked-user", "inicio" => $data["FechaInicio"], "fin" => $data["FechaFin"], "razon" => $data["Razon"]]);
                }else{
                    session_start();
                    session_regenerate_id(true);
            
                    $_SESSION["userID"] = $data["IDUsuario"];
                    $_SESSION["type"] = "user";

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "valid", "redirect" => "user/menu"]);
                }
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