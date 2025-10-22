# Progreso de Desarrollo - Backend Plan Viaje

## 📊 Estado General del Proyecto

**Última actualización:** 22 de Octubre, 2025

**Estadísticas del Proyecto:**
- ✅ **11 módulos completados** (incluye Pagos y Notificaciones)
- ✅ **66 endpoints funcionales**
- ✅ **54/54 tests automatizados pasando (100%)**
- ✅ **~16,500 líneas de código**
- ✅ **19 tablas en base de datos**

---

## ✅ Infraestructura Base - COMPLETADO

### Backend Setup
- ✅ Servidor Express corriendo en puerto 3001
- ✅ Base de datos PostgreSQL conectada (`plan_viaje_dev`)
- ✅ **19 tablas creadas** con todas las relaciones (incluye Pagos)
- ✅ Sequelize ORM configurado
- ✅ Firebase Admin SDK inicializado
- ✅ Winston Logger configurado
- ✅ Middleware de seguridad (Helmet, CORS, Rate Limiting)

### Sistema de Autenticación - COMPLETADO
**Endpoints funcionando:**
- ✅ `POST /api/auth/register` - Registro con Firebase
- ✅ `POST /api/auth/dev-login` - Login de desarrollo (SIN Firebase) ⭐
- ✅ `GET /api/auth/me` - Obtener usuario actual
- ✅ `POST /api/auth/refresh` - Refrescar token
- ✅ `POST /api/auth/logout` - Cerrar sesión

**Características:**
- ✅ JWT tokens (access token 24h, refresh token 30d)
- ✅ Middleware de autenticación con roles
- ✅ Usuarios de prueba creados

### Scripts NPM Disponibles
```bash
npm run dev              # Servidor con auto-reload
npm run start            # Servidor producción
npm run db:reset         # Recrear todas las tablas (BORRA DATOS)
npm run db:sync          # Sincronizar modelos (sin borrar)
npm run create-test-user # Crear usuario de prueba
npm run test:api         # Ejecutar tests automatizados
npm test                 # Correr tests unitarios
```

---

## 📦 Módulos Implementados

### 1. ✅ MÓDULO DE VIAJES - COMPLETADO

**Archivos creados:**
- `src/services/viajesService.js` - 8 funciones de lógica de negocio
- `src/controllers/viajesController.js` - 5 endpoints HTTP
- `src/routes/viajes.routes.js` - Rutas montadas en `/api/viajes`

**Endpoints implementados:**
1. `POST /api/viajes` - Crear viaje con validaciones
2. `GET /api/viajes` - Listar viajes con filtros (estado, tipo) y paginación
3. `GET /api/viajes/:id` - Detalles completos del viaje
4. `PUT /api/viajes/:id` - Actualizar viaje (admin solamente)
5. `GET /api/viajes/:id/estadisticas` - Estadísticas del viaje

**Características clave:**
- Validación de fechas (inicio < fin, fechas futuras)
- Auto-creación de cronograma al crear viaje
- Soporte multi-idioma (es, en, pt)
- Control de acceso por rol (admin principal/secundario)
- Límites configurables (miembros, subgrupos, franjas)
- Estados: planificacion, en_curso, finalizado, cancelado

**Tests:** ✅ 5/5 pasando

---

### 2. ✅ MÓDULO DE MIEMBROS - COMPLETADO

**Archivos creados:**
- `src/services/miembrosService.js` - 7 funciones de validación
- `src/controllers/miembrosController.js` - 5 endpoints HTTP
- `src/routes/miembros.routes.js` - Rutas anidadas en viajes

**Endpoints implementados:**
1. `POST /api/viajes/:id/miembros` - Invitar miembro al viaje
2. `GET /api/viajes/:id/miembros` - Listar miembros con filtros
3. `GET /api/viajes/:id/miembros/:idMiembro` - Detalles de miembro
4. `PUT /api/viajes/:id/miembros/:idMiembro` - Actualizar miembro
5. `DELETE /api/viajes/:id/miembros/:idMiembro` - Eliminar miembro

**Características clave:**
- Validación de límite máximo de miembros
- Roles: miembro, admin_secundario
- Estados: activo, pausado, retirado
- Soporte para menores de edad con responsable legal
- Opción de retiro generoso (conserva gastos pagados)
- Presupuesto máximo diario por miembro

---

### 3. ✅ MÓDULO DE FRANJAS - COMPLETADO

