| estado_gasto | enum | DEFAULT 'pendiente' | pendiente / pagado / parcialmente_pagado / cancelado |
| id_alojamiento_referencia | int | FK → ALOJAMIENTOS | Si el gasto es por alojamiento |
| id_actividad_referencia | int | FK → ACTIVIDADES | Si el gasto es por actividad |

**Validaciones**:
- `id_usuario_pagador` debe ser miembro activo del viaje
- Si `tipo_gasto = 'personal'`: Solo 1 miembro en `miembros_asignados`
- Si `tipo_gasto = 'grupal'`: Múltiples miembros
- Si `tipo_gasto = 'subgrupo_privado'`: Solo miembros del subgrupo
- Si `id_gasto_padre` NOT NULL: `observacion_diferencia` NOT NULL

**Relación Cascada**:
- Cuando se crea un gasto → Sistema automáticamente crea DEUDAS
- Cuando se edita un gasto → Se recalculan DEUDAS (solo si está dentro de plazo o es cambio en monto)

**Índices**:
- `INDEX(id_viaje, estado_gasto)`
- `INDEX(id_usuario_pagador, estado_gasto)`
- `INDEX(id_gasto_padre)` - Para buscar gastos hijos
- `INDEX(fecha)` - Para reportes por fecha

---

## TABLA: GASTOS_SUBGRUPO

**Descripción**: Gastos privados dentro de un subgrupo (solo se dividen entre miembros del subgrupo).

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_gasto_subgrupo | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_subgrupo | int | FK → SUBGRUPOS, NOT NULL | Subgrupo dueño del gasto |
| id_usuario_creador | int | FK → USUARIOS, NOT NULL | Quién registró |
| id_usuario_pagador | int | FK → USUARIOS, NOT NULL | Quién pagó |
| descripcion | string | NOT NULL | Descripción |
| monto_ars | decimal | NOT NULL | Monto en ARS |
| categoria | enum | NOT NULL | comida / transporte / alojamiento / entradas / otros |
| tipo_division | enum | NOT NULL | todos_subgrupo / miembros_especificos |
| es_compartible_grupo_gral | boolean | DEFAULT false | ¿Se suma al gasto general también? |
| fecha | date | NOT NULL | Cuándo ocurrió |
| timestamp_creacion | datetime | NOT NULL | Cuándo se registró |
| miembros_subgrupo_asignados | json | | Array de {id_miembro_viaje, monto_corresponde} |
| estado_gasto | enum | DEFAULT 'pendiente' | pendiente / pagado / parcialmente_pagado / cancelado |

**Validaciones**:
- Todos los `miembros_subgrupo_asignados` deben pertenecer al subgrupo
- Si `es_compartible_grupo_gral = true`: Genera DEUDAS tanto en subgrupo como en grupo general (ojo con doble conteo)

**Índices**:
- `INDEX(id_subgrupo, estado_gasto)`
- `INDEX(id_usuario_pagador, estado_gasto)`

---

## TABLA: DEUDAS

**Descripción**: Deudas generadas del grupo general (quién le debe a quién y cuánto).

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_deuda | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_acreedor | int | FK → USUARIOS, NOT NULL | Quién debe recibir dinero |
| id_deudor | int | FK → USUARIOS, NOT NULL | Quién debe pagar |
| id_gasto | int | FK → GASTOS, NOT NULL | Gasto que generó la deuda |
| monto_ars | decimal | NOT NULL | Monto en ARS |
| monto_clp | decimal | | Monto en CLP |
| monto_usd | decimal | | Monto en USD |
| estado_deuda | enum | DEFAULT 'pendiente' | pendiente / pagada / cancelada / pausada |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó la deuda |
| fecha_vencimiento | datetime | | Fecha sugerida de pago |
| fecha_pago | datetime | | Cuándo se pagó |
| observacion | text | | Notas adicionales |

**Validaciones**:
- `id_acreedor != id_deudor`
- `monto_ars > 0`
- `UNIQUE(id_viaje, id_acreedor, id_deudor, id_gasto)` - No puede haber deuda duplicada por el mismo gasto

