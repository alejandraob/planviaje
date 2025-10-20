# Pasos para Probar la API - ACTUALIZADO

## ✅ Estado Actual
- ✅ Servidor corriendo en `http://localhost:3001`
- ✅ Base de datos conectada
- ✅ **TODAS LAS TABLAS CREADAS** (18 tablas)
- ✅ Endpoints de Auth listos
- ✅ Endpoints de Viajes listos

---

## Paso 1: Registrar un Usuario

Abre [backend/tests/auth.http](backend/tests/auth.http) y ejecuta:

```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+541112345678"
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "telefono": "+541112345678"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**IMPORTANTE:** Copia el `accessToken` de la respuesta.

---

## Paso 2: Configurar el Token

### Opción A: En auth.http (si quieres probar más endpoints de auth)
Reemplaza la línea 29 en `auth.http`:
```http
@token = TU_TOKEN_AQUI
```

### Opción B: En viajes.http (para probar viajes)
Reemplaza la línea 3 en `viajes.http`:
```http
@token = TU_TOKEN_AQUI
```

---

## Paso 3: Probar Endpoints de Viajes

Ahora en [backend/tests/viajes.http](backend/tests/viajes.http), puedes ejecutar:

### 3.1 Crear un viaje:
```http
POST http://localhost:3001/api/viajes
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "nombre": "Viaje a Bariloche 2025",
  "tipo": "amigos",
  "alcance": "nacional",
  "fecha_inicio": "2025-12-15",
  "fecha_fin": "2025-12-22",
  "descripcion": "Viaje de fin de año a la Patagonia"
}
```

### 3.2 Ver mis viajes:
```http
GET http://localhost:3001/api/viajes
Authorization: Bearer {{token}}
```

### 3.3 Ver detalles de un viaje:
```http
GET http://localhost:3001/api/viajes/1
Authorization: Bearer {{token}}
```

### 3.4 Ver estadísticas:
```http
GET http://localhost:3001/api/viajes/1/estadisticas
Authorization: Bearer {{token}}
```

---

## Alternativa: Usar Dev-Login (SIN FIREBASE)

Si prefieres NO usar Firebase, puedes usar el endpoint de desarrollo:

### Paso 1: Registra primero el usuario (igual que arriba)

### Paso 2: Usa dev-login
```http
POST http://localhost:3001/api/auth/dev-login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "cualquier_cosa"
}
```

Este endpoint **NO verifica la contraseña**, solo busca el usuario por email y te da el token. Es solo para testing.

**Respuesta:**
```json
{
  "success": true,
  "message": "Login successful (DEV MODE)",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## Comandos NPM Útiles

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Sincronizar modelos con DB (sin borrar datos)
npm run db:sync

# Resetear DB completamente (BORRA TODO)
npm run db:reset

# Correr tests
npm test
```

---

## Verificar las Tablas Creadas

Puedes conectarte a PostgreSQL y verificar:

```sql
\c plan_viaje_dev

\dt

-- Deberías ver:
-- usuarios
-- viajes
-- miembros_viaje
-- cronograma
-- franjas
-- alojamientos
-- actividades
-- subgrupos
-- subgrupo_miembros
-- gastos
-- gastos_subgrupo
-- deudas
-- deudas_subgrupo
-- pagos
-- notificaciones
-- auditoria
-- configuracion_viaje
-- tasas_cambio
```

---

## Troubleshooting

### Error: "no existe la relación «usuarios»"
✅ **SOLUCIONADO** - Ya ejecutamos `npm run db:reset`

### Error: "User not found" en dev-login
- Primero debes registrar el usuario con `/auth/register`

### Error: "You do not have access to this trip"
- Solo puedes ver viajes donde eres miembro
- Al crear un viaje, automáticamente te conviertes en admin principal

### Error: Token expirado
- Los tokens expiran después de 24 horas
- Genera un nuevo token con `/auth/register` o `/auth/dev-login`

---

## ¡Listo para Probar!

Ahora sí, todo está configurado. Puedes:
1. ✅ Registrar usuarios
2. ✅ Obtener tokens JWT
3. ✅ Crear viajes
4. ✅ Listar viajes
5. ✅ Ver detalles y estadísticas

**Siguiente paso:** Implementar los endpoints de Miembros, Franjas, Alojamientos, Actividades, Gastos, etc.