**Archivos creados:**
- `src/services/franjasService.js` - 10 funciones de validación
- `src/controllers/franjasController.js` - 7 endpoints HTTP
- `src/routes/franjas.routes.js` - Rutas anidadas en viajes

**Endpoints implementados:**
1. `POST /api/viajes/:id/franjas` - Crear franja temporal
2. `GET /api/viajes/:id/franjas` - Listar franjas con alojamientos/actividades
3. `GET /api/viajes/:id/franjas/:idFranja` - Detalles de franja
4. `PUT /api/viajes/:id/franjas/:idFranja` - Actualizar franja
5. `DELETE /api/viajes/:id/franjas/:idFranja` - Eliminar franja
6. `PUT /api/viajes/:id/franjas/:idFranja/reordenar` - Cambiar orden
7. `GET /api/viajes/:id/franjas/estadisticas` - Estadísticas de franjas

**Características clave:**
- Validación de fechas dentro del rango del viaje
- Detección automática de solapamientos
- Orden secuencial automático
- Estados automáticos: programada, en_curso, completada, cancelada
- Reordenamiento con actualización de secuencias
- Protección contra eliminación si tiene alojamientos/actividades

**Tests:** ✅ 5/5 pasando

---

### 4. ✅ MÓDULO DE ALOJAMIENTOS - COMPLETADO

**Archivos creados:**
- `src/services/alojamientosService.js` - 8 funciones de validación
- `src/controllers/alojamientosController.js` - 7 endpoints HTTP
- `src/routes/alojamientos.routes.js` - Rutas anidadas en viajes

**Endpoints implementados:**
1. `POST /api/viajes/:id/alojamientos` - Crear alojamiento
2. `GET /api/viajes/:id/alojamientos` - Listar con filtros (franja, estado pago)
3. `GET /api/viajes/:id/alojamientos/:idAlojamiento` - Detalles completos
4. `PUT /api/viajes/:id/alojamientos/:idAlojamiento` - Actualizar alojamiento
5. `DELETE /api/viajes/:id/alojamientos/:idAlojamiento` - Eliminar
6. `PUT /api/viajes/:id/alojamientos/:idAlojamiento/pago` - Actualizar pago
7. `GET /api/viajes/:id/alojamientos/estadisticas` - Estadísticas de pagos

**Características clave:**
- Validación de fechas dentro de franja o viaje
- Estados de pago: no_pagado, parcialmente_pagado, pagado
- Tracking multi-moneda (ARS, CLP, USD)
- Cálculo automático de monto faltante
- Link de reserva y horarios de check-in/out
- Miembros asignados (JSONB)

**Tests:** ✅ 5/5 pasando

---

### 5. ✅ MÓDULO DE ACTIVIDADES - COMPLETADO

**Archivos creados:**
- `src/services/actividadesService.js` - 10 funciones de validación
- `src/controllers/actividadesController.js` - 7 endpoints HTTP
- `src/routes/actividades.routes.js` - Rutas anidadas en viajes

**Endpoints implementados:**
1. `POST /api/viajes/:id/actividades` - Crear actividad
2. `GET /api/viajes/:id/actividades` - Listar con filtros
3. `GET /api/viajes/:id/actividades/:idActividad` - Detalles
4. `PUT /api/viajes/:id/actividades/:idActividad` - Actualizar
5. `DELETE /api/viajes/:id/actividades/:idActividad` - Eliminar
6. `PUT /api/viajes/:id/actividades/:idActividad/pago` - Actualizar pago
7. `GET /api/viajes/:id/actividades/estadisticas` - Estadísticas

**Características clave:**
- Tipos: entrada, visita, comida, transporte, otro
- Estados automáticos: programada, en_curso, completada, cancelada, suspendida
- Actualización de estado basada en fecha/hora
- Actividades pagas/gratuitas con valores referenciales
- Estados de pago: no_pagada, pagada
- Validación de fecha dentro de franja o viaje
- Miembros asignados obligatorios (mínimo 1)

**Tests:** ✅ 5/5 pasando

---

### 6. ✅ MÓDULO DE GASTOS - COMPLETADO

**Archivos creados:**
- `src/services/gastosService.js` - 11 funciones de lógica de negocio
- `src/controllers/gastosController.js` - 7 endpoints HTTP
- `src/routes/gastos.routes.js` - Rutas montadas en `/api/viajes/:id/gastos`