**Lógica**:
- Cuando se crea/edita un gasto: Sistema automáticamente calcula y crea DEUDAS
- Si es gasto individual: No se generan deudas (monto es del usuario)
- Si es gasto grupal: Se generan N deudas (uno por cada miembro que debe)
- Si es con subgrupos: Se generan deudas multiplicando por la cantidad de miembros del subgrupo

**Ejemplo de cálculo**:
- Cena $250k: Ana (1), Laura (1), Xenia (1), Familia Ruiz (3 miembros = 1 entidad), Familia Patiño (1 miembro = 1 entidad)
- Total: 6 entidades → $250k / 6 = $41.67k por entidad
- Ana debe: $41.67k, Laura debe: $41.67k, Xenia debe: $41.67k
- Familia Ruiz total debe: $41.67k × 3 = $125k (se divide internamente entre Jorge, Diego, Lucas)
- Familia Patiño debe: $41.67k × 1 = $41.67k

**Índices**:
- `INDEX(id_viaje, estado_deuda)`
- `INDEX(id_acreedor, estado_deuda)`
- `INDEX(id_deudor, estado_deuda)`
- `UNIQUE(id_viaje, id_acreedor, id_deudor, id_gasto)`

---

## TABLA: DEUDAS_SUBGRUPO

**Descripción**: Deudas internas dentro de un subgrupo (ej: Diego le debe a Jorge).

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_deuda_subgrupo | int | PK, Auto-increment | Identificador único |
| id_subgrupo | int | FK → SUBGRUPOS, NOT NULL | Subgrupo dueño |
| id_acreedor | int | FK → USUARIOS, NOT NULL | Quién debe recibir |
| id_deudor | int | FK → USUARIOS, NOT NULL | Quién debe pagar |
| id_gasto_subgrupo | int | FK → GASTOS_SUBGRUPO, NOT NULL | Gasto que generó |
| monto_ars | decimal | NOT NULL | Monto en ARS |
| estado_deuda | enum | DEFAULT 'pendiente' | pendiente / pagada / cancelada |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó |
| fecha_pago | datetime | | Cuándo se pagó |

**Validaciones**:
- Ambos usuarios deben ser miembros del subgrupo
- `id_acreedor != id_deudor`
- `UNIQUE(id_subgrupo, id_acreedor, id_deudor, id_gasto_subgrupo)`

**Índices**:
- `INDEX(id_subgrupo, estado_deuda)`
- `UNIQUE(id_subgrupo, id_acreedor, id_deudor, id_gasto_subgrupo)`

---

## TABLA: PAGOS

**Descripción**: Registro de confirmación de pagos de deudas.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_pago | int | PK, Auto-increment | Identificador único |
| id_deuda | int | FK → DEUDAS, NOT NULL | Deuda que se paga |
| id_pagador | int | FK → USUARIOS, NOT NULL | Quién pagó |
| id_confirmador | int | FK → USUARIOS | Quién confirmó (acreedor o ambos) |
| metodo_pago | enum | NOT NULL | transferencia_bancaria / efectivo / mercadopago / otro |
| monto_ars | decimal | NOT NULL | Monto pagado en ARS |
| monto_clp | decimal | | Monto pagado en CLP |
| monto_usd | decimal | | Monto pagado en USD |
| estado_pago | enum | DEFAULT 'pendiente_confirmacion' | pendiente_confirmacion / confirmado / rechazado |
| fecha_pago | datetime | NOT NULL | Cuándo se pagó |
| fecha_confirmacion | datetime | | Cuándo se confirmó |
| referencia_mercadopago | string | | ID de transacción en Mercado Pago |
| comprobante_url | string | | URL del comprobante (foto, screenshot) |
| observacion | text | | Notas |

**Validaciones**:
- `id_pagador = DEUDA.id_deudor`
- Si `metodo_pago = 'mercadopago'`: `referencia_mercadopago` NOT NULL
- Si `metodo_pago = 'transferencia_bancaria'`: `comprobante_url` recomendado

**Flujo**:
1. Usuario A registra pago a Usuario B (pendiente confirmación)
2. Usuario B recibe notificación para confirmar
3. Si B confirma: Estado pasa a "confirmado", se actualiza DEUDA a "pagada"
4. Si B rechaza: Pago queda en estado "rechazado", DEUDA sigue "pendiente"

