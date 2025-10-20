# API Endpoints - Viajes Module

## Base URL
```
http://localhost:3001/api
```

## Authentication
All viajes endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Create New Trip
**POST** `/viajes`

Creates a new trip and automatically:
- Creates a cronograma (timeline) for the trip
- Adds the creator as principal admin
- Sets initial state as "planificacion"

**Request Body:**
```json
{
  "nombre": "Viaje a Bariloche 2025",
  "tipo": "amigos",                    // "individual" | "amigos" | "familia"
  "alcance": "nacional",                // "nacional" | "internacional"
  "fecha_inicio": "2025-12-15",
  "fecha_fin": "2025-12-22",
  "descripcion": "Opcional",            // Optional, max 500 chars
  "max_miembros": 15,                   // Optional, default 30, max 30
  "max_subgrupos": 5,                   // Optional, default 30, max 30
  "max_franjas": 10                     // Optional, default 999
}
```

**Validations:**
- nombre: min 3, max 100 characters
- fecha_fin must be after fecha_inicio
- Trip duration cannot exceed 365 days

**Response (201):**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "viaje": {
      "id_viaje": 1,
      "id_admin_principal": 5,
      "nombre": "Viaje a Bariloche 2025",
      "tipo": "amigos",
      "alcance": "nacional",
      "estado": "planificacion",
      "fecha_inicio": "2025-12-15",
      "fecha_fin": "2025-12-22",
      // ... more fields
    }
  }
}
```

---

### 2. List My Trips
**GET** `/viajes`

Returns all trips where the authenticated user is an active member.

**Query Parameters:**
- `estado` (optional): Filter by estado - "planificacion" | "en_curso" | "finalizado" | "cancelado"
- `tipo` (optional): Filter by tipo - "individual" | "amigos" | "familia"
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100

**Example:**
```
GET /viajes?estado=planificacion&tipo=amigos&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "viajes": [
      {
        "id_viaje": 1,
        "nombre": "Viaje a Bariloche 2025",
        "tipo": "amigos",
        "estado": "planificacion",
        "fecha_inicio": "2025-12-15",
        "fecha_fin": "2025-12-22",
        "mi_rol": "admin_principal",
        "total_miembros": 5,
        "adminPrincipal": {
          "id_usuario": 5,
          "nombre": "Juan",
          "apellido": "Pérez",
          "avatar_url": "https://..."
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### 3. Get Trip Details
**GET** `/viajes/:id`

Returns detailed information about a specific trip.

**Authorization:** User must be an active member of the trip.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "viaje": {
      "id_viaje": 1,
      "nombre": "Viaje a Bariloche 2025",
      "tipo": "amigos",
      "alcance": "nacional",
      "estado": "planificacion",
      "fecha_inicio": "2025-12-15",
      "fecha_fin": "2025-12-22",
      "descripcion": "Viaje de fin de año",
      "max_miembros": 15,
      "max_subgrupos": 5,
      "adminPrincipal": {
        "id_usuario": 5,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com",
        "avatar_url": "https://..."
      },
      "adminSecundario": null,
      "cronograma": {
        "id_cronograma": 1,
        "fecha_inicio": "2025-12-15",
        "fecha_fin": "2025-12-22",
        "estado": "activo"
      },
      "miembros": [
        {
          "id_miembro_viaje": 1,
          "rol": "admin_principal",
          "es_menor": false,
          "presupuesto_maximo_diario": null,
          "estado_participacion": "activo",
          "usuario": {
            "id_usuario": 5,
            "nombre": "Juan",
            "apellido": "Pérez",
            "email": "juan@example.com",
            "avatar_url": "https://..."
          }
        }
      ]
    }
  }
}
```

**Note:** This endpoint also automatically updates the trip state based on current date:
- Before fecha_inicio → "planificacion"
- Between fecha_inicio and fecha_fin → "en_curso"
- After fecha_fin → "finalizado"

---

### 4. Update Trip
**PUT** `/viajes/:id`

Updates trip information.

**Authorization:** User must be admin (admin_principal or admin_secundario).

**Request Body (all fields optional):**
```json
{
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripción",
  "estado": "en_curso",              // Valid state transitions only
  "max_miembros": 20,
  "max_subgrupos": 10
}
```

**Valid State Transitions:**
- planificacion → en_curso, cancelado
- en_curso → finalizado, cancelado
- finalizado → (no transitions allowed)
- cancelado → (no transitions allowed)

**Response (200):**
```json
{
  "success": true,
  "message": "Trip updated successfully",
  "data": {
    "viaje": {
      // updated trip object
    }
  }
}
```

**Errors:**
- 403: If user is not admin
- 400: If invalid state transition
- 404: If trip not found

---

### 5. Delete Trip
**DELETE** `/viajes/:id`

Deletes a trip permanently.

**Authorization:** Only principal admin can delete trips.

**Conditions:**
- Only 1 active member (the admin)
- No expenses registered
- If conditions not met, returns 400 error

**Response (200):**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

**Errors:**
- 403: If user is not principal admin
- 400: If trip has active members or expenses
- 404: If trip not found

---

### 6. Get Trip Statistics
**GET** `/viajes/:id/estadisticas`

Returns statistics and aggregated data for a trip.

**Authorization:** User must be an active member of the trip.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total_miembros": 8,
      "total_franjas": 5,
      "total_alojamientos": 3,
      "total_actividades": 12,
      "gastos_totales": {
        "ars": 150000.50,
        "clp": 45000.00,
        "usd": 500.00
      },
      "duracion_dias": 7,
      "estado": "planificacion"
    }
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Status Codes:
- **400 Bad Request**: Validation error, invalid data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Trip not found
- **500 Internal Server Error**: Server error

### Example Error Responses:

**Trip duration exceeds 365 days (400):**
```json
{
  "success": false,
  "error": {
    "message": "Trip duration cannot exceed 365 days",
    "code": "BAD_REQUEST",
    "statusCode": 400
  }
}
```

**User doesn't have access to trip (403):**
```json
{
  "success": false,
  "error": {
    "message": "You do not have access to this trip",
    "code": "FORBIDDEN",
    "statusCode": 403
  }
}
```

**Trip not found (404):**
```json
{
  "success": false,
  "error": {
    "message": "Trip not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## Business Logic Summary

### Trip Creation Flow:
1. Validate request data (Joi schema)
2. Validate trip duration (max 365 days)
3. Create trip record in database
4. Create cronograma (timeline) for the trip
5. Add creator as principal admin member
6. Return created trip

### Trip Access Control:
- **View trip details**: Must be active member
- **Update trip**: Must be admin (principal or secondary)
- **Delete trip**: Must be principal admin + no expenses/members
- **List trips**: Returns only trips where user is active member

### Automatic State Management:
When fetching trip details, the system automatically updates trip state based on dates:
- `planificacion`: Current date < fecha_inicio
- `en_curso`: fecha_inicio ≤ Current date ≤ fecha_fin
- `finalizado`: Current date > fecha_fin

---

## Testing

Use the provided `tests/viajes.http` file with REST Client extension in VS Code:

1. First, authenticate and get a JWT token from `/auth/login`
2. Replace `@token` variable with your JWT token
3. Run the requests to test each endpoint

---

## Next Steps

This module handles basic CRUD operations for trips. Additional modules to implement:
- **Miembros** (invitations, member management)
- **Franjas** (time periods at locations)
- **Alojamientos** (lodging bookings)
- **Actividades** (activities/events)
- **Gastos** (expenses tracking)
- **Subgrupos** (subgroups management)
- **Deudas** (debt calculation and tracking)
- **Pagos** (payment confirmations)
