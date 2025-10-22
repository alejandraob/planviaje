@@ -0,0 +1,800 @@
# API Alojamientos - Plan Viaje

## Descripción General

El módulo de **Alojamientos** gestiona las reservas de hospedaje para un viaje. Cada alojamiento puede estar asociado a una franja específica o ser independiente, con seguimiento de pagos, asignación de miembros y control de acceso.

**Rutas base**: `/api/viajes/:id/alojamientos`

---

## Características Principales

### 1. **Gestión Automática de Pagos**
Los estados de pago se calculan automáticamente:
- `no_pagado`: No se ha realizado ningún pago (monto_pagado = 0)
- `parcialmente_pagado`: Se ha pagado una parte (0 < monto_pagado < monto_total)
- `pagado`: Pagado completamente (monto_pagado >= monto_total)

El campo `monto_faltante_ars` se calcula automáticamente como: `monto_total_ars - monto_pagado_ars`

###2. **Asociación con Franjas**
- Opcional: Un alojamiento puede o no estar asociado a una franja
- Si está asociado a una franja, las fechas de check-in/check-out deben estar dentro de las fechas de la franja
- Si no está asociado, las fechas deben estar dentro de las fechas del viaje

### 3. **Asignación de Miembros**
- `miembros_asignados`: Array de IDs de miembros que usarán este alojamiento
- Permite tracking de quién se alojará dónde
- Todos los miembros asignados deben pertenecer al viaje

### 4. **Control de Acceso**
- **Crear**: Cualquier miembro del viaje
- **Leer**: Todos los miembros del viaje
- **Actualizar/Eliminar**: Admin del viaje o creador del alojamiento

### 5. **Soporte Multi-moneda**
- `monto_total_ars`, `monto_total_clp`, `monto_total_usd`
- Tracking de pagos actualmente solo para ARS
- Preparado para futuras expansiones

---

## Endpoints

### 1. Crear Alojamiento

**Endpoint**: `POST /api/viajes/:id/alojamientos`
**Acceso**: Miembros del viaje
**Descripción**: Crea un nuevo alojamiento para el viaje

**Request Body**:
```json
{
  "id_franja": 1,
  "nombre": "Hotel Plaza San Martin",
  "link_reserva": "https://booking.com/hotel-plaza",
  "fecha_checkin": "2025-12-31",
  "hora_checkin": "15:00",
  "fecha_checkout": "2026-01-05",
  "hora_checkout": "10:00",
  "ubicacion_descripcion": "Centro de San Martin de los Andes",
  "monto_total_ars": 150000,
  "monto_pagado_ars": 50000,
  "id_usuario_reserva": 1,
  "miembros_asignados": [2, 4]
}
```

