# API Franjas - Plan Viaje

## Descripción General

El módulo de **Franjas** gestiona los períodos de tiempo en diferentes ubicaciones durante un viaje. Cada franja representa una estancia en un lugar específico con fechas de inicio y fin, y puede contener alojamientos y actividades asociadas.

**Rutas base**: `/api/viajes/:id/franjas`

---

## Características Principales

### 1. **Gestión Automática de Estados**
Los estados de las franjas se actualizan automáticamente según las fechas:
- `programada`: La fecha de inicio es futura
- `en_curso`: Hoy está entre fecha_inicio y fecha_fin
- `completada`: La fecha de fin ya pasó
- `cancelada`: Estado manual establecido por admin

### 2. **Ordenamiento Automático**
- Las franjas se ordenan automáticamente por `orden_secuencia`
- Al crear una franja, se asigna el siguiente número de secuencia
- Al modificar fechas, las franjas se reordenan automáticamente
- Se puede reordenar manualmente usando el endpoint `/reorder`

### 3. **Validaciones de Integridad**
- Las fechas deben estar dentro del rango del viaje
- No puede haber overlapping entre franjas
- Solo se pueden eliminar franjas sin alojamientos ni actividades

### 4. **Control de Acceso**
- **Lectura**: Todos los miembros del viaje
- **Escritura**: Solo admins (principal o secundario)

---

## Endpoints

### 1. Crear Franja

**Endpoint**: `POST /api/viajes/:id/franjas`
**Acceso**: Admin solamente
**Descripción**: Crea una nueva franja horaria para el viaje

**Request Body**:
```json
{
  "nombre_lugar": "Buenos Aires",
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-01-05",
  "descripcion": "Exploring the capital city"
}
```

**Validaciones**:
- `nombre_lugar`: String, 2-100 caracteres (requerido)
- `fecha_inicio`: Date ISO (requerido)
- `fecha_fin`: Date ISO, debe ser después de fecha_inicio (requerido)
- `descripcion`: String, máximo 500 caracteres (opcional)
- Las fechas deben estar dentro del rango del viaje
- No debe haber overlap con otras franjas

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id_franja": 1,
    "id_viaje": 1,
    "id_cronograma": 1,
    "nombre_lugar": "Buenos Aires",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-05",
    "descripcion": "Exploring the capital city",
    "orden_secuencia": 1,
    "estado_franja": "programada",
    "fecha_creacion": "2024-12-17T10:00:00.000Z",
    "id_usuario_creador": 2
  }
}
```

**Errores Comunes**:
- `403`: Usuario no es admin
- `400`: Fechas fuera del rango del viaje
- `400`: Overlap con franjas existentes
- `400`: fecha_fin debe ser después de fecha_inicio

---

### 2. Listar Franjas

**Endpoint**: `GET /api/viajes/:id/franjas`
**Acceso**: Miembros del viaje
**Descripción**: Lista todas las franjas del viaje con paginación y filtros

**Query Parameters**:
- `estado`: Filtrar por estado (programada, en_curso, completada, cancelada)
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20, max: 100)

**Ejemplo**: `GET /api/viajes/1/franjas?estado=programada&page=1&limit=10`

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id_franja": 1,
      "id_viaje": 1,
      "nombre_lugar": "Buenos Aires",
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-01-05",
      "descripcion": "Exploring the capital city",
      "orden_secuencia": 1,
      "estado_franja": "programada",
      "alojamientos": [
        {
          "id_alojamiento": 1,
          "nombre_alojamiento": "Hotel Plaza",
          "tipo_alojamiento": "hotel"
        }
      ],
      "actividades": [
        {
          "id_actividad": 1,
          "nombre_actividad": "City Tour",
          "tipo_actividad": "visita"
        }
      ]
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Detalle de Franja

**Endpoint**: `GET /api/viajes/:id/franjas/:idFranja`
**Acceso**: Miembros del viaje
**Descripción**: Obtiene los detalles completos de una franja específica

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_franja": 1,
    "id_viaje": 1,
    "id_cronograma": 1,
    "nombre_lugar": "Buenos Aires",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-05",
    "descripcion": "Exploring the capital city",
    "orden_secuencia": 1,
    "estado_franja": "programada",
    "fecha_creacion": "2024-12-17T10:00:00.000Z",
    "id_usuario_creador": 2,
    "alojamientos": [
      {
        "id_alojamiento": 1,
        "nombre_alojamiento": "Hotel Plaza",
        "tipo_alojamiento": "hotel",
        "direccion": "Av. Corrientes 1234",
        "fecha_checkin": "2025-01-01",
        "fecha_checkout": "2025-01-05",
        "precio_total": 50000
      }
    ],
    "actividades": [
      {
        "id_actividad": 1,
        "nombre_actividad": "City Tour",
        "tipo_actividad": "visita",
        "fecha_actividad": "2025-01-02",
        "hora_inicio": "10:00",
        "hora_fin": "14:00",
        "costo_total": 15000
      }
    ]
  }
}
```

