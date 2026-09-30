-- ============================================================
--  MI CACHARRITO - Base de datos MySQL
--  Script de creacion del modelo relacional
--  Universdad de Caldas - Programacion Web 2
-- ============================================================

CREATE DATABASE IF NOT EXISTS micacharrito
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE micacharrito;

DROP TABLE IF EXISTS alquileres;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS usuarios;

-- ------------------------------------------------------------
--  TABLA: usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id                        BIGINT       NOT NULL AUTO_INCREMENT,
  identificacion            VARCHAR(255) NOT NULL,
  nombre_completo           VARCHAR(255) NOT NULL,
  fecha_expedicion_licencia DATE         NOT NULL,
  categoria_licencia        VARCHAR(255) NOT NULL,
  vigencia_licencia         DATE         NOT NULL,
  correo_electronico        VARCHAR(255) NOT NULL,
  numero_telefono           VARCHAR(255) NOT NULL,
  password                  VARCHAR(255) NOT NULL,
  rol                       VARCHAR(10)  NOT NULL DEFAULT 'USUARIO',
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_identificacion (identificacion)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
--  TABLA: vehiculos
--  tipo  : AUTOMOVIL | CAMIONETA | CAMPERO | MICROBUS | MOTOCICLETA
--  estado: DISPONIBLE | ALQUILADO
-- ------------------------------------------------------------
CREATE TABLE vehiculos (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  tipo           VARCHAR(20)  NOT NULL,
  placa          VARCHAR(255) NOT NULL,
  marca          VARCHAR(255) NOT NULL,
  modelo         VARCHAR(255) NOT NULL,
  anio           INT          NOT NULL,
  color          VARCHAR(255) NOT NULL,
  valor_alquiler DOUBLE       NOT NULL,
  estado         VARCHAR(20)  NOT NULL DEFAULT 'DISPONIBLE',
  PRIMARY KEY (id),
  UNIQUE KEY uk_vehiculos_placa (placa)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
--  TABLA: alquileres
--  estado: PENDIENTE_ENTREGA | ENTREGADO | DEVUELTO | CANCELADO
-- ------------------------------------------------------------
CREATE TABLE alquileres (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  numero_alquiler VARCHAR(255) NOT NULL,
  usuario_id      BIGINT       NOT NULL,
  vehiculo_id     BIGINT       NOT NULL,
  fecha_inicio    DATE         NOT NULL,
  fecha_entrega   DATE         NOT NULL,
  valor_total     DOUBLE       NOT NULL,
  estado          VARCHAR(255) NOT NULL DEFAULT 'PENDIENTE_ENTREGA',
  dias_mora       INT          NOT NULL DEFAULT 0,
  valor_mora      DOUBLE       NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_alquileres_numero (numero_alquiler),
  CONSTRAINT fk_alquiler_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_alquiler_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES vehiculos (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
--  DATOS DE PRUEBA
--  Las contrasenas se guardan cifradas con BCrypt y las crea
--  automaticamente la clase DatosIniciales al arrancar el backend,
--  igual que el catalogo de vehiculos: 25 en total (5 por categoria).
--
--  Admin   : ADMIN-001    / admin123
--  Usuario : 1234567890   / usuario123
-- ------------------------------------------------------------
