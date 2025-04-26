<?php
    require "database.php";
    //require "php_spread_sheet_import.php";

    //use PhpOffice\PhpSpreadsheet\IOFactory;

    //$inputFileName = '../includes/book_database.xlsx';

    //$mysqli->beginTransaction();
    
    try {
        $data = "2025-03-26";
        $array = [];
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM usuarios_bloqueados WHERE ? > FechaFin");
        $stmt->bindParam(1, $data);
        $stmt->execute();
        $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM prestamos WHERE ? > FechaLimite AND FechaDevuelto IS NULL");
        $stmt->bindParam(1, $data);
        $stmt->execute();
        $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM reservaciones WHERE ? > FechaExpiracion");
        $stmt->bindParam(1, $data);
        $stmt->execute();
        $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
        $stmt = $mysqli->prepare("SELECT COUNT(*) FROM multas WHERE DeudaSaldada = 0");
        $stmt->execute();
        $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
        echo $array[0] . " " . $array[1] . " " . $array[2] . " " . $array[3];
    } catch (Exception $e) {
        echo "Failed to import data: " . $e->getMessage();
    }
?>