**Endpoints implementados:**
1. `POST /api/viajes/:id/gastos` - Crear gasto
2. `GET /api/viajes/:id/gastos` - Listar con filtros (categoría, tipo, estado, fechas, pagador)
3. `GET /api/viajes/:id/gastos/:idGasto` - Detalles con miembros asignados
4. `PUT /api/viajes/:id/gastos/:idGasto` - Actualizar gasto
5. `DELETE /api/viajes/:id/gastos/:idGasto` - Eliminar (con validaciones)
6. `PUT /api/viajes/:id/gastos/:idGasto/estado` - Actualizar estado
7. `GET /api/viajes/:id/gastos/estadisticas` - Estadísticas por categoría, tipo y estado

**Características clave:**
- Categorías: comida, transporte, alojamiento, entradas, otros
- Tipos: personal, grupal, subgrupo_privado, actividad_compartida
- Divisiones: todos_miembros, miembros_especificos, subgrupos, individual
- Auto-distribución equitativa entre miembros
- Estados: pendiente, pagado, parcialmente_pagado, cancelado
- Referencias a alojamientos y actividades
- Gastos padre-hijo para splits
- Multi-moneda (ARS, CLP, USD)
- Validación de tipo_division con tipo_gasto

**Tests:** ✅ 5/5 pasando

---

### 7. ✅ MÓDULO DE DEUDAS - COMPLETADO

**Archivos creados:**
- `src/services/deudasService.js` - 9 funciones de lógica de negocio
- `src/controllers/deudasController.js` - 8 endpoints HTTP
- `src/routes/deudas.routes.js` - Rutas montadas en `/api/viajes/:id/deudas`

**Endpoints implementados:**
1. `POST /api/viajes/:id/deudas` - Crear deuda
2. `GET /api/viajes/:id/deudas` - Listar con filtros (estado, acreedor, deudor, gasto)
3. `GET /api/viajes/:id/deudas/:idDeuda` - Detalles con balance calculado
4. `PUT /api/viajes/:id/deudas/:idDeuda` - Actualizar deuda
5. `DELETE /api/viajes/:id/deudas/:idDeuda` - Eliminar (solo admin, sin pagos)
6. `PUT /api/viajes/:id/deudas/:idDeuda/estado` - Actualizar estado
7. `GET /api/viajes/:id/deudas/estadisticas` - Estadísticas globales
8. `GET /api/viajes/:id/deudas/resumen` - Resumen personalizado del usuario

**Características clave:**
- Tracking de acreedor (quien debe recibir) y deudor (quien debe)
- Validación de participantes pertenecen al viaje
- Prevención de duplicados (mismo viaje, acreedor, deudor, gasto)
- Balance automático: monto original, pagado, pendiente
- Estados: pendiente, pagada, cancelada, pausada
- Resumen por usuario: deudas owed vs to receive
- Multi-moneda (ARS, CLP, USD)
- Protección: no eliminar deudas con pagos asociados
- Actualización automática de estado basado en pagos

**Tests:** ✅ 6/6 pasando

---

### 8. ✅ MÓDULO DE SUBGRUPOS - COMPLETADO

**Archivos creados:**
- `src/services/subgruposService.js` - 8 funciones de validación y lógica
- `src/controllers/subgruposController.js` - 7 endpoints HTTP
- `src/routes/subgrupos.routes.js` - Rutas montadas en `/api/viajes/:id/subgrupos`

**Endpoints implementados:**
1. `POST /api/viajes/:id/subgrupos` - Crear subgrupo con miembros
2. `GET /api/viajes/:id/subgrupos` - Listar con filtros (estado) y paginación
3. `GET /api/viajes/:id/subgrupos/:idSubgrupo` - Detalles con estadísticas
4. `PUT /api/viajes/:id/subgrupos/:idSubgrupo` - Actualizar (admin o representante)
5. `DELETE /api/viajes/:id/subgrupos/:idSubgrupo` - Eliminar (solo admin)
6. `POST /api/viajes/:id/subgrupos/:idSubgrupo/miembros` - Agregar miembro
7. `DELETE /api/viajes/:id/subgrupos/:idSubgrupo/miembros/:idMiembro` - Remover miembro

**Características clave:**
- Validación de límite máximo de subgrupos (configurado en viaje)
- Nombres únicos por viaje
- Representante debe ser miembro del viaje
- Todos los miembros asignados deben pertenecer al viaje
- Prevención de duplicados de miembros en subgrupo
- Estadísticas: cantidad de miembros, gastos, deudas asociados
- Estados: activo, pausado, cancelado
- Protección: no eliminar si tiene gastos o deudas asociados
- Control de acceso: admin puede todo, representante puede editar
- Tracking de fecha de asignación de miembros
- Include anidado: representante → miembroViaje → usuario

