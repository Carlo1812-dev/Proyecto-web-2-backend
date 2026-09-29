# Trello — Mi Cacharrito

Tablero listo para copiar. Crear en <https://trello.com> con 5 listas.

---

## Lista 1 — 📋 Por hacer

- [ ] Definir modelo relacional (usuarios, vehiculos, alquileres)
- [ ] Crear script SQL y base de datos `micacharrito`
- [ ] Diseñar el diagrama entidad-relación (MR)
- [ ] Levantar historias de usuario de la consigna
- [ ] Definir el alcance de la primera entrega

## Lista 2 — 🛠 En curso

- [ ] Registro de usuario (8 campos + BCrypt)
- [ ] Login de usuario y administrador
- [ ] Listado de vehículos por tipo
- [ ] Solicitud de alquiler con fechas
- [ ] Generación del PDF del alquiler
- [ ] Cancelación de alquiler
- [ ] Panel de administrador: pendientes de entrega
- [ ] Entrega por número de placa
- [ ] Devolución por número de alquiler + cobro de mora

## Lista 3 — ✅ Terminado

- [ ] Estructura del proyecto (backend Eclipse + frontend Angular)
- [ ] Entidades JPA y repositorios
- [ ] Datos iniciales de prueba
- [ ] CORS configurable
- [ ] Modelo relacional documentado

## Lista 4 — 🧪 Pruebas

- [ ] Registro con identificación duplicada debe fallar
- [ ] Login con credenciales incorrectas debe fallar
- [ ] Alquilar un vehículo lo deja en estado ALQUILADO
- [ ] El PDF trae número, cliente, fechas, placa, color y valor
- [ ] Cancelar devuelve el vehículo a DISPONIBLE
- [ ] Entregar por placa cambia a ENTREGADO
- [ ] Devolver por número deja el vehículo DISPONIBLE
- [ ] Devolución tardía cobra los días extra
- [ ] El administrador no puede entrar con un usuario normal

## Lista 5 — 🚀 Despliegue

- [ ] Repositorio en GitHub
- [ ] Base de datos en Aiven
- [ ] Backend en Render
- [ ] Frontend en GitHub Pages
- [ ] Cambiar `environment.prod.ts` por la URL de Render
- [ ] Configurar `APP_CORS_ORIGINS` en Render
- [ ] Grabar video demo

---

## Historias de usuario

**HU-1 — Registro**
> Como visitante quiero registrarme con mi identificación, datos de licencia,
> correo, teléfono y contraseña para poder alquilar vehículos.
> **Criterios:** identificación única, contraseña mínima de 6 caracteres.

**HU-2 — Alquilar**
> Como usuario quiero elegir el tipo de vehículo, ver los disponibles, indicar
> fecha de inicio y entrega, y recibir un PDF con el comprobante.
> **Criterios:** estado inicial "Pendiente de entrega"; valor = días × valor diario.

**HU-3 — Cancelar**
> Como usuario quiero cancelar mi alquiler en cualquier momento.
> **Criterios:** el vehículo vuelve a estar disponible.

**HU-4 — Entregar**
> Como administrador quiero buscar por placa y cambiar el alquiler a "entregado"
> cuando el usuario reclama el vehículo.

**HU-5 — Devolver**
> Como administrador quiero buscar por número de alquiler, dejar el vehículo
> "disponible" y cobrar los días posteriores si la devolución fue tardía.

---

## Miembros

| Nombre | Rol |
|---|---|
| | Desarrollo backend |
| | Desarrollo frontend |
| | Base de datos y pruebas |
