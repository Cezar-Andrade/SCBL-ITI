-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-11-2025 a las 01:11:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `centro_de_informacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `IDUsuario` varchar(10) NOT NULL,
  `Permisos` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `NoControl` varchar(8) NOT NULL,
  `Carrera` varchar(50) NOT NULL,
  `Semestre` tinyint(2) NOT NULL,
  `IDUsuario` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autores`
--

CREATE TABLE `autores` (
  `IDAutor` varchar(10) NOT NULL,
  `Nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `NoTarjeta` varchar(8) NOT NULL,
  `Departamento` varchar(30) NOT NULL,
  `IDUsuario` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `editoriales`
--

CREATE TABLE `editoriales` (
  `IDEditorial` varchar(10) NOT NULL,
  `Nombre` varchar(60) NOT NULL,
  `Ubicacion` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejemplares`
--

CREATE TABLE `ejemplares` (
  `Folio` varchar(10) NOT NULL,
  `IDTitulo` varchar(10) NOT NULL,
  `EstadoFisico` varchar(20) NOT NULL,
  `EstadoDisponible` varchar(20) NOT NULL,
  `FechaRegistro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multas`
--

CREATE TABLE `multas` (
  `IDPrestamo` varchar(10) NOT NULL,
  `Razon` varchar(255) NOT NULL,
  `Sancion` varchar(50) NOT NULL,
  `FechaMulta` date NOT NULL,
  `DeudaSaldada` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `IDPrestamo` varchar(10) NOT NULL,
  `IDUsuario` varchar(10) DEFAULT NULL,
  `Folio` varchar(10) DEFAULT NULL,
  `ADomicilio` tinyint(1) NOT NULL,
  `FechaEntregado` date NOT NULL,
  `FechaLimite` date DEFAULT NULL,
  `FechaDevuelto` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservaciones`
--

CREATE TABLE `reservaciones` (
  `IDReservacion` varchar(10) NOT NULL,
  `IDUsuario` varchar(10) NOT NULL,
  `IDTitulo` varchar(10) NOT NULL,
  `FechaRealizada` date NOT NULL,
  `FechaExpiracion` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `titulos`
--

CREATE TABLE `titulos` (
  `IDTitulo` varchar(10) NOT NULL,
  `IDEditorial` varchar(10) DEFAULT NULL,
  `Titulo` varchar(100) NOT NULL,
  `ISBN` varchar(20) DEFAULT NULL,
  `CodigoClasificacion` varchar(20) DEFAULT NULL,
  `AnioPublicacion` varchar(4) DEFAULT NULL,
  `Idioma` varchar(20) NOT NULL,
  `Edicion` varchar(30) DEFAULT NULL,
  `FechaRegistro` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `titulo_autores`
--

CREATE TABLE `titulo_autores` (
  `IDTitulo` varchar(10) NOT NULL,
  `IDAutor` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tokens_contrasena`
--

CREATE TABLE `tokens_contrasena` (
  `IDUsuario` varchar(10) NOT NULL,
  `Token` varchar(30) NOT NULL,
  `FechaExpiracion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tomos`
--

CREATE TABLE `tomos` (
  `IDTitulo` varchar(10) NOT NULL,
  `NoTomo` tinyint(2) DEFAULT NULL,
  `Nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `IDUsuario` varchar(10) NOT NULL,
  `Nombre` varchar(60) NOT NULL,
  `ApellidoPaterno` varchar(30) NOT NULL,
  `ApellidoMaterno` varchar(30) NOT NULL,
  `NombreUsuario` varchar(30) NOT NULL,
  `Genero` varchar(1) NOT NULL,
  `Contrasena` varchar(60) NOT NULL,
  `FechaInscrito` date DEFAULT NULL,
  `PrestamosDisponibles` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_bloqueados`
--

CREATE TABLE `usuarios_bloqueados` (
  `IDUsuario` varchar(10) NOT NULL,
  `Razon` varchar(255) NOT NULL,
  `FechaInicio` date NOT NULL,
  `FechaFin` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `volumenes`
--

CREATE TABLE `volumenes` (
  `IDTitulo` varchar(10) NOT NULL,
  `NoVolumen` tinyint(2) DEFAULT NULL,
  `Nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`IDUsuario`),
  ADD KEY `IDUsuario` (`IDUsuario`);

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`NoControl`),
  ADD KEY `IDUsuario` (`IDUsuario`);

--
-- Indices de la tabla `autores`
--
ALTER TABLE `autores`
  ADD PRIMARY KEY (`IDAutor`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`NoTarjeta`),
  ADD KEY `IDUsuario` (`IDUsuario`);

--
-- Indices de la tabla `editoriales`
--
ALTER TABLE `editoriales`
  ADD PRIMARY KEY (`IDEditorial`);

--
-- Indices de la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  ADD PRIMARY KEY (`Folio`),
  ADD KEY `IDTitulo` (`IDTitulo`);

--
-- Indices de la tabla `multas`
--
ALTER TABLE `multas`
  ADD UNIQUE KEY `IDPrestamo` (`IDPrestamo`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`IDPrestamo`),
  ADD KEY `IDUsuario` (`IDUsuario`),
  ADD KEY `Folio` (`Folio`);

--
-- Indices de la tabla `reservaciones`
--
ALTER TABLE `reservaciones`
  ADD PRIMARY KEY (`IDReservacion`),
  ADD KEY `IDUsuario` (`IDUsuario`),
  ADD KEY `IDTitulo` (`IDTitulo`);

--
-- Indices de la tabla `titulos`
--
ALTER TABLE `titulos`
  ADD PRIMARY KEY (`IDTitulo`),
  ADD KEY `IDEditorial` (`IDEditorial`);

--
-- Indices de la tabla `titulo_autores`
--
ALTER TABLE `titulo_autores`
  ADD KEY `IDTitulo` (`IDTitulo`),
  ADD KEY `IDAutor` (`IDAutor`);

--
-- Indices de la tabla `tokens_contrasena`
--
ALTER TABLE `tokens_contrasena`
  ADD UNIQUE KEY `IDUsuario` (`IDUsuario`);

--
-- Indices de la tabla `tomos`
--
ALTER TABLE `tomos`
  ADD KEY `IDTitulo` (`IDTitulo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`IDUsuario`),
  ADD UNIQUE KEY `NombreUsuario` (`NombreUsuario`);

--
-- Indices de la tabla `usuarios_bloqueados`
--
ALTER TABLE `usuarios_bloqueados`
  ADD KEY `IDUsuario` (`IDUsuario`);

--
-- Indices de la tabla `volumenes`
--
ALTER TABLE `volumenes`
  ADD KEY `IDTitulo` (`IDTitulo`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `docentes_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  ADD CONSTRAINT `ejemplares_ibfk_1` FOREIGN KEY (`IDTitulo`) REFERENCES `titulos` (`IDTitulo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `multas`
--
ALTER TABLE `multas`
  ADD CONSTRAINT `multas_ibfk_1` FOREIGN KEY (`IDPrestamo`) REFERENCES `prestamos` (`IDPrestamo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`Folio`) REFERENCES `ejemplares` (`Folio`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservaciones`
--
ALTER TABLE `reservaciones`
  ADD CONSTRAINT `reservaciones_ibfk_1` FOREIGN KEY (`IDTitulo`) REFERENCES `titulos` (`IDTitulo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservaciones_ibfk_2` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `titulos`
--
ALTER TABLE `titulos`
  ADD CONSTRAINT `titulos_ibfk_2` FOREIGN KEY (`IDEditorial`) REFERENCES `editoriales` (`IDEditorial`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `titulo_autores`
--
ALTER TABLE `titulo_autores`
  ADD CONSTRAINT `titulo_autores_ibfk_1` FOREIGN KEY (`IDTitulo`) REFERENCES `titulos` (`IDTitulo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `titulo_autores_ibfk_2` FOREIGN KEY (`IDAutor`) REFERENCES `autores` (`IDAutor`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tokens_contrasena`
--
ALTER TABLE `tokens_contrasena`
  ADD CONSTRAINT `tokens_contrasena_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tomos`
--
ALTER TABLE `tomos`
  ADD CONSTRAINT `tomos_ibfk_1` FOREIGN KEY (`IDTitulo`) REFERENCES `titulos` (`IDTitulo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios_bloqueados`
--
ALTER TABLE `usuarios_bloqueados`
  ADD CONSTRAINT `usuarios_bloqueados_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuarios` (`IDUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `volumenes`
--
ALTER TABLE `volumenes`
  ADD CONSTRAINT `volumenes_ibfk_1` FOREIGN KEY (`IDTitulo`) REFERENCES `titulos` (`IDTitulo`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

INSERT INTO `usuarios` (`IDUsuario`, `Nombre`, `ApellidoPaterno`, `ApellidoMaterno`, `NombreUsuario`, `Genero`, `Contrasena`, `FechaInscrito`, `PrestamosDisponibles`) VALUES ('oaosmdkl32', 'Administrador', 'Temporal', 'X', 'admin', 'M', '$2y$10$rvrTP3df0gl2O6x.53H/ROsNHAYiux9yNi6Qx0XZUL3voMxY.r5SC', NULL, 4);
INSERT INTO `docentes` (`NoTarjeta`, `Departamento`, `IDUsuario`) VALUES ('0001', 'Biblioteca', 'oaosmdkl32');
INSERT INTO `administradores` (`IDUsuario`, `Permisos`) VALUES ('oaosmdkl32', 1);
