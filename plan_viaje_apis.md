  "monto_ars": 250000,
  "monto_clp": 750000,
  "monto_usd": 300,
  "categoria": "comida",
  "tipo_gasto": "grupal|personal|subgrupo_privado|actividad_compartida",
  "tipo_division": "todos_miembros|miembros_especificos|subgrupos|individual",
  "fecha": "2026-01-06",
  "id_usuario_pagador": 1,
  "miembros_asignados": [
    {
      "id_miembro_viaje": 10,
      "monto_corresponde": 41667
    },
    {
      "id_miembro_viaje": 11,
      "monto_corresponde": 41667
    },
    {
      "id_subgrupo": 5,
      "monto_corresponde": 125000
    }
  ],
  "url_comprobante": "https://cloudinary.com/.../ticket.jpg",
  "id_alojamiento_referencia": null,
  "id_actividad_referencia": null
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_gasto": 1001,
    "id_viaje": 123,
    "descripcion": "Cena en restaurante",
    "monto_ars": 250000,
    "monto_clp": 750000,
    "monto_usd": 300,
    "categoria": "comida",
    "tipo_gasto": "grupal",
    "tipo_division": "subgrupos",
    "fecha": "2026-01-06",
    "id_usuario_pagador": 1,
    "id_usuario_creador": 1,
    "estado_gasto": "pendiente",
    "timestamp_creacion": "2025-10-15T10:00:00Z",
    "deudas_generadas": [
      {
        "id_deuda": 2001,
        "id_acreedor": 1,
        "id_deudor": 11,
        "monto_ars": 41667,
        "estado": "pendiente"
      },
      {
        "id_deuda": 2002,
        "id_acreedor": 1,
        "id_deudor": 12,
        "monto_ars": 41667,
        "estado": "pendiente"
      },
      {
        "id_deuda": 2003,
        "id_acreedor": 1,
        "id_deudor_subgrupo": 5,
        "monto_ars": 125000,
        "estado": "pendiente"
      }
    ],
    "notificaciones_enviadas": 3
  }
}
```

**Validaciones**:
- `tipo_gasto` condiciona qué miembros se pueden asignar
- Si es `subgrupo_privado`: solo miembros del subgrupo
- `monto_ars > 0`
- Sumar monto de miembros asignados = monto_ars (o permitir calcular automáticamente)
- Si es internacional: proporcionar 3 monedas

---

### 7.2 POST /viajes/{id_viaje}/gastos/{id_gasto}/diferencia
**Descripción**: Crear gasto hijo (diferencia/corrección)

**Request Body**:
```json
{
  "monto_faltante_ars": 2000,
  "observacion": "Encontré el ticket, tenía servicio de $2000 que no había registrado"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_gasto": 1002,
    "id_gasto_padre": 1001,
    "monto_ars": 2000,
    "observacion": "Encontré el ticket...",
    "estado_gasto": "pendiente",
    "deudas_generadas": [
      {
        "id_deuda": 2004,
        "id_acreedor": 1,
        "id_deudor": 11,
        "monto_ars": 334,
        "observacion": "Diferencia por gasto padre 1001"
      }
    ],
    "gasto_referenciado": {
      "id_gasto_padre": 1001,
      "descripcion_padre": "Cena en restaurante"
    }
  }
}
```

---

### 7.3 PATCH /viajes/{id_viaje}/gastos/{id_gasto}
**Descripción**: Editar gasto (solo dentro de 1 hora de creación)

**Request Body**:
```json
{
  "descripcion": "Cena en restaurante + entrada",
  "monto_ars": 260000
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_gasto": 1001,
    "descripcion": "Cena en restaurante + entrada",
    "monto_ars": 260000,
    "deudas_recalculadas": true,
    "deudas_nuevas": [
      {
        "id_deuda": 2005,
        "monto_ars": 50000,
        "observacion": "Recalculación por edición de gasto"
      }
    ]
  }
}
```

**Validaciones**:
- Solo crear/editor o admin pueden editar
- Solo si pasó menos de 1 hora desde creación (o cambio en monto sin pagos confirmados)
- Recalcular deudas automáticamente

---

### 7.4 DELETE /viajes/{id_viaje}/gastos/{id_gasto}
**Descripción**: Eliminar gasto

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_gasto": 1001,
    "eliminado": true,
    "razon": "Gasto sin pagar, dentro de plazo de edición",
    "deudas_canceladas": 3
  }
}
```

**Validaciones**:
- No se puede eliminar gasto ya pagado/confirmado
- Solo si es gratuita o no pagada
- Cancelar automáticamente deudas relacionadas

---

### 7.5 GET /viajes/{id_viaje}/gastos
**Descripción**: Listar gastos del viaje

**Query Parameters**:
- `tipo_gasto`: grupal,personal,subgrupo_privado (comma-separated)
- `categoria`: comida,transporte,alojamiento,entradas,otros
- `estado_gasto`: pendiente,pagado,cancelado
- `id_usuario_pagador`: ID (filtrar por quién pagó)
- `fecha_inicio`: 2026-01-01
- `fecha_fin`: 2026-01-31
- `ordenar_por`: fecha,monto (default: fecha desc)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "gastos": [
      {
        "id_gasto": 1001,
        "descripcion": "Cena en restaurante",
        "monto_ars": 250000,
        "categoria": "comida",
        "tipo_gasto": "grupal",
        "fecha": "2026-01-06",
        "id_usuario_pagador": 1,
        "pagador_nombre": "Ana",
        "estado_gasto": "pendiente",
        "miembros_asignados_count": 5,
        "tiene_hijos": false,
        "timestamp_creacion": "2025-10-15T10:00:00Z"
      }
    ],
    "resumen": {
      "gasto_total_ars": 250000,
      "gasto_total_clp": 750000,
      "gasto_total_usd": 300,
      "gasto_por_categoria": {
        "comida": 250000,
        "transporte": 0,
        "alojamiento": 0
      }
    },
    "paginacion": {
      "total": 15,
      "pagina": 1,
      "limite": 10
    }
  }
}
```

---

### 7.6 GET /viajes/{id_viaje}/finanzas/resumen
**Descripción**: Resumen financiero personal del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Ana",
    "gasto_personal_total": 50000,
    "gasto_grupal_total": 250000,
    "mi_parte_gasto_grupal": 41667,
    "deudas_totales": 0,
    "creditos_totales": 208333,
    "balance_neto": 208333,
    "resumen_por_categoria": {
      "comida": {
        "gasto_total": 50000,
        "deuda": 0,
        "credito": 0
      },
      "transporte": {
        "gasto_total": 200000,
        "deuda": 41667,
        "credito": 0
      }
    },
    "deudas_pendientes": [
      {
        "id_deuda": 2001,
        "id_acreedor": 1,
        "acreedor_nombre": "Ana",
        "monto_ars": 41667,
        "razon": "Tu parte de Cena en restaurante",
        "fecha_vencimiento": "2026-01-04"
      }
    ],
    "creditos_pendientes": [
      {
        "id_deuda": 2002,
        "id_deudor": 11,
        "deudor_nombre": "Laura",
        "monto_ars": 208333,
        "razon": "Laura debe por Transporte compartido",
        "fecha_vencimiento": "2026-01-04"
      }
    ]
  }
}
```