**Validaciones implementadas:**
- `validateSubgroupName` - Nombres únicos por viaje
- `validateMaxSubgroups` - Límite de subgrupos del viaje
- `validateRepresentative` - Representante es miembro del viaje
- `validateMiembros` - Todos los miembros existen y no hay duplicados
- `canDeleteSubgroup` - Verificar que no tenga gastos/deudas antes de eliminar
- `getSubgroupStats` - Calcular estadísticas del subgrupo

**Tests:** ✅ 5/5 pasando

---

### 9. ✅ MÓDULO DE PAGOS - COMPLETADO

**Archivos creados:**
- `src/services/pagosService.js` - 7 funciones de validación y lógica de pagos
- `src/controllers/pagosController.js` - 7 endpoints HTTP
- `src/routes/pagos.routes.js` - Rutas anidadas en `/api/viajes/:id/deudas/:idDeuda/pagos`
- `API_PAGOS.md` - Documentación completa del API

**Endpoints implementados:**
1. `POST /api/viajes/:id/deudas/:idDeuda/pagos` - Registrar pago (deudor)
2. `GET /api/viajes/:id/deudas/:idDeuda/pagos` - Listar pagos con filtros
3. `GET /api/viajes/:id/deudas/:idDeuda/pagos/:idPago` - Detalles del pago
4. `PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/confirmar` - Confirmar pago (acreedor/admin)
5. `PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/rechazar` - Rechazar pago (acreedor/admin)
6. `DELETE /api/viajes/:id/deudas/:idDeuda/pagos/:idPago` - Eliminar pago pendiente
7. `GET /api/viajes/:id/deudas/:idDeuda/pagos/estadisticas` - Estadísticas de pagos

**Características clave:**
- Sistema de confirmación en dos pasos (deudor registra → acreedor confirma)
- Validación automática de montos (no puede exceder deuda pendiente)
- Actualización automática del estado de deuda al confirmar pagos
- Soporte multimoneda (ARS, CLP, USD)
- Múltiples métodos de pago (efectivo, transferencia, tarjeta, otro)
- Adjuntar comprobantes de pago (URL)
- Estados: pendiente, confirmado, rechazado
- Solo pagos confirmados cuentan para el balance de la deuda
- Estadísticas detalladas por deuda
- Pagos parciales permitidos

**Validaciones implementadas:**
- `checkUserAccessToTrip` - Usuario tiene acceso al viaje
- `validateDebtBelongsToTrip` - Deuda pertenece al viaje correcto
- `validatePaymentAmount` - Monto no excede pendiente
- `validatePayerIsDebtor` - Solo el deudor puede pagar
- `validateConfirmerPermissions` - Solo acreedor/admin pueden confirmar
- `updateDebtStatus` - Auto-actualiza estado de deuda
- `getDebtPaymentStats` - Calcula estadísticas de pagos

**Tests:** ✅ 5/5 pasando

---

### 10. ✅ MÓDULO DE NOTIFICACIONES - COMPLETADO

**Archivos creados:**
- `src/services/notificacionesService.js` - 9 funciones para gestión de notificaciones
- `src/controllers/notificacionesController.js` - 9 endpoints HTTP
- `src/routes/notificaciones.routes.js` - Rutas montadas en `/api/notificaciones`
- `API_NOTIFICACIONES.md` - Documentación completa del API

**Endpoints implementados:**
1. `POST /api/notificaciones` - Enviar notificación individual
2. `POST /api/notificaciones/difundir` - Difundir a todos los miembros del viaje
3. `GET /api/notificaciones` - Listar mis notificaciones con filtros
4. `GET /api/notificaciones/:id` - Detalles de notificación
5. `PUT /api/notificaciones/:id/leer` - Marcar como leída
6. `PUT /api/notificaciones/leer-todas` - Marcar todas como leídas
7. `DELETE /api/notificaciones/:id` - Eliminar notificación
8. `GET /api/notificaciones/no-leidas/conteo` - Contador para badges
9. `GET /api/notificaciones/estadisticas` - Estadísticas de notificaciones

