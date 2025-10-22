# API PAGOS - Gestión de Pagos de Deudas

## Descripción General
El módulo de Pagos permite gestionar los pagos realizados para saldar deudas entre miembros del viaje. Implementa un sistema de confirmación en dos pasos donde el deudor registra el pago y el acreedor lo confirma o rechaza.

**Base URL:** `/api/viajes/:id/deudas/:idDeuda/pagos`

## Características Principales

- ✅ Registro de pagos por parte del deudor
- ✅ Confirmación/Rechazo de pagos por parte del acreedor
- ✅ Validación automática de montos
- ✅ Actualización automática del estado de la deuda
- ✅ Soporte multimoneda (ARS, CLP, USD)
- ✅ Múltiples métodos de pago
- ✅ Adjuntar comprobantes
- ✅ Estadísticas de pagos por deuda

## Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Pago registrado, esperando confirmación del acreedor |
| `confirmado` | Pago confirmado por el acreedor, suma al total pagado |
| `rechazado` | Pago rechazado por el acreedor con motivo |

## Métodos de Pago

- `efectivo` - Pago en efectivo
- `transferencia` - Transferencia bancaria
- `tarjeta` - Tarjeta de crédito/débito
- `otro` - Otro método

---

## Endpoints

### 1. Registrar Pago

Registra un nuevo pago para una deuda. Solo el deudor puede registrar pagos.

**Endpoint:** `POST /api/viajes/:id/deudas/:idDeuda/pagos`

**Permisos:** Solo el deudor de la deuda

**Request Body:**
```json
{
  "monto_ars": 5000,
  "monto_clp": 3000,
  "monto_usd": 10,
  "metodo_pago": "transferencia",
  "comprobante_url": "https://ejemplo.com/comprobante.jpg",
  "observacion": "Pago parcial de la deuda"
}
```

**Campos:**
- `monto_ars` (number, requerido): Monto en pesos argentinos
- `monto_clp` (number, opcional): Monto en pesos chilenos
- `monto_usd` (number, opcional): Monto en dólares
- `metodo_pago` (string, opcional): Método de pago (default: "transferencia")
- `comprobante_url` (string, opcional): URL del comprobante
- `observacion` (string, opcional): Observaciones adicionales

**Response 201:**
```json
{
  "success": true,
  "message": "Payment registered successfully",
  "data": {
    "id_pago": 1,
    "id_deuda": 5,
    "id_pagador": 2,
    "monto_ars": "5000.00",
    "monto_clp": "3000.00",
    "monto_usd": "10.00",
    "metodo_pago": "transferencia",
    "comprobante_url": "https://ejemplo.com/comprobante.jpg",
    "observacion": "Pago parcial de la deuda",
    "estado_pago": "pendiente",
    "fecha_pago": "2026-01-10T14:30:00.000Z",
    "id_confirmador": null,
    "fecha_confirmacion": null,
    "motivo_rechazo": null,
    "pagador": {
      "id_usuario": 2,
      "nombre": "María",
      "apellido": "González"
    },
    "deuda": {
      "id_deuda": 5,
      "monto_ars": "10000.00",
      "estado": "pendiente"
    }
  }
}
```

**Validaciones:**
- El usuario debe ser el deudor de la deuda
- El monto no puede exceder el monto pendiente de la deuda
- La deuda debe existir y pertenecer al viaje
- El usuario debe tener acceso al viaje

---

### 2. Listar Pagos

Obtiene la lista de pagos de una deuda con opciones de filtrado.

**Endpoint:** `GET /api/viajes/:id/deudas/:idDeuda/pagos`

**Permisos:** Miembros activos del viaje

**Query Parameters:**
- `estado_pago` (string, opcional): Filtrar por estado (pendiente, confirmado, rechazado)
- `metodo_pago` (string, opcional): Filtrar por método de pago
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 20, max: 100)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id_pago": 1,
      "monto_ars": "5000.00",
      "metodo_pago": "transferencia",
      "estado_pago": "confirmado",
      "fecha_pago": "2026-01-10T14:30:00.000Z",
      "pagador": {
        "id_usuario": 2,
        "nombre": "María",
        "apellido": "González"
      },
      "confirmador": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### 3. Obtener Detalle de Pago

Obtiene información detallada de un pago específico.

**Endpoint:** `GET /api/viajes/:id/deudas/:idDeuda/pagos/:idPago`