---

## 8. DEUDAS Y PAGOS

### 8.1 GET /viajes/{id_viaje}/deudas
**Descripción**: Listar todas las deudas del viaje (matriz de quién debe a quién)

**Query Parameters**:
- `estado_deuda`: pendiente,pagada,cancelada
- `solo_mias`: true|false

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "deudas": [
      {
        "id_deuda": 2001,
        "id_acreedor": 1,
        "acreedor_nombre": "Ana",
        "id_deudor": 11,
        "deudor_nombre": "Laura",
        "monto_ars": 41667,
        "monto_clp": 125000,
        "monto_usd": 50,
        "estado_deuda": "pendiente",
        "fecha_creacion": "2025-10-15T10:00:00Z",
        "fecha_vencimiento": "2026-01-04",
        "fecha_pago": null,
        "id_gasto": 1001,
        "gasto_descripcion": "Cena en restaurante",
        "pagos_registrados": []
      }
    ],
    "resumen": {
      "deuda_total_pendiente": 250000,
      "deuda_por_acreedor": {
        "id_usuario_1": 250000
      }
    },
    "matriz_deudas": {
      "Ana": {
        "Laura": 41667,
        "Xenia": 41667,
        "Familia Ruiz": 125000
      }
    }
  }
}
```

---

### 8.2 POST /viajes/{id_viaje}/deudas/{id_deuda}/pagos
**Descripción**: Registrar pago de deuda

**Request Body**:
```json
{
  "metodo_pago": "transferencia_bancaria|efectivo|mercadopago",
  "monto_ars": 41667,
  "comprobante_url": "https://...",
  "observacion": "Transferencia bancaria realizada"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_pago": 5001,
    "id_deuda": 2001,
    "id_pagador": 11,
    "id_confirmador": null,
    "metodo_pago": "transferencia_bancaria",
    "monto_ars": 41667,
    "estado_pago": "pendiente_confirmacion",
    "fecha_pago": "2026-01-15T10:00:00Z",
    "observacion": "Transferencia bancaria realizada",
    "notificacion_enviada": {
      "id_usuario_destino": 1,
      "titulo": "Laura registró pago de $41,667",
      "mensaje": "Laura pagó por Cena en restaurante - Confirma si recibiste"
    }
  }
}
```

**Validaciones**:
- `metodo_pago` válido
- `monto_ars > 0` y `<= deuda pendiente`
- Si es mercadopago, validar referencia de transacción

---

### 8.3 PATCH /viajes/{id_viaje}/deudas/{id_deuda}/pagos/{id_pago}
**Descripción**: Confirmar pago recibido (por acreedor)

**Request Body**:
```json
{
  "confirmado": true,
  "observacion": "Recibido correctamente"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_pago": 5001,
    "estado_pago": "confirmado",
    "fecha_confirmacion": "2026-01-15T10:30:00Z",
    "id_confirmador": 1,
    "deuda_afectada": {
      "id_deuda": 2001,
      "estado_anterior": "pendiente",
      "estado_nuevo": "pagada",
      "fecha_pago_registrada": "2026-01-15T10:30:00Z"
    }
  }
}
```

---

### 8.4 POST /viajes/{id_viaje}/deudas/{id_deuda}/mercadopago
**Descripción**: Generar link de pago por Mercado Pago

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_deuda": 2001,
    "link_pago": "https://mercadopago.com/checkout/...",
    "monto_cobrar": 41667,
    "qr_code": "data:image/png;base64,...",
    "estado": "pendiente_pago",
    "fecha_expiracion": "2026-01-22T10:00:00Z",
    "instrucciones": "Comparte este link con Laura para que pague"
  }
}
```

---

## 9. SUBGRUPOS

### 9.1 POST /viajes/{id_viaje}/subgrupos
**Descripción**: Crear subgrupo

**Request Body**:
```json
{
  "nombre": "Familia Gómez Pérez",
  "descripcion": "Abuelos, papás e hijos",
  "id_representante": 1,
  "miembros": [1, 5, 6, 7]
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_subgrupo": 5,
    "id_viaje": 123,
    "nombre": "Familia Gómez Pérez",
    "descripcion": "Abuelos, papás e hijos",
    "id_representante": 1,
    "representante_nombre": "Ana García",
    "miembros_count": 4,
    "miembros": [
      {
        "id_miembro_viaje": 1,
        "nombre": "Ana",
        "rol_en_subgrupo": "representante"
      },
      {
        "id_miembro_viaje": 5,
        "nombre": "Jorge",
        "rol_en_subgrupo": "miembro"
      }
    ],
    "estado": "activo",
    "fecha_creacion": "2025-10-15T10:00:00Z"
  }
}
```

**Validaciones**:
- Solo admin puede crear subgrupos
- Máximo 30 subgrupos por viaje
- Representante debe ser miembro del viaje

---

### 9.2 GET /viajes/{id_viaje}/subgrupos
**Descripción**: Listar subgrupos del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "subgrupos": [
      {
        "id_subgrupo": 5,
        "nombre": "Familia Gómez Pérez",
        "miembros_count": 4,
        "id_representante": 1,
        "representante_nombre": "Ana",
        "gasto_total": 200000,
        "deuda_interna": 50000,
        "estado": "activo"
      }
    ],
    "total_subgrupos": 1
  }
}
```

---

### 9.3 PATCH /viajes/{id_viaje}/subgrupos/{id_subgrupo}/miembros
**Descripción**: Agregar/remover miembros del subgrupo

**Request Body**:
```json
{
  "accion": "agregar|remover",
  "id_miembro_viaje": 8
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_subgrupo": 5,
    "accion": "agregar",
    "id_miembro_viaje": 8,
    "nombre_miembro": "Diego",
    "miembros_total": 5,
    "deudas_recalculadas": false
  }
}
```

---

## 10. MENORES DE EDAD

### 10.1 POST /viajes/{id_viaje}/miembros/registrar-menor
**Descripción**: Registrar menor con responsable legal

**Request Body**:
```json
{
  "nombre": "Diego",
  "apellido": "Ruiz",
  "edad": 15,
  "id_responsable_legal": 1,
  "email_responsable": "ana@example.com",
  "telefono_invitacion": "+5491123456789",
  "presupuesto_maximo_diario": 5000
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_miembro_viaje": 12,
    "id_usuario": null,
    "nombre": "Diego",
    "es_menor": true,
    "id_responsable_legal": 1,
    "responsable_nombre": "Ana",
    "presupuesto_maximo_diario": 5000,
    "estado_participacion": "activo",
    "invitacion_enviada": true,
    "mensaje": "Se envió invitación al responsable legal"
  }
}
```

---

### 10.2 GET /viajes/{id_viaje}/miembros/{id_miembro_viaje}/gastos-menor
**Descripción**: Ver gastos del menor (solo responsable legal o admin)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_menor": 12,
    "nombre_menor": "Diego",
    "presupuesto_maximo_diario": 5000,
    "presupuesto_gastado_hoy": 3500,
    "presupuesto_disponible_hoy": 1500,
    "gastos": [
      {
        "id_gasto": 1005,
        "descripcion": "Entrada a cine",
        "monto": 2500,
        "fecha": "2026-01-15",
        "categoria": "entradas",
        "tipo": "personal",
        "estado": "pendiente"
      }
    ],
    "deudas_totales": 0,
    "creditos_totales": 0
  }
}
```