**Errores**:
- `404`: Franja no encontrada
- `403`: Usuario no tiene acceso al viaje

---

### 4. Editar Franja

**Endpoint**: `PUT /api/viajes/:id/franjas/:idFranja`
**Acceso**: Admin solamente
**Descripción**: Actualiza los datos de una franja

**Request Body** (todos los campos son opcionales):
```json
{
  "nombre_lugar": "Buenos Aires - Updated",
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-01-06",
  "descripcion": "Extended stay in Buenos Aires",
  "estado_franja": "cancelada"
}
```

**Validaciones**:
- Si se modifican fechas, se valida que estén dentro del rango del viaje
- Si se modifican fechas, se valida que no haya overlap con otras franjas
- `estado_franja`: Valores válidos: programada, en_curso, completada, cancelada

**Nota**: Si se modifican las fechas, las franjas se reordenan automáticamente según el orden cronológico.

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_franja": 1,
    "nombre_lugar": "Buenos Aires - Updated",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-06",
    "descripcion": "Extended stay in Buenos Aires",
    "orden_secuencia": 1,
    "estado_franja": "programada"
  }
}
```

---

### 5. Eliminar Franja

**Endpoint**: `DELETE /api/viajes/:id/franjas/:idFranja`
**Acceso**: Admin solamente
**Descripción**: Elimina una franja (solo si no tiene alojamientos ni actividades)

**Response 200**:
```json
{
  "success": true,
  "message": "Franja deleted successfully"
}
```

**Nota**: Después de eliminar, las franjas restantes se reordenan automáticamente.

**Errores**:
- `403`: La franja tiene alojamientos o actividades asociadas
  ```json
  {
    "success": false,
    "error": "Cannot delete franja: has 2 alojamientos and 3 actividades"
  }
  ```
- `404`: Franja no encontrada
- `403`: Usuario no es admin

---

### 6. Reordenar Franja

**Endpoint**: `PUT /api/viajes/:id/franjas/:idFranja/reorder`
**Acceso**: Admin solamente
**Descripción**: Cambia manualmente el orden de secuencia de una franja

**Request Body**:
```json
{
  "nuevo_orden": 2
}
```

**Validaciones**:
- `nuevo_orden` debe estar entre 1 y el total de franjas del viaje

**Lógica de Reordenamiento**:
- Si se mueve hacia arriba (menor orden), las franjas intermedias se desplazan hacia abajo
- Si se mueve hacia abajo (mayor orden), las franjas intermedias se desplazan hacia arriba

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id_franja": 3,
    "nombre_lugar": "Bariloche",
    "orden_secuencia": 2
  }
}
```

**Errores**:
- `400`: nuevo_orden fuera del rango válido
  ```json
  {
    "success": false,
    "error": "nuevo_orden must be between 1 and 3"
  }
  ```

