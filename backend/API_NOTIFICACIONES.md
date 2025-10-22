# API NOTIFICACIONES - Sistema de Notificaciones

## Descripción General
El módulo de Notificaciones permite enviar alertas y mensajes a los usuarios del sistema a través de múltiples canales (push, email, WhatsApp). Soporta notificaciones individuales y difusión masiva a todos los miembros de un viaje.

**Base URL:** `/api/notificaciones`

## Características Principales

- ✅ Envío de notificaciones individuales
- ✅ Difusión masiva a miembros del viaje
- ✅ Múltiples canales (push, email, WhatsApp)
- ✅ Tipos de eventos predefinidos
- ✅ Enlaces de acción directa
- ✅ Marcado de leído/no leído
- ✅ Eliminación de notificaciones
- ✅ Estadísticas y contadores
- ✅ Filtrado avanzado

## Tipos de Evento

| Tipo | Descripción | Uso Típico |
|------|-------------|------------|
| `nuevo_gasto` | Nuevo gasto registrado | Cuando alguien registra un gasto |
| `pago_pendiente` | Pago esperando confirmación | Cuando el deudor registra un pago |
| `cambio_cronograma` | Cambio en itinerario | Cuando se modifica el cronograma |
| `miembro_retiro` | Miembro abandonó el viaje | Cuando alguien se retira |
| `nuevo_miembro` | Nuevo miembro se unió | Cuando alguien se une |
| `otra` | Notificación personalizada | Para cualquier otro caso |

## Canales de Notificación

| Canal | Descripción | Velocidad | Intrusivo |
|-------|-------------|-----------|-----------|
| `push` | Notificación push en app | Instantáneo | Medio |
| `email` | Correo electrónico | 1-5 min | Bajo |
| `whatsapp` | Mensaje WhatsApp | Instantáneo | Alto |

---

## Endpoints

### 1. Enviar Notificación Individual

Envía una notificación a un usuario específico.

**Endpoint:** `POST /api/notificaciones`

**Permisos:** Admin del viaje

**Request Body:**
```json
{
  "id_usuario_destinatario": 2,
  "id_viaje": 4,
  "tipo_evento": "pago_pendiente",
  "titulo": "Tienes un pago pendiente",
  "contenido": "María te ha registrado un pago de $5,000 ARS. Por favor confirma o rechaza el pago.",
  "canales": {
    "push": true,
    "email": true,
    "whatsapp": false
  },
  "url_accion": "https://app.planviaje.com/viajes/4/deudas/3/pagos/1"
}
```

**Campos:**
- `id_usuario_destinatario` (number, requerido): ID del usuario que recibirá la notificación
- `id_viaje` (number, requerido): ID del viaje relacionado
- `tipo_evento` (string, requerido): Tipo de evento
- `titulo` (string, requerido): Título de la notificación (max 200 caracteres)
- `contenido` (string, requerido): Contenido detallado (max 1000 caracteres)
- `canales` (object, requerido): Canales por los que enviar
  - `push` (boolean, opcional): Enviar por push
  - `email` (boolean, opcional): Enviar por email
  - `whatsapp` (boolean, opcional): Enviar por WhatsApp
- `url_accion` (string, opcional): URL para acción directa