---

## 11. NOTIFICACIONES

### 11.1 GET /notificaciones
**Descripción**: Listar notificaciones del usuario

**Query Parameters**:
- `leida`: true,false
- `tipo_evento`: nuevo_gasto,pago_pendiente,cambio_cronograma (comma-separated)
- `id_viaje`: 123
- `limite`: 20
- `pagina`: 1

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id_notificacion": 1001,
        "id_viaje": 123,
        "titulo": "¡Nuevo gasto registrado!",
        "contenido": "Ana registró gasto de $250,000 en Cena en restaurante",
        "tipo_evento": "nuevo_gasto",
        "leida": false,
        "fecha_creacion": "2026-01-15T10:00:00Z",
        "fecha_lectura": null,
        "url_accion": "/viaje/123/gastos/1001",
        "canales": {
          "push": true,
          "email": true,
          "whatsapp": false
        }
      }
    ],
    "no_leidas_count": 5,
    "paginacion": {
      "total": 25,
      "pagina": 1,
      "limite": 20
    }
  }
}
```

---

### 11.2 PATCH /notificaciones/{id_notificacion}
**Descripción**: Marcar notificación como leída

**Request Body**:
```json
{
  "leida": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_notificacion": 1001,
    "leida": true,
    "fecha_lectura": "2026-01-15T10:05:00Z"
  }
}
```

---

### 11.3 PATCH /viajes/{id_viaje}/configuracion/notificaciones
**Descripción**: Configurar canales de notificación (admin)

**Request Body**:
```json
{
  "nuevo_gasto": {
    "destinatarios": "todos",
    "canales": ["push", "email"],
    "mensaje_personalizado": "¡Nuevo gasto! Revisa los detalles."
  },
  "pago_pendiente": {
    "destinatarios": "admins",
    "canales": ["push", "email", "whatsapp"],
    "mensaje_personalizado": "Hay pagos pendientes del viaje"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "configuracion_actualizada": true,
    "eventos_configurados": 2
  }
}
```

---

## 12. REPORTES

### 12.1 GET /viajes/{id_viaje}/reportes/resumen
**Descripción**: Generar resumen financiero del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "nombre_viaje": "Bariloche 2026",
    "fecha_inicio": "2026-01-05",
    "fecha_fin": "2026-01-15",
    "miembros_total": 5,
    "resumen_gastos": {
      "gasto_total_ars": 500000,
      "gasto_total_clp": 1500000,
      "gasto_total_usd": 600,
      "gasto_por_categoria": {
        "comida": 250000,
        "transporte": 150000,
        "alojamiento": 75000,
        "entradas": 25000
      }
    },
    "resumen_deudas": {
      "deuda_total_pendiente": 150000,
      "deuda_total_pagada": 350000,
      "matriz_deudas": {
        "Ana": {
          "Laura": 41667,
          "Xenia": 41667,
          "Familia Ruiz": 125000
        }
      }
    },
    "miembros_resumen": [
      {
        "id_usuario": 1,
        "nombre": "Ana",
        "gasto_personal": 50000,
        "gasto_compartido": 250000,
        "mi_parte": 41667,
        "credito": 208333,
        "deuda": 0,
        "balance": 208333
      }
    ]
  }
}
```

---

### 12.2 GET /viajes/{id_viaje}/reportes/liquidacion-final
**Descripción**: Generar liquidación final (quién debe a quién)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "fecha_generacion": "2026-01-16T10:00:00Z",
    "estado_viaje": "finalizado",
    "transacciones_necesarias": [
      {
        "de": "Laura",
        "para": "Ana",
        "monto_ars": 41667,
        "monto_clp": 125000,
        "monto_usd": 50,
        "razon": "Cena en restaurante"
      },
      {
        "de": "Familia Ruiz",
        "para": "Ana",
        "monto_ars": 125000,
        "monto_clp": 375000,
        "monto_usd": 150,
        "razon": "Cena + alojamiento"
      }
    ],
    "pagos_ya_confirmados": [
      {
        "de": "Xenia",
        "para": "Ana",
        "monto_ars": 41667,
        "fecha_pago": "2026-01-14T15:00:00Z"
      }
    ],
    "pendientes_confirmar": [
      {
        "de": "Laura",
        "para": "Ana",
        "monto_ars": 41667
      }
    ],
    "instrucciones": "Realiza las transferencias listadas arriba para liquidar el viaje"
  }
}
```

---

### 12.3 GET /viajes/{id_viaje}/reportes/auditoria
**Descripción**: Ver historial de cambios (auditoría)

**Query Parameters**:
- `tipo_evento`: crear,editar,eliminar,pausar
- `tabla_afectada`: GASTOS,FRANJAS,ALOJAMIENTOS
- `id_usuario`: 1
- `fecha_inicio`: 2026-01-01
- `fecha_fin`: 2026-01-15
- `ordenar_por`: timestamp (default: desc)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "auditorias": [
      {
        "id_auditoria": 1001,
        "tipo_evento": "editar",
        "tabla_afectada": "FRANJAS",
        "id_registro_afectado": 42,
        "id_usuario_accion": 1,
        "usuario_nombre": "Ana",
        "timestamp_accion": "2026-01-10T14:30:00Z",
        "cambio_anterior": {
          "fecha_fin": "2026-01-10"
        },
        "cambio_nuevo": {
          "fecha_fin": "2026-01-11"
        },
        "observacion": "Cascada automática aplicada a 1 franja"
      }
    ],
    "total_registros": 45
  }
}
```

---

### 12.4 GET /viajes/{id_viaje}/reportes/pdf
**Descripción**: Descargar reporte en PDF

**Response (200 - file)**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Bariloche_2026_Reporte.pdf"
[PDF binary data]
```

---

### 12.5 GET /viajes/{id_viaje}/reportes/excel
**Descripción**: Descargar reporte en Excel

**Response (200 - file)**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Bariloche_2026_Reporte.xlsx"
[XLSX binary data]
```

---

## 13. CONVERSIÓN DE MONEDAS