**Campos**:
- `id_franja`: ID de la franja (opcional, puede ser null)
- `nombre`: Nombre del alojamiento (requerido, 2-100 caracteres)
- `link_reserva`: URL de la reserva (opcional)
- `fecha_checkin`: Fecha de check-in en formato ISO (requerido)
- `hora_checkin`: Hora de check-in en formato HH:MM (opcional)
- `fecha_checkout`: Fecha de check-out, debe ser después de check-in (requerido)
- `hora_checkout`: Hora de check-out en formato HH:MM (opcional)
- `ubicacion_descripcion`: Descripción de la ubicación (opcional, max 500 caracteres)
- `monto_total_ars`: Monto total en pesos argentinos (opcional)
- `monto_total_clp`: Monto total en pesos chilenos (opcional)
- `monto_total_usd`: Monto total en dólares (opcional)
- `monto_pagado_ars`: Monto ya pagado en ARS (opcional, default 0)
- `id_usuario_reserva`: ID del usuario que hizo la reserva (opcional)
- `miembros_asignados`: Array de id_miembro_viaje asignados (opcional)

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 1,
    "id_viaje": 4,
    "id_franja": 1,
    "nombre": "Hotel Plaza San Martin",
    "link_reserva": "https://booking.com/hotel-plaza",
    "fecha_checkin": "2025-12-31",
    "hora_checkin": "15:00:00",
    "fecha_checkout": "2026-01-05",
    "hora_checkout": "10:00:00",
    "ubicacion_descripcion": "Centro de San Martin de los Andes",
    "estado_pago": "parcialmente_pagado",
    "monto_total_ars": "150000.00",
    "monto_total_clp": null,
    "monto_total_usd": null,
    "monto_pagado_ars": "50000.00",
    "monto_faltante_ars": "100000.00",
    "id_usuario_reserva": 1,
    "id_usuario_creador": 1,
    "miembros_asignados": [2, 4],
    "fecha_creacion": "2025-10-20T18:20:00.000Z"
  }
}
```

**Errores Comunes**:
- `400`: Fechas fuera del rango de la franja o viaje
- `400`: fecha_checkout debe ser después de fecha_checkin
- `400`: Franja no existe o no pertenece al viaje
- `400`: Miembros asignados no pertenecen al viaje
- `403`: Usuario no tiene acceso al viaje

---

### 2. Listar Alojamientos

**Endpoint**: `GET /api/viajes/:id/alojamientos`
**Acceso**: Miembros del viaje
**Descripción**: Lista todos los alojamientos del viaje con filtros y paginación

**Query Parameters**:
- `id_franja`: Filtrar por franja específica
- `estado_pago`: Filtrar por estado (no_pagado, parcialmente_pagado, pagado)
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20, max: 100)

**Ejemplos**:
- `GET /api/viajes/4/alojamientos` - Todos los alojamientos
- `GET /api/viajes/4/alojamientos?id_franja=1` - Solo de una franja
- `GET /api/viajes/4/alojamientos?estado_pago=parcialmente_pagado` - Solo parcialmente pagados
- `GET /api/viajes/4/alojamientos?page=1&limit=10` - Paginado

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id_alojamiento": 1,
      "id_viaje": 4,
      "id_franja": 1,
      "nombre": "Hotel Plaza San Martin",
      "link_reserva": "https://booking.com/hotel-plaza",
      "fecha_checkin": "2025-12-31",
      "hora_checkin": "15:00:00",
      "fecha_checkout": "2026-01-05",
      "hora_checkout": "10:00:00",
      "ubicacion_descripcion": "Centro de San Martin de los Andes",
      "estado_pago": "parcialmente_pagado",
      "monto_total_ars": "150000.00",
      "monto_pagado_ars": "50000.00",
      "monto_faltante_ars": "100000.00",
      "id_usuario_reserva": 1,
      "id_usuario_creador": 1,
      "miembros_asignados": [2, 4],
      "fecha_creacion": "2025-10-20T18:20:00.000Z",
      "franja": {
        "id_franja": 1,
        "nombre_lugar": "San Martin de los Andes",
        "fecha_inicio": "2025-12-31",
        "fecha_fin": "2026-01-05"
      },
      "usuarioReserva": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "test@example.com"
      },
      "usuarioCreador": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Detalle de Alojamiento

**Endpoint**: `GET /api/viajes/:id/alojamientos/:idAlojamiento`
**Acceso**: Miembros del viaje
**Descripción**: Obtiene los detalles completos de un alojamiento específico

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 1,
    "id_viaje": 4,
    "id_franja": 1,
    "nombre": "Hotel Plaza San Martin",
    "link_reserva": "https://booking.com/hotel-plaza",
    "fecha_checkin": "2025-12-31",
    "hora_checkin": "15:00:00",
    "fecha_checkout": "2026-01-05",
    "hora_checkout": "10:00:00",
    "ubicacion_descripcion": "Centro de San Martin de los Andes",
    "estado_pago": "parcialmente_pagado",
    "monto_total_ars": "150000.00",
    "monto_total_clp": null,
    "monto_total_usd": null,
    "monto_pagado_ars": "50000.00",
    "monto_faltante_ars": "100000.00",
    "id_usuario_reserva": 1,
    "id_usuario_creador": 1,
    "miembros_asignados": [2, 4],
    "fecha_creacion": "2025-10-20T18:20:00.000Z",
    "franja": {
      "id_franja": 1,
      "nombre_lugar": "San Martin de los Andes",
      "fecha_inicio": "2025-12-31",
      "fecha_fin": "2026-01-05",
      "orden_secuencia": 1
    },
    "usuarioReserva": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "test@example.com",
      "telefono": "+541112345678"
    },
    "usuarioCreador": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "test@example.com"
    },
    "miembros_detalle": [
      {
        "id_miembro_viaje": 2,
        "id_viaje": 4,
        "rol": "admin_principal",
        "usuario": {
          "id_usuario": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          "email": "test@example.com"
        }
      },
      {
        "id_miembro_viaje": 4,
        "id_viaje": 4,
        "rol": "miembro",
        "usuario": {
          "id_usuario": 2,
          "nombre": "María",
          "apellido": "González",
          "email": "maria@example.com"
        }
      }
    ]
  }
}
```

