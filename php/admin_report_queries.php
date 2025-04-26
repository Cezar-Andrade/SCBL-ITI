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

        $type = $_POST["type"];
        switch ($type){
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
                $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);
                $sheet->getStyle('C:C')->getAlignment()->setWrapText(true);
                $sheet->getStyle('A:E')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

                foreach (range('A', $col) as $columnID) {
                    if ($columnID == 'C'){
                        $sheet->getColumnDimension($columnID)->setWidth(70);
                    }else{
                        $sheet->getColumnDimension($columnID)->setAutoSize(true);
                    }
                }

                $sheet->getStyle('A:E')->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle('A')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('E')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                
                $lastRow = $row - 1;
                $range = 'A1:E' . $lastRow;

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