### 13.1 GET /viajes/{id_viaje}/tasas-cambio
**Descripción**: Obtener tasas de cambio del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "tasa_usd_ars": 950,
    "tasa_clp_ars": 0.27,
    "tipo_fuente": "api",
    "fecha_actualizacion": "2026-01-15T08:00:00Z",
    "fecha_proxima_actualizacion": "2026-01-16T08:00:00Z",
    "moneda_base": "ARS"
  }
}
```

---

### 13.2 PATCH /viajes/{id_viaje}/tasas-cambio
**Descripción**: Actualizar tasas manualmente (admin)

**Request Body**:
```json
{
  "tasa_usd_ars": 955,
  "tasa_clp_ars": 0.28,
  "observacion": "Actualización manual por cambio en el dólar"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "tasa_usd_ars": 955,
    "tasa_clp_ars": 0.28,
    "tipo_fuente": "manual",
    "fecha_actualizacion": "2026-01-15T10:00:00Z",
    "gastos_recalculados": 5,
    "deudas_recalculadas": 8
  }
}
```

**Validaciones**:
- Solo admin puede actualizar
- Cambios disparan recálculo de gastos y deudas

---

## 14. ESTADOS Y TRANSICIONES

### Estados de Gasto
```
pendiente → pagado → confirmado
          ↓
         cancelado
```

### Estados de Deuda
```
pendiente → pagada
         ↓
         pausada (retiro generoso)
         ↓
         cancelada
```

### Estados de Miembro
```
activo → pausado (retiro) → retirado
      ↓
      eliminado (si sin gastos)
```

### Estados de Viaje
```
planificacion → en_curso → finalizado
             ↓
             cancelado
```

### Estados de Actividad
```
programada → en_curso → completada
          ↓
          suspendida → completada
          ↓
          cancelada
```

---

## 15. CÓDIGOS DE ERROR

| Código | HTTP | Descripción |
|--------|------|-------------|
| VALIDATION_ERROR | 400 | Error en validación de datos |
| UNAUTHORIZED | 401 | Usuario no autenticado |
| FORBIDDEN | 403 | Usuario sin permisos |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Conflicto (ej: usuario ya existe) |
| RATE_LIMIT_EXCEEDED | 429 | Límite de requests excedido |
| INTERNAL_SERVER_ERROR | 500 | Error interno del servidor |
| SERVICE_UNAVAILABLE | 503 | Servicio no disponible |

### Ejemplos de Errores Específicos

**VALIDATION_ERROR - Monto negativo**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos en la solicitud",
    "details": [
      {
        "field": "monto_ars",
        "message": "monto_ars debe ser mayor a 0",
        "valor_recibido": -5000
      }
    ]
  }
}
```

**FORBIDDEN - Sin permisos para editar**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para editar este gasto",
    "detalles": "Solo el creador o un administrador puede editar"
  }
}
```

**CONFLICT - Usuario duplicado**:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "El email ya está registrado",
    "campo": "email",
    "valor": "ana@example.com"
  }
}
```

---

## 16. RATE LIMITING

- **Usuarios no autenticados**: 100 requests / hora
- **Usuarios autenticados**: 1000 requests / hora
- **Endpoints sensibles** (crear viaje, transferencias): 10 requests / minuto por usuario

**Headers de respuesta**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2026-01-15T11:00:00Z
```

---

## 17. PAGINACIÓN

Todos los endpoints que retornan listas incluyen:

```json
"paginacion": {
  "total": 100,
  "pagina": 1,
  "limite": 20,
  "total_paginas": 5,
  "tiene_siguiente": true,
  "tiene_anterior": false
}
```

**Query parameters estándar**:
- `pagina`: 1 (default)
- `limite`: 20 (default, máx 100)

---

## 18. FILTROS Y BÚSQUEDA

### Búsqueda de Gastos
```
GET /viajes/123/gastos?
  tipo_gasto=grupal,personal&
  categoria=comida&
  estado_gasto=pendiente&
  fecha_inicio=2026-01-01&
  fecha_fin=2026-01-31&
  ordenar_por=fecha&
  orden=desc&
  pagina=1&
  limite=20
```

### Búsqueda de Deudas
```
GET /viajes/123/deudas?
  estado_deuda=pendiente&
  solo_mias=true&
  ordenar_por=fecha_vencimiento&
  pagina=1
```

---

## 19. TRANSACCIONES Y CONSISTENCIA

### Crear Gasto - Lógica Atómica

Cuando se crea un gasto, el sistema debe:

1. ✅ Crear registro en GASTOS
2. ✅ Calcular divisiones inteligentes (subgrupos, etc)
3. ✅ Generar deudas automáticas en DEUDAS
4. ✅ Si hay subgrupos, generar DEUDAS_SUBGRUPO
5. ✅ Crear notificaciones
6. ✅ Registrar auditoría
7. ✅ Enviar notificaciones (canales configurados)

**Si falla en cualquier paso**: Rollback de toda la transacción

### Ejemplo de Lógica de Divisiones

**Entrada**: 
- Gasto $250k (Ana pagó)
- Miembros: Ana, Laura, Xenia, Familia Ruiz (Jorge, Diego, Lucas), Familia Patiño (María)

**Cálculo**:
```
Entidades totales = 6 (Ana, Laura, Xenia, Fam Ruiz, Fam Patiño)
Por entidad = 250k / 6 = 41.67k

Deudas generadas:
- Laura debe $41.67k a Ana
- Xenia debe $41.67k a Ana
- Jorge debe $41.67k a Ana (de la familia)
- Diego debe $41.67k a Ana (de la familia)
- Lucas debe $41.67k a Ana (de la familia)
- María debe $41.67k a Ana

Internamente en Familia Ruiz (representante Jorge):
- Deuda interna: Jorge pagará $125k total
- Interna: Jorge debe de sí mismo: $41.67k
- Interna: Diego debe a Jorge: $41.67k
- Interna: Lucas debe a Jorge: $41.67k
```

---

## 20. WEBHOOKS (Opcional para Futuro)

Eventos que podrían disparar webhooks:

```
POST /webhooks/viajes/{id_viaje}/eventos

Eventos posibles:
- gasto.creado
- gasto.editado
- gasto.pagado
- deuda.creada
- deuda.pagada
- miembro.unido
- miembro.retirado
- franja.editada (cascada)
- viaje.finalizado
```

---

## 21. CACHING Y OPTIMIZACIONES

### Datos que pueden cachearse (5-10 minutos)
- GET /viajes (lista personal)
- GET /viajes/{id}/miembros
- GET /viajes/{id}/franjas
- GET /viajes/{id}/alojamientos

### Datos NO cacheables (siempre frescos)
- GET /viajes/{id}/gastos (financiero crítico)
- GET /viajes/{id}/deudas (financiero crítico)
- GET /viajes/{id}/finanzas/resumen (personal)

### Invalidar caché cuando:
- Se crea/edita/elimina gasto
- Se crea/edita/elimina franja
- Se modifica membresía

---

## 22. SINCRONIZACIÓN OFFLINE

### Datos a Sincronizar (Pequeño volumen)
- Gastos del viaje actual
- Miembros
- Franjas
- Deudas personales

### Datos NO a Sincronizar
- Notificaciones completas
- Auditoría completa
- Reportes

### Estrategia de Sync

**Download (Inicial)**:
```
1. GET /viajes/{id}/datos-offline
   - Retorna: gastos, franjas, miembros, deudas
   - Formato comprimido JSON
