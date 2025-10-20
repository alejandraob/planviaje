# Guía Rápida de Testing - API Backend

## Requisitos
- VS Code con la extensión **REST Client** instalada
- Servidor corriendo en `http://localhost:3001`
- PostgreSQL con base de datos `plan_viaje_dev`

## Paso 1: Obtener un Token JWT

### Opción A: Usando el endpoint de desarrollo (MÁS FÁCIL)

1. Primero, necesitas crear un usuario directamente en la base de datos o usar el endpoint de registro
2. Abre el archivo [tests/auth.http](tests/auth.http)
3. Ejecuta la request **"Step 1: Register a new user"**:
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

4. Luego ejecuta **"Step 2: DEV LOGIN"**:
   ```http
   POST http://localhost:3001/api/auth/dev-login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "any_password"
   }
   ```

5. **Copia el `accessToken`** de la respuesta. Debería verse algo así:
   ```json
   {
     "success": true,
     "message": "Login successful (DEV MODE)",
     "data": {
       "user": {
         "id": 1,
         "email": "test@example.com",
         "nombre": "Juan",
         "apellido": "Pérez"
       },
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

### Opción B: Usando Firebase (Método de producción)

Requiere autenticación con Firebase desde el frontend y obtener el Firebase ID Token.

---

## Paso 2: Configurar el Token en los Tests

1. Abre [tests/viajes.http](tests/viajes.http)
2. En la línea 3, reemplaza `YOUR_JWT_TOKEN_HERE` con tu token:
   ```http
   @token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Paso 3: Probar los Endpoints de Viajes

Ahora puedes ejecutar cualquier request del archivo `viajes.http`. Por ejemplo:

### Crear un viaje:
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
  "descripcion": "Viaje de fin de año a la Patagonia",
  "max_miembros": 15
}
```

### Listar mis viajes:
```http
GET http://localhost:3001/api/viajes
Authorization: Bearer {{token}}
```

### Obtener detalles de un viaje:
```http
GET http://localhost:3001/api/viajes/1
Authorization: Bearer {{token}}
```

---

## Uso de REST Client en VS Code

### Ejecutar una request:
1. Haz clic en "Send Request" que aparece arriba de cada request
2. O usa el atajo: `Ctrl+Alt+R` (Windows/Linux) o `Cmd+Alt+R` (Mac)

### Ver la respuesta:
- La respuesta aparece en una nueva pestaña
- Puedes ver headers, body, y status code
- El formato JSON se muestra con syntax highlighting

### Variables:
Las variables se definen con `@nombreVariable = valor` y se usan con `{{nombreVariable}}`

```http
@baseUrl = http://localhost:3001/api
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

GET {{baseUrl}}/viajes
Authorization: Bearer {{token}}
```

---

## Endpoints Disponibles

### Autenticación (`/api/auth`)
- `POST /auth/register` - Registrar usuario (requiere Firebase)
- `POST /auth/dev-login` - Login de desarrollo (SIN Firebase) ⭐
- `POST /auth/login` - Login con Firebase
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión

### Viajes (`/api/viajes`)
- `POST /viajes` - Crear viaje
- `GET /viajes` - Listar mis viajes (con filtros y paginación)
- `GET /viajes/:id` - Obtener detalles de un viaje
- `PUT /viajes/:id` - Actualizar viaje (solo admins)
- `DELETE /viajes/:id` - Eliminar viaje (solo admin principal)
- `GET /viajes/:id/estadisticas` - Obtener estadísticas del viaje

### Health Check
- `GET /api/health` - Verificar que el servidor está corriendo

---

## Troubleshooting

### Error: "Token is required"
- Asegúrate de haber copiado el token correctamente
- Verifica que la variable `@token` esté definida
- El token debe empezar con `eyJ...`

### Error: "Invalid or expired token"
- El token expira después de 24 horas
- Genera un nuevo token usando `/auth/dev-login`

### Error: "User not found" en dev-login
- Primero debes registrar el usuario usando `/auth/register`
- O verificar que el email exista en la base de datos

### Error: "Route not found"
- Verifica que el servidor esté corriendo
- Comprueba la URL base: `http://localhost:3001/api`

### Error: "You do not have access to this trip"
- Solo puedes ver viajes donde eres miembro activo
- Primero crea un viaje con tu usuario

---

## Ejemplo de Flujo Completo

### 1. Registrar usuario
```http
POST http://localhost:3001/api/auth/register
{
  "email": "maria@example.com",
  "password": "Secure123!",
  "nombre": "María",
  "apellido": "González",
  "telefono": "+541198765432"
}
```

### 2. Login (dev)
```http
POST http://localhost:3001/api/auth/dev-login
{
  "email": "maria@example.com",
  "password": "any"
}
```
**Copiar accessToken**

### 3. Crear un viaje
```http
POST http://localhost:3001/api/viajes
Authorization: Bearer <token>
{
  "nombre": "Viaje familiar a Mendoza",
  "tipo": "familia",
  "alcance": "nacional",
  "fecha_inicio": "2026-01-10",
  "fecha_fin": "2026-01-17"
}
```

### 4. Ver mis viajes
```http
GET http://localhost:3001/api/viajes
Authorization: Bearer <token>
```

### 5. Ver detalles del viaje
```http
GET http://localhost:3001/api/viajes/1
Authorization: Bearer <token>
```

### 6. Ver estadísticas
```http
GET http://localhost:3001/api/viajes/1/estadisticas
Authorization: Bearer <token>
```

---

## Notas Importantes

⚠️ **Endpoint de Desarrollo:**
- `/auth/dev-login` SOLO funciona en modo desarrollo
- NO estará disponible en producción
- En producción se debe usar Firebase Authentication

✅ **Validaciones:**
- Los viajes no pueden durar más de 365 días
- fecha_fin debe ser posterior a fecha_inicio
- Tipos válidos: "individual", "amigos", "familia"
- Alcances válidos: "nacional", "internacional"

🔒 **Permisos:**
- Crear viaje: Cualquier usuario autenticado
- Ver viaje: Debes ser miembro activo del viaje
- Editar viaje: Debes ser admin (principal o secundario)
- Eliminar viaje: Solo admin principal + sin gastos/miembros

---

## Siguientes Pasos

Una vez que hayas probado los endpoints de Viajes, se pueden implementar:
- Gestión de Miembros (invitaciones, aceptar/rechazar)
- Franjas (períodos en diferentes ubicaciones)
- Alojamientos (reservas de hospedaje)
- Actividades (eventos del viaje)
- Gastos (tracking de gastos compartidos)
- Subgrupos (grupos dentro del viaje)
- Deudas (cálculo automático de deudas)
- Pagos (confirmaciones de pago)
