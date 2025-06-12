<?php
    require "database.php";
    require "php_spread_sheet_import.php";

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    use PhpOffice\PhpSpreadsheet\Style\Alignment;
    use PhpOffice\PhpSpreadsheet\Style\Border;
    use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

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
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headerStyle = [
            'font' => [
                'bold' => true,
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'bottom' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                ],
            ],
        ];

        $type = $_POST["type"];
        if ($type != "libros" && $type != "usuarios"){
            $data = json_decode($_POST["data"], true);
            
            $row = 1;
            foreach ($data as $tableRow) {
                $col = 'A';

                foreach ($tableRow as $cell) {
                    $sheet->setCellValue($col . $row, $cell);
                    $col++;
                }
                $row++;
            }
        }

        switch ($type){
            case "usuarios":
                $stmt = $mysqli->prepare("SELECT a.NoControl, d.NoTarjeta, u.Nombre, u.ApellidoPaterno, u.ApellidoMaterno, u.NombreUsuario,
                    u.Genero, a.Carrera, d.Departamento, a.Semestre, u.FechaInscrito
                    FROM usuarios u
                    LEFT JOIN alumnos a ON u.IDUsuario = a.IDUsuario
                    LEFT JOIN docentes d ON u.IDUsuario = d.IDUsuario");
                $stmt->execute();
                $data = $stmt->fetchAll(PDO::FETCH_NUM);
                
                $sheet->setCellValue("A1", "Tipo de Usuario");
                $sheet->setCellValue("B1", "No. de control/tarjeta");
                $sheet->setCellValue("C1", "Nombre");
                $sheet->setCellValue("D1", "Apellido Materno");
                $sheet->setCellValue("E1", "Apellido Paterno");
                $sheet->setCellValue("F1", "Nombre de usuario");
                $sheet->setCellValue("G1", "Genero");
                $sheet->setCellValue("H1", "Carrera/Departamento");
                $sheet->setCellValue("I1", "Semestre (si aplica)");
                $sheet->setCellValue("J1", "Fecha de Inscrito");
                
                $row = 2;
                foreach ($data as $dataRow) {
                    if ($dataRow[0] == null){
                        $sheet->setCellValue("A" . $row, "Docente");
                        $sheet->setCellValue("B" . $row, $dataRow[1]);
                        $sheet->setCellValue("H" . $row, $dataRow[8]);
                        $sheet->setCellValue("I" . $row, "No aplica");
                    }else{
                        $sheet->setCellValue("A" . $row, "Estudiante");
                        $sheet->setCellValue("B" . $row, $dataRow[0]);
                        $sheet->setCellValue("H" . $row, $dataRow[7]);
                        $sheet->setCellValue("I" . $row, $dataRow[9]);
                    }
                    $sheet->setCellValue("C" . $row, $dataRow[2]);
                    $sheet->setCellValue("D" . $row, $dataRow[3]);
                    $sheet->setCellValue("E" . $row, $dataRow[4]);
                    $sheet->setCellValue("F" . $row, $dataRow[5]);
                    $sheet->setCellValue("G" . $row, (($dataRow[6] == "M") ? "Masculino" : "Femenino"));
                    if ($dataRow[10] != null){
                        $sheet->setCellValue("J" . $row, $dataRow[10]);
                    }else{
                        $sheet->setCellValue("J" . $row, "--");
                    }

                    $row++;
                }

                $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:J')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', 'K') as $columnID) {
                    if ($columnID == 'H'){
                        $sheet->getColumnDimension($columnID)->setWidth(30);
                    }else{
                        $sheet->getColumnDimension($columnID)->setAutoSize(true);
                    }
                }
                
                $lastRow = $row - 1;
                $range = 'A1:J' . $lastRow;

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle($range)->applyFromArray($borderStyle);

                $filename = "Usuarios_registrados_SCBL_ITI.xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
            case "libros":
                $stmt = $mysqli->prepare("SELECT t.CodigoClasificacion, GROUP_CONCAT(e.Folio SEPARATOR ', ') as Folios, t.Titulo,
                    GROUP_CONCAT(a.Nombre SEPARATOR ', ') AS Autores, ed.Nombre AS Editorial, t.ISBN, t.Edicion, t.AnioPublicacion,
                    t.Idioma, t.FechaRegistro
                    FROM titulos t
                    INNER JOIN ejemplares e ON t.IDTitulo = e.IDTitulo
                    INNER JOIN titulo_autores ta ON t.IDTitulo = ta.IDTitulo
                    INNER JOIN autores a ON ta.IDAutor = a.IDAutor
                    LEFT JOIN editoriales ed ON t.IDEditorial = ed.IDEditorial
                    GROUP BY t.IDTitulo");
                $stmt->execute();
                $data = $stmt->fetchAll(PDO::FETCH_NUM);
                
                $sheet->setCellValue("A1", "Clasificación");
                $sheet->setCellValue("B1", "Folios");
                $sheet->setCellValue("C1", "Titulo");
                $sheet->setCellValue("D1", "Autores");
                $sheet->setCellValue("E1", "Editorial");
                $sheet->setCellValue("F1", "ISBN");
                $sheet->setCellValue("G1", "Edición");
                $sheet->setCellValue("H1", "Año de Publicación");
                $sheet->setCellValue("I1", "Idioma");
                $sheet->setCellValue("J1", "Fecha de Registro");
                
                $row = 2;
                foreach ($data as $dataRow) {
                    $col = 'A';
                    foreach ($dataRow as $cell) {
                        $sheet->setCellValue($col . $row, $cell);
                        $col++;
                    }
                    $row++;
                }

                $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:J')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', 'K') as $columnID) {
                    if ($columnID == 'B' || $columnID == 'C' || $columnID == 'D'){
                        $sheet->getColumnDimension($columnID)->setWidth(50);
                    }else{
                        $sheet->getColumnDimension($columnID)->setAutoSize(true);
                    }
                }
                
                $lastRow = $row - 1;
                $range = 'A1:J' . $lastRow;

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle($range)->applyFromArray($borderStyle);

                $filename = "Libros_registrados_SCBL_ITI.xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
            case "estadisticas":
                $sheet->mergeCells('A7:B7');

                $sheet->getStyle('A7')->applyFromArray($headerStyle);

                $headerStyle = [
                    'font' => [
                        'bold' => true,
                    ],
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
                    ],
                    'borders' => [
                        'bottom' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                        ],
                    ],
                ];
                
                $sheet->getStyle('A1:A5')->applyFromArray($headerStyle);
                $sheet->getStyle('A8:A17')->applyFromArray($headerStyle);
                $sheet->getStyle('A:C')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A','C') as $columnID) {
                    if ($columnID == 'A'){
                        $sheet->getColumnDimension($columnID)->setWidth(35);
                    }else{
                        $sheet->getColumnDimension($columnID)->setAutoSize(true);
                    }
                }

                $sheet->getStyle('A:C')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle('B')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('C')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle('A1:C1')->applyFromArray($borderStyle);
                $sheet->getStyle('A3:B5')->applyFromArray($borderStyle);
                $sheet->getStyle('A7:B9')->applyFromArray($borderStyle);
                $sheet->getStyle('A11:B13')->applyFromArray($borderStyle);
                $sheet->getStyle('A15:B17')->applyFromArray($borderStyle);

                $filename = "Estadisticas_Sistema_Bibliotecario_ITI_" . $_POST["inicio"] . "_" . $_POST["final"] . ".xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
            case "libros_carrera":
                $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:H')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', $col) as $columnID) {
                    $sheet->getColumnDimension($columnID)->setAutoSize(true);
                }

                $sheet->getStyle('A:G')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle('A')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('H')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                
                $lastRow = $row - 1;
                $range = 'A1:H' . $lastRow;

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle($range)->applyFromArray($borderStyle);

                $filename = "Libros_mas_consultados_por_carrera_" . $_POST["inicio"] . "_" . $_POST["final"] . ".xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
            case "libros_consultados":
                $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:G')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', $col) as $columnID) {
                    $sheet->getColumnDimension($columnID)->setAutoSize(true);
                }

                $sheet->getStyle('A:F')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle('A')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('G')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                
                $lastRow = $row - 1;
                $range = 'A1:G' . $lastRow;

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle($range)->applyFromArray($borderStyle);

                $filename = "Libros_mas_consultados_" . $_POST["inicio"] . "_" . $_POST["final"] . ".xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
            case "deudores":
                $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:D')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', $col) as $columnID) {
                    if ($columnID == 'B'){
                        $sheet->getColumnDimension($columnID)->setWidth(30);
                    }else if ($columnID == 'C'){
                        $sheet->getColumnDimension($columnID)->setWidth(70);
                    }else{
                        $sheet->getColumnDimension($columnID)->setAutoSize(true);
                    }
                }

                $sheet->getStyle('A:D')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle('A')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('B')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('D')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                
                $lastRow = $row - 1;
                $range = 'A1:D' . $lastRow;

                $borderStyle = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];

                $sheet->getStyle($range)->applyFromArray($borderStyle);

                $filename = "Tabla_de_deudores_" . $_POST["inicio"] . "_" . $_POST["final"] . ".xlsx";
                header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                header('Content-Disposition: attachment; filename="' . $filename . '"');
                header('Cache-Control: max-age=0');
                header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
                header('Pragma: public');

                $writer = new Xlsx($spreadsheet);
                $writer->save("php://output");
                exit;
            break;
        }
    }else{
        header("Content-Type: application/json");
        echo json_encode(["status" => "user-not-admin"]);
    }
?>