2. Se almacena en localStorage/SQLite local
```

**Upload (Con cambios)**:
```
1. Usuario modifica datos sin conexión
2. Se guarda localmente como "pendiente_sync"
3. Cuando reconecta:
   - POST /sync/{id_viaje} con cambios
   - Sistema detecta conflictos
   - Resuelve manualmente o auto-merge si es posible
```

**Conflicto Ejemplo**:
- Usuario A edita gasto sin conexión (offline)
- Usuario B edita el mismo gasto (online)
- Al sincronizar: Sistema muestra "¿Cuál versión prefieres?"

---

## 23. AUTENTICACIÓN Y SEGURIDAD

### JWT Token
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id_usuario": 1,
    "email": "ana@example.com",
    "iat": 1705329600,
    "exp": 1705416000,
    "iss": "plan-viaje-app",
    "viajes": [123, 124, 125]
  }
}
```

**Duración**: 
- Access Token: 24 horas
- Refresh Token: 30 días

### Endpoints Públicos (sin autenticación)
- POST /auth/register
- POST /auth/login
- POST /auth/otp/send
- POST /auth/otp/verify
- POST /viajes/{id}/aceptar-invitacion (con token)

### Endpoints Protegidos (requieren JWT)
- Todos los demás

---

## 24. LÍMITES Y RESTRICCIONES

| Recurso | Límite |
|---------|--------|
| Miembros por viaje | 30 |
| Subgrupos por viaje | 30 |
| Franjas por viaje | Sin límite |
| Actividades por viaje | Sin límite |
| Gastos por viaje | Sin límite |
| Duración máxima del viaje | 365 días |
| Tamaño máximo de archivo (comprobante) | 10 MB |
| Longitud máxima de descripción | 500 caracteres |
| Invitaciones pendientes por viaje | 100 |

---

## 25. MEJORES PRÁCTICAS DE LLAMADAS

### ✅ BIEN: Llamadas Eficientes

```javascript
// Obtener viaje con todo lo relacionado en una sola llamada
GET /viajes/123?incluir=miembros,franjas,gastos,deudas

// Listar gastos filtrados
GET /viajes/123/gastos?
  tipo_gasto=grupal&
  categoria=comida&
  ordenar_por=fecha&
  pagina=1&
  limite=20

// Crear gasto con toda la información
POST /viajes/123/gastos {
  descripcion,
  monto_ars,
  miembros_asignados,
  // ... todo de una vez
}
```

### ❌ EVITAR: Llamadas Ineficientes

```javascript
// No: Llamadas múltiples para el mismo dato
GET /viajes/123
GET /viajes/123/miembros
GET /viajes/123/franjas
GET /viajes/123/gastos
// ... cada una por separado

// No: Crear gasto y luego hacer otra llamada para las deudas
POST /viajes/123/gastos
GET /viajes/123/deudas
// Deudas se generan automáticamente
```

---

## 26. DOCUMENTACIÓN DE EJEMPLO COMPLETO

### Caso: Crear Viaje, Invitar Miembros, Registrar Gasto

**Paso 1: Crear Viaje**
```bash
POST /viajes
{
  "nombre": "Bariloche 2026",
  "tipo": "familia",
  "alcance": "nacional",
  "fecha_inicio": "2026-01-05",
  "fecha_fin": "2026-01-15"
}
↓
Response: id_viaje = 123, link_invitacion = "..."
```

**Paso 2: Invitar Miembros**
```bash
POST /viajes/123/miembros/invitar
{
  "invitaciones": [
    { "tipo_contacto": "telefono", "contacto": "+5491123456789", "nombre": "Laura" },
    { "tipo_contacto": "email", "contacto": "xenia@example.com", "nombre": "Xenia" }
  ],
  "canales": ["whatsapp", "email"]
}
↓
Response: invitaciones_enviadas = 2
```

**Paso 3: Miembros Aceptan (Link con Token)**
```bash
POST /viajes/123/aceptar-invitacion
{ "token": "xyz789abc123" }
↓
Response: id_miembro_viaje = 11 (ahora es miembro)
```

**Paso 4: Crear Franja**
```bash
POST /viajes/123/franjas
{
  "nombre_lugar": "Villa Traful",
  "fecha_inicio": "2026-01-05",
  "fecha_fin": "2026-01-10"
}
↓
Response: id_franja = 42
```

**Paso 5: Registrar Gasto Compartido**
```bash
POST /viajes/123/gastos
{
  "descripcion": "Cena en restaurante",
  "monto_ars": 250000,
  "categoria": "comida",
  "tipo_gasto": "grupal",
  "tipo_division": "todos_miembros",
  "fecha": "2026-01-06",
  "id_usuario_pagador": 1,
  "miembros_asignados": [10, 11, 12]
}
↓
Response: 
- id_gasto = 1001
- deudas_generadas = 3
- notificaciones_enviadas = 2
```

**Paso 6: Ver Deudas Pendientes**
```bash
GET /viajes/123/deudas?estado_deuda=pendiente
↓
Response: Matriz completa de quién debe a quién
```

**Paso 7: Confirmar Pago**
```bash
POST /viajes/123/deudas/2001/pagos
{
  "metodo_pago": "transferencia_bancaria",
  "monto_ars": 41667
}
↓
Response: id_pago = 5001, estado = "pendiente_confirmacion"

PATCH /viajes/123/deudas/2001/pagos/5001
{ "confirmado": true }
↓
Response: deuda_pagada = true
```

**Paso 8: Generar Reporte Final**
```bash
GET /viajes/123/reportes/liquidacion-final
↓
Response: Resumen final de quién debe a quién

GET /viajes/123/reportes/pdf
↓
Response: Descarga PDF con todos los detalles
```

---

## RESUMEN DE ENDPOINTS

**Autenticación**: 7 endpoints
**Viajes**: 5 endpoints
**Miembros**: 5 endpoints
**Franjas**: 4 endpoints
**Actividades**: 3 endpoints
**Alojamientos**: 3 endpoints
**Gastos**: 6 endpoints
**Deudas**: 4 endpoints
**Subgrupos**: 3 endpoints
**Menores**: 2 endpoints
**Notificaciones**: 3 endpoints
**Reportes**: 5 endpoints
**Monedas**: 2 endpoints

**Total**: ~52 endpoints principales

---

## PRÓXIMOS PASOS EN DESARROLLO

1. **Especificar Requests/Responses Exactos** en Swagger/OpenAPI
2. **Implementar Base de Datos** (PostgreSQL + Firestore)
3. **Codificar Backend** (Node.js/Express)
4. **Crear SDK para Frontend** (TypeScript types)
5. **Wireframes y Mockups** de la UI
6. **Testing** (unit, integration, E2E)# APIs y Endpoints - Plan Viaje App

## Estructura General de Respuestas

### Respuesta Exitosa (2xx)
```json
{
  "success": true,
  "data": { /* contenido según endpoint */ },
  "message": "Operación realizada exitosamente",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### Respuesta de Error (4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El monto debe ser mayor a 0",
    "details": [
      { "field": "monto_ars", "message": "monto_ars debe ser > 0" }
    ]
  },
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### Headers Requeridos en Todas las Solicitudes
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-API-Version: v1
```