**Índices**:
- `INDEX(id_deuda, estado_pago)`
- `INDEX(id_pagador, estado_pago)`

---

## TABLA: NOTIFICACIONES

**Descripción**: Notificaciones enviadas a usuarios.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_notificacion | int | PK, Auto-increment | Identificador único |
| id_usuario_destinatario | int | FK → USUARIOS, NOT NULL | A quién va dirigida |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje relacionado |
| tipo_evento | enum | NOT NULL | nuevo_gasto / pago_pendiente / cambio_cronograma / miembro_retiro / nuevo_miembro / otra |
| titulo | string | NOT NULL | Título de la notificación |
| contenido | text | NOT NULL | Contenido principal |
| canales | json | NOT NULL | {push: true, email: true, whatsapp: true} |
| leida | boolean | DEFAULT false | ¿Fue leída? |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó |
| fecha_lectura | datetime | | Cuándo se leyó |
| url_accion | string | | Link directo al elemento (ej: /viaje/123/gastos) |

**Validaciones**:
- Debe haber al menos 1 canal activo en `canales`

**Ejemplo**:
```json
{
  "titulo": "¡Nuevo gasto registrado!",
  "contenido": "Ana registró gasto de $5000 en Cena",
  "canales": {
    "push": true,
    "email": true,
    "whatsapp": false
  },
  "url_accion": "/viaje/123/gastos/456"
}
```

**Índices**:
- `INDEX(id_usuario_destinatario, leida)`
- `INDEX(id_viaje, fecha_creacion)`

---

## TABLA: AUDITORIA

**Descripción**: Registro de auditoría de todos los cambios realizados en el viaje.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_auditoria | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_usuario_accion | int | FK → USUARIOS, NOT NULL | Quién hizo el cambio |
| tipo_evento | enum | NOT NULL | crear / editar / eliminar / pausar |
| tabla_afectada | string | NOT NULL | Nombre de tabla (ej: "GASTOS", "FRANJAS") |
| id_registro_afectado | int | NOT NULL | ID del registro modificado |
| cambio_anterior | json | | Estado anterior del registro |
| cambio_nuevo | json | | Estado nuevo del registro |
| timestamp_accion | datetime | NOT NULL | Cuándo ocurrió |
| observacion | text | | Notas adicionales |

**Ejemplo**:
```json
{
  "tipo_evento": "editar",
  "tabla_afectada": "FRANJAS",
  "id_registro_afectado": 42,
  "cambio_anterior": {
    "fecha_fin": "2026-01-10",
    "nombre_lugar": "Villa Traful"
  },
  "cambio_nuevo": {
    "fecha_fin": "2026-01-11",
    "nombre_lugar": "Villa Traful"
  },
  "observacion": "Cascada automática aplicada: Bariloche se corrió al 12/01"
}
```

**Índices**:
- `INDEX(id_viaje, timestamp_accion)`
- `INDEX(id_usuario_accion, timestamp_accion)`

---

## TABLA: CONFIGURACION_VIAJE

**Descripción**: Configuración específica del viaje (canales de notificación, moneda base, etc).

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_config_viaje | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| canales_notificacion | json | | Configuración de canales por tipo de evento |
| permite_edicion_pasado | boolean | DEFAULT false | ¿Se pueden editar datos pasados? |
| dias_anticipacion_notificacion | int | DEFAULT 2 | Días antes para notificar pagos |
| moneda_base | enum | DEFAULT 'ARS' | ARS / CLP / USD |
| fecha_actualizacion | datetime | NOT NULL | Cuándo se actualizó |

**Ejemplo de canales_notificacion**:
```json
{
  "nuevo_gasto": {
    "destinatarios": "todos",
    "canales": ["push", "email"],
    "mensaje_personalizado": "¡Nuevo gasto registrado! Revisa los detalles."
  },
  "pago_pendiente": {
    "destinatarios": "admins",
    "canales": ["push", "email", "whatsapp"],
    "mensaje_personalizado": "Faltan X días para el pago"
  }
}
```

**UNIQUE**:
- `UNIQUE(id_viaje)` - Una única configuración por viaje

---

## TABLA: TASAS_CAMBIO