**Permisos:** Miembros activos del viaje

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id_pago": 1,
    "id_deuda": 5,
    "id_pagador": 2,
    "monto_ars": "5000.00",
    "monto_clp": "3000.00",
    "monto_usd": "10.00",
    "metodo_pago": "transferencia",
    "comprobante_url": "https://ejemplo.com/comprobante.jpg",
    "observacion": "Pago parcial",
    "estado_pago": "confirmado",
    "fecha_pago": "2026-01-10T14:30:00.000Z",
    "id_confirmador": 1,
    "fecha_confirmacion": "2026-01-11T09:00:00.000Z",
    "motivo_rechazo": null,
    "pagador": {
      "id_usuario": 2,
      "nombre": "María",
      "apellido": "González",
      "email": "maria@example.com"
    },
    "confirmador": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com"
    },
    "deuda": {
      "id_deuda": 5,
      "monto_ars": "10000.00",
      "estado": "parcialmente_pagada",
      "acreedor": {
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "deudor": {
        "nombre": "María",
        "apellido": "González"
      }
    }
  }
}
```

---

### 4. Confirmar Pago

Confirma un pago pendiente. Solo el acreedor o admin puede confirmar.

**Endpoint:** `PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/confirmar`

**Permisos:** Acreedor de la deuda o admin del viaje

**Request Body:** No requiere body (se puede enviar objeto vacío)

**Response 200:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "id_pago": 1,
    "estado_pago": "confirmado",
    "id_confirmador": 1,
    "fecha_confirmacion": "2026-01-11T09:00:00.000Z",
    "deuda_actualizada": {
      "id_deuda": 5,
      "monto_ars": "10000.00",
      "monto_pagado": "5000.00",
      "monto_pendiente": "5000.00",
      "estado": "parcialmente_pagada"
    }
  }
}
```

**Proceso automático al confirmar:**
1. Marca el pago como confirmado
2. Registra quién y cuándo confirmó
3. Suma el monto a los pagos confirmados de la deuda
4. Si pagos confirmados >= monto total → marca deuda como "pagada"

**Validaciones:**
- Solo el acreedor o admin del viaje puede confirmar
- El pago debe estar en estado "pendiente"
- No se puede confirmar un pago ya confirmado o rechazado

---

### 5. Rechazar Pago

Rechaza un pago pendiente. Solo el acreedor o admin puede rechazar.

**Endpoint:** `PUT /api/viajes/:id/deudas/:idDeuda/pagos/:idPago/rechazar`

**Permisos:** Acreedor de la deuda o admin del viaje

**Request Body:**
```json
{
  "motivo_rechazo": "El comprobante no es válido, por favor enviar uno nuevo"
}
```

**Campos:**
- `motivo_rechazo` (string, opcional): Razón del rechazo

**Response 200:**
```json
{
  "success": true,
  "message": "Payment rejected successfully",
  "data": {
    "id_pago": 1,
    "estado_pago": "rechazado",
    "motivo_rechazo": "El comprobante no es válido, por favor enviar uno nuevo",
    "id_confirmador": 1,
    "fecha_confirmacion": "2026-01-11T09:00:00.000Z"
  }
}
```

**Validaciones:**
- Solo el acreedor o admin del viaje puede rechazar
- El pago debe estar en estado "pendiente"
- No se puede rechazar un pago ya confirmado o rechazado

---

### 6. Eliminar Pago

Elimina un pago. Solo pagos pendientes pueden ser eliminados y solo por el pagador.

**Endpoint:** `DELETE /api/viajes/:id/deudas/:idDeuda/pagos/:idPago`

**Permisos:** Pagador del pago (solo si está pendiente)

**Response 200:**
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

**Validaciones:**
- Solo el pagador puede eliminar su pago
- Solo se pueden eliminar pagos en estado "pendiente"
- No se pueden eliminar pagos confirmados o rechazados

---

### 7. Obtener Estadísticas de Pagos

Obtiene estadísticas de los pagos de una deuda.

**Endpoint:** `GET /api/viajes/:id/deudas/:idDeuda/pagos/estadisticas`

**Permisos:** Miembros activos del viaje

**Response 200:**
```json
{
  "success": true,
  "data": {
    "monto_total_deuda": "10000.00",
    "total_pagado": "7000.00",
    "pendiente_pagar": "3000.00",
    "porcentaje_pagado": 70,
    "total_pagos": 3,
    "pagos_por_estado": {
      "pendiente": 1,
      "confirmado": 2,
      "rechazado": 0
    },
    "pagos_por_metodo": {
      "transferencia": 2,
      "efectivo": 1
    },
    "monto_pendiente_confirmacion": "2000.00"
  }
}
```

---

## Flujo de Trabajo Típico

### Flujo 1: Pago Total
```
1. María (deudora) le debe $10,000 a Juan (acreedor)
2. María registra pago de $10,000 → estado: "pendiente"
3. Juan revisa el comprobante y confirma el pago
4. Sistema actualiza: deuda pasa a estado "pagada"
```

### Flujo 2: Pagos Parciales
```
1. Pedro le debe $20,000 a Ana
2. Pedro registra primer pago de $10,000 → pendiente
3. Ana confirma → deuda pasa a "parcialmente_pagada"
4. Pedro registra segundo pago de $10,000 → pendiente
5. Ana confirma → deuda pasa a "pagada"
```

### Flujo 3: Pago Rechazado
```
1. Luis registra pago de $5,000 con comprobante
2. Carlos revisa y detecta que el comprobante es de otro monto
3. Carlos rechaza con motivo: "Monto no coincide"
4. Luis registra nuevo pago con comprobante correcto
5. Carlos confirma el nuevo pago
```

---

## Permisos por Rol

