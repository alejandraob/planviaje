# API Endpoints - Miembros Module

## Base URL
```
http://localhost:3001/api/viajes/:id/miembros
```

## Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Invitar Miembro
**POST** `/viajes/:id/miembros`

Invita un usuario existente al viaje.

**Authorization:** Solo admins (principal o secundario)

**Request Body:**
```json
{
  "email": "maria@example.com",
  "es_menor": false,
  "id_responsable_legal": null,
  "presupuesto_maximo_diario": 5000
}
```

**Validaciones:**
- El usuario debe existir en la base de datos
- No puede estar ya en el viaje
- El viaje no puede haber alcanzado su capacidad máxima
- Si `es_menor` es true, debe tener `id_responsable_legal`
- El responsable legal debe ser miembro activo del viaje

**Response (201):**
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "miembro": {
      "id_miembro_viaje": 2,
      "id_viaje": 1,
      "id_usuario": 2,
      "rol": "miembro",
      "es_menor": false,
      "presupuesto_maximo_diario": 5000,
      "estado_participacion": "activo",
      "usuario": {
        "id_usuario": 2,
        "nombre": "María",
        "apellido": "González",
        "email": "maria@example.com"
      }
    }
  }
}
```

---

### 2. Listar Miembros
**GET** `/viajes/:id/miembros`

Lista todos los miembros del viaje.

**Authorization:** Cualquier miembro activo del viaje

**Query Parameters:**
- `estado_participacion` (optional): "activo", "pausado", "retirado"
- `rol` (optional): "admin_principal", "admin_secundario", "miembro"

**Examples:**
```
GET /viajes/1/miembros
GET /viajes/1/miembros?estado_participacion=activo
GET /viajes/1/miembros?rol=admin_principal
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "miembros": [
      {
        "id_miembro_viaje": 1,
        "rol": "admin_principal",
        "es_menor": false,
        "presupuesto_maximo_diario": null,
        "estado_participacion": "activo",
        "fecha_union": "2025-10-20T13:13:29.859Z",
        "usuario": {
          "id_usuario": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          "email": "test@example.com",
          "telefono": "+541112345678"
        },
        "responsableLegal": null
      }
    ],
    "total": 1
  }
}
```

---

### 3. Obtener Detalles de Miembro
**GET** `/viajes/:id/miembros/:memberId`

Obtiene información detallada de un miembro específico.

**Authorization:** Cualquier miembro activo del viaje

**Response (200):**
```json
{
  "success": true,
  "data": {
    "miembro": {
      "id_miembro_viaje": 1,
      "rol": "admin_principal",
      "es_menor": false,
      "id_responsable_legal": null,
      "presupuesto_maximo_diario": null,
      "estado_participacion": "activo",
      "fecha_union": "2025-10-20T13:13:29.859Z",
      "usuario": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "test@example.com",
        "telefono": "+541112345678",
        "avatar_url": null,
        "cbu_argentina": null
      }
    }
  }
}
```

---

### 4. Actualizar Miembro
**PUT** `/viajes/:id/miembros/:memberId`

Actualiza información de un miembro.

**Authorization:** Solo admins (principal o secundario)

**Request Body (todos opcionales):**
```json
{
  "presupuesto_maximo_diario": 7000,
  "es_menor": true,
  "id_responsable_legal": 1
}
```

**Restrictions:**
- No se puede modificar al admin principal
- Si se marca como menor, debe tener responsable legal

**Response (200):**
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "miembro": { /* updated member */ }
  }
}
```

---

### 5. Remover Miembro
**DELETE** `/viajes/:id/miembros/:memberId`

Remueve un miembro del viaje (lo marca como "retirado").

**Authorization:** Solo admins (principal o secundario)

**Restrictions:**
- No se puede remover al admin principal
- El miembro no puede tener deudas pendientes

**Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

### 6. Pausar Participación
**PUT** `/viajes/:id/miembros/:memberId/pausar`

Pausa temporalmente la participación de un miembro.

**Authorization:** El propio miembro O un admin

**Restrictions:**
- No se puede pausar al admin principal
- El miembro debe estar activo

**Response (200):**
```json
{
  "success": true,
  "message": "Participation paused successfully"
}
```

---

### 7. Reanudar Participación
**PUT** `/viajes/:id/miembros/:memberId/reanudar`

Reanuda la participación de un miembro pausado.

**Authorization:** El propio miembro O un admin

**Restrictions:**
- El miembro debe estar pausado

**Response (200):**
```json
{
  "success": true,
  "message": "Participation resumed successfully"
}
```

---

### 8. Cambiar Admin Secundario
**PUT** `/viajes/:id/admin-secundario`

Cambia o asigna el admin secundario del viaje.

**Authorization:** Solo admin principal

**Request Body:**
```json
{
  "id_usuario_nuevo_admin": 2
}
```

**Validations:**
- Solo el admin principal puede hacer este cambio
- El nuevo admin debe ser miembro activo del viaje
- No puede ser el mismo admin principal

**Response (200):**
```json
{
  "success": true,
  "message": "Secondary admin changed successfully",
  "data": {
    "viaje": {
      "id_viaje": 1,
      "id_admin_principal": 1,
      "id_admin_secundario_actual": 2
    }
  }
}
```

**Flow:**
- Si ya existe un admin secundario, su rol cambia a "miembro"
- El nuevo usuario cambia su rol a "admin_secundario"
- Se actualiza el campo `id_admin_secundario_actual` en el viaje

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Trip has reached maximum capacity (30 members)"
}
```

```json
{
  "success": false,
  "error": "Minor members must have a legal guardian (id_responsable_legal)"
}
```

```json
{
  "success": false,
  "error": "Cannot remove member with pending debts. Settle debts first."
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Admin access required"
}
```

```json
{
  "success": false,
  "error": "You are not a member of this trip"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "User with email maria@example.com not found"
}
```

```json
{
  "success": false,
  "error": "Member not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": "User is already a member of this trip"
}
```

---

## Business Logic

### Roles de Miembros
- **admin_principal**: Creador del viaje, no puede ser removido, puede cambiar admin secundario
- **admin_secundario**: Designado por admin principal, puede gestionar miembros y configuraciones
- **miembro**: Participante regular del viaje

### Estados de Participación
- **activo**: Miembro participando normalmente
- **pausado**: Participación temporalmente pausada
- **retirado**: Miembro removido del viaje

### Validaciones de Negocio
1. **Capacidad**: Un viaje tiene `max_miembros` (default 30)
2. **Menores**: Deben tener un `id_responsable_legal` que sea miembro activo
3. **Deudas**: No se puede remover a miembros con deudas pendientes
4. **Admin Principal**: No puede ser modificado, pausado o removido

---

## Testing

Usa el archivo `tests/miembros.http` para probar los endpoints.

**Flujo de testing:**
1. Crear un viaje (te conviertes en admin_principal)
2. Invitar a otro usuario
3. Listar miembros
4. Actualizar presupuesto de un miembro
5. Cambiar admin secundario
6. Pausar/Reanudar participación
7. Remover miembro

---

## Próximos Módulos

Con Viajes y Miembros completados, los siguientes módulos lógicos son:
- **Franjas**: Períodos en diferentes ubicaciones
- **Alojamientos**: Reservas de hospedaje
- **Actividades**: Eventos del viaje
- **Gastos**: Tracking de gastos compartidos
- **Deudas**: Cálculo automático de deudas
