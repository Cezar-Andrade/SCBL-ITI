<?php
    try {
        $mysqli = new PDO('mysql:host=localhost;dbname=centro_de_informacion', "root", "", array(
            PDO::ATTR_PERSISTENT => true
        ));
    } catch (PDOException $e) {
        header("Content-Type: application/json");
        echo json_encode(["status" => "error", "message" => "Fallo al conectar a la base de datos: (" . $e . ") "]);
        exit();
    }
?>