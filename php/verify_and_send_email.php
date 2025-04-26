<?php
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require '../includes/PHPMailer/src/PHPMailer.php';
    require '../includes/PHPMailer/src/SMTP.php';
    require '../includes/PHPMailer/src/Exception.php';

    function random_str(
        int $length = 10,
        string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ): string {
        if ($length < 1) {
            throw new \RangeException("Length must be a positive integer");
        }
        $pieces = [];
        $max = mb_strlen($keyspace, '8bit') - 1;
        for ($i = 0; $i < $length; ++$i) {
            $pieces []= $keyspace[random_int(0, $max)];
        }
        return implode('', $pieces);
    }

    require 'database.php';
    
    $usuario = $_POST["username"];
    $numero = $_POST["nocontrol"];

    $stmt = $mysqli->prepare("SELECT * FROM usuarios WHERE NombreUsuario = ? AND (IDUsuario = (SELECT IDUsuario FROM alumnos WHERE NoControl = ?) OR IDUsuario = (SELECT IDUsuario FROM docentes WHERE NoTarjeta = ?))");
    $stmt->bindParam(1, $usuario);
    $stmt->bindParam(2, $numero);
    $stmt->bindParam(3, $numero);
    $stmt->execute();

    if ($stmt->rowCount() > 0){
        $stmt = $mysqli->prepare("SELECT * FROM tokens_contrasena WHERE IDUsuario = ?");
        $stmt->bindParam(1, $usuario);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0){
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            $expiration = date("Y-m-d H:i:s", strtotime("+3 hours", $data["FechaExpiracion"]));
            if ($expiration <= strtotime("now")){
                $update = true;
            }else{
                header("Content-Type: application/json");
                echo json_encode(["status" => "not-expired"]);
                exit();
            }
        }else{
            $update = false;
        }

        $token = random_str(30);
        $expiration = date("Y-m-d H:i:s", strtotime("+1 hour"));
        $resetLink = "http://siiguala.ddns.net/php/reset_password.php?token=$token";
                
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.office365.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'cesar_esponja10@hotmail.com';
        $mail->Password = 'jopekwqutsomewgo';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPDebug = 3;

        $mail->setFrom('cesar_esponja10@hotmail.com', 'Centro de Información');
        $mail->addAddress("L$numero@costagrande.tecnm.mx");

        $mail->isHTML(true);
        $mail->Subject = "Recuperación de Contraseña - Centro de Información ITI";
        $mail->Body = "
            <p>Hemos recibido una solicitud para restaurar la contraseña de tu cuenta del Centro de Información del Instituto Tecnológico de Iguala, para restaurarlo da clic en el siguiente enlace:</p>
            <a href='$resetLink'>Restaurar contraseña</a>
            <p>El enlace expirará dentro de 1 hora de su solicitud, de no haber podido acceder al enlace durante el tiempo establecido, intentarlo de nuevo despues de 4 horas de haberse hecho la petición o consulte con el Centro de Información para que te restauren la contraseña.</p>
            <p>De no haber solicitado esto, ignore este correo electronico.</p>
        ";

        $mail->send();

        if ($update){
            $stmt = $mysqli->prepare("UPDATE tokens_contrasena SET Token = ?, FechaExpiracion = ? WHERE IDUsuario = ?");
            $stmt->bindParam(1, $token);
            $stmt->bindParam(2, $expiration);
            $stmt->bindParam(3, $data["IDUsuario"]);
        }else{
            $stmt = $mysqli->prepare("INSERT INTO tokens_contrasena VALUES (?, ?, ?)");
            $stmt->bindParam(1, $data["IDUsuario"]);
            $stmt->bindParam(2, $token);
            $stmt->bindParam(3, $expiration);
        }
        $stmt->execute();

        header("Content-Type: application/json");
        echo json_encode(["status" => "valid"]);
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "not-valid"]);
    }
?>