**Response 201:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "id_notificacion": 1,
    "id_usuario_destinatario": 2,
    "id_viaje": 4,
    "tipo_evento": "pago_pendiente",
    "titulo": "Tienes un pago pendiente",
    "contenido": "María te ha registrado un pago de $5,000 ARS...",
    "canales": {
      "push": true,
      "email": true,
      "whatsapp": false
    },
    "leida": false,
    "fecha_creacion": "2026-01-10T14:30:00.000Z",
    "fecha_lectura": null,
    "url_accion": "https://app.planviaje.com/viajes/4/deudas/3/pagos/1",
    "destinatario": {
      "id_usuario": 2,
      "nombre": "María",
      "apellido": "González",
      "email": "maria@example.com"
    },
    "viaje": {
      "id_viaje": 4,
      "nombre": "Viaje a Córdoba 2026"
    }
  }
}
```

**Validaciones:**
- El destinatario debe existir
- El destinatario debe ser miembro activo del viaje
- Al menos un canal debe estar habilitado
- El tipo de evento debe ser válido

---

### 2. Difundir Notificación

Envía una notificación a todos los miembros activos de un viaje.

**Endpoint:** `POST /api/notificaciones/difundir`

**Permisos:** Admin del viaje

**Request Body:**
```json
{
  "id_viaje": 4,
  "tipo_evento": "cambio_cronograma",
  "titulo": "Cambio en el cronograma",
  "contenido": "Se ha actualizado la fecha de la franja de Córdoba del 15/01 al 20/01. Por favor revisa el cronograma.",
  "canales": {
    "push": true,
    "email": true,
    "whatsapp": false
  },
  "url_accion": "https://app.planviaje.com/viajes/4/cronograma",
  "excluir_usuario": 1
}
```

**Campos:**
- `id_viaje` (number, requerido): ID del viaje
- `tipo_evento` (string, requerido): Tipo de evento
- `titulo` (string, requerido): Título (max 200)
- `contenido` (string, requerido): Contenido (max 1000)
- `canales` (object, requerido): Canales de envío
- `url_accion` (string, opcional): URL de acción
- `excluir_usuario` (number, opcional): ID de usuario a excluir (útil para no notificar al que causó el evento)

**Response 201:**
```json
{
  "success": true,
  "message": "Notification broadcasted to 5 members",
  "data": {
    "total_enviadas": 5,
    "destinatarios": [2, 3, 4, 5, 6]
  }
}
```

**Validaciones:**
- El viaje debe existir
- Debe haber al menos un miembro activo para notificar
- Los canales deben ser válidos

---

### 3. Listar Mis Notificaciones

Obtiene la lista de notificaciones del usuario autenticado.

**Endpoint:** `GET /api/notificaciones`

**Permisos:** Usuario autenticado

**Query Parameters:**
- `id_viaje` (number, opcional): Filtrar por viaje
- `tipo_evento` (string, opcional): Filtrar por tipo
- `leida` (string, opcional): Filtrar por estado ("true" o "false")
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Por página (default: 20, max: 100)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id_notificacion": 15,
      "tipo_evento": "nuevo_gasto",
      "titulo": "Nuevo gasto registrado",
      "contenido": "Juan registró un gasto de $25,000 ARS",
      "leida": false,
      "fecha_creacion": "2026-01-10T14:30:00.000Z",
      "url_accion": "https://app.planviaje.com/viajes/4/gastos/12",
      "viaje": {
        "id_viaje": 4,
        "nombre": "Viaje a Córdoba 2026",
        "estado": "planificacion"
      }
    },
    {
      "id_notificacion": 14,
      "tipo_evento": "pago_pendiente",
      "titulo": "Pago confirmado",
      "contenido": "Tu pago de $5,000 ha sido confirmado por Juan",
      "leida": true,
      "fecha_creacion": "2026-01-09T10:00:00.000Z",
      "fecha_lectura": "2026-01-09T11:30:00.000Z",
      "viaje": {
        "id_viaje": 4,
        "nombre": "Viaje a Córdoba 2026"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 4. Obtener Detalle de Notificación

Obtiene información detallada de una notificación específica.

**Endpoint:** `GET /api/notificaciones/:id`

**Permisos:** Propietario de la notificación

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id_notificacion": 15,
    "id_usuario_destinatario": 2,
    "id_viaje": 4,
    "tipo_evento": "nuevo_gasto",
    "titulo": "Nuevo gasto registrado",
    "contenido": "Juan registró un gasto de $25,000 ARS por transporte",
    "canales": {
      "push": true,
      "email": true,
      "whatsapp": false
    },
    "leida": false,
    "fecha_creacion": "2026-01-10T14:30:00.000Z",
    "fecha_lectura": null,
    "url_accion": "https://app.planviaje.com/viajes/4/gastos/12",
    "viaje": {
      "id_viaje": 4,
      "nombre": "Viaje a Córdoba 2026",
      "estado": "planificacion",
      "fecha_inicio": "2026-01-15",
      "fecha_fin": "2026-01-25"
    }
  }
}
```

