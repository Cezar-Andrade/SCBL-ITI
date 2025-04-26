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
    if ($_SESSION["type"] == "user"){
        $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
    }else{
        $stmt = $mysqli->prepare("SELECT * FROM administradores WHERE IDUsuario = ?");
    }
    $stmt->bindParam(1, $id);
    $stmt->execute();

    if ($stmt->rowCount() > 0){
        $array = [];
        $type = $_POST["type"];

        switch ($type) {
            case "multas user":
                $data = json_decode($_POST["data"], true);

                $stmt = $mysqli->prepare("SELECT p.IDPrestamo, t.Titulo, e.Folio, m.FechaMulta, m.Sancion, m.DeudaSaldada, p.FechaEntregado
                    FROM multas m
                    INNER JOIN prestamos p ON m.IDPrestamo = p.IDPrestamo
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    WHERE (p.IDUsuario = :id)
                    AND (p.Folio LIKE CONCAT(:folio, '%') OR :folio IS NULL OR :folio = '')
                    AND (t.Titulo LIKE CONCAT(:titulo, '%') OR :titulo IS NULL OR :titulo = '')
                    AND (m.Sancion = :sancion OR :sancion IS NULL OR :sancion = '')
                    AND (p.FechaEntregado >= :fechaEntregadoInicio OR :fechaEntregadoInicio IS NULL OR :fechaEntregadoInicio = '')
                    AND (p.FechaEntregado <= :fechaEntregadoFinal OR :fechaEntregadoFinal IS NULL OR :fechaEntregadoFinal = '')
                    AND (p.FechaDevuelto >= :fechaDevolucionInicio OR :fechaDevolucionInicio IS NULL OR :fechaDevolucionInicio = '')
                    AND (p.FechaDevuelto <= :fechaDevolucionFinal OR :fechaDevolucionFinal IS NULL OR :fechaDevolucionFinal = '')
                    AND (m.FechaMulta >= :fechaMultaInicio OR :fechaMultaInicio IS NULL OR :fechaMultaInicio = '')
                    AND (m.FechaMulta <= :fechaMultaFinal OR :fechaMultaFinal IS NULL OR :fechaMultaFinal = '')
                    ORDER BY m.FechaMulta DESC");
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":folio", $data["folio"]);
                $stmt->bindParam(":titulo", $data["titulo"]);
                $stmt->bindParam(":sancion", $data["sancion"]);
                $stmt->bindParam(":fechaEntregadoInicio", $data["fechaentregainicio"]);
                $stmt->bindParam(":fechaEntregadoFinal", $data["fechaentregafinal"]);
                $stmt->bindParam(":fechaDevolucionInicio", $data["fechadevolucioninicio"]);
                $stmt->bindParam(":fechaDevolucionFinal", $data["fechadevolucionfinal"]);
                $stmt->bindParam(":fechaMultaInicio", $data["fechamultainicio"]);
                $stmt->bindParam(":fechaMultaFinal", $data["fechamultafinal"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "prestamos user":
                $data = json_decode($_POST["data"], true);
                $query = "SELECT p.IDPrestamo, p.FechaEntregado, p.FechaLimite, t.Titulo, e.Folio, p.FechaDevuelto, m.FechaMulta, m.DeudaSaldada
                    FROM prestamos p
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                    WHERE (p.IDUsuario = :id)
                    AND (e.Folio LIKE CONCAT(:folio, '%') OR :folio IS NULL OR :folio = '')
                    AND (t.Titulo LIKE CONCAT(:titulo, '%') OR :titulo IS NULL OR :titulo = '')
                    AND (t.IDEditorial = :editorial OR :editorial IS NULL OR :editorial = '')
                    AND (t.CodigoClasificacion = :codigo OR :codigo IS NULL OR :codigo = '')
                    AND (t.ISBN LIKE CONCAT(:isbn, '%') OR :isbn IS NULL OR :isbn = '')
                    AND (p.FechaEntregado >= :fechaEntregaInicio OR :fechaEntregaInicio IS NULL OR :fechaEntregaInicio = '')
                    AND (p.FechaEntregado <= :fechaEntregaFinal OR :fechaEntregaFinal IS NULL OR :fechaEntregaFinal = '')
                    AND (p.FechaLimite >= :fechaLimiteInicio OR :fechaLimiteInicio IS NULL OR :fechaLimiteInicio = '')
                    AND (p.FechaLimite <= :fechaLimiteFinal OR :fechaLimiteFinal IS NULL OR :fechaLimiteFinal = '')";

                if ($data["active"]){
                    $query .= " AND p.FechaDevuelto IS NULL";
                }else{
                    $query .= " AND (p.FechaDevuelto >= :fechaDevolucionInicio OR :fechaDevolucionInicio IS NULL OR :fechaDevolucionInicio = '')
                        AND (p.FechaDevuelto <= :fechaDevolucionFinal OR :fechaDevolucionFinal IS NULL OR :fechaDevolucionFinal = '')";
                }
                $query .= " ORDER BY p.FechaEntregado DESC";

                $stmt = $mysqli->prepare($query);
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":folio", $data["folio"]);
                $stmt->bindParam(":titulo", $data["titulo"]);
                $stmt->bindParam(":editorial", $data["editorial"]);
                $stmt->bindParam(":codigo", $data["clasificacion"]);
                $stmt->bindParam(":isbn", $data["isbn"]);
                $stmt->bindParam(":fechaEntregaInicio", $data["fechaentregainicio"]);
                $stmt->bindParam(":fechaEntregaFinal", $data["fechaentregafinal"]);
                $stmt->bindParam(":fechaLimiteInicio", $data["fechalimiteinicio"]);
                $stmt->bindParam(":fechaLimiteFinal", $data["fechalimitefinal"]);
                if ($data["active"] == false){
                    $stmt->bindParam(":fechaDevolucionInicio", $data["fechadevolucioninicio"]);
                    $stmt->bindParam(":fechaDevolucionFinal", $data["fechadevolucionfinal"]);
                }
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "reservaciones user":
                $data = json_decode($_POST["data"], true);
                $idautores = $data["idautores"];
                $query = "";
                if (count($idautores) > 0){
                    $query .= "AND EXISTS (SELECT 1
                        FROM titulo_autores ta2
                        WHERE ta2.IDTitulo = r.IDTitulo
                        AND ta2.IDAutor IN (";
                    foreach ($idautores as $number => $id){
                        if ($number > 0){
                            $query .= ", ";
                        }
                        $query .= ":idautor" . $number;
                    }
                    $query .= "))";
                }

                $stmt = $mysqli->prepare("SELECT r.IDReservacion, t.Titulo, t.ISBN, r.FechaRealizada, r.FechaExpiracion
                    FROM reservaciones r
                    INNER JOIN usuarios u ON r.IDUsuario = u.IDUsuario
                    INNER JOIN titulos t ON r.IDTitulo = t.IDTitulo
                    INNER JOIN titulo_autores ta ON r.IDTitulo = ta.IDTitulo
                    WHERE u.IDUsuario = :id
                    AND (r.IDReservacion = :reservacion OR :reservacion IS NULL OR :reservacion = '')
                    AND (t.Titulo LIKE CONCAT(:titulo, '%') OR :titulo IS NULL OR :titulo = '')
                    AND (t.IDEditorial = :editorial OR :editorial IS NULL OR :editorial = '')
                    AND (t.CodigoClasificacion = :clasificacion OR :clasificacion IS NULL OR :clasificacion = '')
                    AND (r.FechaRealizada >= :fechareservadoinicio OR :fechareservadoinicio IS NULL OR :fechareservadoinicio = '')
                    AND (r.FechaRealizada <= :fechareservadofinal OR :fechareservadofinal IS NULL OR :fechareservadofinal = '')
                    AND (r.FechaExpiracion >= :fechaexpiracioninicio OR :fechaexpiracioninicio IS NULL OR :fechaexpiracioninicio = '')
                    AND (r.FechaExpiracion <= :fechaexpiracionfinal OR :fechaexpiracionfinal IS NULL OR :fechaexpiracionfinal = '')
                    $query
                    GROUP BY r.IDReservacion
                    ORDER BY r.FechaRealizada DESC");
                $stmt->bindParam(":reservacion", $data["IDReservacion"]);
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":titulo", $data["titulo"]);
                $stmt->bindParam(":editorial", $data["editorial"]);
                $stmt->bindParam(":clasificacion", $data["clasificacion"]);
                $stmt->bindParam(":fechareservadoinicio", $data["fechareservadoinicio"]);
                $stmt->bindParam(":fechareservadofinal", $data["fechareservadofinal"]);
                $stmt->bindParam(":fechaexpiracioninicio", $data["fechaexpiracioninicio"]);
                $stmt->bindParam(":fechaexpiracionfinal", $data["fechaexpiracionfinal"]);
                if (count($idautores) > 0){
                    foreach ($idautores as $number => $id){
                        $stmt->bindParam(":idautor" . $number, $id);
                    }
                }
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "menu_user":
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM multas
                    WHERE IDPrestamo IN (SELECT IDPrestamo FROM prestamos WHERE IDUsuario = ?)
                    AND DeudaSaldada = 0");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM reservaciones WHERE IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT Nombre, Genero FROM usuarios WHERE IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $data = $stmt->fetch(PDO::FETCH_NUM);
                $array[] = $data[0];
                $array[] = $data[1];
            break;
            case "profile_user":
                $stmt = $mysqli->prepare("SELECT u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno, u.NombreUsuario, u.Genero, u.PrestamosDisponibles,
                    a.NoControl, a.Carrera, a.Semestre, d.NoTarjeta, d.Departamento, COUNT(CASE WHEN p.FechaDevuelto IS NULL THEN p.IDPrestamo END) AS Prestados
                    FROM usuarios u
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    LEFT JOIN prestamos p ON u.IDUsuario = p.IDUsuario
                    WHERE u.IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "folios":
                $stmt = $mysqli->prepare("SELECT e.Folio
                    FROM ejemplares e
                    INNER JOIN titulos t ON t.IDTitulo = e.IDTitulo
                    WHERE t.IDTitulo = ? AND e.EstadoDisponible = 'Disponible'");
                $stmt->bindParam(1, $_POST["IDTitulo"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_NUM);
            break;
            case "vista reservacion":
                $stmt = $mysqli->prepare("SELECT r.IDReservacion, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                    u.Genero, a.NoControl, a.Carrera, d.NoTarjeta, d.Departamento, t.IDTitulo, t.Titulo, t.ISBN, r.FechaRealizada, r.FechaExpiracion,
                    u.IDUsuario, GROUP_CONCAT(DISTINCT CONCAT(au.Nombre, ' ', au.ApellidoPaterno, ' ', au.ApellidoMaterno) SEPARATOR ', ') AS Autores
                    FROM reservaciones r
                    INNER JOIN usuarios u ON r.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    INNER JOIN titulos t ON r.IDTitulo = t.IDTitulo
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores au ON ta.IDAutor = au.IDAutor
                    WHERE r.IDReservacion = ?
                    GROUP BY r.IDReservacion");
                $stmt->bindParam(1, $_POST["IDReservacion"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "vista multa":
                $stmt = $mysqli->prepare("SELECT CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre, a.NoControl, a.Carrera,
                    d.NoTarjeta, d.Departamento, u.Genero, e.Folio, t.Titulo, p.FechaEntregado, p.FechaDevuelto, m.Sancion, m.Razon, m.FechaMulta, m.DeudaSaldada
                    FROM multas m
                    INNER JOIN prestamos p ON m.IDPrestamo = p.IDPrestamo
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    WHERE m.IDPrestamo = ?");
                $stmt->bindParam(1, $_POST["IDPrestamo"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "vista prestamo":
                $stmt = $mysqli->prepare("SELECT p.FechaEntregado, p.FechaLimite, p.FechaDevuelto, p.Folio,
                    CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre, a.NoControl, d.NoTarjeta, t.Titulo,
                    e.EstadoFisico, m.FechaMulta, m.DeudaSaldada
                    FROM prestamos p
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                    WHERE p.IDPrestamo = ?");
                $stmt->bindParam(1, $_POST["IDPrestamo"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "vista usuario":
                $stmt = $mysqli->prepare("SELECT u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno, u.NombreUsuario, u.Genero, u.PrestamosDisponibles,
                    a.NoControl, a.Carrera, a.Semestre, d.NoTarjeta, d.Departamento,
                    COUNT(CASE WHEN p.FechaDevuelto IS NULL THEN p.IDPrestamo END) AS Prestados, ub.FechaInicio, ub.FechaFin
                    FROM usuarios u
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    LEFT JOIN prestamos p ON u.IDUsuario = p.IDUsuario
                    LEFT JOIN usuarios_bloqueados ub ON u.IDUsuario = ub.IDUsuario
                    WHERE u.IDUsuario = ?
                    GROUP BY u.IDUsuario, a.NoControl, a.Carrera, a.Semestre, d.NoTarjeta, d.Departamento;");
                $stmt->bindParam(1, $_POST["IDUsuario"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "prestado":
                $stmt = $mysqli->prepare("SELECT t.Titulo, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre, s.NoControl, d.NoTarjeta, u.Genero
                    FROM prestamos p
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    LEFT JOIN alumnos s ON u.IDUsuario = s.IDUsuario
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    WHERE e.Folio LIKE CONCAT(?, '%') AND p.FechaDevuelto IS NULL");
                $stmt->bindParam(1, $_POST["Folio"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "reservaciones vigentes":
                $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE FechaExpiracion >= ? AND IDTitulo = ?");
                $stmt->bindParam(1, $_POST["Fecha"]);
                $stmt->bindParam(2, $_POST["id"]);
                $stmt->execute();
                $array[] = $stmt->rowCount();
            break;
            case "ejemplares":
                $stmt = $mysqli->prepare("SELECT Folio, EstadoFisico, EstadoDisponible
                    FROM ejemplares
                    WHERE IDTitulo = ?");
                $stmt->bindParam(1, $_POST["IDTitulo"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "vista titulo user":
                $stmt = $mysqli->prepare("SELECT t.Titulo, ed.Nombre AS Editorial, ed.IDEditorial, ed.Ubicacion, CONCAT(c.CodigoClasificacion, ' - ', c.Nombre) AS Clasificacion,
                    t.Edicion, GROUP_CONCAT(DISTINCT CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno) SEPARATOR ', ') AS Autores, GROUP_CONCAT(DISTINCT a.IDAutor SEPARATOR ', ') AS IDAutores,
                    t.ISBN, t.Idioma, t.AnioPublicacion, tm.NoTomo, tm.Nombre AS Tomo, v.NoVolumen, v.Nombre AS Volumen, COUNT(DISTINCT CASE WHEN e.EstadoDisponible='Disponible' THEN e.Folio END) AS NoFoliosDisponibles,
                    GROUP_CONCAT(DISTINCT e.Folio SEPARATOR ', ') AS Folios
                    FROM titulos t
                    LEFT JOIN editoriales ed ON t.IDEditorial = ed.IDEditorial
                    LEFT JOIN tomos tm ON t.IDTitulo = tm.IDTitulo
                    LEFT JOIN volumenes v ON t.IDTitulo = v.IDTitulo
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores a ON ta.IDAutor = a.IDAutor
                    INNER JOIN clasificacion c ON t.CodigoClasificacion = c.CodigoClasificacion
                    INNER JOIN ejemplares e ON t.IDTitulo = e.IDTitulo
                    WHERE t.IDTitulo = ?");
                $stmt->bindParam(1, $_POST["IDTitulo"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
                $stmt = $mysqli->prepare("SELECT * FROM reservaciones WHERE IDTitulo = ? AND FechaExpiracion >= ?");
                $stmt->bindParam(1, $_POST["IDTitulo"]);
                $stmt->bindParam(2, $_POST["Fecha"]);
                $stmt->execute();
                $array["Reservados"] = $stmt->rowCount();
            break;
            case "vista titulo":
                $stmt = $mysqli->prepare("SELECT t.Titulo, ed.Nombre AS Editorial, ed.IDEditorial, ed.Ubicacion, CONCAT(c.CodigoClasificacion, ' - ', c.Nombre) AS Clasificacion,
                    t.Edicion, GROUP_CONCAT(DISTINCT CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno) SEPARATOR ', ') AS Autores, GROUP_CONCAT(DISTINCT a.IDAutor SEPARATOR ', ') AS IDAutores,
                    t.ISBN, t.Idioma, t.AnioPublicacion, tm.NoTomo, tm.Nombre AS Tomo, v.NoVolumen, v.Nombre AS Volumen, COUNT(DISTINCT e.Folio) AS NoFolios,
                    GROUP_CONCAT(DISTINCT e.Folio SEPARATOR ', ') AS Folios, COUNT(DISTINCT e.Folio) AS NoFolios
                    FROM titulos t
                    LEFT JOIN editoriales ed ON t.IDEditorial = ed.IDEditorial
                    LEFT JOIN tomos tm ON t.IDTitulo = tm.IDTitulo
                    LEFT JOIN volumenes v ON t.IDTitulo = v.IDTitulo
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores a ON ta.IDAutor = a.IDAutor
                    INNER JOIN clasificacion c ON t.CodigoClasificacion = c.CodigoClasificacion
                    INNER JOIN ejemplares e ON t.IDTitulo = e.IDTitulo
                    WHERE t.IDTitulo = ?");
                $stmt->bindParam(1, $_POST["IDTitulo"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "profile":
                $stmt = $mysqli->prepare("SELECT u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno, u.NombreUsuario, u.Genero, d.NoTarjeta, d.Departamento
                    FROM usuarios u
                    INNER JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    WHERE u.IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "libros_carrera":
                $carrera = $_POST["carrera"];
                $extra = "";
                if ($carrera != "Todos"){
                    $extra = " AND al.Carrera = ?";
                }
                $stmt = $mysqli->prepare("SELECT t.Titulo, GROUP_CONCAT(DISTINCT CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno) SEPARATOR ', ') AS Autores,
                    t.ISBN, e.Nombre AS Editorial, CONCAT(c.CodigoClasificacion, ' ', c.Nombre) AS Clasificacion, al.Carrera, COUNT(DISTINCT p.IDPrestamo) AS Total
                    FROM titulos t
                    LEFT JOIN editoriales e ON t.IDEditorial = e.IDEditorial
                    INNER JOIN ejemplares s ON t.IDTitulo = s.IDTitulo
                    INNER JOIN prestamos p ON s.Folio = p.Folio
                    INNER JOIN alumnos al ON p.IDUsuario = al.IDUsuario
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores a ON ta.IDAutor = a.IDAutor
                    INNER JOIN clasificacion c ON t.CodigoClasificacion = c.CodigoClasificacion
                    WHERE p.FechaEntregado >= ?
                    AND p.FechaEntregado <= ?
                    $extra
                    GROUP BY t.IDTitulo, al.Carrera
                    ORDER BY Total DESC");
                $stmt->bindParam(1, $_POST["inicio"]);
                $stmt->bindParam(2, $_POST["final"]);
                if ($carrera != "Todos"){
                    $stmt->bindParam(3, $carrera);
                }
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "carreras":
                $stmt = $mysqli->prepare("SELECT DISTINCT Carrera FROM alumnos");
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "libros_consultados":
                $stmt = $mysqli->prepare("SELECT t.Titulo, GROUP_CONCAT(DISTINCT CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno) SEPARATOR ', ') AS Autores,
                    t.ISBN, e.Nombre AS Editorial, CONCAT(c.CodigoClasificacion, ' ', c.Nombre) AS Clasificacion, COUNT(DISTINCT p.IDPrestamo) AS Total
                    FROM titulos t
                    LEFT JOIN editoriales e ON t.IDEditorial = e.IDEditorial
                    INNER JOIN ejemplares s ON t.IDTitulo = s.IDTitulo
                    INNER JOIN prestamos p ON s.Folio = p.Folio
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores a ON ta.IDAutor = a.IDAutor
                    INNER JOIN clasificacion c ON t.CodigoClasificacion = c.CodigoClasificacion
                    WHERE p.FechaEntregado >= ?
                    AND p.FechaEntregado <= ?
                    GROUP BY t.IDTitulo
                    ORDER BY Total DESC");
                $stmt->bindParam(1, $_POST["inicio"]);
                $stmt->bindParam(2, $_POST["final"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "deudores":
                $stmt = $mysqli->prepare("SELECT a.NoControl, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                    m.Razon, m.Sancion, m.FechaMulta
                    FROM multas m
                    INNER JOIN prestamos p ON m.IDPrestamo = p.IDPrestamo
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    INNER JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    WHERE m.DeudaSaldada = 0
                    AND m.FechaMulta >= ?
                    AND m.FechaMulta <= ?");
                $stmt->bindParam(1, $_POST["inicio"]);
                $stmt->bindParam(2, $_POST["final"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "menu":
                $fecha = $_POST["fecha"];
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM usuarios_bloqueados WHERE FechaFin > ?");
                $stmt->bindParam(1, $fecha);
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM prestamos WHERE ? > FechaLimite AND FechaDevuelto IS NULL");
                $stmt->bindParam(1, $fecha);
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM reservaciones WHERE ? > FechaExpiracion");
                $stmt->bindParam(1, $fecha);
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT COUNT(*) FROM multas WHERE DeudaSaldada = 0");
                $stmt->execute();
                $array[] = $stmt->fetch(PDO::FETCH_NUM)[0];
                $stmt = $mysqli->prepare("SELECT Nombre, Genero FROM usuarios WHERE IDUsuario = ?");
                $stmt->bindParam(1, $id);
                $stmt->execute();
                $data = $stmt->fetch(PDO::FETCH_NUM);
                $array[] = $data[0];
                $array[] = $data[1];
            break;
            case "reservaciones":
                $data = json_decode($_POST["data"], true);
                $idautores = $data["idautores"];
                $query = "";
                if (count($idautores) > 0){
                    $query .= "AND EXISTS (SELECT 1
                        FROM titulo_autores ta2
                        WHERE ta2.IDTitulo = r.IDTitulo
                        AND ta2.IDAutor IN (";
                    foreach ($idautores as $number => $id){
                        if ($number > 0){
                            $query .= ", ";
                        }
                        $query .= ":idautor" . $number;
                    }
                    $query .= "))";
                }
                if ($data["estudiante"]){
                    $query .= " AND (a.NoControl = :numero OR :numero IS NULL OR :numero = '')";
                }else{
                    $query .= " AND (d.NoTarjeta = :numero OR :numero IS NULL OR :numero = '')";
                }

                $stmt = $mysqli->prepare("SELECT r.IDReservacion, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                    a.NoControl, d.NoTarjeta, t.Titulo, t.ISBN, r.FechaRealizada, r.FechaExpiracion
                    FROM reservaciones r
                    INNER JOIN usuarios u ON r.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON r.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON r.IDUsuario = d.IDUsuario
                    INNER JOIN titulos t ON r.IDTitulo = t.IDTitulo
                    INNER JOIN titulo_autores ta ON r.IDTitulo = ta.IDTitulo
                    WHERE (r.IDReservacion = :reservacion OR :reservacion IS NULL OR :reservacion = '')
                    AND (t.Titulo LIKE CONCAT(:titulo, '%') OR :titulo IS NULL OR :titulo = '')
                    AND (t.IDEditorial = :editorial OR :editorial IS NULL OR :editorial = '')
                    AND (t.CodigoClasificacion = :clasificacion OR :clasificacion IS NULL OR :clasificacion = '')
                    AND (r.FechaRealizada >= :fechareservadoinicio OR :fechareservadoinicio IS NULL OR :fechareservadoinicio = '')
                    AND (r.FechaRealizada <= :fechareservadofinal OR :fechareservadofinal IS NULL OR :fechareservadofinal = '')
                    AND (r.FechaExpiracion >= :fechaexpiracioninicio OR :fechaexpiracioninicio IS NULL OR :fechaexpiracioninicio = '')
                    AND (r.FechaExpiracion <= :fechaexpiracionfinal OR :fechaexpiracionfinal IS NULL OR :fechaexpiracionfinal = '')
                    $query
                    GROUP BY r.IDReservacion
                    ORDER BY r.FechaRealizada DESC");
                $stmt->bindParam(":reservacion", $data["IDReservacion"]);
                $stmt->bindParam(":numero", $data["numero"]);
                $stmt->bindParam(":titulo", $data["titulo"]);
                $stmt->bindParam(":editorial", $data["editorial"]);
                $stmt->bindParam(":clasificacion", $data["clasificacion"]);
                $stmt->bindParam(":fechareservadoinicio", $data["fechareservadoinicio"]);
                $stmt->bindParam(":fechareservadofinal", $data["fechareservadofinal"]);
                $stmt->bindParam(":fechaexpiracioninicio", $data["fechaexpiracioninicio"]);
                $stmt->bindParam(":fechaexpiracionfinal", $data["fechaexpiracionfinal"]);
                if (count($idautores) > 0){
                    foreach ($idautores as $number => $id){
                        $stmt->bindParam(":idautor" . $number, $id);
                    }
                }
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "multas":
                $data = json_decode($_POST["data"], true);
                $query = "SELECT p.IDPrestamo, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                    a.NoControl, d.NoTarjeta, t.Titulo, e.Folio, m.FechaMulta, m.DeudaSaldada
                    FROM multas m
                    INNER JOIN prestamos p ON m.IDPrestamo = p.IDPrestamo
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON p.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON p.IDUsuario = d.IDUsuario
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    WHERE (p.Folio LIKE CONCAT(:folio, '%') OR :folio IS NULL OR :folio = '')
                    AND (m.Sancion = :sancion OR :sancion IS NULL OR :sancion = '')
                    AND (p.FechaEntregado >= :fechaEntregadoInicio OR :fechaEntregadoInicio IS NULL OR :fechaEntregadoInicio = '')
                    AND (p.FechaEntregado <= :fechaEntregadoFinal OR :fechaEntregadoFinal IS NULL OR :fechaEntregadoFinal = '')
                    AND (p.FechaDevuelto >= :fechaDevolucionInicio OR :fechaDevolucionInicio IS NULL OR :fechaDevolucionInicio = '')
                    AND (p.FechaDevuelto <= :fechaDevolucionFinal OR :fechaDevolucionFinal IS NULL OR :fechaDevolucionFinal = '')
                    AND (m.FechaMulta >= :fechaMultaInicio OR :fechaMultaInicio IS NULL OR :fechaMultaInicio = '')
                    AND (m.FechaMulta <= :fechaMultaFinal OR :fechaMultaFinal IS NULL OR :fechaMultaFinal = '')";
                if ($data["estudiante"]){
                    $query .= " AND (a.NoControl = :numero OR :numero IS NULL OR :numero = '')";
                }else{
                    $query .= " AND (d.NoTarjeta = :numero OR :numero IS NULL OR :numero = '')";
                }
                $query .= " ORDER BY m.FechaMulta DESC";

                $stmt = $mysqli->prepare($query);
                $stmt->bindParam(":folio", $data["folio"]);
                $stmt->bindParam(":numero", $data["numero"]);
                $stmt->bindParam(":sancion", $data["sancion"]);
                $stmt->bindParam(":fechaEntregadoInicio", $data["fechaentregainicio"]);
                $stmt->bindParam(":fechaEntregadoFinal", $data["fechaentregafinal"]);
                $stmt->bindParam(":fechaDevolucionInicio", $data["fechadevolucioninicio"]);
                $stmt->bindParam(":fechaDevolucionFinal", $data["fechadevolucionfinal"]);
                $stmt->bindParam(":fechaMultaInicio", $data["fechamultainicio"]);
                $stmt->bindParam(":fechaMultaFinal", $data["fechamultafinal"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "prestamos":
                $data = json_decode($_POST["data"], true);
                $query = "SELECT p.IDPrestamo, p.FechaEntregado, p.FechaLimite, t.Titulo, e.Folio,
                    CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre, a.NoControl, d.NoTarjeta, p.FechaDevuelto,
                    m.FechaMulta, m.DeudaSaldada
                    FROM prestamos p
                    INNER JOIN ejemplares e ON p.Folio = e.Folio
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    INNER JOIN usuarios u ON p.IDUsuario = u.IDUsuario
                    LEFT JOIN alumnos a ON p.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON p.IDUsuario = d.IDUsuario
                    LEFT JOIN multas m ON p.IDPrestamo = m.IDPrestamo
                    WHERE (e.Folio LIKE CONCAT(:folio, '%') OR :folio IS NULL OR :folio = '')
                    AND (p.FechaEntregado >= :fechaEntregaInicio OR :fechaEntregaInicio IS NULL OR :fechaEntregaInicio = '')
                    AND (p.FechaEntregado <= :fechaEntregaFinal OR :fechaEntregaFinal IS NULL OR :fechaEntregaFinal = '')
                    AND (p.FechaLimite >= :fechaLimiteInicio OR :fechaLimiteInicio IS NULL OR :fechaLimiteInicio = '')
                    AND (p.FechaLimite <= :fechaLimiteFinal OR :fechaLimiteFinal IS NULL OR :fechaLimiteFinal = '')";
                
                if ($data["estudiante"]){
                    $query .= " AND (a.NoControl = :usuario OR :usuario IS NULL OR :usuario = '')";
                }else{
                    $query .= " AND (d.NoTarjeta = :usuario OR :usuario IS NULL OR :usuario = '')";
                }

                if ($data["active"]){
                    $query .= " AND p.FechaDevuelto IS NULL";
                }else{
                    $query .= " AND (p.FechaDevuelto >= :fechaDevolucionInicio OR :fechaDevolucionInicio IS NULL OR :fechaDevolucionInicio = '')
                        AND (p.FechaDevuelto <= :fechaDevolucionFinal OR :fechaDevolucionFinal IS NULL OR :fechaDevolucionFinal = '')";
                }
                $query .= " ORDER BY p.FechaEntregado DESC";

                $stmt = $mysqli->prepare($query);
                $stmt->bindParam(":folio", $data["folio"]);
                $stmt->bindParam(":usuario", $data["numero"]);
                $stmt->bindParam(":fechaEntregaInicio", $data["fechaentregainicio"]);
                $stmt->bindParam(":fechaEntregaFinal", $data["fechaentregafinal"]);
                $stmt->bindParam(":fechaLimiteInicio", $data["fechalimiteinicio"]);
                $stmt->bindParam(":fechaLimiteFinal", $data["fechalimitefinal"]);
                if ($data["active"] == false){
                    $stmt->bindParam(":fechaDevolucionInicio", $data["fechadevolucioninicio"]);
                    $stmt->bindParam(":fechaDevolucionFinal", $data["fechadevolucionfinal"]);
                }
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "titulo por ejemplar":
                $data = json_decode($_POST["data"], true);
                $stmt = $mysqli->prepare("SELECT t.Titulo, t.ISBN,
                    GROUP_CONCAT(CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno)) AS Autores, e.EstadoDisponible
                    FROM ejemplares e
                    INNER JOIN titulos t ON e.IDTitulo = t.IDTitulo
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    LEFT JOIN autores a ON ta.IDAutor = a.IDAutor
                    WHERE e.Folio = ?");
                $stmt->bindParam(1, $data["folio"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "estudiante por ID":
                $data = json_decode($_POST["data"], true);
                $stmt = $mysqli->prepare("SELECT u.IDUsuario, u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno, u.PrestamosDisponibles
                    FROM usuarios u
                    INNER JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    WHERE a.NoControl = ?");
                $stmt->bindParam(1, $data["nocontrol"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "docente por ID":
                $data = json_decode($_POST["data"], true);
                $stmt = $mysqli->prepare("SELECT u.IDUsuario, u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno
                    FROM usuarios u
                    INNER JOIN docentes d
                    ON u.IDUsuario = d.IDUsuario
                    WHERE d.NoTarjeta = ?");
                $stmt->bindParam(1, $data["notarjeta"]);
                $stmt->execute();
                $array = $stmt->fetch(PDO::FETCH_ASSOC);
            break;
            case "usuario":
                $data = json_decode($_POST["data"], true); //Cambiar toda esta query mejor por una dinamica
                $stmt = $mysqli->prepare("SELECT u.IDUsuario AS Id, CONCAT(u.Nombre, ' ', u.ApellidoPaterno, ' ', u.ApellidoMaterno) AS Nombre,
                    u.Genero, a.NoControl, a.Carrera, d.NoTarjeta, d.Departamento, ub.FechaInicio, ub.FechaFin
                    FROM usuarios u
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario
                    LEFT JOIN usuarios_bloqueados ub ON u.IDUsuario = ub.IDUsuario
                    WHERE (u.IDUsuario NOT IN (SELECT IDUsuario FROM administradores WHERE IDUsuario = u.IDUsuario))
                    AND (u.Nombre LIKE CONCAT(:nombre, '%') OR :nombre IS NULL OR :nombre = '')
                    AND (u.ApellidoPaterno LIKE CONCAT(:apeP, '%') OR :apeP IS NULL OR :apeP = '')
                    AND (u.ApellidoMaterno LIKE CONCAT(:apeM, '%') OR :apeM IS NULL OR :apeM = '')
                    AND (u.NombreUsuario LIKE CONCAT(:usuario, '%') OR :usuario IS NULL OR :usuario = '')
                    AND (u.Genero LIKE CONCAT(:genero, '%') OR :genero IS NULL OR :genero = '')
                    AND (
                        ((:nocontrol IS NOT NULL OR :carrera IS NOT NULL OR :semestre IS NOT NULL) 
                            AND (:notarjeta IS NULL AND :departamento IS NULL)
                            AND (a.NoControl LIKE CONCAT(:nocontrol, '%') OR :nocontrol IS NULL)
                            AND (a.Carrera LIKE CONCAT(:carrera, '%') OR :carrera IS NULL)
                            AND (a.Semestre LIKE CONCAT(:semestre, '%') OR :semestre IS NULL)
                            AND d.NoTarjeta IS NULL
                            AND d.Departamento IS NULL
                        )OR(
                            (:nocontrol IS NOT NULL OR :carrera IS NOT NULL OR :semestre IS NOT NULL) 
                            AND (:notarjeta IS NOT NULL OR :departamento IS NOT NULL)
                            AND (
                                (
                                    (a.NoControl LIKE CONCAT(:nocontrol, '%') OR :nocontrol IS NULL)
                                    AND (a.Carrera LIKE CONCAT(:carrera, '%') OR :carrera IS NULL)
                                    AND (a.Semestre LIKE CONCAT(:semestre, '%') OR :semestre IS NULL)
                                )OR(
                                    (d.NoTarjeta LIKE CONCAT(:notarjeta, '%') OR :notarjeta IS NULL)
                                    AND (d.Departamento LIKE CONCAT(:departamento, '%') OR :departamento IS NULL)
                                )
                            )
                        )OR(
                            (:notarjeta IS NOT NULL OR :departamento IS NOT NULL) 
                            AND (:nocontrol IS NULL AND :carrera IS NULL AND :semestre IS NULL)
                            AND (d.NoTarjeta LIKE CONCAT(:notarjeta, '%') OR :notarjeta IS NULL)
                            AND (d.Departamento LIKE CONCAT(:departamento, '%') OR :departamento IS NULL)
                            AND a.NoControl IS NULL
                            AND a.Carrera IS NULL
                            AND a.Semestre IS NULL
                        )OR(
                            (:nocontrol IS NULL AND :carrera IS NULL AND :semestre IS NULL)
                            AND (:notarjeta IS NULL AND :departamento IS NULL)
                        )
                    ) ORDER BY u.Nombre");
                $stmt->bindParam(":nombre", $data["nombre"]);
                $stmt->bindParam(":apeP", $data["apeP"]);
                $stmt->bindParam(":apeM", $data["apeM"]);
                $stmt->bindParam(":usuario", $data["usuario"]);
                $stmt->bindParam(":genero", $data["genero"]);
                $stmt->bindParam(":nocontrol", $data["nocontrol"]);
                $stmt->bindParam(":carrera", $data["carrera"]);
                $stmt->bindParam(":semestre", $data["semestre"]);
                $stmt->bindParam(":notarjeta", $data["notarjeta"]);
                $stmt->bindParam(":departamento", $data["departamento"]);
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "folio":
                $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE Folio = ?");
                $stmt->bindParam(1, $folioID);
                do{
                    $folioID = random_str(6,"0123456789");
                    $stmt->execute();
                }while ($stmt->rowCount() > 0);

                $array[] = $folioID;
            break;
            case "editorial":
                $stmt = $mysqli->prepare("SELECT * FROM editoriales");
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "autores":
                $stmt = $mysqli->prepare("SELECT * FROM autores");
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "clasificacion":
                $stmt = $mysqli->prepare("SELECT * FROM clasificacion");
                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            case "titulo":
                $data = json_decode($_POST["data"], true);
                $idautores = $data["idautores"];
                $query = "";
                if (count($idautores) > 0){
                    $query .= "AND EXISTS (SELECT 1
                        FROM titulo_autores ba2
                        WHERE ba2.IDTitulo = b.IDTitulo
                        AND ba2.IDAutor IN (";
                    foreach ($idautores as $number => $id){
                        if ($number > 0){
                            $query .= ", ";
                        }
                        $query .= ":idautor" . $number;
                    }
                    $query .= "))";
                }
                
                $stmt = $mysqli->prepare("SELECT b.IDTitulo, b.Titulo, GROUP_CONCAT(DISTINCT CONCAT(a.Nombre, ' ', a.ApellidoPaterno, ' ', a.ApellidoMaterno) SEPARATOR ', ')
                    AS Autores, CONCAT(c.CodigoClasificacion, ' - ', c.Nombre) AS Clasificacion, COUNT(DISTINCT CASE WHEN p.FechaDevuelto IS NULL THEN p.IDPrestamo END) AS Prestados,
                    COUNT(DISTINCT CASE WHEN r.FechaExpiracion > :fecha THEN r.IDReservacion END) AS Reservados, COUNT(DISTINCT s.Folio) AS Ejemplares,
                    COUNT(CASE WHEN r.IDUsuario = :id THEN r.IDReservacion END) AS YaReservado
                    FROM titulos b
                    INNER JOIN titulo_autores ba ON b.IDTitulo = ba.IDTitulo
                    INNER JOIN autores a ON ba.IDAutor = a.IDAutor
                    LEFT JOIN editoriales e ON b.IDEditorial = e.IDEditorial
                    INNER JOIN clasificacion c ON b.CodigoClasificacion = c.CodigoClasificacion
                    INNER JOIN ejemplares s ON b.IDTitulo = s.IDTitulo
                    LEFT JOIN tomos t ON b.IDTitulo = t.IDTitulo
                    LEFT JOIN volumenes v ON b.IDTitulo = v.IDTitulo
                    LEFT JOIN prestamos p ON s.Folio = p.Folio
                    LEFT JOIN reservaciones r ON b.IDTitulo = r.IDTitulo
                    WHERE (b.IDEditorial = :editorial OR :editorial IS NULL OR :editorial = '')
                    AND (e.Ubicacion LIKE CONCAT(:lugar, '%') OR :lugar IS NULL OR :lugar = '')
                    AND (b.Titulo LIKE CONCAT(:titulo, '%') OR :titulo IS NULL OR :titulo = '')
                    AND (b.ISBN LIKE CONCAT(:isbn, '%') OR :isbn IS NULL OR :isbn = '')
                    AND (b.CodigoClasificacion = :codigo OR :codigo IS NULL OR :codigo = '')
                    AND (b.AnioPublicacion LIKE CONCAT(:anio, '%') OR :anio IS NULL OR :anio = '')
                    AND (b.Idioma = :idioma OR :idioma IS NULL OR :idioma = '')
                    AND (b.Edicion LIKE CONCAT(:edicion, '%') OR :edicion IS NULL OR :edicion = '')
                    $query
                    AND (:folio IN (SELECT Folio FROM ejemplares e WHERE e.IDTitulo = b.IDTitulo) OR :folio IS NULL OR :folio = '')
                    AND (:estado IN (SELECT EstadoFisico FROM ejemplares e WHERE e.IDTitulo = b.IDTitulo) OR :estado IS NULL OR :estado = '')
                    AND (t.NoTomo = :notomo OR :notomo IS NULL)
                    AND (t.Nombre LIKE CONCAT(:nombretomo, '%') OR :nombretomo IS NULL OR :nombretomo = '')
                    AND (v.NoVolumen = :novolumen OR :novolumen IS NULL)
                    AND (v.Nombre LIKE CONCAT(:nombrevolumen, '%') OR :nombrevolumen IS NULL OR :nombrevolumen = '')
                    GROUP BY b.IDTitulo
                    ORDER BY b.Titulo");
                $stmt->bindParam(":editorial", $data["editorial"]);
                $stmt->bindParam(":lugar", $data["lugar"]);
                $stmt->bindParam(":titulo", $data["titulo"]);
                $stmt->bindParam(":isbn", $data["ISBN"]);
                $stmt->bindParam(":codigo", $data["codigo"]);
                $stmt->bindParam(":anio", $data["anio"]);
                $stmt->bindParam(":idioma", $data["idioma"]);
                $stmt->bindParam(":edicion", $data["edicion"]);
                $stmt->bindParam(":folio", $data["folio"]);
                $stmt->bindParam(":estado", $data["estado"]);
                $stmt->bindParam(":notomo", $data["notomo"]);
                $stmt->bindParam(":nombretomo", $data["nombretomo"]);
                $stmt->bindParam(":novolumen", $data["novolumen"]);
                $stmt->bindParam(":nombrevolumen", $data["nombrevolumen"]);
                $stmt->bindParam(":fecha", $data["fecha"]);
                $stmt->bindParam(":id", $id);

                if (count($idautores) > 0){
                    foreach ($idautores as $number => $id){
                        $stmt->bindParam(":idautor" . $number, $id);
                    }
                }

                $stmt->execute();
                $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
        }

        header("Content-Type: application/json");
        echo json_encode(["status" => "success", "data" => json_encode($array)]);
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-admin"]);
    }
?>