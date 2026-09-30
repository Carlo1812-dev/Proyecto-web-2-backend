# Mi Cacharrito

Sistema de alquiler de vehículos para la empresa **Mi Cacharrito**.
Usuarios se registran, alquilan vehículos y descargan el comprobante en PDF;
el administrador gestiona entregas, devoluciones y cobros por mora.

**Asignatura:** Programación Web 2 · Ingeniería Informática · Universidad de Caldas

---

## 1. Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 17 · Spring Boot 4.1.1 · Spring Data JPA · iText 8 (PDF) · BCrypt |
| Base de datos | MySQL 8.0 |
| Frontend | Angular 22 · TypeScript · Bootstrap 5 |
| IDE | Eclipse (backend) · VS Code (frontend) |
| Hosting | GitHub Pages (frontend) · Render (backend) · Aiven (MySQL) |

---

## 2. Requisitos previos

- Java JDK 17
- MySQL 8.0 en ejecución
- Node.js 18+ y npm
- Eclipse (para el backend) o Maven
- VS Code con la extensión Angular Language Service

---

## 3. Base de datos

```bash
mysql -uroot -p < docs/script-mysql.sql
```

Esto crea la base de datos `micacharrito` con las tablas `usuarios`, `vehiculos` y `alquileres`.
Las contraseñas y los datos de prueba los inserta automáticamente el backend al arrancar
(clase `DatosIniciales`).

Si prefieres que Hibernate cree las tablas solo, déjalo en `spring.jpa.hibernate.ddl-auto=update`.

---

## 4. Backend en Eclipse

1. **File → Import → Maven → Existing Maven Projects**
2. Selecciona la carpeta `backend/`
3. Espera a que Eclipse descargue las dependencias
4. Revisa `backend/src/main/resources/application.properties` y ajusta usuario/contraseña de MySQL
5. Click derecho en `MiCacharritoApplication.java` → **Run As → Spring Boot App**
6. El servidor queda en `http://localhost:8081`

### Compilar desde la terminal

```bash
cd backend
mvn -B package -DskipTests
java -jar target/mi-cacharrito-0.0.1-SNAPSHOT.jar
```

---

## 5. Frontend

```bash
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`.

---

## 6. Usuarios de prueba

| Rol | Identificación | Contraseña |
|---|---|---|
| Administrador | `ADMIN-001` | `admin123` |
| Usuario | `1234567890` | `usuario123` |

---

## 7. API REST

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login/l/registrar/` | Registro de usuario |
| POST | `/login/l/ingresar/` | Inicio de sesión |

### Usuario

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/vehiculo/v/listarDisponibles/` | Vehículos disponibles |
| GET | `/vehiculo/v/listarDisponiblesTipo/?tipo=` | Disponibles por tipo |
| POST | `/alquiler/a/guardarAlquiler/` | Crear alquiler |
| GET | `/alquiler/a/misAlquileres/?identificacion=` | Alquileres del usuario |
| POST | `/alquiler/a/cancelar/?numero=&identificacion=` | Cancelar alquiler |
| GET | `/alquiler/a/pdf/?numero=` | Descargar PDF |

### Administrador

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/ad/pendientes/` | Alquilados sin entregar |
| GET | `/admin/ad/entregados/` | Entregados al usuario |
| GET | `/admin/ad/atrasados/` | Devoluciones vencidas |
| GET | `/admin/ad/buscarPorNumero/?numero=` | Buscar alquiler |
| POST | `/admin/ad/entregar/?placa=` | Cambiar a **entregado** |
| POST | `/admin/ad/devolver/?numero=` | Vehículo a **disponible** + cobrar mora |
| GET | `/vehiculo/v/listarTodo/` | Todos los vehículos |
| GET | `/vehiculo/v/listarTodoTipo/?tipo=` | Todos por tipo |

---

## 8. Estados del alquiler

```
PENDIENTE_ENTREGA ──(admin busca por PLACA)──▶ ENTREGADO
       │                                          │
       │                                          ▼
       └──(usuario cancela)──▶ CANCELADO    DEVUELTO ──▶ vehículo DISPONIBLE
                                                  (cobra días posteriores)
```

---

## 9. Entregables

| # | Entregable | Archivo |
|---|---|---|
| 1 | MR – Modelo Relacional | [`docs/modelo-relacional.md`](docs/modelo-relacional.md) |
| 2 | Trello | [`docs/trello.md`](docs/trello.md) |
| 3 | GitHub | Repositorio con el código fuente |
| 4 | Hosting | Ver sección 10 |
| 5 | Proyecto completo | Este repositorio |

---

## 10. Hosting

### 10.1 Base de datos en Aiven (gratis)

1. Regístrate en <https://aiven.io> → **Create database** → **MySQL** (plan gratuito)
2. Copia el **Service URI**: `mysql://usuario:clave@host:puerto/micacharrito`
3. Descarga el certificado SSL si Aiven lo exige
4. Conviértela a JDBC:
   `jdbc:mysql://HOST:PUERTO/micacharrito?useSSL=true&serverTimezone=UTC`

### 10.2 Backend en Render (gratis)

1. Sube el código a GitHub
2. En <https://render.com> → **New → Web Service** → conecta el repo
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `mvn -B package -DskipTests`
   - **Start Command:** `java -jar target/mi-cacharrito-0.0.1-SNAPSHOT.jar`
4. Agrega estas **Environment Variables**:

   | Clave | Valor |
   |---|---|
   | `SPRING_DATASOURCE_URL` | la URL JDBC de Aiven |
   | `SPRING_DATASOURCE_USERNAME` | usuario de Aiven |
   | `SPRING_DATASOURCE_PASSWORD` | contraseña de Aiven |
   | `APP_CORS_ORIGINS` | `https://TU-USUARIO.github.io` |

   > Nota: `app.cors.origins` es una propiedad normal; en `application.properties`
   > se llama igual. Spring la sobrescribe con la variable de entorno.

5. Anota la URL asignada, por ejemplo `https://mi-cacharrito-backend.onrender.com`

### 10.3 Frontend en GitHub Pages

1. Edita `frontend/src/environments/environment.prod.ts` y pon la URL de Render
2. En GitHub → **Settings → Pages → Source: GitHub Actions**
3. El workflow `.github/workflows/deploy-frontend.yml` compila y publica automáticamente
4. La app quedará en `https://TU-USUARIO.github.io/mi-cacharrito/`

---

## 11. Estructura del proyecto

```
prueba/
├── backend/                    # Eclipse: Maven / Spring Boot
│   └── src/main/java/com/micacharrito/
│       ├── controlador/        # ControladoraLogin, Vehiculo, Alquiler, Admin
│       ├── modelo/             # Usuario, Vehiculo, Alquiler
│       ├── repositorio/        # usuario, vehiculo, alquiler
│       ├── datos/              # DatosIniciales (datos de prueba)
│       └── config/             # ConfiguracionCors
├── frontend/                   # Angular 22 + Bootstrap 5
│   └── src/app/
│       ├── entities/  servicios/  guards/
│       ├── login/  registro/  vehiculos/  alquileres/  admin/
│       └── navegacion/
└── docs/
    ├── modelo-relacional.md    # MR
    ├── script-mysql.sql
    └── trello.md
```
