# 🚀 Instrucciones de Setup - Backend Plan Viaje

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior ([Descargar aquí](https://nodejs.org/))
- **PostgreSQL** 14 o superior ([Descargar aquí](https://www.postgresql.org/download/))
- **npm** (viene con Node.js)
- **Git** (opcional, para clonar el repo)

Verifica las instalaciones:
```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 8.x.x o superior
psql --version    # Debe mostrar PostgreSQL 14.x o superior
```

---

## 🗄️ Configuración de la Base de Datos

### Paso 1: Crear la base de datos

Abre una terminal y ejecuta PostgreSQL:

**En Windows:**
```bash
psql -U postgres
```

**En Mac/Linux:**
```bash
sudo -u postgres psql
```

Una vez dentro de PostgreSQL, ejecuta:
```sql
-- Crear la base de datos de desarrollo
CREATE DATABASE plan_viaje_dev;

-- Verificar que se creó
\l

-- Salir de PostgreSQL
\q
```

### Paso 2: Configurar credenciales

**IMPORTANTE:** El archivo `.env` debe estar en la raíz del proyecto backend.

Si no existe el archivo `.env`, créalo con este contenido:

```env
# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plan_viaje_dev
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# Puerto del servidor
PORT=3001

# JWT Secrets (puedes usar cualquier string largo y aleatorio)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_123456789
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_super_seguro_aqui_987654321

# Ambiente
NODE_ENV=development

# Firebase (opcional para dev, usa dev-login en su lugar)
# FIREBASE_PROJECT_ID=tu-proyecto
# FIREBASE_PRIVATE_KEY=tu-private-key
# FIREBASE_CLIENT_EMAIL=tu-email
```

**🔐 Importante sobre las credenciales:**
- Reemplaza `tu_password_aqui` con tu contraseña de PostgreSQL
- Los JWT_SECRET pueden ser cualquier string largo (mínimo 32 caracteres)
- Para desarrollo, NO necesitas configurar Firebase (usa `/api/auth/dev-login`)

### Paso 3: Verificar conexión a PostgreSQL

Prueba que puedes conectarte con las credenciales del `.env`:

```bash
psql -U postgres -d plan_viaje_dev
```

Si conecta correctamente, escribe `\q` para salir.

---

## 📦 Instalación de Dependencias

### Paso 1: Navegar al directorio backend

```bash
cd backend
```

### Paso 2: Instalar dependencias de Node

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`:
- express
- sequelize
- pg (PostgreSQL driver)
- jsonwebtoken
- bcryptjs
- joi
- winston
- cors
- helmet
- express-rate-limit
- dotenv
- y más...

**Tiempo estimado:** 1-3 minutos

---

## 🏗️ Inicializar las Tablas

Después de instalar las dependencias, necesitas crear todas las tablas en la base de datos.

### Opción 1: Reset completo (BORRA TODOS LOS DATOS)

```bash
npm run db:reset
```

**⚠️ ADVERTENCIA:** Este comando:
1. Elimina todas las tablas existentes
2. Crea todas las tablas desde cero
3. Borra todos los datos

Úsalo solo:
- En el primer setup
- Cuando quieras empezar de cero
- En desarrollo (nunca en producción)

### Opción 2: Sincronizar modelos (no borra datos)

```bash
npm run db:sync
```

Esto sincroniza los modelos con la base de datos sin borrar datos existentes.

### Verificar que las tablas se crearon

```bash
psql -U postgres -d plan_viaje_dev
```

Dentro de PostgreSQL:
```sql
-- Ver todas las tablas
\dt

-- Deberías ver 19 tablas:
-- usuarios
-- viajes
-- miembros_viaje
-- cronograma
-- franjas
-- alojamientos
-- actividades
-- gastos
-- deudas
-- pagos              <- Nueva tabla
-- subgrupos
-- subgrupo_miembros
-- gasto_subgrupos
-- deuda_subgrupos
-- notificaciones
-- configuracion_viaje
-- tasas_cambio
-- auditoria
-- usuarios_firebase

-- Salir
\q
```

---

## 👤 Crear Usuario de Prueba

Para poder hacer login en desarrollo, necesitas al menos un usuario:

```bash
npm run create-test-user
```

Esto crea un usuario de prueba:
- **Email:** `test@example.com`
- **Password:** `test123`
- **Nombre:** Test User

Puedes crear más usuarios manualmente ejecutando el script múltiples veces o modificando `src/scripts/createTestUser.js`.

---

## 🚀 Arrancar el Servidor

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

**Características:**
- Auto-reinicio cuando cambias archivos
- Hot reload
- Logs detallados en consola

**Salida esperada:**
```
[info]: 🔥 Initializing Firebase Admin SDK...
[info]: ✅ Firebase Admin SDK initialized successfully
[info]: 🔍 Testing database connection...
[info]: ✅ Database connection established successfully
[info]: 📊 Connected to: plan_viaje_dev on localhost:5432
[info]: 🚀 Server running in development mode
[info]: 📡 Server listening on port 3001
[info]: 🌐 API URL: http://localhost:3001/api
[info]: 🏠 Frontend URL: http://localhost:5173
[info]: ✅ Server started successfully
```

### Modo Producción

```bash
npm start
```

Usa este modo solo en servidores de producción.

### Detener el servidor

Presiona `Ctrl + C` en la terminal donde está corriendo.

---

## 🧪 Verificar que Todo Funciona

### 1. Health Check

Abre tu navegador o usa curl:

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-10-22T..."
}
```

### 2. Login de Prueba

Prueba el endpoint de autenticación:

**Usando curl:**
```bash
curl -X POST http://localhost:3001/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Usando archivo .http:** (con extensión REST Client en VS Code)

Abre `tests/viajes.http` y ejecuta la primera petición.

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "user": {
      "id_usuario": 1,
      "email": "test@example.com",
      "nombre": "Test",
      "apellido": "User"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### 3. Ejecutar Suite de Tests Automatizados

```bash
npm run test:api
```

**Resultado esperado:**
```
╔════════════════════════════════════════════════════════════╗
║         Plan Viaje Backend - Automated Testing             ║
╚════════════════════════════════════════════════════════════╝

Total Tests: 54
✅ Passed: 54
❌ Failed: 0
Success Rate: 100.00%

✅ All tests passed! 🎉
```

**⚠️ Nota:** Para que los tests pasen, el servidor debe estar corriendo.

---

## 📚 Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registrar usuario con Firebase
- `POST /api/auth/dev-login` - Login de desarrollo (SIN Firebase) ⭐
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión

### Viajes
- `POST /api/viajes` - Crear viaje
- `GET /api/viajes` - Listar viajes
- `GET /api/viajes/:id` - Detalles
- `PUT /api/viajes/:id` - Actualizar
- `GET /api/viajes/:id/estadisticas` - Estadísticas

### Miembros (anidado en viajes)
- `POST /api/viajes/:id/miembros` - Invitar miembro
- `GET /api/viajes/:id/miembros` - Listar miembros
- `GET /api/viajes/:id/miembros/:idMiembro` - Detalles
- `PUT /api/viajes/:id/miembros/:idMiembro` - Actualizar
- `DELETE /api/viajes/:id/miembros/:idMiembro` - Eliminar

### Franjas (anidado en viajes)
- `POST /api/viajes/:id/franjas` - Crear franja
- `GET /api/viajes/:id/franjas` - Listar
- `GET /api/viajes/:id/franjas/:idFranja` - Detalles
- `PUT /api/viajes/:id/franjas/:idFranja` - Actualizar
- `DELETE /api/viajes/:id/franjas/:idFranja` - Eliminar
- `PUT /api/viajes/:id/franjas/:idFranja/reordenar` - Reordenar
- `GET /api/viajes/:id/franjas/estadisticas` - Estadísticas

### Alojamientos (anidado en viajes)
- 7 endpoints para gestión de alojamientos
- Ver documentación: `API_ALOJAMIENTOS.md`

### Actividades (anidado en viajes)
- 7 endpoints para gestión de actividades
- Ver documentación en el código

### Gastos (anidado en viajes)
- 7 endpoints para gestión de gastos
- Filtros avanzados por categoría, tipo, estado, pagador

### Deudas (anidado en viajes)
- 8 endpoints para gestión de deudas
- Incluye resumen de balance

### 🆕 Pagos (anidado en deudas)
- 7 endpoints para gestión de pagos
- **Ver documentación completa:** `API_PAGOS.md`
- Flujo: registrar → confirmar → auto-actualiza deuda

### 🆕 Notificaciones
- 9 endpoints para notificaciones
- **Ver documentación completa:** `API_NOTIFICACIONES.md`
- Envío individual o difusión masiva

### Subgrupos (anidado en viajes)
- 7 endpoints para gestión de subgrupos
- Ver documentación: `API_SUBGRUPOS.md`

**Total: 66 endpoints funcionales** ✅

---

## 🔧 Scripts NPM Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con auto-reload (nodemon)

# Producción
npm start                # Servidor sin auto-reload

# Base de Datos
npm run db:reset         # ⚠️ BORRA TODO y recrea tablas
npm run db:sync          # Sincroniza modelos sin borrar datos

# Usuarios
npm run create-test-user # Crear usuario test@example.com

# Testing
npm run test:api         # Ejecutar tests automatizados (54 tests)
npm test                 # Tests unitarios (si los hay)
```

---

## 🧰 Herramientas Recomendadas

### 1. VS Code con Extensiones

**Extensiones útiles:**
- **REST Client** - Para ejecutar archivos `.http`
  - Instalar: busca "REST Client" en VS Code
  - Usar: abre cualquier `.http` en `tests/` y click en "Send Request"

- **PostgreSQL** - Para explorar la base de datos

- **ESLint** - Para linting de código

- **Prettier** - Para formato de código

### 2. Postman (alternativa a REST Client)

Si prefieres Postman:
1. Importa los archivos `.http` como colecciones
2. Configura la variable `{{baseUrl}}` = `http://localhost:3001/api`
3. Configura la variable `{{token}}` con el token de login

### 3. pgAdmin (alternativa para PostgreSQL)

Interfaz gráfica para explorar y administrar PostgreSQL:
- [Descargar pgAdmin](https://www.pgadmin.org/download/)

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "connect ECONNREFUSED"

**Problema:** No se puede conectar a PostgreSQL

**Soluciones:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   sc query postgresql-x64-14

   # Mac
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verifica las credenciales en `.env`

3. Verifica que el puerto 5432 esté libre:
   ```bash
   netstat -an | findstr 5432
   ```

### ❌ Error: "Port 3001 already in use"

**Problema:** El puerto 3001 ya está siendo usado

**Soluciones:**

**Windows:**
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3001

# Matar el proceso (reemplaza PID con el número que viste)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Ver qué está usando el puerto
lsof -i :3001

# Matar el proceso
kill -9 <PID>
```

**O cambiar el puerto en `.env`:**
```env
PORT=3002
```

### ❌ Error: "JWT_SECRET is not defined"

**Problema:** Falta el archivo `.env` o está mal configurado

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz de `backend/`
2. Copia el template de arriba
3. Reinicia el servidor

### ❌ Tests fallan con errores 404

**Problema:** El servidor no está corriendo o las rutas cambiaron

**Solución:**
1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. Verifica que el servidor muestre "Server listening on port 3001"
3. Prueba el health check primero

### ❌ Error: "relation 'usuarios' does not exist"

**Problema:** Las tablas no se crearon en la base de datos

**Solución:**
```bash
npm run db:reset
```

### ❌ Error: "password authentication failed"

**Problema:** Contraseña de PostgreSQL incorrecta en `.env`

**Solución:**
1. Verifica la contraseña correcta de PostgreSQL
2. Actualiza `DB_PASSWORD` en `.env`
3. Reinicia el servidor

---

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/              # Configuraciones (DB, Firebase)
│   ├── controllers/         # 11 controladores HTTP
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # 19 modelos Sequelize
│   ├── routes/              # 11 archivos de rutas
│   ├── services/            # 11 servicios de lógica de negocio
│   ├── utils/               # Utilidades (errors, validationSchemas)
│   ├── scripts/             # Scripts auxiliares
│   └── app.js               # Configuración de Express
├── tests/
│   ├── viajes.http          # Tests manuales de Viajes
│   ├── miembros.http        # Tests manuales de Miembros
│   ├── franjas.http         # Tests manuales de Franjas
│   ├── alojamientos.http    # Tests manuales de Alojamientos
│   ├── actividades.http     # Tests manuales de Actividades
│   ├── gastos.http          # Tests manuales de Gastos
│   ├── deudas.http          # Tests manuales de Deudas
│   ├── pagos.http           # Tests manuales de Pagos 🆕
│   ├── notificaciones.http  # Tests manuales de Notificaciones 🆕
│   ├── subgrupos.http       # Tests manuales de Subgrupos
│   └── run-tests.js         # Suite de tests automatizados
├── .env                     # Variables de entorno (NO commitear)
├── .env.example             # Template de .env
├── package.json             # Dependencias y scripts
├── server.js                # Entry point
├── API_*.md                 # Documentación de APIs
├── PROGRESO_DESARROLLO.md   # Estado del desarrollo
└── SETUP_INSTRUCCIONES.md   # Este archivo

```

---

## 🎯 Flujo Completo de Primer Uso

**Resumen paso a paso:**

```bash
# 1. Instalar PostgreSQL y Node.js (ver requisitos previos)

# 2. Crear base de datos
psql -U postgres
CREATE DATABASE plan_viaje_dev;
\q

# 3. Configurar .env (copiar template y editar credenciales)

# 4. Instalar dependencias
cd backend
npm install

# 5. Crear tablas
npm run db:reset

# 6. Crear usuario de prueba
npm run create-test-user

# 7. Arrancar servidor
npm run dev

# 8. En otra terminal, ejecutar tests
npm run test:api

# 9. Ver resultado: 54/54 tests passing ✅
```

**Tiempo total estimado:** 10-15 minutos

---

## 📖 Documentación Adicional

- **API_PAGOS.md** - Documentación completa del módulo de Pagos
- **API_NOTIFICACIONES.md** - Documentación completa del módulo de Notificaciones
- **API_SUBGRUPOS.md** - Documentación del módulo de Subgrupos
- **API_ALOJAMIENTOS.md** - Documentación del módulo de Alojamientos
- **API_MIEMBROS.md** - Documentación del módulo de Miembros
- **API_FRANJAS.md** - Documentación del módulo de Franjas
- **PROGRESO_DESARROLLO.md** - Estado general del proyecto

---

## 🆘 Soporte

Si tienes problemas:

1. **Lee este archivo completo** - La mayoría de problemas están resueltos aquí
2. **Revisa los logs** - El servidor muestra mensajes detallados de errores
3. **Verifica las variables de entorno** - Muchos errores vienen de `.env` mal configurado
4. **Prueba el health check** - Si falla, el problema es básico de servidor
5. **Revisa la conexión a PostgreSQL** - Prueba conectarte manualmente

---

## ✅ Checklist de Verificación

Marca los items cuando los completes:

- [ ] Node.js v18+ instalado
- [ ] PostgreSQL 14+ instalado
- [ ] Base de datos `plan_viaje_dev` creada
- [ ] Archivo `.env` configurado con credenciales correctas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Tablas creadas (`npm run db:reset`)
- [ ] Usuario de prueba creado (`npm run create-test-user`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Health check responde correctamente
- [ ] Login funciona con test@example.com
- [ ] Tests automatizados pasan 54/54 ✅

---

## 🎉 ¡Listo!

Si completaste todos los pasos y el servidor está corriendo con los tests en verde, **¡felicitaciones!**

El backend está completamente funcional y listo para:
- Desarrollo de frontend
- Integración con cliente móvil
- Testing de endpoints
- Agregar nuevas funcionalidades

**El proyecto Plan Viaje Backend está 100% operativo** 🚀

---

**Última actualización:** Octubre 2025
**Versión:** 1.0
**Módulos:** 11/11 completados
**Tests:** 54/54 pasando ✅