**Validaciones:**
- Solo el propietario puede ver su notificación
- La notificación debe existir

---

### 5. Marcar Notificación como Leída

Marca una notificación específica como leída.

**Endpoint:** `PUT /api/notificaciones/:id/leer`

**Permisos:** Propietario de la notificación

**Request Body:** No requiere (enviar objeto vacío)

**Response 200:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id_notificacion": 15,
    "leida": true,
    "fecha_lectura": "2026-01-10T15:00:00.000Z"
  }
}
```

**Notas:**
- Si la notificación ya estaba leída, no genera error
- Registra la fecha y hora exacta de lectura

---

### 6. Marcar Todas como Leídas

Marca todas las notificaciones del usuario como leídas.

**Endpoint:** `PUT /api/notificaciones/leer-todas`

**Permisos:** Usuario autenticado

**Query Parameters:**
- `id_viaje` (number, opcional): Solo marcar las de un viaje específico

**Response 200:**
```json
{
  "success": true,
  "message": "12 notifications marked as read",
  "data": {
    "actualizadas": 12
  }
}
```

**Ejemplos:**
```http
# Marcar todas las notificaciones
PUT /api/notificaciones/leer-todas

# Marcar solo las del viaje 4
PUT /api/notificaciones/leer-todas?id_viaje=4
```

---

### 7. Eliminar Notificación

Elimina una notificación del usuario.

**Endpoint:** `DELETE /api/notificaciones/:id`

**Permisos:** Propietario de la notificación

**Response 200:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Validaciones:**
- Solo el propietario puede eliminar su notificación
- La notificación debe existir

---

### 8. Obtener Conteo de No Leídas

Obtiene el número de notificaciones no leídas. Útil para badges.

**Endpoint:** `GET /api/notificaciones/no-leidas/conteo`

**Permisos:** Usuario autenticado

**Query Parameters:**
- `id_viaje` (number, opcional): Solo contar las de un viaje

**Response 200:**
```json
{
  "success": true,
  "data": {
    "no_leidas": 7
  }
}
```

**Ejemplos:**
```http
# Conteo total
GET /api/notificaciones/no-leidas/conteo

# Conteo solo del viaje 4
GET /api/notificaciones/no-leidas/conteo?id_viaje=4
```

**Uso típico:**
Llamar este endpoint cada vez que se abre la app para mostrar el badge con el número de notificaciones pendientes.

---

### 9. Obtener Estadísticas

Obtiene estadísticas detalladas de las notificaciones del usuario.

**Endpoint:** `GET /api/notificaciones/estadisticas`

**Permisos:** Usuario autenticado

**Query Parameters:**
- `id_viaje` (number, opcional): Solo estadísticas de un viaje

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totales": {
      "total": 45,
      "leidas": 38,
      "no_leidas": 7
    },
    "por_tipo": {
      "nuevo_gasto": 15,
      "pago_pendiente": 8,
      "cambio_cronograma": 5,
      "nuevo_miembro": 3,
      "miembro_retiro": 1,
      "otra": 13
    },
    "ultimos_7_dias": 12
  }
}
```

---

## Flujos de Trabajo

### Flujo 1: Notificación de Nuevo Gasto
```
1. Juan registra un gasto de $25,000
2. Sistema difunde notificación a todos los miembros (excepto Juan)
3. Cada miembro recibe notificación por push y email
4. María abre la app y ve el badge "5 notificaciones"
5. María lee la notificación → badge disminuye a "4"
```