---

## 1. AUTENTICACIÓN Y USUARIOS

### 1.1 POST /auth/register
**Descripción**: Registrar nuevo usuario

**Request Body**:
```json
{
  "email": "ana@example.com",
  "telefono": "+5491123456789",
  "nombre": "Ana",
  "apellido": "García",
  "metodo_login": "google|facebook|telefono",
  "id_viaje_invitacion": "abc123def456" // opcional si viene de invitación
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "email": "ana@example.com",
    "nombre": "Ana",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "viaje_asignado": {
      "id_viaje": 123,
      "nombre": "Bariloche 2026",
      "tipo": "familia"
    }
  }
}
```

**Validaciones**:
- Email debe ser único y válido
- Teléfono debe ser válido (Argentina +54)
- Nombre y apellido no vacíos
- Si viene de invitación, validar token de invitación

---

### 1.2 POST /auth/login
**Descripción**: Iniciar sesión (multi-método)

**Request Body**:
```json
{
  "metodo": "email|telefono|google|facebook",
  "credencial": "ana@example.com o +5491123456789",
  "password": "hash_o_token_social" // opcional según método
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "email": "ana@example.com",
    "nombre": "Ana",
    "avatar_url": "https://...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "viajes_activos": [
      {
        "id_viaje": 123,
        "nombre": "Bariloche 2026",
        "estado": "en_curso",
        "mi_rol": "admin_principal"
      }
    ]
  }
}
```

**Validaciones**:
- Credencial debe existir en BD
- Si es método social, validar token con proveedor
- Si es teléfono, requerir OTP

---

### 1.3 POST /auth/otp/send
**Descripción**: Enviar OTP por SMS

**Request Body**:
```json
{
  "telefono": "+5491123456789",
  "tipo": "login|password_reset"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "codigo_envio": "sms_req_123",
    "telefono_enmascarado": "+549112345****",
    "timeout_segundos": 300,
    "intentos_restantes": 3
  }
}
```

---

### 1.4 POST /auth/otp/verify
**Descripción**: Verificar OTP ingresado

**Request Body**:
```json
{
  "codigo_envio": "sms_req_123",
  "otp": "123456",
  "tipo": "login|password_reset"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id_usuario": 1,
    "verificado": true
  }
}
```

**Validaciones**:
- OTP válido (6 dígitos)
- No expirado
- Intentos restantes > 0

---

### 1.5 GET /usuarios/{id_usuario}
**Descripción**: Obtener datos del perfil del usuario

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "email": "ana@example.com",
    "telefono": "+5491123456789",
    "nombre": "Ana",
    "apellido": "García",
    "avatar_url": "https://...",
    "cbu_argentina": "1234567890123456789012",
    "fecha_registro": "2025-10-01T10:00:00Z",
    "fecha_ultimo_login": "2026-01-15T10:30:00Z",
    "estado": "activo",
    "preferencias_privacidad": {
      "ver_cbu": "admins",
      "notificaciones": "todos",
      "historial": "solo_yo"
    }
  }
}
```

---

### 1.6 PATCH /usuarios/{id_usuario}
**Descripción**: Actualizar perfil del usuario

**Request Body**:
```json
{
  "nombre": "Ana María",
  "apellido": "García López",
  "avatar_url": "https://...",
  "cbu_argentina": "1234567890123456789012",
  "preferencias_privacidad": {
    "ver_cbu": "admins",
    "notificaciones": "solo_relevantes",
    "historial": "admins"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Ana María",
    "actualizado": true
  }
}
```

**Validaciones**:
- Solo el usuario puede actualizar su propio perfil (o ser admin)
- CBU debe ser válido si se proporciona

---

### 1.7 DELETE /usuarios/{id_usuario}
**Descripción**: Eliminar cuenta del usuario

**Request Body**:
```json
{
  "password": "contraseña_hash",
  "confirmacion": "Sí, eliminar mi cuenta"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "estado": "eliminado",
    "datos_preservados": {
      "gastos": "conservados_anonimos",
      "deudas": "conservadas_anonimas"
    }
  }
}
```

**Validaciones**:
- Usuario no debe ser miembro de viajes activos
- Usuario no debe ser admin principal de viajes activos
- Requiere confirmación

---

## 2. VIAJES

### 2.1 POST /viajes
**Descripción**: Crear nuevo viaje

**Request Body**:
```json
{
  "nombre": "Bariloche 2026",
  "tipo": "familia|amigos|individual",
  "alcance": "nacional|internacional",
  "fecha_inicio": "2026-01-05",
  "fecha_fin": "2026-01-15",
  "descripcion": "Viaje familiar a la Patagonia",
  "paises": ["Argentina", "Chile"] // opcional, si alcance = internacional
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "nombre": "Bariloche 2026",
    "tipo": "familia",
    "alcance": "nacional",
    "fecha_inicio": "2026-01-05",
    "fecha_fin": "2026-01-15",
    "descripcion": "Viaje familiar a la Patagonia",
    "id_admin_principal": 1,
    "estado": "planificacion",
    "fecha_creacion": "2025-10-15T10:00:00Z",
    "token_invitacion": "xyz789abc123",
    "link_invitacion": "https://miapp.com/viaje/123?token=xyz789abc123"
  }
}
```

**Validaciones**:
- `fecha_inicio <= fecha_fin`
- `(fecha_fin - fecha_inicio)` entre 1 y 365 días
- Usuario logueado automáticamente admin principal

---

### 2.2 GET /viajes/{id_viaje}
**Descripción**: Obtener detalles del viaje

**Query Parameters**:
- `incluir`: cronograma,miembros,franjas,gastos,alojamientos (comma-separated)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "nombre": "Bariloche 2026",
    "tipo": "familia",
    "alcance": "nacional",
    "fecha_inicio": "2026-01-05",
    "fecha_fin": "2026-01-15",
    "descripcion": "Viaje familiar a la Patagonia",
    "estado": "planificacion",
    "id_admin_principal": 1,
    "id_admin_secundario_actual": 2,
    "miembros": [
      {
        "id_miembro_viaje": 10,
        "id_usuario": 1,
        "nombre": "Ana",
        "rol": "admin_principal",
        "es_menor": false,
        "estado_participacion": "activo"
      }
    ],
    "resumen_finanzas": {
      "gasto_total_ars": 250000,
      "deuda_total_ars": 125000,
      "mi_deuda": 41670,
      "me_deben": 0,
      "balance": -41670
    }
  }
}
```

---

### 2.3 PATCH /viajes/{id_viaje}
**Descripción**: Actualizar datos del viaje

**Request Body**:
```json
{
  "nombre": "Bariloche + Villa Traful 2026",
  "descripcion": "Patagonia completa",
  "fecha_fin": "2026-01-20"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "nombre": "Bariloche + Villa Traful 2026",
    "fecha_fin": "2026-01-20",
    "actualizado": true
  }
}
```

