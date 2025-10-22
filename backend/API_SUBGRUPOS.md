# API Subgrupos - Documentación Completa

## 📋 Descripción General

El módulo de **Subgrupos** permite organizar a los miembros del viaje en grupos más pequeños, facilitando la gestión de gastos compartidos, actividades específicas y mejor organización del viaje.

**Características principales:**
- Creación de subgrupos con miembros específicos
- Asignación de un representante por subgrupo
- Gestión de membresía (agregar/remover miembros)
- Validación de límites y restricciones
- Estadísticas automáticas
- Control de acceso basado en roles

---

## 🔗 Endpoints Disponibles

### 1. Crear Subgrupo
**POST** `/api/viajes/:id/subgrupos`

Crea un nuevo subgrupo dentro del viaje con los miembros especificados.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje

**Body:**
```json
{
  "nombre": "Grupo A",
  "descripcion": "Subgrupo para actividades de montaña",
  "id_representante": 2,
  "miembros": [2, 3, 5]
}
```

**Validaciones:**
- ✅ Nombre único por viaje
- ✅ Máximo de subgrupos no excedido (configurado en viaje)
- ✅ Representante debe ser miembro del viaje
- ✅ Todos los miembros deben pertenecer al viaje
- ✅ No pueden haber miembros duplicados

**Response exitoso (201):**
```json
{
  "success": true,
  "data": {
    "id_subgrupo": 1,
    "id_viaje": 4,
    "nombre": "Grupo A",
    "descripcion": "Subgrupo para actividades de montaña",
    "id_representante": 2,
    "estado": "activo",
    "fecha_creacion": "2025-10-22T12:00:00.000Z",
    "representante": {
      "id_miembro_viaje": 2,
      "id_usuario": 1,
      "rol": "miembro",
      "usuario": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    }
  }
}
```

**Errores posibles:**
- `400` - Nombre duplicado, límite excedido, miembros inválidos
- `403` - Usuario no pertenece al viaje
- `404` - Viaje no encontrado

---

### 2. Listar Subgrupos
**GET** `/api/viajes/:id/subgrupos`

Obtiene todos los subgrupos del viaje con paginación y filtros opcionales.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje

**Query Parameters:**
- `estado` (string, opcional): activo, pausado, cancelado
- `page` (integer, opcional): Número de página (default: 1)
- `limit` (integer, opcional): Items por página (default: 20, max: 100)

**Ejemplo:**
```
GET /api/viajes/4/subgrupos?estado=activo&page=1&limit=10
```

