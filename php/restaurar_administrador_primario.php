<?php
    require "database.php";
    require "randstr.php";

    $nocard = "0001";
    $name = "Administrador";
    $apeP = "Temporal";
    $apeM = "X";
    $user = "admin";
    $gender = "F";
    $department = "Biblioteca";
    $disponibilidad = 4;
    $fechaRegistro = null;
    $update = false;

    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = 'admin'");
    $stmt->execute();
    if ($stmt->rowCount() > 0){
        $id = $stmt->fetch(PDO::FETCH_ASSOC)["IDUsuario"];
        $update = true;
    }else{
        $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE IDUsuario = ?");
        $stmt->bindParam(1, $id);
        do{
            $id = random_str();
            $stmt->execute();
        }while ($stmt->rowCount() > 0);
		
		$stmt = $mysqli->prepare("SELECT * FROM docentes WHERE NoTarjeta = ?");
		$stmt->bindParam(1, $nocard);
		$stmt->execute();
		while ($stmt->rowCount() > 0){
			$nocard = random_str(5, '0123456789');
			$stmt->execute();
		}
	}

    $pass = password_hash("1234", PASSWORD_BCRYPT);

    if ($update){
        $stmt = $mysqli->prepare("UPDATE usuarios SET Contrasena = ? WHERE IDUsuario = ?");
        $stmt->bindParam(1, $pass);
        $stmt->bindParam(2, $id);
        $stmt->execute();
    }else{
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
		
		$stmt = $mysqli->prepare("INSERT INTO administradores VALUES(?, 1)");
		$stmt->bindParam(1, $id);
		$stmt->execute();
    }
?>