**Descripción**: Tipos de cambio para conversiones de monedas en viajes internacionales.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_tasa_cambio | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| tasa_usd_ars | decimal | NOT NULL | 1 USD = X ARS |
| tasa_clp_ars | decimal | NOT NULL | 1 CLP = X ARS |
| tipo_fuente | enum | NOT NULL | api / manual |
| fecha_actualizacion | datetime | NOT NULL | Cuándo se actualizó |
| fecha_proxima_actualizacion | datetime | | Cuándo se espera próxima actualización (si es automática) |

**Validaciones**:
- `tasa_usd_ars > 0`
- `tasa_clp_ars > 0`

**Lógica**:
- Si `tipo_fuente = 'api'`: Sistema intenta actualizar automáticamente diariamente
- Si `tipo_fuente = 'manual'`: Solo se actualiza si admin lo cambia (CU-032)
- Fallback: Si API falla, usa último valor conocido

**UNIQUE**:
- `UNIQUE(id_viaje)` - Una única configuración de tasas por viaje

---

## RELACIONES CLAVE Y RESTRICCIONES

### Cascadas (ON DELETE/UPDATE)

1. **VIAJES → MIEMBROS_VIAJE**: CASCADE
   - Si se elimina viaje, se eliminan todos los miembros

2. **VIAJES → GASTOS**: CASCADE
   - Si se elimina viaje, se eliminan todos los gastos
   - Pero se preservan datos para compliance por 3 años

3. **MIEMBROS_VIAJE → DEUDAS**: Cuando se retira miembro
   - Se genera DEUDA final (liquidación)
   - Miembro marcado como "pausado" o "retirado"

4. **FRANJAS → ACTIVIDADES**: CASCADE
   - Si se elimina franja, se eliminan actividades
   - Pero si actividades tienen costos pagados, se preservan en auditoría

5. **SUBGRUPOS → GASTOS_SUBGRUPO**: CASCADE
   - Si se elimina subgrupo, sus gastos se re-asignan al grupo general

### Restricciones de Integridad

1. **No se puede eliminar admin principal** si es el único admin
   - El sistema asigna automáticamente un admin secundario como principal

2. **No se puede editar cronograma pasado**
   - Si hoy es 08/04/2026 y el viaje empezó el 05/04, solo puedo editar del 09/04 en adelante

3. **No se puede eliminar gasto pagado**
   - Si un gasto ya fue pagado y confirmado, se marca como cancelado pero no se elimina

4. **No se puede remover miembro con deudas activas**
   - Primero debe resolver su situación financiera (pagar o ser generoso)

---

## ÍNDICES Y OPTIMIZACIONES

### Índices Primarios (Ya Mencionados)
- Todos los PRIMARY KEY tienen índices únicos automáticos
- Todos los FOREIGN KEY deben tener índices para joins rápidos

### Índices Secundarios Recomendados

```sql
-- Búsquedas rápidas por usuario
CREATE INDEX idx_usuarios_email ON USUARIOS(email);
CREATE INDEX idx_usuarios_telefono ON USUARIOS(telefono);

-- Búsquedas por viaje
CREATE INDEX idx_viajes_admin_principal ON VIAJES(id_admin_principal, estado);
CREATE INDEX idx_viajes_fecha ON VIAJES(fecha_fin) FOR cleanup;

-- Búsquedas de miembros activos
CREATE INDEX idx_miembros_viaje_activos ON MIEMBROS_VIAJE(id_viaje, estado_participacion);

-- Búsquedas de deudas pendientes
CREATE INDEX idx_deudas_pendientes ON DEUDAS(id_viaje, estado_deuda, id_acreedor);
CREATE INDEX idx_deudas_vencimiento ON DEUDAS(fecha_vencimiento) FOR notificaciones;

-- Búsquedas de gastos
CREATE INDEX idx_gastos_viaje_fecha ON GASTOS(id_viaje, fecha);
CREATE INDEX idx_gastos_pagador ON GASTOS(id_usuario_pagador, estado_gasto);

-- Búsquedas de franjas
CREATE INDEX idx_franjas_secuencia ON FRANJAS(id_viaje, orden_secuencia);

-- Búsquedas de notificaciones no leídas
CREATE INDEX idx_notificaciones_no_leidas ON NOTIFICACIONES(id_usuario_destinatario, leida);

-- Búsquedas de auditoría
CREATE INDEX idx_auditoria_viaje_timestamp ON AUDITORIA(id_viaje, timestamp_accion DESC);
```

