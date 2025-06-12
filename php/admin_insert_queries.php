<?php
    require 'database.php';
    require 'randstr.php';
    require "php_spread_sheet_import.php";
    
    use PhpOffice\PhpSpreadsheet\IOFactory;

    session_start();

    if (isset($_SESSION["userID"])){
        $id = $_SESSION["userID"];
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-authenticated"]);
        exit();
    }
    $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ?");
    $stmt->bindParam(1, $id);
    $stmt->execute();

    if ($stmt->rowCount() > 0){
        $type = $_POST["type"];
        switch ($type) {
            case "update editoriales":
                $ids = json_decode($_POST["ids"]);
                $names = json_decode($_POST["names"]);
                $places = json_decode($_POST["places"]);

                $mysqli->beginTransaction();

                $stmt = $mysqli->prepare("UPDATE editoriales SET Nombre = ?, Ubicacion = ? WHERE IDEditorial = ?");
                try{
                    for ($i = 0; $i < sizeof($ids); $i++){
                        $stmt->bindParam(1, $names[$i]);
                        $stmt->bindParam(2, $places[$i]);
                        $stmt->bindParam(3, $ids[$i]);
                        $stmt->execute();
                    }

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "update autores":
                $ids = json_decode($_POST["ids"]);
                $names = json_decode($_POST["names"]);

                $mysqli->beginTransaction();

                $stmt = $mysqli->prepare("UPDATE autores SET Nombre = ? WHERE IDAutor = ?");
                try{
                    for ($i = 0; $i < sizeof($ids); $i++){
                        $stmt->bindParam(1, $names[$i]);
                        $stmt->bindParam(2, $ids[$i]);
                        $stmt->execute();
                    }

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "contrasena forzada":
                $new_pass = password_hash($_POST["new_pass"], PASSWORD_BCRYPT);

                $stmt = $mysqli->prepare("UPDATE usuarios SET Contrasena = ? WHERE IDUsuario = ?");
                $stmt->bindParam(1, $new_pass);
                $stmt->bindParam(2, $id);
                $stmt->execute();
            break;
            case "activate_user":
                try{
                    $stmt = $mysqli->prepare("UPDATE usuarios SET FechaInscrito = NOW() WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $_POST["id"]);
                    $stmt->execute();
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "remove admin":
                $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ? AND Permisos = 1");
                $stmt->bindParam(1, $id);
                $stmt->execute();

                if ($stmt->rowCount() == 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "user-not-admin"]);
                    exit();
                }

                try{
                    $stmt = $mysqli->prepare("DELETE FROM administradores WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $_POST["id"]);
                    $stmt->execute();
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "asign admin":
                $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ? AND Permisos = 1");
                $stmt->bindParam(1, $id);
                $stmt->execute();

                if ($stmt->rowCount() == 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "user-not-admin"]);
                    exit();
                }

                try{
                    $stmt = $mysqli->prepare("INSERT INTO administradores VALUES(?, 0)");
                    $stmt->bindParam(1, $_POST["id"]);
                    $stmt->execute();
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "update titulo":
                $data = json_decode($_POST["data"], true);
                $id = $data["id"];
                $editorial = $data["editorial"];
                $tomoexiste = false;
                $volumenexiste = false;
                $editorialexiste = false;

                $stmt = $mysqli->prepare("SELECT * FROM tomos WHERE IDTitulo = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                if ($stmt->rowCount() > 0){
                    $tomoexiste = true;
                }

                $stmt = $mysqli->prepare("SELECT * FROM volumenes WHERE IDTitulo = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                if ($stmt->rowCount() > 0){
                    $volumenexiste = true;
                }

                $mysqli->beginTransaction();

                try{
                    $titulo = $data["titulo"];
                    $ISBN = $data["ISBN"];
                    $codigo = $data["codigo"];
                    $anio = $data["anio"];
                    $idioma = $data["idioma"];
                    $edicion = $data["edicion"];

                    $stmt = $mysqli->prepare("UPDATE titulos SET IDEditorial = ?, Titulo = ?, ISBN = ?, CodigoClasificacion = ?, AnioPublicacion = ?, Idioma = ?, Edicion = ? WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $editorial);
                    $stmt->bindParam(2, $titulo);
                    $stmt->bindParam(3, $ISBN);
                    $stmt->bindParam(4, $codigo);
                    $stmt->bindParam(5, $anio);
                    $stmt->bindParam(6, $idioma);
                    $stmt->bindParam(7, $edicion);
                    $stmt->bindParam(8, $id);
                    $stmt->execute();

                    $stmt = $mysqli->prepare("DELETE FROM titulo_autores WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $id);
                    $stmt->execute();

                    $autores = $data["autores"];
                    $stmt = $mysqli->prepare("INSERT INTO titulo_autores VALUES(?, ?)");
                    $stmt->bindParam(1, $id);
                    $stmt->bindParam(2, $autorID);
                    foreach ($autores as $x){
                        $autorID = $x;
                        $stmt->execute();
                    }

                    $tomo = $data["notomo"];
                    $tomo_nombre = $data["nombretomo"];
                    if (!is_null($tomo) || !is_null($tomo_nombre)){
                        if ($tomoexiste){
                            $stmt = $mysqli->prepare("UPDATE tomos SET NoTomo = ?, Nombre = ? WHERE IDTitulo = ?");
                            $stmt->bindParam(1, $tomo);
                            $stmt->bindParam(2, $tomo_nombre);
                            $stmt->bindParam(3, $id);
                        }else{
                            $stmt = $mysqli->prepare("INSERT INTO tomos VALUES(?, ?, ?)");
                            $stmt->bindParam(1, $id);
                            $stmt->bindParam(2, $tomo);
                            $stmt->bindParam(3, $tomo_nombre);
                        }
                        $stmt->execute();
                    }

                    $volumen = $data["novolumen"];
                    $volumen_nombre = $data["nombrevolumen"];
                    if (!is_null($volumen) || !is_null($volumen_nombre)){
                        if ($volumenexiste){
                            $stmt = $mysqli->prepare("UPDATE volumenes SET NoVolumen = ?, Nombre = ? WHERE IDTitulo = ?");
                            $stmt->bindParam(1, $volumen);
                            $stmt->bindParam(2, $volumen_nombre);
                            $stmt->bindParam(3, $id);
                        }else{
                            $stmt = $mysqli->prepare("INSERT INTO volumenes VALUES(?, ?, ?)");
                            $stmt->bindParam(1, $id);
                            $stmt->bindParam(2, $volumen);
                            $stmt->bindParam(3, $volumen_nombre);
                        }
                        $stmt->execute();
                    }

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "update expiracion":
                $stmt = $mysqli->prepare("SELECT IDTitulo FROM reservaciones WHERE IDReservacion = ?");
                $stmt->bindParam(1, $_POST["IDReservacion"]);
                $stmt->execute();

                $idTitulo = $stmt->fetch(PDO::FETCH_ASSOC)["IDTitulo"];

                $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE EstadoDisponible = 'Disponible' AND IDTitulo = ?");
                $stmt->bindParam(1, $idTitulo);
                $stmt->execute();

                $ejemplares = $stmt->rowCount();

                $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE IDTitulo = ? AND FechaExpiracion > ? AND NOT IDReservacion = ?");
                $stmt->bindParam(1, $idTitulo);
                $stmt->bindParam(2, $_POST["fechaActual"]);
                $stmt->bindParam(3, $_POST["IDReservacion"]);
                $stmt->execute();

                if ($stmt->rowCount() >= $ejemplares){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "insufficient-books"]);
                    exit();
                }

                try{
                    $stmt = $mysqli->prepare("UPDATE reservaciones SET FechaExpiracion = ? WHERE IDReservacion = ?");
                    $stmt->bindParam(1, $_POST["fecha"]);
                    $stmt->bindParam(2, $_POST["IDReservacion"]);
                    $stmt->execute();
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "saldar multa":
                $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ? AND Permisos = 1");
                $stmt->bindParam(1, $id);
                $stmt->execute();

                if ($stmt->rowCount() == 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "user-not-admin"]);
                    exit();
                }

                $mysqli->beginTransaction();

                try{
                    $stmt = $mysqli->prepare("UPDATE multas SET DeudaSaldada = 1 WHERE IDPrestamo = ?");
                    $stmt->bindParam(1, $_POST["IDPrestamo"]);
                    $stmt->execute();

                    $stmt = $mysqli->prepare("UPDATE usuarios SET PrestamosDisponibles = PrestamosDisponibles + 1 WHERE IDUsuario = (SELECT IDUsuario FROM prestamos WHERE IDPrestamo = ?) AND PrestamosDisponibles < 2");
                    $stmt->bindParam(1, $_POST["IDPrestamo"]);
                    $stmt->execute();

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "multa":
                $data = json_decode($_POST["data"], true);

                $mysqli->beginTransaction();
                
                try{
                    if ($data["update"]){
                        $stmt = $mysqli->prepare("UPDATE prestamos SET FechaDevuelto = ? WHERE IDPrestamo = ?");
                        $stmt->bindParam(1, $data["fecha"]);
                        $stmt->bindParam(2, $data["id"]);
                        $stmt->execute();

                        $stmt = $mysqli->prepare("UPDATE ejemplares SET EstadoDisponible = 'Disponible' WHERE Folio = (SELECT Folio FROM prestamos WHERE IDPrestamo = ?)");
                        $stmt->bindParam(1, $data["id"]);
                        $stmt->execute();

                        if ($data["domicilio"] == 1){
                            $stmt = $mysqli->prepare("UPDATE usuarios SET PrestamosDisponibles = PrestamosDisponibles + 1 WHERE IDUsuario = (SELECT IDUsuario FROM prestamos WHERE IDPrestamo = ?) AND PrestamosDisponibles < 2");
                            $stmt->bindParam(1, $data["id"]);
                            $stmt->execute();
                        }
                    }

                    $stmt = $mysqli->prepare("INSERT INTO multas VALUES(?, ?, ?, ?, ?)");
                    $stmt->bindParam(1, $data["id"]);
                    $stmt->bindParam(2, $data["razon"]);
                    $stmt->bindParam(3, $data["sancion"]);
                    $stmt->bindParam(4, $data["fecha"]);
                    $stmt->bindParam(5, $data["deuda"]);
                    $stmt->execute();

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "prestamo devuelto":
                $mysqli->beginTransaction();

                try{
                    $stmt = $mysqli->prepare("UPDATE prestamos SET FechaDevuelto = ? WHERE IDPrestamo = ?");
                    $stmt->bindParam(1, $_POST["fecha"]);
                    $stmt->bindParam(2, $_POST["id"]);
                    $stmt->execute();

                    $stmt = $mysqli->prepare("UPDATE ejemplares SET EstadoDisponible = 'Disponible' WHERE Folio = (SELECT Folio FROM prestamos WHERE IDPrestamo = ?)");
                    $stmt->bindParam(1, $_POST["id"]);
                    $stmt->execute();

                    if ($_POST["domicilio"] == 1){
                        $stmt = $mysqli->prepare("UPDATE usuarios SET PrestamosDisponibles = PrestamosDisponibles + 1 WHERE IDUsuario = (SELECT IDUsuario FROM prestamos WHERE IDPrestamo = ?) AND PrestamosDisponibles < 2");
                        $stmt->bindParam(1, $_POST["id"]);
                        $stmt->execute();
                    }

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "contrasena restaurar":
                $data = json_decode($_POST["data"], true);
                $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
                $stmt->bindParam(1, $data["usuario"]);
                $stmt->execute();
                    
                if ($stmt->rowCount() > 0){
                    $data2 = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (password_verify($data["pass"], $data2["Contrasena"])){
                        if ($data["estudiante"]){
                            $stmt = $mysqli->prepare("SELECT NoControl AS Numero FROM alumnos WHERE IDUsuario = ?");
                        }else{
                            $stmt = $mysqli->prepare("SELECT NoTarjeta AS Numero FROM docentes WHERE IDUsuario = ?");
                        }
                        $stmt->bindParam(1, $data["id"]);
                        $stmt->execute();
                        $data2 = $stmt->fetch(PDO::FETCH_ASSOC);
                        $pass = password_hash($data2["Numero"], PASSWORD_BCRYPT);

                        $stmt = $mysqli->prepare("UPDATE usuarios SET Contrasena = ? WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $pass);
                        $stmt->bindParam(2, $data["id"]);
                        $stmt->execute();
                    }else{
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "invalid-credentials", "user" => $data["usuario"], "pass" => $data["pass"]]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "inexistent-user", "user" => $data["usuario"], "pass" => $data["pass"]]);
                    exit();
                }
            break;
            case "bloqueo":
                $data = json_decode($_POST["data"], true);

                $stmt = $mysqli->prepare("SELECT * FROM usuarios_bloqueados WHERE IDUsuario = ?");
                $stmt->bindParam(1, $data["id"]);
                $stmt->execute();

                try{
                    if ($stmt->rowCount() > 0){
                        $stmt = $mysqli->prepare("UPDATE usuarios_bloqueados SET Razon = ?, FechaInicio = ?, FechaFin = ? WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $data["razon"]);
                        $stmt->bindParam(2, $data["inicio"]);
                        $stmt->bindParam(3, $data["fin"]);
                        $stmt->bindParam(4, $data["id"]);
                        $stmt->execute();
                    }else{
                        $stmt = $mysqli->prepare("INSERT INTO usuarios_bloqueados VALUES(?, ?, ?, ?)");
                        $stmt->bindParam(1, $data["id"]);
                        $stmt->bindParam(2, $data["razon"]);
                        $stmt->bindParam(3, $data["inicio"]);
                        $stmt->bindParam(4, $data["fin"]);
                        $stmt->execute();
                    }
                }catch (Exception $e){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "update self admin":
                $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();

                $data = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($_POST["username"] == $data["NombreUsuario"] && password_verify($_POST["pass"], $data["Contrasena"])){
                    $data = json_decode($_POST["data"], true);
                    
                    $mysqli->beginTransaction();

                    try{
                        $stmt = $mysqli->prepare("UPDATE usuarios SET Nombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?, NombreUsuario = ?, Genero = ? WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $data["nombre"]);
                        $stmt->bindParam(2, $data["apeP"]);
                        $stmt->bindParam(3, $data["apeM"]);
                        $stmt->bindParam(4, $data["usuario"]);
                        $stmt->bindParam(5, $data["genero"]);
                        $stmt->bindParam(6, $id);
                        $stmt->execute();

                        if ($data["estudiante"]){
                            $stmt = $mysqli->prepare("UPDATE alumnos SET NoControl = ?, Carrera = ?, Semestre = ? WHERE IDUsuario = ?");
                            $stmt->bindParam(1, $data["numero"]);
                            $stmt->bindParam(2, $data["carrera"]);
                            $stmt->bindParam(3, $data["semestre"]);
                            $stmt->bindParam(4, $id);
                            $stmt->execute();
                        }else{
                            $stmt = $mysqli->prepare("UPDATE docentes SET NoTarjeta = ?, Departamento = ? WHERE IDUsuario = ?");
                            $stmt->bindParam(1, $data["numero"]);
                            $stmt->bindParam(2, $data["carrera"]);
                            $stmt->bindParam(3, $id);
                            $stmt->execute();
                        }

                        $mysqli->commit();
                    }catch (Exception $e){
                        $mysqli->rollBack();

                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "not-valid-2"]);
                    exit();
                }
            break;
            case "update usuario":
                $data = json_decode($_POST["data"], true);
                $estudiante = $data["estudiante"];

                $mysqli->beginTransaction();

                try{
                    $stmt = $mysqli->prepare("UPDATE usuarios SET Nombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?, NombreUsuario = ?, Genero = ? WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $data["nombre"]);
                    $stmt->bindParam(2, $data["apeP"]);
                    $stmt->bindParam(3, $data["apeM"]);
                    $stmt->bindParam(4, $data["usuario"]);
                    $stmt->bindParam(5, $data["genero"]);
                    $stmt->bindParam(6, $data["id"]);
                    $stmt->execute();

                    if ($estudiante){
                        $stmt = $mysqli->prepare("UPDATE alumnos SET NoControl = ?, Carrera = ?, Semestre = ? WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $data["numero"]);
                        $stmt->bindParam(2, $data["carrera"]);
                        $stmt->bindParam(3, $data["semestre"]);
                        $stmt->bindParam(4, $data["id"]);
                        $stmt->execute();
                    }else{
                        $stmt = $mysqli->prepare("UPDATE docentes SET NoTarjeta = ?, Departamento = ? WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $data["numero"]);
                        $stmt->bindParam(2, $data["carrera"]);
                        $stmt->bindParam(3, $data["id"]);
                        $stmt->execute();
                    }

                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
                }
            break;
            case "operaciones_ejemplar":
                $data = json_decode($_POST["data"], true);
                $folios = $data["folios"];
                $folios_og = $data["folios_og"];
                $states = $data["states"];
                $first = $data["first"];
                $deleted = $data["deleted"];
                $id = $data["id"];
                $length = count($folios);
                $repeated = [];
                $final_count = count($first);

                for ($i = 0; $i < $length; $i++){
                    if (!$first[$i]){
                        $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE Folio = ?");
                        $stmt->bindParam(1, $folios[$i]);
                        $stmt->execute();

                        if ($stmt->rowCount() > 0){
                            $repeated[] = $folios[$i];
                        }

                        $final_count++;
                    }else if ($deleted[$i]){
                        $final_count--;
                    }
                }

                if (count($repeated) > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "folios-repeated", "message" => json_encode($repeated)]);
                    exit();
                }

                $stmt = $mysqli->prepare("SELECT IDTitulo FROM ejemplares WHERE Folio = ?");
                $stmt->bindParam(1, $folios_og[0]);
                $stmt->execute();
                $idt = $stmt->fetch(PDO::FETCH_ASSOC)["IDTitulo"];

                $stmt = $mysqli->prepare("SELECT * FROM reservaciones
                    WHERE IDTitulo = ?
                    AND FechaExpiracion > ?");
                $stmt->bindParam(1, $idt);
                $stmt->bindParam(2, $data["fecha"]);
                $stmt->execute();
                $reservaciones = $stmt->rowCount();

                $stmt = $mysqli->prepare("SELECT * FROM ejemplares
                    WHERE IDTitulo = ?
                    AND EstadoDisponible = 'Prestado'");
                $stmt->bindParam(1, $idt);
                $stmt->execute();
                $prestados = $stmt->rowCount();

                if ($reservaciones + $prestados > $final_count){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "insufficient-books"]);
                    exit();
                }

                $mysqli->beginTransaction();
                
                try{
                    for ($i = 0; $i < $length; $i++){
                        if ($first[$i]){
                            if ($deleted[$i]){
                                $stmt = $mysqli->prepare("DELETE FROM ejemplares WHERE Folio = ?");
                                $stmt->bindParam(1, $folios[$i]);
                            }else{
                                $stmt = $mysqli->prepare("UPDATE ejemplares SET EstadoFisico = ?, Folio = ? WHERE Folio = ?");
                                $stmt->bindParam(1, $states[$i]);
                                $stmt->bindParam(2, $folios[$i]);
                                $stmt->bindParam(3, $folios_og[$i]);
                            }
                        }else{
                            $stmt = $mysqli->prepare("INSERT INTO ejemplares VALUES(?, ?, ?, 'Disponible', NOW())");
                            $stmt->bindParam(1, $folios[$i]);
                            $stmt->bindParam(2, $id);
                            $stmt->bindParam(3, $states[$i]);
                        }
                        $stmt->execute();
                    }
                    $mysqli->commit();
                }catch (Exception $e){
                    $mysqli->rollBack();

                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                    exit();
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
            case "prestamo":
                $data = json_decode($_POST["data"], true);
                $iduser = $data["IDUsuario"];
                $domicilio = $data["domicilio"];

                $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ? AND PrestamosDisponibles > 0");
                $stmt->bindParam(1, $iduser);
                $stmt->execute();

                if ($stmt->rowCount() == 0 && $domicilio == 1){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "user-cant"]);
                    exit();
                }else{
                    $folio = $data["Folio"];

                    $stmt = $mysqli->prepare("SELECT * FROM ejemplares e
                        WHERE e.EstadoDisponible = 'Disponible'
                        AND e.IDTitulo = (SELECT e2.IDTitulo FROM ejemplares e2 WHERE e2.Folio = ?)");
                    $stmt->bindParam(1, $folio);
                    $stmt->execute();

                    if ($stmt->rowCount() == 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "book-ran-out"]);
                        exit();
                    }

                    $stmt = $mysqli->prepare("SELECT * FROM ejemplares e
                        WHERE e.EstadoFisico = 'Perdido'
                        AND e.Folio = ?");
                    $stmt->bindParam(1, $folio);
                    $stmt->execute();

                    $fecha = $data["Fecha"];

                    if ($stmt->rowCount() > 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "book-unavailable"]);
                        exit();
                    }else{
                        $stmt = $mysqli->prepare("SELECT * FROM prestamos WHERE IDPrestamo = ?");
                        $stmt->bindParam(1, $id);
                        do{
                            $id = random_str();
                            $stmt->execute();
                        }while ($stmt->rowCount() > 0);
                        
                        $fechaLimite = $data["FechaLimite"];
                        $estudiante = $data["estudiante"];

                        $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                        $stmt->bindParam(1, $iduser);
                        $stmt->execute();
                        $datos = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        $mysqli->beginTransaction();

                        try{
                            if ($estudiante){
                                $query = ", FechaLimite";
                                $extra = ", ?";
                            }else{
                                $query = "";
                                $extra = "";
                            }

                            if ($domicilio == 0){
                                $query .= ", FechaDevuelto";
                                $extra .= ", ?";
                            }

                            if ($datos["FechaInscrito"] == null){
                                $stmt = $mysqli->prepare("UPDATE usuarios SET FechaInscrito = NOW() WHERE IDUsuario = ?");
                                $stmt->bindParam(1, $iduser);
                                $stmt->execute();
                            }

                            $stmt = $mysqli->prepare("INSERT INTO prestamos(IDPrestamo, IDUsuario, Folio, ADomicilio, FechaEntregado$query) VALUES(?, ?, ?, ?, ?$extra)");
                            $stmt->bindParam(1, $id);
                            $stmt->bindParam(2, $iduser);
                            $stmt->bindParam(3, $folio);
                            $stmt->bindParam(4, $domicilio);
                            $stmt->bindParam(5, $fecha);
                            if ($estudiante){
                                $stmt->bindParam(6, $fechaLimite);
                                if ($domicilio == 0){
                                    $stmt->bindParam(7, $fecha);
                                }
                            }else if ($domicilio == 0){
                                $stmt->bindParam(6, $fecha);
                            }
                            $stmt->execute();

                            if ($domicilio == 1){
                                $stmt = $mysqli->prepare("UPDATE ejemplares SET EstadoDisponible = 'Prestado' WHERE Folio = ?");
                                $stmt->bindParam(1, $folio);
                                $stmt->execute();
                                
                                $stmt = $mysqli->prepare("UPDATE usuarios SET PrestamosDisponibles = PrestamosDisponibles - 1 WHERE IDUsuario = ? AND PrestamosDisponibles <= 2");
                                $stmt->bindParam(1, $iduser);
                                $stmt->execute();
                            }

                            $mysqli->commit();

                            $stmt = $mysqli->prepare("SELECT p.FechaEntregado, p.FechaLimite, p.FechaDevuelto, p.Folio, p.ADomicilio,
                                CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre, a.NoControl, d.NoTarjeta,
                                a.Carrera, d.Departamento, t.Titulo, e.EstadoFisico, m.FechaMulta, m.DeudaSaldada
                                FROM prestamos p
                                INNER JOIN ejemplares e ON p.Folio = e.Folio
                                INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                                INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                                LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                                LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                                LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                                WHERE p.IDPrestamo = ?");
                            $stmt->bindParam(1, $id);
                            $stmt->execute();
                            $array = $stmt->fetch(PDO::FETCH_ASSOC);

                            header("Content-Type: application/json");
                            echo json_encode(["status" => "success", "message" => json_encode($array)]);
                            exit();
                        }catch (Exception $e){
                            $mysqli->rollBack();

                            header("Content-Type: application/json");
                            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                            exit();
                        }
                    }
                }
            break;
            case "student_file_eliminate":
                if (!empty($_FILES['files']['name'][0])){
                    try {
                        $insertedUsers = [];
                        $exceptedUsers = [];
                        $notFound = [];
                        $spreadsheet = IOFactory::load($_FILES['files']['tmp_name'][0]);
                        $sheet = $spreadsheet->getActiveSheet();
                        $data = $sheet->toArray();
                
                        $firstRow = true;
                        foreach ($data as $row) {
                            if ($firstRow) {
                                $firstRow = false;
                                continue;
                            }

                            $nocontrol = (string) $row[0];

                            $stmt = $mysqli->prepare("SELECT * FROM alumnos WHERE NoControl = ?");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            if ($stmt->rowCount() == 0){
                                $notFound[] = $nocontrol;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT *
                                FROM usuarios u
                                INNER JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                                WHERE a.NoControl = ?");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            $datos = $stmt->fetch(PDO::FETCH_ASSOC);

                            $info = [
                                "Nombre" => $datos["Nombre"] . " " . $datos["ApellidoPaterno"] . " " . $datos["ApellidoMaterno"],
                                "Usuario" => $datos["NombreUsuario"],
                                "Genero" => $datos["Genero"],
                                "NoControl" => $nocontrol,
                                "Carrera" => $datos["Carrera"],
                                "Semestre" => $datos["Semestre"]
                            ];
                            
                            $stmt = $mysqli->prepare("SELECT *
                                FROM usuarios u
                                INNER JOIN prestamos p ON u.IDUsuario = p.IDUsuario
                                LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                                WHERE u.IDUsuario IN (SELECT a.IDUsuario FROM alumnos a WHERE NoControl = ?)
                                AND (p.FechaDevuelto IS NULL
                                OR m.DeudaSaldada = 0)
                                GROUP BY u.IDUsuario");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("DELETE FROM usuarios WHERE IDUsuario IN (SELECT IDUsuario FROM alumnos WHERE NoControl = ?)");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            $insertedUsers[] = $info; //The successful deletes basically
                        }

                        header("Content-Type: application/json");
                        echo json_encode(["status" => "success-delete", "message" => json_encode([$insertedUsers, $exceptedUsers, $notFound])]);
                        exit();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => "Hubo un fallo al importar la información: " . $e->getMessage()]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => "No se paso ningun archivo excel que leer."]);
                    exit();
                }
            break;
            case "teacher_file_eliminate":
                if (!empty($_FILES['files']['name'][0])){
                    try {
                        $insertedUsers = [];
                        $exceptedUsers = [];
                        $notFound = [];
                        $spreadsheet = IOFactory::load($_FILES['files']['tmp_name'][0]);
                        $sheet = $spreadsheet->getActiveSheet();
                        $data = $sheet->toArray();
                
                        $firstRow = true;
                        foreach ($data as $row) {
                            if ($firstRow) {
                                $firstRow = false;
                                continue;
                            }

                            $nocard = (string) $row[0];

                            $stmt = $mysqli->prepare("SELECT * FROM docentes WHERE NoTarjeta = ?");
                            $stmt->bindParam(1, $nocard);
                            $stmt->execute();

                            if ($stmt->rowCount() == 0){
                                $notFound[] = $nocard;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT *
                                FROM usuarios u
                                INNER JOIN docentes d ON u.IDUsuario = d.IDUsuario
                                WHERE d.NoTarjeta = ?");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            $datos = $stmt->fetch(PDO::FETCH_ASSOC);

                            $info = [
                                "Nombre" => $datos["Nombre"] . " " . $datos["ApellidoPaterno"] . " " . $datos["ApellidoMaterno"],
                                "Usuario" => $datos["NombreUsuario"],
                                "Genero" => $datos["Genero"],
                                "NoTarjeta" => $nocard,
                                "Departamento" => $datos["Departamento"]
                            ];

                            $stmt = $mysqli->prepare("SELECT *
                                FROM usuarios u
                                INNER JOIN prestamos p ON u.IDUsuario = p.IDUsuario
                                LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                                WHERE u.IDUsuario IN (SELECT d.IDUsuario FROM docentes d WHERE NoTarjeta = ?)
                                AND (p.FechaDevuelto IS NULL
                                OR m.DeudaSaldada = 0)
                                GROUP BY u.IDUsuario");
                            $stmt->bindParam(1, $nocard);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("DELETE FROM usuarios WHERE IDUsuario IN (SELECT IDUsuario FROM docentes WHERE NoTarjeta = ?)");
                            $stmt->bindParam(1, $nocard);
                            $stmt->execute();

                            $insertedUsers[] = $info;
                        }

                        header("Content-Type: application/json");
                        echo json_encode(["status" => "success-delete", "message" => json_encode([$insertedUsers, $exceptedUsers, $notFound])]);
                        exit();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => "Hubo un fallo al importar la información, verifique que sea un archivo .xlsx y que no este corrupto: " . $e->getMessage()]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => "No se paso ningun archivo excel que leer."]);
                    exit();
                }
            break;
            case "teacher_file_register":
                if (!empty($_FILES['files']['name'][0])){
                    try {
                        $insertedUsers = [];
                        $exceptedUsers = [];
                        $spreadsheet = IOFactory::load($_FILES['files']['tmp_name'][0]);
                        $sheet = $spreadsheet->getActiveSheet();
                        $data = $sheet->toArray();
                
                        $firstRow = true;
                        foreach ($data as $row) {
                            if ($firstRow) {
                                $firstRow = false;
                                continue;
                            }

                            $nocard = (string) $row[0];
                            $name = (string) $row[1];
                            $apeP = (string) $row[2];
                            $apeM = (string) $row[3];
                            $gender = (string) $row[4];
                            $department = (string) array_map('trim', explode('/', (string) $row[5]))[0];;
                            $user = $nocard;

                            $info = [
                                "Nombre" => $name . " " . $apeP . " " . $apeM,
                                "Usuario" => $user,
                                "Genero" => $gender,
                                "NoTarjeta" => $nocard,
                                "Departamento" => $department
                            ];

                            if ($nocard == "" || $user == ""){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
                            $stmt->bindParam(1, $user);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM docentes WHERE NoTarjeta = ?");
                            $stmt->bindParam(1, $nocard);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                            $stmt->bindParam(1, $id);
                            do{
                                $id = random_str();
                                $stmt->execute();
                            }while ($stmt->rowCount() > 0);

                            $mysqli->beginTransaction();

                            try{
                                $disponibilidad = 4;
                                $fechaRegistro = null;
                                $pass = password_hash($nocard, PASSWORD_BCRYPT);
                                $stmt = $mysqli->prepare("INSERT INTO usuarios VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
                                $stmt->bindParam(1, $id);
                                $stmt->bindParam(2, $name);
                                $stmt->bindParam(3, $apeP);
                                $stmt->bindParam(4, $apeM);
                                $stmt->bindParam(5, $user);
                                $stmt->bindParam(6, $gender);
                                $stmt->bindParam(7, $pass);
                                $stmt->bindParam(8, $fechaRegistro);
                                $stmt->bindParam(9, $disponibilidad);
                                $stmt->execute();
                                
                                $stmt = $mysqli->prepare("INSERT INTO docentes VALUES(?, ?, ?)");
                                $stmt->bindParam(1, $nocard);
                                $stmt->bindParam(2, $department);
                                $stmt->bindParam(3, $id);
                                $stmt->execute();

                                $mysqli->commit();
                                $insertedUsers[] = $info;
                            }catch (Exception $e){
                                $mysqli->rollBack();
                                $exceptedUsers[] = $info;
                            }
                        }

                        header("Content-Type: application/json");
                        echo json_encode(["status" => "success", "message" => json_encode([$insertedUsers, $exceptedUsers])]);
                        exit();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => "Hubo un fallo al importar la información, verifique que sea un archivo .xlsx y que no este corrupto: " . $e->getMessage()]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => "No se paso ningun archivo excel que leer."]);
                    exit();
                }
            break;
            case "student_file_register":
                if (!empty($_FILES['files']['name'][0])){
                    try {
                        $insertedUsers = [];
                        $exceptedUsers = [];
                        $spreadsheet = IOFactory::load($_FILES['files']['tmp_name'][0]);
                        $sheet = $spreadsheet->getActiveSheet();
                        $data = $sheet->toArray();
                
                        $firstRow = true;
                        foreach ($data as $row) {
                            if ($firstRow) {
                                $firstRow = false;
                                continue;
                            }

                            $nocontrol = (string) $row[0];
                            $name = (string) $row[1];
                            $apeP = (string) $row[2];
                            $apeM = (string) $row[3];
                            $gender = (string) $row[4];
                            $career = array_map('trim', explode('/', (string) $row[5]))[0];
                            $semester = (int) $row[6];
                            $user = $nocontrol;

                            $info = [
                                "Nombre" => $name . " " . $apeP . " " . $apeM,
                                "Usuario" => $user,
                                "Genero" => $gender,
                                "NoControl" => $nocontrol,
                                "Carrera" => $career,
                                "Semestre" => $semester
                            ];

                            if ($nocontrol == "" || $user == ""){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
                            $stmt->bindParam(1, $user);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM alumnos WHERE NoControl = ?");
                            $stmt->bindParam(1, $nocontrol);
                            $stmt->execute();

                            if ($stmt->rowCount() > 0){
                                $exceptedUsers[] = $info;
                                continue;
                            }

                            $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                            $stmt->bindParam(1, $id);
                            do{
                                $id = random_str();
                                $stmt->execute();
                            }while ($stmt->rowCount() > 0);

                            $mysqli->beginTransaction();

                            try{
                                $disponibilidad = 2;
                                $fechaRegistro = null;
                                $pass = password_hash($nocontrol, PASSWORD_BCRYPT);
                                $stmt = $mysqli->prepare("INSERT INTO usuarios VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
                                $stmt->bindParam(1, $id);
                                $stmt->bindParam(2, $name);
                                $stmt->bindParam(3, $apeP);
                                $stmt->bindParam(4, $apeM);
                                $stmt->bindParam(5, $user);
                                $stmt->bindParam(6, $gender);
                                $stmt->bindParam(7, $pass);
                                $stmt->bindParam(8, $fechaRegistro);
                                $stmt->bindParam(9, $disponibilidad);
                                $stmt->execute();
                                
                                $stmt = $mysqli->prepare("INSERT INTO alumnos VALUES(?, ?, ?, ?)");
                                $stmt->bindParam(1, $nocontrol);
                                $stmt->bindParam(2, $career);
                                $stmt->bindParam(3, $semester);
                                $stmt->bindParam(4, $id);
                                $stmt->execute();

                                $mysqli->commit();
                                $insertedUsers[] = $info;
                            }catch (Exception $e){
                                $mysqli->rollBack();
                                $exceptedUsers[] = $info;
                            }
                        }

                        header("Content-Type: application/json");
                        echo json_encode(["status" => "success", "message" => json_encode([$insertedUsers, $exceptedUsers])]);
                        exit();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => "Hubo un fallo al importar la información: " . $e->getMessage()]);
                        exit();
                    }
                }else{
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "error", "message" => "No se paso ningun archivo excel que leer."]);
                    exit();
                }
            break;
            case "student":
                $data = json_decode($_POST["data"], true);
                $nocontrol = $data["nocontrol"];
                $stmt = $mysqli->prepare("SELECT * FROM alumnos WHERE NoControl = ?");
                $stmt->bindParam(1, $nocontrol);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "duplicate-entry"]);
                    exit();
                }else{
                    $usuario = $data["usuario"];
                    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
                    $stmt->bindParam(1, $usuario);
                    $stmt->execute();

                    if ($stmt->rowCount() > 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "duplicate-entry"]);
                        exit();
                    }

                    $nombre = $data["nombre"];
                    $apeP = $data["apeP"];
                    $apeM = $data["apeM"];
                    $genero = $data["genero"];
                    $semestre = $data["semestre"];
                    $carrera = $data["carrera"];
                    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $id);
                    do{
                        $id = random_str();
                        $stmt->execute();
                    }while ($stmt->rowCount() > 0);

                    $mysqli->beginTransaction();

                    try{
                        $pass = password_hash($nocontrol, PASSWORD_BCRYPT);
                        $disponibles = 2;
                        $fechaRegistro = null;
                        $stmt = $mysqli->prepare("INSERT INTO usuarios VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $nombre);
                        $stmt->bindParam(3, $apeP);
                        $stmt->bindParam(4, $apeM);
                        $stmt->bindParam(5, $usuario);
                        $stmt->bindParam(6, $genero);
                        $stmt->bindParam(7, $pass);
                        $stmt->bindParam(8, $fechaRegistro);
                        $stmt->bindParam(9, $disponibles);
                        $stmt->execute();

                        $stmt = $mysqli->prepare("INSERT INTO alumnos VALUES(?, ?, ?, ?)");
                        $stmt->bindParam(1, $nocontrol);
                        $stmt->bindParam(2, $carrera);
                        $stmt->bindParam(3, $semestre);
                        $stmt->bindParam(4, $id);
                        $stmt->execute();

                        $mysqli->commit();
                    } catch (Exception $e) {
                        $mysqli->rollBack();
                        
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }
            break;
            case "teacher":
                $data = json_decode($_POST["data"], true);
                $notarjeta = $data["notarjeta"];
                $stmt = $mysqli->prepare("SELECT * FROM docentes WHERE NoTarjeta = ?");
                $stmt->bindParam(1, $notarjeta);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "duplicate-entry"]);
                    exit();
                }else{
                    $usuario = $data["usuario"];
                    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ?");
                    $stmt->bindParam(1, $usuario);
                    $stmt->execute();

                    if ($stmt->rowCount() > 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "duplicate-entry"]);
                        exit();
                    }

                    $nombre = $data["nombre"];
                    $apeP = $data["apeP"];
                    $apeM = $data["apeM"];
                    $genero = $data["genero"];
                    $departamento = $data["departamento"];
                    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
                    $stmt->bindParam(1, $id);
                    do{
                        $id = random_str();
                        $stmt->execute();
                    }while ($stmt->rowCount() > 0);

                    $mysqli->beginTransaction();

                    try{
                        $pass = password_hash($notarjeta, PASSWORD_BCRYPT);
                        $disponibles = 4;
                        $fechaRegistro = null;
                        $stmt = $mysqli->prepare("INSERT INTO usuarios VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $nombre);
                        $stmt->bindParam(3, $apeP);
                        $stmt->bindParam(4, $apeM);
                        $stmt->bindParam(5, $usuario);
                        $stmt->bindParam(6, $genero);
                        $stmt->bindParam(7, $pass);
                        $stmt->bindParam(8, $fechaRegistro);
                        $stmt->bindParam(9, $disponibles);
                        $stmt->execute();

                        $stmt = $mysqli->prepare("INSERT INTO docentes VALUES(?, ?, ?)");
                        $stmt->bindParam(1, $notarjeta);
                        $stmt->bindParam(2, $departamento);
                        $stmt->bindParam(3, $id);
                        $stmt->execute();

                        $mysqli->commit();
                    } catch (Exception $e) {
                        $mysqli->rollBack();
                        
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }
            break;
            case "editorial":
                $data = json_decode($_POST["data"], true);
                $nombre = $data["nombre"];
                $ubicacion = $data["ubicacion"];
                $stmt = $mysqli->prepare("SELECT * FROM editoriales WHERE Nombre = ?");
                $stmt->bindParam(1, $nombre);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "duplicate-entry"]);
                    exit();
                }else{
                    try{
                        $stmt = $mysqli->prepare("SELECT * FROM editoriales WHERE IDEditorial = ?");
                        $stmt->bindParam(1, $id);
                        do{
                            $id = random_str();
                            $stmt->execute();
                        }while ($stmt->rowCount() > 0);

                        $stmt = $mysqli->prepare("INSERT INTO editoriales VALUES(?, ?, ?)");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $nombre);
                        $stmt->bindParam(3, $ubicacion);
                        $stmt->execute();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }
            break;
            case "author":
                $nombre = $_POST["nombre"];
                $stmt = $mysqli->prepare("SELECT * FROM autores WHERE Nombre = ?");
                $stmt->bindParam(1, $nombre);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "duplicate-entry"]);
                    exit();
                }else{
                    try{
                        $stmt = $mysqli->prepare("SELECT * FROM autores WHERE IDAutor = ?");
                        $stmt->bindParam(1, $id);
                        do{
                            $id = random_str();
                            $stmt->execute();
                        }while ($stmt->rowCount() > 0);

                        $stmt = $mysqli->prepare("INSERT INTO autores VALUES(?, ?)");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $nombre);
                        $stmt->execute();
                    } catch (Exception $e) {
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }
            break;
            case "title":
                $data = json_decode($_POST["data"], true);
                $titulo = $data["titulo"];
                $ISBN = $data["ISBN"];
                $edicion = $data["edicion"];
                $editorial = $data["editorial"];
                $anio = $data["anio"];
                $idioma = $data["idioma"];
                $clasificacion = $data["clasificacion"];
                $autores = $data["autores"];

                $stmt = $mysqli->prepare("SELECT * FROM titulos t
                    WHERE Titulo = :titulo
                    AND Idioma = :idioma
                    AND (ISBN = :isbn OR (ISBN IS NULL AND :isbn IS NULL))
                    AND (Edicion = :edicion OR (Edicion IS NULL AND :edicion IS NULL))
                    AND (IDEditorial = :editorial OR (IDEditorial IS NULL AND :editorial IS NULL))
                    AND (AnioPublicacion = :anio OR (AnioPublicacion IS NULL AND :anio IS NULL))
                    AND (CodigoClasificacion = :clasificacion OR (CodigoClasificacion IS NULL AND :clasificacion IS NULL))");
                $stmt->bindParam(":titulo", $titulo);
                $stmt->bindParam(":idioma", $idioma);
                $stmt->bindParam(":isbn", $ISBN);
                $stmt->bindParam(":edicion", $edicion);
                $stmt->bindParam(":editorial", $editorial);
                $stmt->bindParam(":anio", $anio);
                $stmt->bindParam(":clasificacion", $clasificacion);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    header("Content-Type: application/json");
                    echo json_encode(["status" => "duplicate-entry"]);
                    exit();
                }else{
                    $repeated = [];
                    $datos = $data["folios_estados"];
                    foreach ($datos as [$x, $y]){
                        $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE Folio = ?");
                        $stmt->bindParam(1, $x);
                        $stmt->execute();
    
                        if ($stmt->rowCount() > 0){
                            $repeated[] = $x;
                        }
                    }
    
                    if (count($repeated) > 0){
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "folios-repeated", "message" => json_encode($repeated)]);
                        exit();
                    }

                    $stmt = $mysqli->prepare("SELECT * FROM titulos WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $id);
                    do{
                        $id = random_str();
                        $stmt->execute();
                    }while ($stmt->rowCount() > 0);

                    $mysqli->beginTransaction();

                    try{
                        $stmt = $mysqli->prepare("INSERT INTO titulos VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $editorial);
                        $stmt->bindParam(3, $titulo);
                        $stmt->bindParam(4, $ISBN);
                        $stmt->bindParam(5, $clasificacion);
                        $stmt->bindParam(6, $anio);
                        $stmt->bindParam(7, $idioma);
                        $stmt->bindParam(8, $edicion);
                        $stmt->execute();

                        $stmt = $mysqli->prepare("INSERT INTO titulo_autores VALUES(?, ?)");
                        $stmt->bindParam(1, $id);
                        $stmt->bindParam(2, $autorID);
                        foreach ($autores as $x){
                            $autorID = $x;
                            $stmt->execute();
                        }

                        $tomo = $data["tomo"];
                        $tomo_nombre = $data["tomo_nombre"];
                        if (!is_null($tomo) || !is_null($tomo_nombre)){
                            $stmt = $mysqli->prepare("INSERT INTO tomos VALUES(?, ?, ?)");
                            $stmt->bindParam(1, $id);
                            $stmt->bindParam(2, $tomo);
                            $stmt->bindParam(3, $tomo_nombre);
                            $stmt->execute();
                        }

                        $volumen = $data["volumen"];
                        $volumen_nombre = $data["volumen_nombre"];
                        if (!is_null($volumen) || !is_null($volumen_nombre)){
                            $stmt = $mysqli->prepare("INSERT INTO volumenes VALUES(?, ?, ?)");
                            $stmt->bindParam(1, $id);
                            $stmt->bindParam(2, $volumen);
                            $stmt->bindParam(3, $volumen_nombre);
                            $stmt->execute();
                        }

                        $disponibilidad = "Disponible";
                        $stmt = $mysqli->prepare("INSERT INTO ejemplares VALUES(?, ?, ?, ?, NOW())");
                        $stmt->bindParam(1, $folioID);
                        $stmt->bindParam(2, $id);
                        $stmt->bindParam(3, $estado);
                        $stmt->bindParam(4, $disponibilidad);
                        foreach ($datos as [$x, $y]){
                            $folioID = $x;
                            $estado = $y;
                            $stmt->execute();
                        }

                        $mysqli->commit();
                    } catch (Exception $e) {
                        $mysqli->rollBack();
                        
                        header("Content-Type: application/json");
                        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        exit();
                    }
                }
            break;
        }

        header("Content-Type: application/json");
        echo json_encode(["status" => "success", "message" => json_encode([])]);
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-admin"]);
    }
?>