**Validaciones**:
- Solo admin principal o secundario pueden editar
- No se puede cambiar tipo ni alcance una vez creado

---

### 2.4 DELETE /viajes/{id_viaje}
**Descripción**: Eliminar viaje (solo si está vacío)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "eliminado": true,
    "razon": "Viaje sin registros"
  }
}
```

**Validaciones**:
- Solo admin principal puede eliminar
- Viaje debe estar sin gastos, alojamientos o miembros (excepto admin)

---

### 2.5 GET /viajes
**Descripción**: Listar todos mis viajes

**Query Parameters**:
- `estado`: planificacion,en_curso,finalizado,cancelado (comma-separated)
- `ordenar_por`: fecha_inicio,fecha_creacion (default: fecha_creacion)
- `orden`: asc,desc (default: desc)
- `limite`: 10
- `pagina`: 1

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "viajes": [
      {
        "id_viaje": 123,
        "nombre": "Bariloche 2026",
        "tipo": "familia",
        "estado": "planificacion",
        "fecha_inicio": "2026-01-05",
        "fecha_fin": "2026-01-15",
        "mi_rol": "admin_principal",
        "miembros_count": 5,
        "gastos_count": 3,
        "resumen_finanzas": {
          "gasto_total": 250000,
          "mi_deuda": 41670
        }
      }
    ],
    "paginacion": {
      "total": 15,
      "pagina": 1,
      "limite": 10,
      "total_paginas": 2
    }
  }
}
```

---

## 3. MIEMBROS Y INVITACIONES

### 3.1 POST /viajes/{id_viaje}/miembros/invitar
**Descripción**: Invitar miembros al viaje

**Request Body**:
```json
{
  "invitaciones": [
    {
      "tipo_contacto": "telefono|email",
      "contacto": "+5491123456789",
      "nombre": "Laura García"
    },
    {
      "tipo_contacto": "email",
      "contacto": "xenia@example.com",
      "nombre": "Xenia López"
    }
  ],
  "canales": ["whatsapp", "email"],
  "mensaje_personalizado": "¡Vení a Bariloche con nosotros!"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "invitaciones_enviadas": 2,
    "invitaciones": [
      {
        "id_invitacion": "inv_001",
        "contacto": "+5491123456789",
        "estado": "enviada",
        "token": "xyz789abc123",
        "link": "https://miapp.com/viaje/123?token=xyz789abc123&tipo=whatsapp",
        "fecha_envio": "2025-10-15T10:00:00Z",
        "fecha_expiracion": "2025-10-22T10:00:00Z"
      }
    ]
  }
}
```

**Validaciones**:
- Solo admin principal/secundario pueden invitar
- Máximo 30 miembros por viaje
- Contacto debe ser válido (teléfono o email)
- No se puede invitar al mismo usuario dos veces

---

### 3.2 POST /viajes/{id_viaje}/aceptar-invitacion
**Descripción**: Aceptar invitación a viaje (desde link con token)

**Request Body**:
```json
{
  "token": "xyz789abc123",
  "id_usuario": 2 // si ya está registrado
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_viaje": 123,
    "id_miembro_viaje": 11,
    "id_usuario": 2,
    "nombre": "Laura",
    "rol": "miembro",
    "estado_participacion": "activo",
    "viaje": {
      "nombre": "Bariloche 2026",
      "fecha_inicio": "2026-01-05",
      "miembros_count": 5
    }
  }
}
```

**Validaciones**:
- Token debe ser válido y no expirado
- Usuario no debe ser miembro ya

---

### 3.3 GET /viajes/{id_viaje}/miembros
**Descripción**: Listar miembros del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "miembros": [
      {
        "id_miembro_viaje": 10,
        "id_usuario": 1,
        "nombre": "Ana",
        "apellido": "García",
        "email": "ana@example.com",
        "avatar_url": "https://...",
        "rol": "admin_principal",
        "es_menor": false,
        "estado_participacion": "activo",
        "fecha_union": "2025-10-01T10:00:00Z",
        "resumen_finanzas": {
          "gasto_total": 50000,
          "deuda": 0,
          "credito": 30000
        }
      },
      {
        "id_miembro_viaje": 11,
        "id_usuario": 2,
        "nombre": "Laura",
        "apellido": "López",
        "email": "laura@example.com",
        "rol": "miembro",
        "es_menor": false,
        "estado_participacion": "activo",
        "fecha_union": "2025-10-05T14:00:00Z"
      },
      {
        "id_miembro_viaje": 12,
        "id_usuario": 3,
        "nombre": "Diego",
        "apellido": "Ruiz",
        "rol": "miembro",
        "es_menor": true,
        "id_responsable_legal": 10,
        "estado_participacion": "activo"
      }
    ],
    "total_miembros": 3,
    "admins": 1,
    "menores": 1
  }
}
```

---

### 3.4 PATCH /viajes/{id_viaje}/miembros/{id_miembro_viaje}/rol
**Descripción**: Cambiar rol de miembro (promover/descender admin)

**Request Body**:
```json
{
  "nuevo_rol": "admin_secundario|miembro"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_miembro_viaje": 11,
    "id_usuario": 2,
    "nombre": "Laura",
    "rol_anterior": "miembro",
    "rol_nuevo": "admin_secundario",
    "fecha_cambio": "2025-10-15T10:00:00Z"
  }
}
```

**Validaciones**:
- Solo admin principal puede cambiar roles
- No se puede descender el único admin
- Si admin principal se va, automáticamente asignar admin secundario como principal

---

### 3.5 DELETE /viajes/{id_viaje}/miembros/{id_miembro_viaje}
**Descripción**: Remover miembro del viaje

**Request Body**:
```json
{
  "razon": "El usuario se retira del viaje"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_miembro_viaje": 11,
    "id_usuario": 2,
    "nombre": "Laura",
    "removido": true,
    "liquidacion_generada": false,
    "observacion": "Sin deudas pendientes"
  }
}
```

**Validaciones**:
- Si hay deudas, generar liquidación (CU-029)
- Si hay gastos, solicitar opción generoso/estricto

---

## 4. CRONOGRAMA Y FRANJAS

### 4.1 POST /viajes/{id_viaje}/franjas
**Descripción**: Crear franja de alojamiento

**Request Body**:
```json
{
  "nombre_lugar": "Villa Traful",
  "fecha_inicio": "2026-01-05",
  "fecha_fin": "2026-01-10",
  "descripcion": "Cabaña frente al lago",
  "orden_secuencia": 1
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_franja": 42,
    "id_viaje": 123,
    "nombre_lugar": "Villa Traful",
    "fecha_inicio": "2026-01-05",
    "fecha_fin": "2026-01-10",
    "estado_franja": "programada",
    "orden_secuencia": 1,
    "dias_intermedios_detectados": [],
    "fecha_creacion": "2025-10-15T10:00:00Z"
  }
}
```

**Validaciones**:
- Fechas deben estar dentro del cronograma del viaje
- No deben superponerse con otras franjas
- `fecha_inicio < fecha_fin`

---

### 4.2 PATCH /viajes/{id_viaje}/franjas/{id_franja}
**Descripción**: Editar franja (con cascada automática)

**Request Body**:
```json
{
  "nombre_lugar": "Villa Traful + Alrededores",
  "fecha_fin": "2026-01-11"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_franja": 42,
    "nombre_lugar": "Villa Traful + Alrededores",
    "fecha_fin": "2026-01-11",
    "cascada_aplicada": {
      "activada": true,
      "franjas_afectadas": [
        {
          "id_franja": 43,
          "nombre_lugar": "Bariloche",
          "fecha_inicio_anterior": "2026-01-10",
          "fecha_inicio_nueva": "2026-01-12",
          "diferencia_dias": 1
        }
      ],
      "notificaciones_enviadas": 1
    }
  }
}
```

**Validaciones**:
- Solo si el viaje aún no comenzó o solo editar a futuro
- Aplicar cascada automáticamente
- Notificar a todos sobre cambios

---

### 4.3 GET /viajes/{id_viaje}/franjas
**Descripción**: Listar todas las franjas del viaje

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "franjas": [
      {
        "id_franja": 42,
        "nombre_lugar": "Villa Traful",
        "fecha_inicio": "2026-01-05",
        "fecha_fin": "2026-01-10",
        "duracion_dias": 5,
        "estado_franja": "programada",
        "actividades_count": 2,
        "alojamientos_count": 1,
        "orden_secuencia": 1
      },
      {
        "id_franja": 43,
        "nombre_lugar": "Bariloche",
        "fecha_inicio": "2026-01-12",
        "fecha_fin": "2026-01-15",
        "duracion_dias": 3,
        "estado_franja": "programada",
        "actividades_count": 3,
        "alojamientos_count": 1,
        "orden_secuencia": 2
      }
    ],
    "dias_intermedios": [
      {
        "fecha": "2026-01-11",
        "descripcion": "Día sin franja asignada",
        "actividades_count": 0
      }
    ]
  }
}
```