---

## NOTAS DE IMPLEMENTACIÓN

### Consideraciones para Firebase/Firestore

Si usa **Firestore** en lugar de PostgreSQL:

1. **Colecciones**: Cada tabla → Colección
2. **Documentos**: Cada fila → Documento con ID único
3. **Subcollecciones**: Relaciones 1 a N (ej: viajes/123/gastos/456)
4. **Índices Compuestos**: Definir para queries complejas
5. **Security Rules**: Validar permisos (solo ver gastos de mi viaje)

### Consideraciones para PostgreSQL

Si usa **PostgreSQL**:

1. **Tipos Enum**: Usar `CREATE TYPE` o columnas STRING con CHECK
2. **JSON**: Usar tipo `jsonb` para queries dentro de JSON
3. **Particionamiento**: Particionar GASTOS y DEUDAS por id_viaje para escalar
4. **Vistas**: Crear vistas para reportes (ej: v_deudas_pendientes)

### Soft Deletes vs Hard Deletes

- **USUARIOS**: Soft delete (marcar como "eliminado", no borrar datos)
- **VIAJES**: Soft delete (guardar 1 año, luego hard delete)
- **GASTOS**: Soft delete (compliance financiero)
- **FRANJAS**: Hard delete (no hay restricción legal)

---

## FLUJO DE CREACIÓN DE DEUDAS (Ejemplo Concreto)

**Escenario**: Ana registra gasto de $250k "Cena" en grupo con subgrupos

**Miembros asignados**:
- Ana (1 entidad)
- Laura (1 entidad)
- Xenia (1 entidad)
- Familia Ruiz: Jorge, Diego, Lucas (1 entidad = 3 miembros)
- Familia Patiño: María (1 entidad = 1 miembro)

**Total**: 6 entidades → $250k / 6 = $41.67k por entidad

**Deudas generadas** (id_usuario_pagador = Ana):

| id_deudor | monto_ars | descripción |
|-----------|----------|------------|
| Laura | 41.67k | Por su parte de la cena |
| Xenia | 41.67k | Por su parte de la cena |
| Jorge (Fam Ruiz) | 41.67k | Por su parte + 2 hermanos |
| Diego (Fam Ruiz) | 41.67k | Por su parte + 2 hermanos |
| Lucas (Fam Ruiz) | 41.67k | Por su parte + 2 hermanos |
| María (Fam Patiño) | 41.67k | Por su parte |

**Internamente en Familia Ruiz** (cuando Jorge paga):
- Jorge pagó $125k (cantidad total de la familia)
- Jorge debe dividir entre sí mismo, Diego y Lucas
- Cada uno debe: $125k / 3 = $41.67k
- Si Diego pagó a Jorge $41.67k: DEUDA interna saldada para Diego# Estructura de Base de Datos - Plan Viaje App

## Convenciones

- **PK**: Primary Key (clave primaria)
- **FK**: Foreign Key (clave foránea)
- **UNIQUE**: Campo no puede repetirse
- **NOT NULL**: Campo obligatorio
- **DEFAULT**: Valor por defecto
- Tipos de datos: `int`, `string`, `decimal`, `date`, `time`, `datetime`, `boolean`, `enum`, `json`

---

## TABLA: USUARIOS

**Descripción**: Almacena datos de todos los usuarios registrados en la app.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_usuario | int | PK, Auto-increment | Identificador único |
| email | string | UNIQUE, NOT NULL | Email único para login |
| telefono | string | UNIQUE | Teléfono para login OTP |
| nombre | string | NOT NULL | Nombre del usuario |
| apellido | string | NOT NULL | Apellido del usuario |
| avatar_url | string | | URL del avatar en cloud storage |
| cbu_argentina | string | | CBU bancario para transferencias |
| fecha_registro | datetime | NOT NULL | Cuándo se registró |
| fecha_ultimo_login | datetime | | Último acceso a la app |
| estado | enum | DEFAULT 'activo' | activo / pausado / eliminado |
| preferencias_privacidad | json | | {ver_cbu: 'admins', notificaciones: 'todos'} |