---

### 7. Obtener Estadísticas

**Endpoint**: `GET /api/viajes/:id/franjas/estadisticas`
**Acceso**: Miembros del viaje
**Descripción**: Obtiene estadísticas de las franjas del viaje

**Response 200**:
```json
{
  "success": true,
  "data": {
    "total_franjas": 5,
    "por_estado": {
      "programadas": 3,
      "en_curso": 1,
      "completadas": 1,
      "canceladas": 0
    },
    "total_alojamientos": 8,
    "total_actividades": 15
  }
}
```

---

## Lógica de Negocio

### Validación de Fechas

**Regla 1: Fechas dentro del rango del viaje**
```javascript
// Ejemplo: Viaje del 2025-01-01 al 2025-01-31
// ✅ Válido
{
  "fecha_inicio": "2025-01-10",
  "fecha_fin": "2025-01-15"
}

// ❌ Inválido - fecha_inicio antes del viaje
{
  "fecha_inicio": "2024-12-25",
  "fecha_fin": "2025-01-05"
}

// ❌ Inválido - fecha_fin después del viaje
{
  "fecha_inicio": "2025-01-20",
  "fecha_fin": "2025-02-05"
}
```

**Regla 2: No overlap entre franjas**
```javascript
// Franjas existentes:
// Franja 1: 2025-01-01 a 2025-01-05
// Franja 2: 2025-01-06 a 2025-01-10

// ✅ Válido - después de la última franja
{
  "fecha_inicio": "2025-01-11",
  "fecha_fin": "2025-01-15"
}

// ❌ Inválido - overlap con Franja 1
{
  "fecha_inicio": "2025-01-03",
  "fecha_fin": "2025-01-08"
}

// ❌ Inválido - overlap con Franja 2
{
  "fecha_inicio": "2025-01-05",
  "fecha_fin": "2025-01-07"
}
```

### Ordenamiento Automático

Las franjas se ordenan automáticamente en estos escenarios:

1. **Al crear**: Se asigna el siguiente `orden_secuencia`
2. **Al editar fechas**: Se reordenan todas las franjas por fecha cronológica
3. **Al eliminar**: Se recalculan los números de secuencia

**Ejemplo de reordenamiento al modificar fechas**:
```
Estado inicial:
1. Buenos Aires (2025-01-01 a 2025-01-05)
2. Mendoza (2025-01-06 a 2025-01-10)
3. Bariloche (2025-01-11 a 2025-01-15)

Modificamos Bariloche a (2025-01-03 a 2025-01-04)

Resultado automático:
1. Buenos Aires (2025-01-01 a 2025-01-05)
2. Bariloche (2025-01-03 a 2025-01-04) // Reordenado
3. Mendoza (2025-01-06 a 2025-01-10)
```

### Actualización de Estados

El estado de una franja se actualiza automáticamente cada vez que se consulta:

```javascript
const today = new Date();

if (franja.estado_franja !== 'cancelada') {
  if (today < franja.fecha_inicio) {
    // Aún no empieza
    estado = 'programada';
  } else if (today >= franja.fecha_inicio && today <= franja.fecha_fin) {
    // Está en progreso
    estado = 'en_curso';
  } else if (today > franja.fecha_fin) {
    // Ya terminó
    estado = 'completada';
  }
}
```

**Nota**: El estado `cancelada` es permanente y no se actualiza automáticamente.

---

## Control de Acceso

### Jerarquía de Permisos

| Acción | Admin Principal | Admin Secundario | Miembro Regular |
|--------|----------------|------------------|-----------------|
| Crear franja | ✅ | ✅ | ❌ |
| Editar franja | ✅ | ✅ | ❌ |
| Eliminar franja | ✅ | ✅ | ❌ |
| Reordenar franja | ✅ | ✅ | ❌ |
| Ver franjas | ✅ | ✅ | ✅ |
| Ver estadísticas | ✅ | ✅ | ✅ |

