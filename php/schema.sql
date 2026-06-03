--Datos personales: Carmen Méndez Camino UO299841
CREATE DATABASE UO299841_DB;
USE UO299841_DB;

-- Borrado de tablas en orden inverso a sus dependencias
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS recursos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- 1. Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías de Recursos
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Tabla de Recursos Turísticos
CREATE TABLE recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    capacidad INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_Recurso_Categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 4. Tabla de Horarios y Disponibilidad
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_recurso INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    CONSTRAINT FK_Horario_Recurso FOREIGN KEY (id_recurso) REFERENCES recursos(id) ON DELETE CASCADE
);

-- 5. Tabla de Reservas
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_recurso INT NOT NULL,
    id_horario INT NOT NULL,
    plazas INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Reserva_Usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_Reserva_Recurso FOREIGN KEY (id_recurso) REFERENCES recursos(id) ON DELETE CASCADE,
    CONSTRAINT FK_Reserva_Horario FOREIGN KEY (id_horario) REFERENCES horarios(id) ON DELETE CASCADE
);
