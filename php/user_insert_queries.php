<?php
    require 'database.php';
    require 'randstr.php';

    session_start();

    if (isset($_SESSION["userID"])){
        $id = $_SESSION["userID"];
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-authenticated"]);
        exit();
    }

    $type = $_POST["type"];
    switch ($type) {
        case "contrasena forzada":
            $new_pass = password_hash($_POST["new_pass"], PASSWORD_BCRYPT);

            $stmt = $mysqli->prepare("UPDATE usuarios SET Contrasena = ? WHERE IDUsuario = ?");
            $stmt->bindParam(1, $new_pass);
            $stmt->bindParam(2, $id);
            $stmt->execute();
        break;
        case "delete reservacion":
            $stmt = $mysqli->prepare("DELETE FROM reservaciones WHERE IDUsuario = ? AND IDReservacion = ?");
            $stmt->bindParam(1, $id);
            $stmt->bindParam(2, $_POST["id"]);
            $stmt->execute();
        break;
        case "reservacion":
            $data = json_decode($_POST["data"], true);
            $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE IDUsuario = ? AND IDTitulo = ?");
            $stmt->bindParam(1, $id);
            $stmt->bindParam(2, $data["idt"]);
            $stmt->execute();

            if ($stmt->rowCount() > 0){
                header("Content-Type: application/json");
                echo json_encode(["status" => "already-reservated"]);
                exit();
            }else{
                $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();

                if ($stmt->rowCount() >= 3){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "insufficient-reservations"]);
                    exit();
                }else{
                    $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE EstadoDisponible = 'Disponible' AND IDTitulo = ?");
                    $stmt->bindParam(1, $data["idt"]);
                    $stmt->execute();

                    if ($stmt->rowCount() == 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "book-ran-out"]);
                        exit();
                    }

                    $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE IDReservacion = ?");
                    $stmt->bindParam(1, $idr);
                    do{
                        $idr = random_str();
                        $stmt->execute();
                    }while ($stmt->rowCount() > 0);

                    try{
                        $stmt = $mysqli->prepare("INSERT INTO reservaciones VALUES(?, ?, ?, ?, ?)");
                        $stmt->bindParam(1, $idr);
                        $stmt->bindParam(2, $id);
                        $stmt->bindParam(3, $data["idt"]);
                        $stmt->bindParam(4, $data["inicio"]);
                        $stmt->bindParam(5, $data["fin"]);
                        $stmt->execute();
                    }catch (Exception $e){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e.getMessage()]);
                        exit();
                    }
                }
            }
        break;
        case "contrasena":
            $username = $_POST["usuario"];
            $password = $_POST["pass"];

            $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
            $stmt->bindParam(1, $id);
            $stmt->execute();

            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($username == $data["NombreUsuario"] && password_verify($password, $data["Contrasena"])){
                $new_pass = password_hash($_POST["new_pass"], PASSWORD_BCRYPT);

                $stmt = $mysqli->prepare("UPDATE usuarios SET Contrasena = ? WHERE NombreUsuario = ?");
                $stmt->bindParam(1, $new_pass);
                $stmt->bindParam(2, $username);
                $stmt->execute();
            }else{
                header("Content-Type: application/json");
                echo json_encode(["status" => "not-valid"]);
                exit();
            }
        break;
    }

    header("Content-Type: application/json");
    echo json_encode(["status" => "success", "message" => json_encode([])]);
?>