---

## Manejo de Errores

### Errores de Validación (400)

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "fecha_fin",
      "message": "fecha_fin must be after fecha_inicio"
    }
  ]
}
```

### Errores de Permisos (403)

```json
{
  "success": false,
  "error": "Only admins can create franjas"
}
```

### Errores de Recurso No Encontrado (404)

```json
{
  "success": false,
  "error": "Franja not found"
}
```

### Errores de Lógica de Negocio (400)

```json
{
  "success": false,
  "error": "Franja dates overlap with existing franjas"
}
```

```json
{
  "success": false,
  "error": "Franja dates must be within trip dates (2025-01-01 to 2025-01-31)"
}
```

---

## Casos de Uso Completos

### Caso 1: Planificación de Viaje Multi-ciudad

```bash
# 1. Crear primera franja
POST /api/viajes/1/franjas
{
  "nombre_lugar": "Santiago, Chile",
  "fecha_inicio": "2025-03-01",
  "fecha_fin": "2025-03-05",
  "descripcion": "Exploring the capital"
}

# 2. Crear segunda franja
POST /api/viajes/1/franjas
{
  "nombre_lugar": "Valparaíso, Chile",
  "fecha_inicio": "2025-03-06",
  "fecha_fin": "2025-03-10",
  "descripcion": "Port city and street art"
}

# 3. Listar todas las franjas
GET /api/viajes/1/franjas

# 4. Extender la estancia en Santiago
PUT /api/viajes/1/franjas/1
{
  "fecha_fin": "2025-03-06"
}
# Las franjas se reordenan automáticamente
```

### Caso 2: Cancelación de una Franja

```bash
# 1. Verificar si tiene dependencias
GET /api/viajes/1/franjas/2

# 2. Si tiene alojamientos/actividades, eliminarlos primero
# (endpoints de alojamientos y actividades)

# 3. Eliminar la franja
DELETE /api/viajes/1/franjas/2

# 4. Las franjas restantes se reordenan automáticamente
```

### Caso 3: Reordenamiento Manual

```bash
# Tenemos 3 franjas en orden cronológico
# Queremos mover la tercera al segundo lugar

# 1. Mover franja 3 a posición 2
PUT /api/viajes/1/franjas/3/reorder
{
  "nuevo_orden": 2
}

# 2. Verificar el nuevo orden
GET /api/viajes/1/franjas
```

---

## Integración con Otros Módulos

### Relación con Alojamientos
- Cada alojamiento puede estar asociado a una franja
- No se puede eliminar una franja con alojamientos activos

### Relación con Actividades
- Cada actividad puede estar asociada a una franja
- No se puede eliminar una franja con actividades activas

### Relación con Cronograma
- Cada franja pertenece a un cronograma específico del viaje
- El cronograma se crea automáticamente al crear el viaje

---

## Testing

Ver [franjas.http](./tests/franjas.http) para casos de prueba completos incluyendo:
- ✅ Crear franjas exitosamente
- ✅ Listar con filtros y paginación
- ✅ Actualizar franjas
- ✅ Reordenar franjas
- ✅ Eliminar franjas
- ✅ Obtener estadísticas
- ❌ Casos de error: overlaps, fechas inválidas, permisos
- ❌ Casos de error: eliminar con dependencias

---

## Notas Técnicas

1. **Actualización de Estados**: Los estados se actualizan en cada lectura, no mediante un cron job
2. **Transacciones**: Las operaciones de reordenamiento no usan transacciones explícitas (considerar para producción)
3. **Performance**: Los includes de alojamientos y actividades pueden ser costosos para muchas franjas
4. **Validación de Overlaps**: Usa comparación de rangos de fechas en memoria (consideraescalar para grandes volúmenes)

---

**Última actualización**: Diciembre 2024
**Versión del módulo**: 1.0.0
