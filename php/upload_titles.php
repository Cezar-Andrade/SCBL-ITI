<?php
    require "database.php";
    require "randstr.php";
    require "php_spread_sheet_import.php";

    use PhpOffice\PhpSpreadsheet\IOFactory;

    $directory = '../includes';
    $files = glob($directory . '/*.csv'); // Get all .csv files in the directory

    $mysqli->beginTransaction();

    try {
        foreach ($files as $inputFileName) {
            $spreadsheet = IOFactory::load($inputFileName);
            $sheet = $spreadsheet->getActiveSheet();
            $data = $sheet->toArray();
            
            $estado = "Buena condicion";
            $disponible = "Disponible";
            //$date = "2024-01-01";

            $firstRow = true;
            foreach ($data as $row) {
                if ($firstRow) {
                    $firstRow = false;
                    continue; // Skip header row
                }

                $class = mb_convert_encoding($row[0], 'UTF-8', 'auto');
                $folios = mb_convert_encoding($row[1], 'UTF-8', 'auto');
                $title = mb_convert_encoding($row[2], 'UTF-8', 'UTF-8');
                $author = mb_convert_encoding($row[3], 'UTF-8', 'auto');
                $edition = mb_convert_encoding($row[4], 'UTF-8', 'auto');
                $year = mb_convert_encoding($row[5], 'UTF-8', 'auto');
                $isbn = mb_convert_encoding($row[6], 'UTF-8', 'auto');
                $editorial = mb_convert_encoding($row[7], 'UTF-8', 'auto');
                
                $folios = preg_replace('/\s+/', '', $folios);
                $folios = explode(",", $folios);

                $author = preg_split('/\s*[\/,]\s*/', $author);
                $author = array_map('trim', $author);
                $author = array_filter($author, fn($v) => $v !== "");
                $author = array_values($author);

                if ($year == ""){
                    $year = null;
                }

                if ($isbn == ""){
                    $isbn = null;
                }

                if ($edition == ""){
                    $edition = null;
                }

                if ($editorial == ""){
                    $idE = null;
                }else{
                     $stmt = $mysqli->prepare("SELECT * FROM editoriales WHERE Nombre = ?");
                    $stmt->bindParam(1, $editorial);
                    $stmt->execute();

                    if ($stmt->rowCount() > 0){
                        $idE = $stmt->fetch(PDO::FETCH_ASSOC)["IDEditorial"];
                    }else{
                        $stmt = $mysqli->prepare("SELECT * FROM editoriales WHERE IDEditorial = ?");
                        $stmt->bindParam(1, $idE);
                        do{
                            $idE = random_str();
                            $stmt->execute();
                        }while ($stmt->rowCount() > 0);

                        $stmt = $mysqli->prepare("INSERT INTO editoriales(IDEditorial, Nombre) VALUES(?, ?)");
                        $stmt->bindParam(1, $idE);
                        $stmt->bindParam(2, $editorial);
                        $stmt->execute();
                    }
                }

                $stmt = $mysqli->prepare("SELECT * FROM titulos WHERE IDEditorial = ? AND Titulo = ? AND ISBN = ? AND CodigoClasificacion = ?
                    AND AnioPublicacion = ? AND Edicion = ?");
                $stmt->bindParam(1, $idE);
                $stmt->bindParam(2, $title);
                $stmt->bindParam(3, $isbn);
                $stmt->bindParam(4, $class);
                $stmt->bindParam(5, $year);
                $stmt->bindParam(6, $edicion);
                $stmt->execute();

                if ($stmt->rowCount() > 0){
                    $idT = $stmt->fetch(PDO::FETCH_ASSOC)["IDTitulo"];
                }else{
                    $stmt = $mysqli->prepare("SELECT * FROM titulos WHERE IDTitulo = ?");
                    $stmt->bindParam(1, $idT);
                    do{
                        $idT = random_str();
                        $stmt->execute();
                    }while ($stmt->rowCount() > 0);

                    $lang = "Español";
                    $stmt = $mysqli->prepare("INSERT INTO titulos VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    $stmt->bindParam(1, $idT);
                    $stmt->bindParam(2, $idE);
                    $stmt->bindParam(3, $title);
                    $stmt->bindParam(4, $isbn);
                    $stmt->bindParam(5, $class);
                    $stmt->bindParam(6, $year);
                    $stmt->bindParam(7, $lang);
                    $stmt->bindParam(8, $edition);
                    //$stmt->bindParam(9, $date);
                    $stmt->execute();
                }

                foreach ($author as $a){
                    $stmt = $mysqli->prepare("SELECT * FROM autores WHERE Nombre = ?");
                    $stmt->bindParam(1, $a);
                    $stmt->execute();

                    if ($stmt->rowCount() > 0){
                        $idA = $stmt->fetch(PDO::FETCH_ASSOC)["IDAutor"];
                    }else{
                        $stmt = $mysqli->prepare("SELECT * FROM autores WHERE IDAutor = ?");
                        $stmt->bindParam(1, $idA);
                        do{
                            $idA = random_str();
                            $stmt->execute();
                        }while ($stmt->rowCount() > 0);

                        $stmt = $mysqli->prepare("INSERT INTO autores VALUES(?, ?)");
                        $stmt->bindParam(1, $idA);
                        $stmt->bindParam(2, $a);
                        $stmt->execute();
                    }

                    $stmt = $mysqli->prepare("SELECT * FROM titulo_autores WHERE IDTitulo = ? AND IDAutor = ?");
                    $stmt->bindParam(1, $idT);
                    $stmt->bindParam(2, $idA);
                    $stmt->execute();

                    if ($stmt->rowCount() == 0){
                        $stmt = $mysqli->prepare("INSERT INTO titulo_autores VALUES(?, ?)");
                        $stmt->bindParam(1, $idT);
                        $stmt->bindParam(2, $idA);
                        $stmt->execute();
                    }
                }

                foreach ($folios as $f){
                    $stmt = $mysqli->prepare("SELECT * FROM ejemplares WHERE Folio = ?");
                    $stmt->bindParam(1, $f);
                    $stmt->execute();

                    if ($stmt->rowCount() == 0){
                        $stmt = $mysqli->prepare("INSERT INTO ejemplares VALUES(?, ?, ?, ?, NOW())");
                        $stmt->bindParam(1, $f);
                        $stmt->bindParam(2, $idT);
                        $stmt->bindParam(3, $estado);
                        $stmt->bindParam(4, $disponible);
                        //$stmt->bindParam(5, $date);
                        $stmt->execute();
                    }
                }
            }
        }

        $mysqli->commit();
        echo "All CSV files imported successfully!";
    } catch (Exception $e) {
        $mysqli->rollBack();
        echo "Failed to import data: " . $e->getMessage();
    }
?>
