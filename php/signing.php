<?php
    $toSign = file_get_contents("php://input"); // recibe el contenido a firmar
    $privateKeyPath = __DIR__ . '/private_key.pem';
    $privateKey = file_get_contents($privateKeyPath);

    $signature = "";
    openssl_sign($toSign, $signature, $privateKey, OPENSSL_ALGO_SHA1);
    echo base64_encode($signature);
?>