### Flujo 2: Notificación de Pago Pendiente
```
1. Pedro registra pago a Ana de $10,000
2. Sistema envía notificación individual a Ana
3. Ana recibe notificación por push, email y WhatsApp (urgente)
4. Ana hace clic en la notificación → va directo al pago
5. Ana confirma el pago
6. Sistema envía notificación a Pedro confirmando
```

### Flujo 3: Difusión de Cambio de Cronograma
```
1. Admin modifica fechas del cronograma
2. Sistema difunde a todos los miembros
3. Todos reciben notificación con link al cronograma
4. Usuario X lee y elimina la notificación
5. Usuario Y marca todas como leídas de una vez
```

---

## Permisos por Rol

| Acción | Usuario | Admin Viaje | Destinatario |
|--------|---------|-------------|--------------|
| Enviar individual | ❌ | ✅ | ❌ |
| Difundir | ❌ | ✅ | ❌ |
| Ver mis notificaciones | ✅ | ✅ | ✅ |
| Marcar como leída | ✅ (propias) | ✅ (propias) | ✅ (propias) |
| Eliminar | ✅ (propias) | ✅ (propias) | ✅ (propias) |
| Ver estadísticas | ✅ (propias) | ✅ (propias) | ✅ (propias) |

---

## Ejemplos de Uso

### Ejemplo 1: Notificar sobre Nuevo Gasto

**Request:**
```http
POST /api/notificaciones/difundir
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_viaje": 4,
  "tipo_evento": "nuevo_gasto",
  "titulo": "Nuevo gasto grupal",
  "contenido": "Juan registró un gasto de $45,000 ARS para la cena grupal en el restaurante La Parrilla",
  "canales": {
    "push": true,
    "email": false,
    "whatsapp": false
  },
  "url_accion": "https://app.planviaje.com/viajes/4/gastos/25",
  "excluir_usuario": 1
}
```

### Ejemplo 2: Notificar Pago Urgente

**Request:**
```http
POST /api/notificaciones
Authorization: Bearer <token>

{
  "id_usuario_destinatario": 3,
  "id_viaje": 4,
  "tipo_evento": "pago_pendiente",
  "titulo": "URGENTE: Confirma tu pago",
  "contenido": "Tienes un pago pendiente de $50,000 ARS que vence en 24 horas. Por favor confirma o rechaza.",
  "canales": {
    "push": true,
    "email": true,
    "whatsapp": true
  },
  "url_accion": "https://app.planviaje.com/viajes/4/deudas/8/pagos/3"
}
```

### Ejemplo 3: Ver Notificaciones No Leídas de un Viaje

**Request:**
```http
GET /api/notificaciones?id_viaje=4&leida=false&limit=20
Authorization: Bearer <token>
```

---

## Integración con Otros Módulos

### Con Gastos
```javascript
// Cuando se crea un gasto
POST /api/viajes/4/gastos
→ Automáticamente difunde notificación tipo "nuevo_gasto"
```

### Con Pagos
```javascript
// Cuando se registra un pago
POST /api/viajes/4/deudas/5/pagos
→ Envía notificación individual al acreedor tipo "pago_pendiente"

// Cuando se confirma un pago
PUT /api/viajes/4/deudas/5/pagos/1/confirmar
→ Envía notificación al deudor confirmando
```

### Con Miembros
```javascript
// Cuando alguien se une
POST /api/viajes/4/miembros
→ Difunde notificación tipo "nuevo_miembro" (excluyendo al nuevo)

// Cuando alguien se retira
PUT /api/viajes/4/miembros/2/retiro
→ Difunde notificación tipo "miembro_retiro" (excluyendo al que se va)
```

---

## Códigos de Error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | No active members found to notify | No hay miembros para notificar |
| 400 | Invalid channel | Canal no válido |
| 403 | You can only access your own notifications | Solo puedes ver tus notificaciones |
| 404 | Notification not found | Notificación no encontrada |
| 404 | Recipient user not found | Usuario destinatario no existe |
| 404 | Trip not found | Viaje no encontrado |