**Response exitoso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_subgrupo": 1,
      "id_viaje": 4,
      "nombre": "Grupo A",
      "descripcion": "Subgrupo para actividades de montaña",
      "id_representante": 2,
      "estado": "activo",
      "fecha_creacion": "2025-10-22T12:00:00.000Z",
      "representante": {
        "id_miembro_viaje": 2,
        "usuario": {
          "id_usuario": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          "email": "juan@example.com"
        }
      },
      "miembros": [
        {
          "id_subgrupo_miembro": 1,
          "id_miembro_viaje": 2,
          "fecha_asignacion": "2025-10-22T12:00:00.000Z",
          "miembroViaje": {
            "id_miembro_viaje": 2,
            "usuario": {
              "id_usuario": 1,
              "nombre": "Juan",
              "apellido": "Pérez"
            }
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Detalles de Subgrupo
**GET** `/api/viajes/:id/subgrupos/:idSubgrupo`

Obtiene información detallada de un subgrupo específico con estadísticas.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje
- `idSubgrupo` (integer): ID del subgrupo

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id_subgrupo": 1,
    "id_viaje": 4,
    "nombre": "Grupo A",
    "descripcion": "Subgrupo para actividades de montaña",
    "id_representante": 2,
    "estado": "activo",
    "fecha_creacion": "2025-10-22T12:00:00.000Z",
    "representante": {
      "id_miembro_viaje": 2,
      "usuario": {
        "id_usuario": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com"
      }
    },
    "miembros": [...],
    "estadisticas": {
      "total_miembros": 3,
      "total_gastos": 5,
      "total_deudas": 2
    }
  }
}
```

**Errores posibles:**
- `403` - Usuario no pertenece al viaje
- `404` - Subgrupo no encontrado

---

### 4. Actualizar Subgrupo
**PUT** `/api/viajes/:id/subgrupos/:idSubgrupo`

Actualiza información del subgrupo. Solo el admin o el representante pueden editar.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje
- `idSubgrupo` (integer): ID del subgrupo

**Body (todos los campos opcionales):**
```json
{
  "nombre": "Grupo A - Actualizado",
  "descripcion": "Nueva descripción",
  "id_representante": 3
}
```

**Validaciones:**
- ✅ Solo admin o representante pueden editar
- ✅ Si se cambia nombre, debe ser único
- ✅ Si se cambia representante, debe ser miembro del viaje

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id_subgrupo": 1,
    "nombre": "Grupo A - Actualizado",
    "descripcion": "Nueva descripción",
    ...
  },
  "message": "Subgroup updated successfully"
}
```

**Errores posibles:**
- `400` - Nombre duplicado, representante inválido
- `403` - Usuario sin permisos para editar
- `404` - Subgrupo no encontrado

---

### 5. Eliminar Subgrupo
**DELETE** `/api/viajes/:id/subgrupos/:idSubgrupo`

Elimina un subgrupo. Solo admin puede eliminar. No se puede eliminar si tiene gastos o deudas asociados.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje
- `idSubgrupo` (integer): ID del subgrupo

**Validaciones:**
- ✅ Solo admin puede eliminar
- ✅ No puede tener gastos asociados
- ✅ No puede tener deudas asociadas

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Subgroup deleted successfully"
}
```

**Errores posibles:**
- `400` - Tiene gastos o deudas asociados
- `403` - Usuario no es admin
- `404` - Subgrupo no encontrado

---

### 6. Agregar Miembro a Subgrupo
**POST** `/api/viajes/:id/subgrupos/:idSubgrupo/miembros`

Agrega un nuevo miembro al subgrupo.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje
- `idSubgrupo` (integer): ID del subgrupo

**Body:**
```json
{
  "id_miembro_viaje": 7
}
```

**Validaciones:**
- ✅ Miembro debe pertenecer al viaje
- ✅ Miembro no debe estar ya en el subgrupo

**Response exitoso (201):**
```json
{
  "success": true,
  "message": "Member added to subgroup successfully"
}
```

**Errores posibles:**
- `400` - Miembro ya existe en subgrupo o no pertenece al viaje
- `403` - Usuario sin acceso al viaje
- `404` - Subgrupo o miembro no encontrado

---

### 7. Remover Miembro de Subgrupo
**DELETE** `/api/viajes/:id/subgrupos/:idSubgrupo/miembros/:idMiembro`

Remueve un miembro del subgrupo.

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (integer): ID del viaje
- `idSubgrupo` (integer): ID del subgrupo
- `idMiembro` (integer): ID del miembro en el subgrupo (id_subgrupo_miembro)

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Member removed from subgroup successfully"
}
```

**Errores posibles:**
- `403` - Usuario sin acceso al viaje
- `404` - Subgrupo o relación miembro-subgrupo no encontrada

---

## 🔐 Control de Acceso

### Permisos por Endpoint

| Endpoint | Admin | Representante | Miembro |
|----------|-------|---------------|---------|
| Crear subgrupo | ✅ | ✅ | ✅ |
| Listar subgrupos | ✅ | ✅ | ✅ |
| Ver detalles | ✅ | ✅ | ✅ |
| Actualizar | ✅ | ✅ (propio) | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| Agregar miembro | ✅ | ✅ (propio) | ❌ |
| Remover miembro | ✅ | ✅ (propio) | ❌ |

---

## 📊 Campos del Modelo Subgrupo

