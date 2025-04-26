<?php
    require 'database.php';

    date_default_timezone_set("America/Mexico_City");

    session_start();
    
    if (isset($_SESSION["userID"])){
        $id = $_SESSION["userID"];
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "not-valid"]);
        exit();
    }
    
    $type = $_SESSION["type"];
    if ($type === "user"){
        $date = new DateTime();
        $fecha = $date->format("Y-m-d");
        $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = :id
            AND IDUsuario NOT IN (SELECT IDUsuario FROM administradores WHERE IDUsuario = :id)
            AND IDUsuario NOT IN (SELECT IDUsuario FROM usuarios_bloqueados WHERE IDUsuario = :id AND FechaFin >= :fecha)");
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":fecha", $fecha);
    }else{
        $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ?");
        $stmt->bindParam(1, $id);
    }
    $stmt->execute();

    header("Content-Type: application/json");
    if ($stmt->rowCount() > 0){
        $stmt = $mysqli->prepare("SELECT u.Contrasena, a.NoControl, d.NoTarjeta
            FROM usuarios u
            LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
            LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
            WHERE u.IDUsuario = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data["NoControl"] == null){
            $numero = $data["NoTarjeta"];
        }else{
            $numero = $data["NoControl"];
        }

        if (password_verify($numero, $data["Contrasena"])){
            echo json_encode(["status" => "change-pass", "numero" => $numero]);
        }else{
            echo json_encode(["status" => "valid"]);
        }
    }else{
        echo json_encode(["status" => "not-valid"]);
    }
?>