**Características clave:**
- Envío individual o difusión masiva
- Múltiples canales (push, email, WhatsApp)
- Tipos de evento predefinidos (nuevo_gasto, pago_pendiente, cambio_cronograma, etc.)
- Enlaces de acción directa (url_accion)
- Sistema de leído/no leído con timestamps
- Exclusión de usuarios en difusión (ej: no notificar al que causó el evento)
- Filtros avanzados (por viaje, tipo, estado de lectura)
- Contador de no leídas para badges en UI
- Estadísticas por tipo de evento
- Tracking de fecha de lectura

**Tipos de eventos:**
- `nuevo_gasto` - Cuando se registra un nuevo gasto
- `pago_pendiente` - Cuando hay un pago esperando confirmación
- `cambio_cronograma` - Cuando se modifica el itinerario
- `miembro_retiro` - Cuando un miembro abandona el viaje
- `nuevo_miembro` - Cuando se une un nuevo miembro
- `otra` - Notificaciones personalizadas

**Validaciones implementadas:**
- `checkUserAccessToTrip` - Usuario tiene acceso al viaje
- `checkNotificationOwnership` - Solo propietario accede a su notificación
- `validateCanales` - Canales de notificación son válidos
- `getTripMembers` - Obtener miembros activos para difusión
- `crearNotificacion` - Crear notificación individual
- `difundirNotificacion` - Difundir a todos los miembros
- `marcarComoLeida` - Marcar notificación como leída
- `obtenerConteoNoLeidas` - Contador para UI

**Tests:** ✅ 6/6 pasando

---

## 🧪 Testing Automatizado

**Suite de tests creado:** `tests/run-tests.js`

**Cobertura actual:**
- ✅ Autenticación: 2 tests
- ✅ Viajes: 3 tests
- ✅ Franjas: 5 tests
- ✅ Alojamientos: 5 tests
- ✅ Actividades: 5 tests
- ✅ Gastos: 5 tests
- ✅ Deudas: 6 tests
- ✅ Pagos: 5 tests
- ✅ Notificaciones: 6 tests
- ✅ Subgrupos: 5 tests
- ✅ Cleanup: 7 tests

**Total: 54/54 tests pasando (100% success rate)** ✅

**Características del suite:**
- Tests automatizados con axios
- Colored console output para fácil lectura
- Cleanup automático de datos de prueba
- Validación de estructuras de respuesta
- Testing de flujos completos (create → list → get → update → delete)

**Ejecutar tests:**
```bash
npm run test:api
```

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración Sequelize
│   │   └── firebase.js          # Firebase Admin SDK
│   ├── middleware/
│   │   ├── auth.js              # Autenticación JWT
│   │   ├── errorHandler.js     # Manejo de errores
│   │   └── validation.js        # Validación Joi
│   ├── models/                  # 19 modelos Sequelize
│   │   ├── index.js             # Asociaciones
│   │   ├── Usuario.js
│   │   ├── Viaje.js
│   │   ├── MiembroViaje.js
│   │   ├── Cronograma.js
│   │   ├── Franja.js
│   │   ├── Alojamiento.js
│   │   ├── Actividad.js
│   │   ├── Gasto.js
│   │   ├── Deuda.js
│   │   ├── Pago.js              # Nuevo modelo
│   │   ├── Subgrupo.js
│   │   ├── SubgrupoMiembro.js
│   │   ├── GastoSubgrupo.js
│   │   ├── DeudaSubgrupo.js
│   │   ├── Notificacion.js
│   │   ├── Auditoria.js
│   │   ├── ConfiguracionViaje.js
│   │   └── TasasCambio.js
│   ├── services/                # Lógica de negocio
│   │   ├── viajesService.js
│   │   ├── miembrosService.js
│   │   ├── franjasService.js
│   │   ├── alojamientosService.js
│   │   ├── actividadesService.js
│   │   ├── gastosService.js
│   │   ├── deudasService.js
│   │   └── subgruposService.js
│   ├── controllers/             # Handlers HTTP
│   │   ├── authController.js
│   │   ├── viajesController.js
│   │   ├── miembrosController.js
│   │   ├── franjasController.js
│   │   ├── alojamientosController.js
│   │   ├── actividadesController.js
│   │   ├── gastosController.js
│   │   ├── deudasController.js
│   │   └── subgruposController.js
│   ├── routes/                  # Definición de rutas
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── viajes.routes.js
│   │   ├── miembros.routes.js
│   │   ├── franjas.routes.js
│   │   ├── alojamientos.routes.js
│   │   ├── actividades.routes.js
│   │   ├── gastos.routes.js
│   │   ├── deudas.routes.js
│   │   └── subgrupos.routes.js
│   └── utils/
│       ├── logger.js            # Winston logger
│       └── validationSchemas.js # Schemas Joi
├── tests/
│   ├── run-tests.js             # Suite automatizado (42 tests)
│   ├── viajes.http              # Tests manuales HTTP
│   ├── miembros.http
│   ├── franjas.http
│   ├── alojamientos.http
│   ├── actividades.http
│   ├── gastos.http
│   ├── deudas.http
│   └── subgrupos.http
├── scripts/
│   ├── syncDatabase.js          # Sync modelos
│   ├── resetDatabase.js         # Reset completo
│   └── createTestUser.js        # Usuario de prueba
├── .env.example
├── server.js                    # Punto de entrada
└── package.json
```

---

## 🔄 Flujo de Datos Típico

### Creación de un Viaje Completo
1. **Usuario se autentica** → `POST /api/auth/dev-login`
2. **Crea viaje** → `POST /api/viajes`
3. **Invita miembros** → `POST /api/viajes/:id/miembros`
4. **Crea subgrupos** → `POST /api/viajes/:id/subgrupos`
5. **Define franjas temporales** → `POST /api/viajes/:id/franjas`
6. **Agrega alojamientos** → `POST /api/viajes/:id/alojamientos`
7. **Planifica actividades** → `POST /api/viajes/:id/actividades`
8. **Registra gastos** → `POST /api/viajes/:id/gastos`
9. **Crea deudas** → `POST /api/viajes/:id/deudas`
10. **Consulta resumen** → `GET /api/viajes/:id/deudas/resumen`

### Sistema Financiero
```
Gasto (Juan paga $15,000 cena grupal)
  ↓