```javascript
{
  id_subgrupo: INTEGER (PK, auto-increment),
  id_viaje: INTEGER (FK → viajes),
  nombre: STRING(100) (required, unique per viaje),
  descripcion: TEXT (optional),
  id_representante: INTEGER (FK → miembros_viaje),
  fecha_creacion: TIMESTAMP (auto),
  estado: ENUM('activo', 'pausado', 'cancelado')
}
```

### Relaciones
- **belongsTo** Viaje
- **belongsTo** MiembroViaje (representante)
- **hasMany** SubgrupoMiembro (miembros)
- **hasMany** GastoSubgrupo (gastos)
- **hasMany** DeudaSubgrupo (deudas)

---

## 🎯 Casos de Uso Comunes

### 1. Crear subgrupo para actividades específicas
```javascript
// POST /api/viajes/4/subgrupos
{
  "nombre": "Grupo Trekking",
  "descripcion": "Miembros que irán al trekking de montaña",
  "id_representante": 2,
  "miembros": [2, 3, 5, 8]
}
```

### 2. Listar subgrupos activos con sus miembros
```javascript
// GET /api/viajes/4/subgrupos?estado=activo
// Retorna todos los subgrupos con detalles de representante y miembros
```

### 3. Cambiar representante de un subgrupo
```javascript
// PUT /api/viajes/4/subgrupos/1
{
  "id_representante": 5
}
```

### 4. Agregar miembro a subgrupo existente
```javascript
// POST /api/viajes/4/subgrupos/1/miembros
{
  "id_miembro_viaje": 9
}
```

---

## ⚠️ Validaciones Importantes

### Al crear subgrupo:
1. **Límite máximo**: No exceder `max_subgrupos` del viaje
2. **Nombre único**: No puede haber dos subgrupos con el mismo nombre en un viaje
3. **Representante válido**: Debe ser un miembro activo del viaje
4. **Miembros válidos**: Todos deben pertenecer al viaje y estar activos
5. **Sin duplicados**: No puede haber miembros duplicados en el array

### Al eliminar subgrupo:
1. **Sin gastos**: No puede tener gastos asociados
2. **Sin deudas**: No puede tener deudas asociadas
3. **Solo admin**: Solo el admin principal puede eliminar

### Al actualizar:
1. **Permisos**: Solo admin o representante actual
2. **Nombre único**: Si se cambia, debe seguir siendo único
3. **Nuevo representante**: Debe ser miembro del viaje

---

## 🔄 Flujo Típico de Trabajo

```
1. Admin crea viaje
   ↓
2. Admin invita miembros
   ↓
3. Admin o miembros crean subgrupos
   ↓
4. Asignan representante a cada subgrupo
   ↓
5. Agregan miembros específicos a cada subgrupo
   ↓
6. Registran gastos asociados a subgrupos
   ↓
7. Sistema calcula deudas automáticamente
   ↓
8. Consultan estadísticas por subgrupo
```

---

## 📈 Estadísticas Disponibles

Cada subgrupo incluye estadísticas automáticas:

```json
{
  "estadisticas": {
    "total_miembros": 4,      // Cantidad de miembros en el subgrupo
    "total_gastos": 12,        // Gastos asociados al subgrupo
    "total_deudas": 5          // Deudas relacionadas al subgrupo
  }
}
```

---

## 🧪 Tests Implementados

✅ **5 tests automatizados:**
1. Get Miembro ID
2. Create Subgrupo
3. List Subgrupos
4. Get Subgrupo Details
5. Update Subgrupo
6. Delete Subgrupo (en cleanup)

**Ejecutar:** `npm run test:api`

---

## 💡 Notas de Implementación

- Los subgrupos usan **nombres con timestamp** en tests para evitar duplicados
- Las asociaciones son **anidadas**: Subgrupo → MiembroViaje → Usuario
- El sistema valida automáticamente la **integridad referencial**
- Se implementa **soft delete** mediante el campo `estado`
- Las estadísticas se calculan **en tiempo real** mediante queries