---

### 4.4 DELETE /viajes/{id_viaje}/franjas/{id_franja}
**Descripción**: Eliminar franja

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_franja": 42,
    "eliminado": true,
    "actividades_eliminadas": 2,
    "alojamientos_eliminados": 1
  }
}
```

**Validaciones**:
- No se puede eliminar si ya pasó
- Si tiene actividades pagadas, rechazar

---

## 5. ACTIVIDADES

### 5.1 POST /viajes/{id_viaje}/actividades
**Descripción**: Crear actividad

**Request Body**:
```json
{
  "nombre": "Visita Parque Dinosaurios",
  "fecha": "2026-01-06",
  "hora": "14:30",
  "descripcion": "Tour guiado",
  "tipo_actividad": "entrada",
  "es_paga": true,
  "valor_referencial_ars": 15000,
  "estado_pago": "no_pagada",
  "miembros_asignados": [10, 11, 12],
  "id_franja": 42
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_actividad": 201,
    "id_viaje": 123,
    "nombre": "Visita Parque Dinosaurios",
    "fecha": "2026-01-06",
    "hora": "14:30",
    "tipo_actividad": "entrada",
    "es_paga": true,
    "valor_referencial_ars": 15000,
    "estado_pago": "no_pagada",
    "estado_actividad": "programada",
    "miembros_asignados": [
      {
        "id_miembro_viaje": 10,
        "nombre": "Ana",
        "asistencia": "pendiente"
      },
      {
        "id_miembro_viaje": 11,
        "nombre": "Laura",
        "asistencia": "pendiente"
      }
    ],
    "fecha_creacion": "2025-10-15T10:00:00Z"
  }
}
```

---

### 5.2 PATCH /viajes/{id_viaje}/actividades/{id_actividad}
**Descripción**: Editar actividad

**Request Body**:
```json
{
  "nombre": "Visita Parque Dinosaurios + Museo",
  "valor_referencial_ars": 18000,
  "fecha": "2026-01-07"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_actividad": 201,
    "nombre": "Visita Parque Dinosaurios + Museo",
    "valor_referencial_ars": 18000,
    "fecha": "2026-01-07",
    "actualizado": true
  }
}
```

---

### 5.3 PATCH /viajes/{id_viaje}/actividades/{id_actividad}/estado
**Descripción**: Cambiar estado de actividad

**Request Body**:
```json
{
  "nuevo_estado": "completada|cancelada|suspendida",
  "motivo": "Se suspendió por lluvia"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_actividad": 201,
    "estado_anterior": "programada",
    "estado_nuevo": "suspendida",
    "impacto_finanzas": {
      "afectada": true,
      "descripcion": "Actividad pagada, se marca como costo perdido"
    }
  }
}
```

---

## 6. ALOJAMIENTOS

### 6.1 POST /viajes/{id_viaje}/alojamientos
**Descripción**: Registrar alojamiento

**Request Body**:
```json
{
  "nombre": "Booking - Cabaña Villa Traful",
  "link_reserva": "https://www.booking.com/...",
  "fecha_checkin": "2026-01-05",
  "hora_checkin": "15:00",
  "fecha_checkout": "2026-01-10",
  "hora_checkout": "11:00",
  "ubicacion_descripcion": "Frente al lago, camino principal",
  "estado_pago": "pagado|no_pagado|parcialmente_pagado",
  "monto_total_ars": 75000,
  "monto_pagado_ars": 75000,
  "miembros_asignados": [10, 11, 12, 13, 14],
  "id_usuario_reserva": 1
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 501,
    "id_viaje": 123,
    "nombre": "Booking - Cabaña Villa Traful",
    "fecha_checkin": "2026-01-05",
    "fecha_checkout": "2026-01-10",
    "estado_pago": "pagado",
    "monto_total_ars": 75000,
    "monto_pagado_ars": 75000,
    "monto_faltante_ars": 0,
    "miembros_asignados_count": 5,
    "costo_por_persona": 15000,
    "gasto_generado": {
      "id_gasto": 1001,
      "estado": "pendiente_confirmacion",
      "descripcion": "Alojamiento - Villa Traful"
    }
  }
}
```

**Validaciones**:
- Fechas deben estar dentro del viaje
- Si es internacional, validar monedas
- Crear automáticamente gasto en finanzas si estado_pago = "pagado"

---

### 6.2 PATCH /viajes/{id_viaje}/alojamientos/{id_alojamiento}
**Descripción**: Editar alojamiento

**Request Body**:
```json
{
  "fecha_checkout": "2026-01-11",
  "monto_total_ars": 90000
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id_alojamiento": 501,
    "fecha_checkout": "2026-01-11",
    "monto_total_ars": 90000,
    "cascada_aplicada": true,
    "costo_por_persona": 18000
  }
}
```

---

## 7. GASTOS Y FINANZAS

### 7.1 POST /viajes/{id_viaje}/gastos
**Descripción**: Crear gasto (individual, grupal o subgrupo)

**Request Body**:
```json
{
  "descripcion": "Cena en restaurante",
  "monto_ars": 250000,
  