**Errores**:
- `404`: Alojamiento no encontrado
- `403`: Usuario no tiene acceso al viaje

---

### 4. Actualizar Alojamiento

**Endpoint**: `PUT /api/viajes/:id/alojamientos/:idAlojamiento`
**Acceso**: Admin o creador del alojamiento
**Descripción**: Actualiza los datos de un alojamiento

**Request Body** (todos los campos son opcionales):
```json
{
  "nombre": "Hotel Plaza San Martin - Suite",
  "ubicacion_descripcion": "Centro de San Martin - Frente al lago",
  "monto_total_ars": 180000,
  "id_franja": 2,
  "miembros_asignados": [2, 3, 4]
}
```

**Validaciones**:
- Si se cambia `id_franja`, se valida que las fechas estén dentro de la nueva franja
- Si se cambian las fechas, se valida que estén dentro de la franja (o viaje si no hay franja)
- Si se cambian montos, se recalcula automáticamente `estado_pago` y `monto_faltante_ars`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 1,
    "nombre": "Hotel Plaza San Martin - Suite",
    "ubicacion_descripcion": "Centro de San Martin - Frente al lago",
    "monto_total_ars": "180000.00",
    "monto_pagado_ars": "50000.00",
    "monto_faltante_ars": "130000.00",
    "estado_pago": "parcialmente_pagado",
    "id_franja": 2,
    "miembros_asignados": [2, 3, 4]
  }
}
```

**Errores**:
- `403`: Solo admins o el creador pueden editar
- `400`: Fechas fuera del rango válido
- `400`: Miembros no pertenecen al viaje

---

### 5. Actualizar Pago

**Endpoint**: `PUT /api/viajes/:id/alojamientos/:idAlojamiento/pago`
**Acceso**: Admin o creador del alojamiento
**Descripción**: Actualiza el monto pagado (endpoint especializado para pagos)

**Request Body**:
```json
{
  "monto_pagado_ars": 100000
}
```

**Validaciones**:
- `monto_pagado_ars`: Debe ser >= 0

**Nota**: Automáticamente recalcula:
- `monto_faltante_ars` = monto_total_ars - monto_pagado_ars
- `estado_pago` según el monto pagado

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 1,
    "monto_total_ars": "150000.00",
    "monto_pagado_ars": "100000.00",
    "monto_faltante_ars": "50000.00",
    "estado_pago": "parcialmente_pagado"
  }
}
```

**Ejemplo - Marcar como pagado completamente**:
```json
{
  "monto_pagado_ars": 150000
}
```
Resultado: `estado_pago` cambia a "pagado", `monto_faltante_ars` = 0

---

### 6. Eliminar Alojamiento

**Endpoint**: `DELETE /api/viajes/:id/alojamientos/:idAlojamiento`
**Acceso**: Admin o creador del alojamiento
**Descripción**: Elimina un alojamiento del viaje

**Response 200**:
```json
{
  "success": true,
  "message": "Alojamiento deleted successfully"
}
```

**Errores**:
- `404`: Alojamiento no encontrado
- `403`: Solo admins o el creador pueden eliminar

---

### 7. Obtener Estadísticas

**Endpoint**: `GET /api/viajes/:id/alojamientos/estadisticas`
**Acceso**: Miembros del viaje
**Descripción**: Obtiene estadísticas de los alojamientos del viaje

**Response 200**:
```json
{
  "success": true,
  "data": {
    "total_alojamientos": 5,
    "por_estado_pago": {
      "no_pagado": 1,
      "parcialmente_pagado": 2,
      "pagado": 2
    },
    "montos_ars": {
      "total": 850000.00,
      "pagado": 450000.00,
      "faltante": 400000.00
    }
  }
}
```

---

## Lógica de Negocio

### Cálculo Automático de Estado de Pago

```javascript
const determineEstadoPago = (montoTotal, montoPagado) => {
  if (!montoTotal) {
    return 'no_pagado';
  }

  const total = parseFloat(montoTotal);
  const pagado = parseFloat(montoPagado || 0);

  if (pagado === 0) {
    return 'no_pagado';
  } else if (pagado >= total) {
    return 'pagado';
  } else {
    return 'parcialmente_pagado';
  }
};
```

