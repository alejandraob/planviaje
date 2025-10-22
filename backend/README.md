# Plan Viaje - Backend API

Sistema de gestión de viajes grupales con seguimiento de gastos, miembros y actividades.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20.x
- PostgreSQL 15
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear tablas en la base de datos
npm run db:reset

# Crear usuario de prueba
npm run create-test-user

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará corriendo en `http://localhost:3001`

---

## 📚 Documentación

### Documentación General
- **[PROGRESO_DESARROLLO.md](PROGRESO_DESARROLLO.md)** - Estado actual del proyecto y módulos completados
- **[GUIA_TESTING.md](GUIA_TESTING.md)** - Guía completa para testing
- **[PASOS_PARA_PROBAR.md](PASOS_PARA_PROBAR.md)** - Guía rápida de inicio

### Documentación de APIs
- **[API_VIAJES.md](API_VIAJES.md)** - Endpoints del módulo de Viajes (6 endpoints)
- **[API_MIEMBROS.md](API_MIEMBROS.md)** - Endpoints del módulo de Miembros (8 endpoints)

### Archivos de Testing
- `tests/auth.http` - Tests de autenticación
- `tests/viajes.http` - Tests de viajes
- `tests/miembros.http` - Tests de miembros

---

## 🎯 Características Principales

### ✅ Módulos Implementados

#### 1. Autenticación (5 endpoints)
- Registro con Firebase
- Login de desarrollo (sin Firebase)
- Obtener usuario actual
- Refrescar tokens
- Logout

#### 2. Viajes (6 endpoints)
- Crear viajes con cronograma automático
- Listar viajes con filtros y paginación
- Ver detalles completos
- Actualizar viajes (solo admins)
- Eliminar viajes (solo admin principal)
- Estadísticas del viaje

#### 3. Miembros (8 endpoints)
- Invitar miembros al viaje
- Listar miembros con filtros
- Ver detalles de miembros
- Actualizar información
- Remover miembros
- Pausar/Reanudar participación
- Cambiar admin secundario

### ⏳ Módulos Pendientes
- Franjas (períodos en diferentes ubicaciones)
- Alojamientos (reservas de hospedaje)
- Actividades (eventos del viaje)
- Gastos (tracking de gastos compartidos)
- Subgrupos (grupos dentro del viaje)
- Deudas (cálculo automático)
- Pagos (confirmaciones)
- Notificaciones

---

## 🗄️ Base de Datos

### PostgreSQL - 18 Tablas Creadas
- `usuarios` - Usuarios del sistema
- `viajes` - Viajes principales
- `miembros_viaje` - Miembros de cada viaje
- `cronograma` - Timeline del viaje
- `franjas` - Períodos en ubicaciones
- `alojamientos` - Reservas de hospedaje
- `actividades` - Actividades del viaje
- `subgrupos` - Grupos dentro del viaje
- `subgrupo_miembros` - Miembros de subgrupos
- `gastos` - Gastos del grupo
- `gastos_subgrupo` - Gastos de subgrupos
- `deudas` - Deudas entre usuarios
- `deudas_subgrupo` - Deudas de subgrupo
- `pagos` - Confirmaciones de pago
- `notificaciones` - Notificaciones
- `auditoria` - Log de auditoría
- `configuracion_viaje` - Configuración
- `tasas_cambio` - Tasas de cambio

---

## 🛠️ Stack Técnico

### Backend
- **Node.js 20.x** - Runtime
- **Express.js 4.x** - Framework web
- **Sequelize 6.x** - ORM
- **PostgreSQL 15** - Base de datos

### Autenticación & Seguridad
- **Firebase Admin SDK** - Autenticación
- **JWT** - Tokens propios (access + refresh)
- **bcrypt** - Hash de passwords
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Express Rate Limit** - Limitación de requests

### Validación & Logging
- **Joi** - Validación de schemas
- **Winston** - Logging avanzado
- **Morgan** - HTTP request logger