**Relaciones**:
- Crea múltiples VIAJES (1 a N)
- Participa en múltiples VIAJES como MIEMBROS_VIAJE (1 a N)
- Crea múltiples GASTOS (1 a N)
- Recibe múltiples NOTIFICACIONES (1 a N)

**Índices**:
- `UNIQUE(email)`
- `UNIQUE(telefono)`
- `INDEX(estado, fecha_registro)`

---

## TABLA: VIAJES

**Descripción**: Representa cada viaje planificado o en curso.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_viaje | int | PK, Auto-increment | Identificador único del viaje |
| id_admin_principal | int | FK → USUARIOS, NOT NULL | Admin principal que controla el viaje |
| id_admin_secundario_actual | int | FK → USUARIOS | Admin secundario actual (puede cambiar si principal se va) |
| nombre | string | NOT NULL | Nombre del viaje (ej: "Bariloche 2026") |
| tipo | enum | NOT NULL | individual / amigos / familia |
| alcance | enum | NOT NULL | nacional / internacional |
| fecha_inicio | date | NOT NULL | Fecha inicio del viaje |
| fecha_fin | date | NOT NULL | Fecha fin del viaje |
| descripcion | text | | Descripción del viaje |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó el viaje |
| estado | enum | DEFAULT 'planificacion' | planificacion / en_curso / finalizado / cancelado |
| max_miembros | int | DEFAULT 30 | Máximo de miembros permitido |
| max_subgrupos | int | DEFAULT 30 | Máximo de subgrupos |
| max_franjas | int | DEFAULT 999 | Sin límite de franjas (NULL o 999) |

**Validaciones**:
- `fecha_inicio <= fecha_fin`
- `(fecha_fin - fecha_inicio) <= 365 días`
- `max_miembros >= COUNT(MIEMBROS_VIAJE)`

**Índices**:
- `UNIQUE(id_admin_principal, nombre)` - No puede haber dos viajes con mismo nombre para un admin
- `INDEX(estado, fecha_inicio)`
- `INDEX(fecha_fin)` - Para limpiar datos después de 1 año

---

## TABLA: MIEMBROS_VIAJE

**Descripción**: Relación entre USUARIOS y VIAJES con roles y estados específicos.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_miembro_viaje | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje al que pertenece |
| id_usuario | int | FK → USUARIOS, NOT NULL | Usuario miembro |
| rol | enum | NOT NULL | admin_principal / admin_secundario / miembro |
| fecha_union | datetime | NOT NULL | Cuándo se unió al viaje |
| es_menor | boolean | DEFAULT false | ¿Es menor de edad? |
| id_responsable_legal | int | FK → USUARIOS | Quién es responsable si es menor |
| presupuesto_maximo_diario | decimal | | Límite de gasto diario para menores |
| estado_participacion | enum | DEFAULT 'activo' | activo / pausado / retirado |
| fecha_pausa_retiro | datetime | | Cuándo se pausó/retiró |
| opcion_retiro_generoso | enum | | generoso / estricto / null (si no se retira) |

**Validaciones**:
- Si `es_menor = true`: `id_responsable_legal` NO NULL
- `UNIQUE(id_viaje, id_usuario)` - No puede haber duplicados
- Si `estado_participacion = 'pausado'`: `opcion_retiro_generoso` debe tener valor

**Índices**:
- `UNIQUE(id_viaje, id_usuario)`
- `INDEX(id_viaje, estado_participacion)`
- `INDEX(id_usuario, estado_participacion)`

---

## TABLA: CRONOGRAMA

**Descripción**: Período general del viaje.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_cronograma | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje al que pertenece |
| fecha_inicio | date | NOT NULL | Inicio del viaje |
| fecha_fin | date | NOT NULL | Fin del viaje |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó |
| estado | enum | DEFAULT 'activo' | activo / finalizado / cancelado |

**Relación**:
- `UNIQUE(id_viaje)` - Solo 1 cronograma por viaje

---

## TABLA: FRANJAS