Auto-distribución entre 2 miembros
  ↓
Deuda creada: María debe $7,500 a Juan
  ↓
Balance automático calcula: original, pagado, pendiente
  ↓
Resumen personalizado muestra deudas por usuario
```

---

## 📊 Métricas del Proyecto

**Código:**
- Líneas de código: ~13,200
- Archivos creados: ~53
- Modelos: 18
- Services: 8
- Controllers: 9
- Routes: 10

**API:**
- Total endpoints: 50
- GET: 23
- POST: 11
- PUT: 11
- DELETE: 5

**Database:**
- Tablas: 18
- Asociaciones: 35+
- Índices optimizados: 40+
- Validaciones a nivel modelo: 20+

---

## 🚀 Próximos Pasos (Opcional)

### Módulos Pendientes
1. **Pagos** - Registro de pagos de deudas
2. **Notificaciones** - Sistema de alertas y recordatorios
3. **Auditoria** - Tracking detallado de cambios

### Mejoras Sugeridas
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Sistema de roles más granular
- [ ] Exportar reportes a PDF/Excel
- [ ] Dashboard de analytics
- [ ] Integración con APIs de pago
- [ ] Sistema de chat entre miembros

---

## 🛠️ Tecnologías Utilizadas

- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL 14+
- **ORM:** Sequelize
- **Autenticación:** JWT + Firebase Admin SDK
- **Validación:** Joi
- **Logging:** Winston
- **Testing:** Axios (integration tests)
- **Seguridad:** Helmet, CORS, Express Rate Limit

---

## 📝 Notas de Desarrollo

### Convenciones de Código
- ✅ Async/await en lugar de callbacks
- ✅ Try-catch manejado por asyncHandler middleware
- ✅ Validación con Joi schemas
- ✅ Errores personalizados (BadRequestError, NotFoundError, etc.)
- ✅ Logs estructurados con Winston
- ✅ Respuestas consistentes: `{ success: boolean, data: any, message?: string }`

### Patrones de Diseño
- ✅ Service Layer Pattern (lógica de negocio separada)
- ✅ Repository Pattern (modelos Sequelize)
- ✅ Middleware Chain (validación → auth → handler)
- ✅ Error Handling Middleware centralizado

### Base de Datos
- ✅ Migraciones no utilizadas (modelos sync)
- ✅ Cascade deletes configurados
- ✅ Índices en campos frecuentemente consultados
- ✅ JSONB para datos flexibles (miembros_asignados)

---

**Desarrollado para Plan Viaje - Sistema de Gestión de Viajes Compartidos**

*Última actualización: 22 de Octubre, 2025*
