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
    $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ? AND Permisos = 1");
    $stmt->bindParam(1, $id);
    $stmt->execute();

    if ($stmt->rowCount() > 0){
        $type = $_POST["type"];
        switch ($type) {
            case "editoriales":
                $autoresLeft = [];
                $autoresDeleted = [];
                $ids = json_decode($_POST["ids"]);

                try{
                    for ($i = 0; $i < sizeof($ids); $i++){
                        $stmt = $mysqli->prepare("SELECT * FROM editoriales
                            WHERE IDEditorial = ?");
                        $stmt->bindParam(1, $ids[$i]);
                        $stmt->execute();
                        $info = $stmt->fetch(PDO::FETCH_ASSOC)["Nombre"];

                        $stmt = $mysqli->prepare("SELECT * FROM editoriales ed
                            INNER JOIN titulos t ON ed.IDEditorial = t.IDEditorial
                            INNER JOIN ejemplares e ON t.IDTitulo = e.IDTitulo
                            WHERE e.EstadoDisponible = 'Prestado'
                            AND ed.IDEditorial = ?");
                        $stmt->bindParam(1, $ids[$i]);
                        $stmt->execute();

                        if ($stmt->rowCount() > 0){
                            $autoresLeft[] = $info;
                        }else{
                            try{
                                $stmt = $mysqli->prepare("DELETE FROM editoriales WHERE IDEditorial = ?");
                                $stmt->bindParam(1, $ids[$i]);
                                $stmt->execute();

                                $autoresDeleted[] = $info;
                            }catch (Exception $e){
                                $autoresLeft[] = $info;
                            }
                        }
                    }
                    
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "success", "autoresLeft" => json_encode($autoresLeft), "autoresDeleted" => json_encode($autoresDeleted)]);
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                }
            break;
            case "autores":
                $autoresLeft = [];
                $autoresDeleted = [];
                $ids = json_decode($_POST["ids"]);

                try{
                    for ($i = 0; $i < sizeof($ids); $i++){
                        $stmt = $mysqli->prepare("SELECT * FROM autores a
                            WHERE IDAutor = ?");
                        $stmt->bindParam(1, $ids[$i]);
                        $stmt->execute();
                        $info = $stmt->fetch(PDO::FETCH_ASSOC)["Nombre"];

                        $stmt = $mysqli->prepare("SELECT * FROM autores a
                            INNER JOIN titulo_autores ta ON a.IDAutor = ta.IDAutor
                            INNER JOIN ejemplares e ON ta.IDTitulo = e.IDTitulo
                            WHERE e.EstadoDisponible = 'Prestado'
                            AND a.IDAutor = ?");
                        $stmt->bindParam(1, $ids[$i]);
                        $stmt->execute();

                        if ($stmt->rowCount() > 0){
                            $autoresLeft[] = $info;
                        }else{
                            try{
                                $stmt = $mysqli->prepare("DELETE FROM autores WHERE IDAutor = ?");
                                $stmt->bindParam(1, $ids[$i]);
                                $stmt->execute();

                                $autoresDeleted[] = $info;
                            }catch (Exception $e){
                                $autoresLeft[] = $info;
                            }
                        }
                    }
                    
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "success", "autoresLeft" => json_encode($autoresLeft), "autoresDeleted" => json_encode($autoresDeleted)]);
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                }
            break;
            case "bloqueo":
                $stmt = $mysqli->prepare("DELETE FROM usuarios_bloqueados WHERE IDUsuario = ?");
                $stmt->bindParam(1, $_POST["id"]);
                $stmt->execute();

                header("Content-Type: application/json");
                echo json_encode(["status" => "success"]);
            break;
            case "user":
                $usersLeft = [];
                $usersDeleted = [];
                $admin_id = $id;
                $ids = json_decode($_POST["ids"]);
                $count = 0;
                $final_count = -1;
                foreach ($ids as $x){
                    $id = $x;

                    $stmt = $mysqli->prepare("SELECT u.IDUsuario, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                        u.Genero, a.NoControl, a.Carrera, d.NoTarjeta, d.Departamento
                        FROM usuarios u
                        LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                        LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                        WHERE u.IDUsuario = ?");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                    $info = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($id == $admin_id){ //Cannot delete yourself dummy
                        $usersLeft[] = $info;
                        $final_count = $count;
                        $count++;

                        continue;
                    }

                    $stmt = $mysqli->prepare("SELECT *
                        FROM usuarios u
                        INNER JOIN prestamos p ON u.IDUsuario = p.IDUsuario
                        LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                        WHERE u.IDUsuario = ?
                        AND (p.FechaDevuelto IS NULL
                        OR m.DeudaSaldada = 0)
                        GROUP BY u.IDUsuario");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                    if ($stmt->rowCount() > 0){
                        $usersLeft[] = $info;
                        $count++;

                        continue;
                    }

                    $usersDeleted[] = $info;
                    $stmt = $mysqli->prepare("DELETE FROM usuarios WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                }

                header("Content-Type: application/json");
                echo json_encode(["status" => "success", "usersLeft" => json_encode($usersLeft), "usersDeleted" => json_encode($usersDeleted), "selfuser" => $final_count]);
            break;
            case "title":
                $titlesLeft = [];
                $titlesDeleted = [];
                $ids = json_decode($_POST["ids"]);
                foreach ($ids as $x){
                    $id = $x;
                    $delete = true;

                    $stmt = $mysqli->prepare("SELECT b.IDTitulo, b.Titulo, GROUP_CONCAT(DISTINCT a.Nombre SEPARATOR ', ')
                        AS Autores, b.CodigoClasificacion AS Clasificacion
                        FROM titulos b
                        INNER JOIN titulo_autores ba ON b.IDTitulo = ba.IDTitulo
                        INNER JOIN autores a ON ba.IDAutor = a.IDAutor
                        WHERE b.IDTitulo = ?
                        GROUP BY b.IDTitulo");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                    $info = $stmt->fetch(PDO::FETCH_ASSOC);

                    $stmt = $mysqli->prepare("SELECT EstadoDisponible FROM ejemplares WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($result as $data){
                        if ($data["EstadoDisponible"] == "Prestado"){
                            $delete = false;
                            $titlesLeft[] = $info;

                            break;
                        }
                    }

                    if (!$delete){
                        continue;
                    }

                    $titlesDeleted[] = $info;
                    $stmt = $mysqli->prepare("DELETE FROM titulos WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();
                }

                header("Content-Type: application/json");
                echo json_encode(["status" => "success", "titlesLeft" => json_encode($titlesLeft), "titlesDeleted" => json_encode($titlesDeleted)]);
            break;
        }
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-admin"]);
    }
?>