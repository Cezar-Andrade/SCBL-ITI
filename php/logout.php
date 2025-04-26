<?php
    session_start();

    unset($_SESSION["userID"]);
    unset($_SESSION["type"]);

    header("Location: ../index");
?>