**Descripción**: Períodos dentro del cronograma donde se hospeda en un lugar específico.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_franja | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_cronograma | int | FK → CRONOGRAMA, NOT NULL | Cronograma del viaje |
| nombre_lugar | string | NOT NULL | Nombre del lugar (ej: "Villa Traful") |
| fecha_inicio | date | NOT NULL | Cuándo llega al lugar |
| fecha_fin | date | NOT NULL | Cuándo se va del lugar |
| descripcion | text | | Notas sobre el lugar |
| orden_secuencia | int | NOT NULL | Orden en que ocurren las franjas |
| estado_franja | enum | DEFAULT 'programada' | programada / en_curso / completada / cancelada |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó la franja |
| id_usuario_creador | int | FK → USUARIOS | Quién la creó |

**Validaciones**:
- `fecha_inicio >= CRONOGRAMA.fecha_inicio`
- `fecha_fin <= CRONOGRAMA.fecha_fin`
- `fecha_inicio < fecha_fin`
- Las franjas NO deben superponerse (excepción: días intermedios sin asignar)
- `orden_secuencia` debe ser único dentro de un viaje

**Lógica de Cascada**:
- Cuando se edita `fecha_fin` de una franja, la siguiente franja se corre automáticamente
- Sistema detecta automáticamente días intermedios sin asignar

**Índices**:
- `INDEX(id_viaje, orden_secuencia)`
- `INDEX(fecha_inicio, fecha_fin)`

---

## TABLA: ALOJAMIENTOS

**Descripción**: Reservas de hospedaje específicas para franjas.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_alojamiento | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_franja | int | FK → FRANJAS | Franja donde se hospeda (puede ser NULL si es día intermedio) |
| nombre | string | NOT NULL | Nombre del alojamiento |
| link_reserva | string | | Link a Booking, Airbnb, etc |
| fecha_checkin | date | NOT NULL | Fecha de entrada |
| hora_checkin | time | | Hora de check-in |
| fecha_checkout | date | NOT NULL | Fecha de salida |
| hora_checkout | time | | Hora de check-out |
| ubicacion_descripcion | text | | Ubicación/dirección |
| estado_pago | enum | NOT NULL | no_pagado / pagado / parcialmente_pagado |
| monto_total_ars | decimal | | Monto total en ARS |
| monto_total_clp | decimal | | Monto total en CLP (si es internacional) |
| monto_total_usd | decimal | | Monto total en USD (si es internacional) |
| monto_pagado_ars | decimal | DEFAULT 0 | Monto ya pagado |
| monto_faltante_ars | decimal | | Monto pendiente (calculado) |
| id_usuario_reserva | int | FK → USUARIOS | Quién hizo la reserva |
| id_usuario_creador | int | FK → USUARIOS | Quién registró en la app |
| miembros_asignados | json | | Array de id_miembro_viaje asignados |
| fecha_creacion | datetime | NOT NULL | Cuándo se registró |

**Validaciones**:
- `fecha_checkin < fecha_checkout`
- `estado_pago` condiciona qué campos aparecen en UI
- Si `estado_pago = 'no_pagado'`: Solo campos de referencia
- Si `estado_pago = 'pagado'`: Debe tener montos

**Cálculos Automáticos**:
- `monto_faltante_ars = monto_total_ars - monto_pagado_ars`
- Si es internacional: Mostrar siempre 3 monedas (- si no aplica)

**Índices**:
- `INDEX(id_viaje, id_franja)`
- `INDEX(fecha_checkin, fecha_checkout)`

---

## TABLA: ACTIVIDADES

**Descripción**: Eventos o actividades dentro de una franja.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_actividad | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_franja | int | FK → FRANJAS | Franja donde ocurre (puede ser NULL si es día intermedio) |
| nombre | string | NOT NULL | Nombre de la actividad |
| fecha | date | NOT NULL | Fecha de la actividad |
| hora | time | | Hora de inicio |
| descripcion | text | | Descripción |
| tipo_actividad | enum | NOT NULL | entrada / visita / comida / transporte / otro |
| es_paga | boolean | DEFAULT false | ¿Tiene costo? |
| valor_referencial_ars | decimal | | Valor aproximado en ARS |
| valor_referencial_clp | decimal | | Valor aproximado en CLP |
| valor_referencial_usd | decimal | | Valor aproximado en USD |
| estado_pago | enum | DEFAULT 'no_pagada' | no_pagada / pagada / confirmada |
| id_usuario_pago | int | FK → USUARIOS | Quién la pagó |
| miembros_asignados | json | NOT NULL | Array de id_miembro_viaje que participan |
| estado_actividad | enum | DEFAULT 'programada' | programada / en_curso / completada / cancelada / suspendida |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó |
| id_usuario_creador | int | FK → USUARIOS | Quién la creó |