**Ejemplos**:
```javascript
// Caso 1: No pagado
monto_total_ars: 100000
monto_pagado_ars: 0
→ estado_pago: 'no_pagado'
→ monto_faltante_ars: 100000

// Caso 2: Parcialmente pagado
monto_total_ars: 100000
monto_pagado_ars: 50000
→ estado_pago: 'parcialmente_pagado'
→ monto_faltante_ars: 50000

// Caso 3: Pagado
monto_total_ars: 100000
monto_pagado_ars: 100000
→ estado_pago: 'pagado'
→ monto_faltante_ars: 0

// Caso 4: Sobrepagado
monto_total_ars: 100000
monto_pagado_ars: 120000
→ estado_pago: 'pagado'
→ monto_faltante_ars: -20000
```

### Validación de Fechas

**Regla 1: Con franja asociada**
```javascript
// Alojamiento asociado a franja
id_franja: 1
Franja: 2025-12-31 a 2026-01-05

// ✅ Válido
fecha_checkin: "2025-12-31"
fecha_checkout: "2026-01-05"

// ✅ Válido - dentro del rango
fecha_checkin: "2026-01-02"
fecha_checkout: "2026-01-04"

// ❌ Inválido - checkout después de la franja
fecha_checkin: "2026-01-03"
fecha_checkout: "2026-01-07"
```

**Regla 2: Sin franja (independiente)**
```javascript
// Viaje: 2025-12-20 a 2026-01-31
// Alojamiento sin franja

// ✅ Válido
fecha_checkin: "2026-01-15"
fecha_checkout: "2026-01-20"

// ❌ Inválido - fuera del viaje
fecha_checkin: "2026-02-01"
fecha_checkout: "2026-02-05"
```

### Asignación de Miembros

**Validación de miembros asignados**:
```javascript
// Viaje tiene miembros: [2, 4, 5]

// ✅ Válido
miembros_asignados: [2, 4]

// ✅ Válido - todos los miembros
miembros_asignados: [2, 4, 5]

// ❌ Inválido - miembro 99 no existe en el viaje
miembros_asignados: [2, 99]

// ✅ Válido - array vacío
miembros_asignados: []
```

### Control de Acceso

**Creación**:
- Cualquier miembro del viaje puede crear alojamientos
- Se guarda como `id_usuario_creador` automáticamente

**Modificación/Eliminación**:
```javascript
const canModifyAlojamiento = (alojamiento, idUsuario) => {
  // Verificar si es admin del viaje
  const isAdmin = viaje.id_admin_principal === idUsuario ||
                  viaje.id_admin_secundario_actual === idUsuario;

  // Verificar si es el creador
  const isCreator = alojamiento.id_usuario_creador === idUsuario;

  // Puede modificar si es admin O creador
  return isAdmin || isCreator;
};
```

**Tabla de permisos**:

| Acción | Admin Principal | Admin Secundario | Creador | Miembro Regular |
|--------|----------------|------------------|---------|-----------------|
| Crear | ✅ | ✅ | ✅ | ✅ |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ✅ (solo suyo) | ❌ |
| Eliminar | ✅ | ✅ | ✅ (solo suyo) | ❌ |
| Actualizar pago | ✅ | ✅ | ✅ (solo suyo) | ❌ |

---

## Manejo de Errores

### Errores de Validación (400)

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "fecha_checkout",
      "message": "fecha_checkout must be after fecha_checkin"
    }
  ]
}
```

### Errores de Permisos (403)

```json
{
  "success": false,
  "error": "Only admins or the creator can edit this accommodation"
}
```

### Errores de Recurso No Encontrado (404)

```json
{
  "success": false,
  "error": "Alojamiento not found"
}
```

### Errores de Lógica de Negocio (400)

```json
{
  "success": false,
  "error": "Accommodation dates must be within franja dates (2025-12-31 to 2026-01-05)"
}
```

```json
{
  "success": false,
  "error": "Some assigned members do not exist or do not belong to this trip"
}
```

---

## Casos de Uso Completos

### Caso 1: Crear Alojamiento en una Franja

```bash
# 1. Obtener las franjas del viaje
GET /api/viajes/4/franjas