### Desarrollo
- **Nodemon** - Auto-reload en desarrollo
- **dotenv** - Variables de entorno

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, Firebase, env)
│   │   ├── database.js
│   │   ├── firebase.js
│   │   ├── environment.js
│   │   └── constants.js
│   │
│   ├── models/          # 18 modelos Sequelize
│   │   ├── index.js
│   │   ├── Usuario.js
│   │   ├── Viaje.js
│   │   ├── MiembroViaje.js
│   │   └── ...
│   │
│   ├── controllers/     # Controladores HTTP
│   │   ├── authController.js ✅
│   │   ├── viajesController.js ✅
│   │   └── miembrosController.js ✅
│   │
│   ├── services/        # Lógica de negocio
│   │   ├── viajesService.js ✅
│   │   └── miembrosService.js ✅
│   │
│   ├── routes/          # Rutas de la API
│   │   ├── index.js
│   │   ├── auth.routes.js ✅
│   │   ├── viajes.routes.js ✅
│   │   └── miembros.routes.js ✅
│   │
│   ├── middleware/      # Middleware personalizado
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── cors.js
│   │   └── rateLimit.js
│   │
│   ├── utils/           # Utilidades
│   │   ├── jwt.js
│   │   ├── bcrypt.js
│   │   ├── logger.js
│   │   ├── errors.js
│   │   └── validationSchemas.js
│   │
│   ├── scripts/         # Scripts de utilidad
│   │   ├── syncDatabase.js
│   │   ├── resetDatabase.js
│   │   └── createTestUser.js
│   │
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
│
├── tests/               # Archivos de testing
│   ├── auth.http ✅
│   ├── viajes.http ✅
│   └── miembros.http ✅
│
├── logs/                # Logs de Winston
├── .env                 # Variables de entorno
├── .gitignore
├── package.json
└── README.md            # Este archivo
```

---

## 🔑 Variables de Entorno

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plan_viaje_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=30d

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Frontend
FRONTEND_URL=http://localhost:5173

# External APIs
MERCADOPAGO_ACCESS_TOKEN=your_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con auto-reload (nodemon)
npm start                # Servidor en producción

# Base de datos
npm run db:sync          # Sincronizar modelos sin borrar datos
npm run db:reset         # Recrear todas las tablas (⚠️ BORRA TODO)
npm run create-test-user # Crear usuario de prueba

# Testing
npm test                 # Ejecutar tests con Jest

# Migraciones (si se usan)
npm run migrate          # Ejecutar migraciones
npm run migrate:undo     # Revertir última migración
```

---

## 🧪 Testing

### Usando REST Client (VS Code)

1. Instala la extensión "REST Client" en VS Code
2. Abre cualquier archivo `.http` en la carpeta `tests/`
3. Haz clic en "Send Request" sobre cada petición

### Flujo de Testing Completo

```bash
# 1. Resetear base de datos
npm run db:reset

# 2. Crear usuario de prueba
npm run create-test-user

# 3. Iniciar servidor
npm run dev

# 4. Abrir tests/auth.http
# 5. Ejecutar DEV LOGIN
# 6. Copiar el accessToken
# 7. Pegar token en tests/viajes.http y tests/miembros.http
# 8. Ejecutar los tests
```

---

## 🔐 Autenticación

### Desarrollo (Recomendado para testing)
```http
POST /api/auth/dev-login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "cualquier_cosa"
}
```

### Producción (con Firebase)
```http
POST /api/auth/login
Content-Type: application/json

{
  "idToken": "FIREBASE_ID_TOKEN"
}
```

Ambos retornan:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## 📊 Endpoints Disponibles

### Auth (5 endpoints)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/dev-login  (development only)
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Viajes (6 endpoints)
```
POST   /api/viajes
GET    /api/viajes
GET    /api/viajes/:id
PUT    /api/viajes/:id
DELETE /api/viajes/:id
GET    /api/viajes/:id/estadisticas
```

### Miembros (8 endpoints)
```
POST   /api/viajes/:id/miembros
GET    /api/viajes/:id/miembros
GET    /api/viajes/:id/miembros/:memberId
PUT    /api/viajes/:id/miembros/:memberId
DELETE /api/viajes/:id/miembros/:memberId
PUT    /api/viajes/:id/miembros/:memberId/pausar
PUT    /api/viajes/:id/miembros/:memberId/reanudar
PUT    /api/viajes/:id/admin-secundario
```

---

## 🐛 Troubleshooting

### Error: "no existe la relación usuarios"
```bash
npm run db:reset
```

### Error: "Invalid token"
```bash
# Genera un nuevo token con:
POST /api/auth/dev-login
```

### Error: "User not found" en dev-login
```bash
npm run create-test-user
```

### Servidor no inicia
```bash
# Verifica que PostgreSQL esté corriendo
# Verifica las credenciales en .env
# Verifica que el puerto 3001 esté disponible
```

---

## 🤝 Contribución

1. Sigue el patrón MVC + Services existente
2. Crea schemas de validación con Joi
3. Documenta cada endpoint en archivos API_*.md
4. Crea archivo .http para testing
5. Actualiza PROGRESO_DESARROLLO.md

---

## 📝 Licencia

MIT

---

## 👥 Usuarios de Prueba

- **test@example.com** (id: 1) - Admin principal
- **maria@example.com** (id: 2) - Usuario regular

Ambos pueden usar `/auth/dev-login` con cualquier password.

---

## 🎯 Roadmap

- [x] Infraestructura base
- [x] Autenticación
- [x] Módulo de Viajes
- [x] Módulo de Miembros
- [ ] Módulo de Franjas
- [ ] Módulo de Gastos
- [ ] Módulo de Deudas
- [ ] Módulo de Alojamientos
- [ ] Módulo de Actividades
- [ ] Módulo de Subgrupos
- [ ] Módulo de Pagos
- [ ] Sistema de Notificaciones
- [ ] Tests unitarios (Jest)
- [ ] Tests E2E
- [ ] Documentación con Swagger
- [ ] Docker setup
- [ ] CI/CD

---

**Para más detalles, consulta [PROGRESO_DESARROLLO.md](PROGRESO_DESARROLLO.md)**