---

## Mejores Prácticas

### 1. Elegir Canales Apropiados
```javascript
// Notificación informativa → Solo push
{
  "canales": { "push": true, "email": false, "whatsapp": false }
}

// Notificación importante → Push + Email
{
  "canales": { "push": true, "email": true, "whatsapp": false }
}

// Notificación urgente → Todos los canales
{
  "canales": { "push": true, "email": true, "whatsapp": true }
}
```

### 2. Usar excluir_usuario en Difusiones
```javascript
// ❌ Malo: Juan se notifica a sí mismo
{
  "id_viaje": 4,
  "titulo": "Juan registró un gasto"
}

// ✅ Bueno: Juan no recibe su propia notificación
{
  "id_viaje": 4,
  "titulo": "Juan registró un gasto",
  "excluir_usuario": 1  // ID de Juan
}
```

### 3. Siempre Incluir url_accion
```javascript
// ❌ Malo: Usuario tiene que buscar manualmente
{
  "titulo": "Nuevo gasto",
  "contenido": "Se registró un gasto"
}

// ✅ Bueno: Usuario puede ir directo con un clic
{
  "titulo": "Nuevo gasto",
  "contenido": "Se registró un gasto",
  "url_accion": "https://app.planviaje.com/viajes/4/gastos/25"
}
```

### 4. Títulos Concisos, Contenido Detallado
```javascript
// ✅ Bueno
{
  "titulo": "Nuevo gasto registrado",
  "contenido": "Juan registró un gasto de $45,000 ARS para la cena grupal en La Parrilla el 15/01/2026"
}

// ❌ Malo: Título muy largo
{
  "titulo": "Juan registró un gasto de $45,000 ARS para la cena grupal en La Parrilla el 15/01/2026",
  "contenido": "Nuevo gasto"
}
```

### 5. Implementar Badge de Contador
```javascript
// En la app, al abrir o cada X minutos
GET /api/notificaciones/no-leidas/conteo
→ Mostrar badge con el número

// Cuando el usuario lee una
PUT /api/notificaciones/15/leer
→ Actualizar badge (decrementar)

// Botón "Marcar todas como leídas"
PUT /api/notificaciones/leer-todas
→ Badge = 0
```

---

## Implementación en Frontend

### React Example
```javascript
// Hook para notificaciones
import { useState, useEffect } from 'react';

function useNotifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    // Cargar notificaciones
    fetchNotificaciones();
    // Actualizar contador cada 30 segundos
    const interval = setInterval(fetchConteo, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificaciones = async () => {
    const response = await fetch('/api/notificaciones?leida=false');
    const data = await response.json();
    setNotificaciones(data.data);
  };

  const fetchConteo = async () => {
    const response = await fetch('/api/notificaciones/no-leidas/conteo');
    const data = await response.json();
    setNoLeidas(data.data.no_leidas);
  };

  const marcarLeida = async (id) => {
    await fetch(`/api/notificaciones/${id}/leer`, { method: 'PUT' });
    fetchNotificaciones();
    fetchConteo();
  };

  return { notificaciones, noLeidas, marcarLeida };
}

// Componente
function NotificationBadge() {
  const { noLeidas } = useNotifications();

  return (
    <div className="notification-badge">
      <BellIcon />
      {noLeidas > 0 && <span className="badge">{noLeidas}</span>}
    </div>
  );
}
```

---

## Webhooks para Servicios Externos

El sistema puede integrarse con servicios de terceros para envío real:

### Push Notifications (Firebase)
```javascript
// El backend envía a Firebase Cloud Messaging
// cuando canales.push = true
```

### Email (SendGrid/Mailgun)
```javascript
// El backend envía email via SendGrid
// cuando canales.email = true
```

### WhatsApp (Twilio)
```javascript
// El backend envía WhatsApp via Twilio
// cuando canales.whatsapp = true
```

---

**Última actualización:** Octubre 2025
**Versión del API:** 1.0