# 2. Crear alojamiento en la primera franja
POST /api/viajes/4/alojamientos
{
  "id_franja": 1,
  "nombre": "Hotel Plaza",
  "fecha_checkin": "2025-12-31",
  "fecha_checkout": "2026-01-05",
  "monto_total_ars": 150000,
  "miembros_asignados": [2, 4]
}

# 3. Verificar creación
GET /api/viajes/4/alojamientos/1
```

### Caso 2: Tracking de Pagos Parciales

```bash
# 1. Crear alojamiento con seña
POST /api/viajes/4/alojamientos
{
  "nombre": "Hostel Patagonia",
  "fecha_checkin": "2026-01-10",
  "fecha_checkout": "2026-01-15",
  "monto_total_ars": 80000,
  "monto_pagado_ars": 20000  # Seña del 25%
}
# → estado_pago: "parcialmente_pagado", monto_faltante_ars: 60000

# 2. Hacer segundo pago
PUT /api/viajes/4/alojamientos/2/pago
{
  "monto_pagado_ars": 50000  # 20000 + 30000
}
# → estado_pago: "parcialmente_pagado", monto_faltante_ars: 30000

# 3. Completar pago
PUT /api/viajes/4/alojamientos/2/pago
{
  "monto_pagado_ars": 80000  # Pago completo
}
# → estado_pago: "pagado", monto_faltante_ars: 0
```

### Caso 3: Cambiar Alojamiento a Otra Franja

```bash
# 1. Ver alojamiento actual
GET /api/viajes/4/alojamientos/1
# → id_franja: 1, fecha_checkin: "2025-12-31", fecha_checkout: "2026-01-05"

# 2. Cambiar a franja 2
PUT /api/viajes/4/alojamientos/1
{
  "id_franja": 2,
  "fecha_checkin": "2026-01-06",  # Ajustar fechas a la nueva franja
  "fecha_checkout": "2026-01-10"
}

# 3. Verificar cambio
GET /api/viajes/4/alojamientos/1
# → id_franja: 2, fecha_checkin: "2026-01-06"
```

### Caso 4: Reporte de Pagos Pendientes

```bash
# 1. Obtener estadísticas generales
GET /api/viajes/4/alojamientos/estadisticas

# 2. Listar alojamientos no pagados
GET /api/viajes/4/alojamientos?estado_pago=no_pagado

# 3. Listar alojamientos parcialmente pagados
GET /api/viajes/4/alojamientos?estado_pago=parcialmente_pagado

# 4. Ver detalles de cada uno para gestionar pagos
GET /api/viajes/4/alojamientos/3
GET /api/viajes/4/alojamientos/5
```

---

## Integración con Otros Módulos

### Relación con Franjas
- Cada alojamiento puede estar asociado a una franja (opcional)
- Las fechas del alojamiento deben estar dentro de las fechas de la franja
- Al eliminar una franja, considerar qué hacer con alojamientos asociados

### Relación con Miembros del Viaje
- `miembros_asignados` almacena IDs de MiembroViaje (no Usuario)
- Solo se pueden asignar miembros activos o pausados del viaje
- Útil para tracking de quién usará qué alojamiento

### Relación con Gastos (futuro)
- Los alojamientos podrán generar gastos asociados
- Link entre el pago del alojamiento y los gastos del viaje

---

## Testing

Ver [alojamientos.http](./tests/alojamientos.http) para casos de prueba completos incluyendo:
- ✅ Crear alojamientos con y sin franja
- ✅ Listar con filtros y paginación
- ✅ Actualizar alojamientos
- ✅ Actualizar pagos
- ✅ Eliminar alojamientos
- ✅ Obtener estadísticas
- ❌ Casos de error: fechas inválidas, permisos, miembros inválidos

---

## Notas Técnicas

1. **JSONB para miembros_asignados**: Almacenado como array JSON en PostgreSQL, permite queries eficientes
2. **Decimal para montos**: Usa DECIMAL(10,2) para evitar problemas de redondeo con floats
3. **Multi-moneda**: Estructura preparada pero tracking de pagos solo en ARS actualmente
4. **Soft deletes**: No implementado - alojamientos se eliminan físicamente
5. **Timezone**: Fechas en DATEONLY, horas en TIME (sin timezone)

---

**Última actualización**: Octubre 2025
**Versión del módulo**: 1.0.0