| Acción | Deudor | Acreedor | Admin | Otro Miembro |
|--------|--------|----------|-------|--------------|
| Registrar pago | ✅ | ❌ | ❌ | ❌ |
| Ver pagos | ✅ | ✅ | ✅ | ✅ |
| Ver detalle | ✅ | ✅ | ✅ | ✅ |
| Confirmar pago | ❌ | ✅ | ✅ | ❌ |
| Rechazar pago | ❌ | ✅ | ✅ | ❌ |
| Eliminar pago | ✅* | ❌ | ❌ | ❌ |
| Ver estadísticas | ✅ | ✅ | ✅ | ✅ |

*Solo pagos pendientes

---

## Validaciones de Negocio

### Validación de Monto
```javascript
// El monto del pago no puede exceder el pendiente
Deuda: $10,000
Pagos confirmados: $7,000
Pendiente: $3,000

✅ Nuevo pago de $3,000 → OK
❌ Nuevo pago de $5,000 → Error: excede pendiente
```

### Validación de Pagador
```javascript
// Solo el deudor puede registrar pagos
Deuda: María debe a Juan

✅ María registra pago → OK
❌ Juan registra pago → Error: no eres el deudor
❌ Pedro registra pago → Error: no eres el deudor
```

### Validación de Confirmador
```javascript
// Solo acreedor o admin pueden confirmar
Deuda: María debe a Juan

✅ Juan confirma → OK (es acreedor)
✅ Admin confirma → OK (es admin del viaje)
❌ María confirma → Error: no puedes confirmar tu propio pago
❌ Pedro confirma → Error: no tienes permisos
```

---

## Ejemplos de Uso

### Ejemplo 1: Pago Completo con Transferencia

**Request:**
```http
POST /api/viajes/4/deudas/5/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "monto_ars": 25000,
  "metodo_pago": "transferencia",
  "comprobante_url": "https://drive.google.com/file/d/abc123",
  "observacion": "Transferencia desde Banco Galicia"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_pago": 12,
    "estado_pago": "pendiente",
    "monto_ars": "25000.00"
  }
}
```

### Ejemplo 2: Pago Multimoneda

**Request:**
```http
POST /api/viajes/4/deudas/5/pagos

{
  "monto_ars": 5000,
  "monto_clp": 3000,
  "monto_usd": 10,
  "metodo_pago": "transferencia",
  "observacion": "Pago internacional"
}
```

### Ejemplo 3: Filtrar Pagos Pendientes

**Request:**
```http
GET /api/viajes/4/deudas/5/pagos?estado_pago=pendiente&limit=10
```

---

## Códigos de Error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | Payment amount exceeds pending debt | El monto excede lo pendiente |
| 403 | Only debtor can make payments | Solo el deudor puede pagar |
| 403 | Only creditor or admin can confirm | Solo acreedor/admin confirma |
| 404 | Debt not found | Deuda no encontrada |
| 404 | Payment not found | Pago no encontrado |
| 409 | Payment already confirmed | Pago ya confirmado |
| 409 | Cannot delete confirmed payment | No se puede eliminar confirmado |

---

## Notas de Implementación

### Actualización Automática de Estado
Cuando se confirma un pago, el sistema automáticamente:
1. Suma el monto a `pagos_confirmados`
2. Calcula `monto_pendiente = monto_total - pagos_confirmados`
3. Si `pagos_confirmados >= monto_total` → `estado = "pagada"`

### Multimoneda
- El campo `monto_ars` es obligatorio (moneda base)
- `monto_clp` y `monto_usd` son opcionales
- Útil para viajes internacionales donde se paga en diferentes monedas

### Comprobantes
- El campo `comprobante_url` permite adjuntar imagen o PDF del comprobante
- El sistema no valida el contenido del archivo
- Es responsabilidad del acreedor verificar que el comprobante sea válido

### Estadísticas
- Solo cuentan pagos **confirmados** para el balance
- Pagos pendientes se muestran separadamente
- Útil para ver progreso real de pago de la deuda

---

## Mejores Prácticas

1. **Registrar pagos inmediatamente**: El deudor debe registrar el pago tan pronto como lo realice
2. **Adjuntar comprobantes**: Siempre incluir `comprobante_url` para facilitar verificación
3. **Confirmar/Rechazar rápido**: El acreedor debe revisar pagos pendientes regularmente
4. **Usar observaciones**: Agregar detalles útiles (banco, número de operación, etc.)
5. **Pagos parciales**: Está permitido hacer múltiples pagos parciales para una deuda
6. **Verificar estadísticas**: Usar endpoint de estadísticas para verificar balance antes de pagar

---

## Webhooks y Notificaciones

El sistema puede enviar notificaciones automáticas en los siguientes eventos:

- ✉️ **Pago registrado**: Notifica al acreedor cuando el deudor registra un pago
- ✉️ **Pago confirmado**: Notifica al deudor cuando el acreedor confirma
- ✉️ **Pago rechazado**: Notifica al deudor con el motivo del rechazo
- ✉️ **Deuda saldada**: Notifica a ambos cuando la deuda pasa a estado "pagada"

---

**Última actualización:** Octubre 2025
**Versión del API:** 1.0