**Validaciones**:
- `fecha` dentro del rango de la franja o día intermedio
- Si `es_paga = true`: `valor_referencial_ars` NOT NULL
- `miembros_asignados` no puede estar vacío

**Relación con Finanzas**:
- Actividad pagada que se cancela → Entra a finanzas como "costo perdido"
- Actividad no pagada que se cancela → Solo cambia estado

**Índices**:
- `INDEX(id_viaje, fecha)`
- `INDEX(id_franja, estado_actividad)`

---

## TABLA: SUBGRUPOS

**Descripción**: Grupos temáticos dentro del viaje (familias, círculos de amigos).

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_subgrupo | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| nombre | string | NOT NULL | Nombre del subgrupo (ej: "Familia Gómez") |
| descripcion | text | | Descripción |
| id_representante | int | FK → USUARIOS, NOT NULL | Quién representa al subgrupo |
| fecha_creacion | datetime | NOT NULL | Cuándo se creó |
| estado | enum | DEFAULT 'activo' | activo / pausado / eliminado |

**Validaciones**:
- `UNIQUE(id_viaje, nombre)` - No puede haber 2 subgrupos con mismo nombre en un viaje
- `id_representante` debe ser miembro del viaje

**Índices**:
- `INDEX(id_viaje, estado)`

---

## TABLA: SUBGRUPO_MIEMBROS

**Descripción**: Relación entre SUBGRUPOS y MIEMBROS_VIAJE.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_subgrupo_miembro | int | PK, Auto-increment | Identificador único |
| id_subgrupo | int | FK → SUBGRUPOS, NOT NULL | Subgrupo |
| id_miembro_viaje | int | FK → MIEMBROS_VIAJE, NOT NULL | Miembro del viaje |
| fecha_asignacion | datetime | NOT NULL | Cuándo se asignó |

**Validaciones**:
- `UNIQUE(id_subgrupo, id_miembro_viaje)` - No duplicados
- Un miembro puede estar en MÚLTIPLES subgrupos (a diferencia de versiones anteriores que eran exclusivos)

**Índices**:
- `UNIQUE(id_subgrupo, id_miembro_viaje)`

---

## TABLA: GASTOS

**Descripción**: Registros de gastos individuales y compartidos del grupo general.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id_gasto | int | PK, Auto-increment | Identificador único |
| id_viaje | int | FK → VIAJES, NOT NULL | Viaje asociado |
| id_usuario_creador | int | FK → USUARIOS, NOT NULL | Quién registró el gasto |
| id_usuario_pagador | int | FK → USUARIOS, NOT NULL | Quién pagó |
| descripcion | string | NOT NULL | Descripción del gasto |
| monto_ars | decimal | NOT NULL | Monto en ARS |
| monto_clp | decimal | | Monto en CLP (si es internacional) |
| monto_usd | decimal | | Monto en USD (si es internacional) |
| categoria | enum | NOT NULL | comida / transporte / alojamiento / entradas / otros |
| tipo_gasto | enum | NOT NULL | personal / grupal / subgrupo_privado / actividad_compartida |
| tipo_division | enum | NOT NULL | todos_miembros / miembros_especificos / subgrupos / individual |
| fecha | date | NOT NULL | Cuándo ocurrió el gasto |
| timestamp_creacion | datetime | NOT NULL | Cuándo se registró |
| miembros_asignados | json | | Array de {id_miembro_viaje, monto_corresponde} |
| id_gasto_padre | int | FK → GASTOS | Si es diferencia, referencia al gasto original |
| observacion_diferencia | string | | Observación si es gasto hijo (ej: "Servicio olvidado") |
| url_comprobante | string | | URL del ticket/foto del comprobante |
| estado_gasto | enum | DEFAULT 'pendiente' | pendiente / pag