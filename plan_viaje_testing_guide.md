- ✅ Conversiones correctas
- ✅ Deudas en 3 monedas
- ✅ Recálculos automáticos
- ✅ Reporte muestra comparativa de monedas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🔒 MÓDULO 13: VALIDACIONES Y SEGURIDAD

### TC-071: Validación - Email Único
**Descripción:** No se puede registrar con email duplicado
**Precondición:** ana@example.com ya existe
**Pasos:**
1. Intentar registrar con ana@example.com

**Resultado Esperado:**
- ✅ Error: "Email ya está registrado"
- ✅ No se crea cuenta

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-072: Validación - Teléfono Válido (Argentina)
**Descripción:** Validar formato correcto de teléfono
**Precondición:** Ninguna
**Pasos:**
1. Intentar registrar con teléfono: "1234567" (inválido)

**Resultado Esperado:**
- ✅ Error: "Teléfono inválido. Debe ser +549..."

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-073: Validación - Monto > 0
**Descripción:** No se puede crear gasto con monto negativo o 0
**Precondición:** Ninguna
**Pasos:**
1. Crear gasto con monto: $0 o -$5000

**Resultado Esperado:**
- ✅ Error: "Monto debe ser mayor a 0"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-074: Validación - Fechas Coherentes
**Descripción:** Validar rangos de fechas
**Precondición:** Ninguna
**Pasos:**
1. Crear franja con fecha_inicio > fecha_fin

**Resultado Esperado:**
- ✅ Error: "Fecha inicio debe ser menor que fin"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-075: Validación - Máximo de Miembros (30)
**Descripción:** No se puede agregar más de 30 miembros
**Precondición:** 30 miembros ya invitados
**Pasos:**
1. Intentar invitar miembro #31

**Resultado Esperado:**
- ✅ Error: "Límite de 30 miembros alcanzado"
- ✅ Invitación no se envía

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-076: Seguridad - JWT Token Expirado
**Descripción:** Validar que token expirado se rechaza
**Precondición:** Token con 25+ horas
**Pasos:**
1. Con token expirado, intentar hacer request a API

**Resultado Esperado:**
- ✅ Error 401: "Token expirado"
- ✅ Redirige a login
- ✅ Usuario debe volver a loguearse

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-077: Seguridad - Rate Limiting
**Descripción:** Validar límite de requests
**Precondición:** Ninguna
**Pasos:**
1. Hacer 1001 requests en 1 hora
2. Intento #1001

**Resultado Esperado:**
- ✅ Error 429: "Too Many Requests"
- ✅ Esperar 1 hora antes de intentar de nuevo
- ✅ Header incluye: X-RateLimit-Reset

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-078: Seguridad - No Acceder a Datos de Otro Viaje
**Descripción:** Usuario no puede ver datos de viaje que no es miembro
**Precondición:** 
- Usuario Ana en Viaje 1
- Viaje 2 existe (no es miembro)

**Pasos:**
1. Ana intenta acceder: GET /viajes/2/gastos

**Resultado Esperado:**
- ✅ Error 403: "No tienes permiso"
- ✅ Ana NO puede ver datos del Viaje 2

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-079: Seguridad - Solo Admin Puede Editar Cronograma
**Descripción:** Miembro regular no puede editar franja
**Precondición:** Laura es miembro (no admin)
**Pasos:**
1. Laura intenta editar franja

**Resultado Esperado:**
- ✅ Error 403: "Solo administradores pueden editar cronograma"
- ✅ Botón "Editar" deshabilitado para Laura

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-080: Seguridad - Contraseña Hasheada
**Descripción:** Verificar que contraseña se almacena hasheada
**Precondición:** Usuario registrado con password: "password123"
**Pasos:**
1. Acceder a BD directamente
2. Buscar registro de usuario
3. Intentar leer contraseña

**Resultado Esperado:**
- ✅ Contraseña NO está en texto plano
- ✅ Está hasheada (bcrypt o similar)
- ✅ No se puede reversar

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 📈 MÓDULO 14: PERFORMANCE Y ESCALABILIDAD

### TC-081: Performance - Cargar Viaje con 100 Gastos
**Descripción:** Verificar velocidad con muchos gastos
**Precondición:** Viaje con 100 gastos registrados
**Pasos:**
1. Abrir pantalla de Gastos
2. Medir tiempo de carga

**Resultado Esperado:**
- ✅ Carga en < 2 segundos
- ✅ Tabla responsiva
- ✅ Paginación automática (20 por página)

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-082: Performance - Generar Reporte PDF (50 Miembros)
**Descripción:** Verificar velocidad de generación de reportes
**Precondición:** Viaje con 50 miembros y 200 gastos
**Pasos:**
1. Hacer clic en "Descargar PDF"
2. Medir tiempo

**Resultado Esperado:**
- ✅ PDF generado en < 5 segundos
- ✅ Tamaño < 10 MB
- ✅ Todos los datos incluidos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-083: Performance - Sincronización con 500 Cambios
**Descripción:** Verificar sync con muchos cambios pendientes
**Precondición:** 500 cambios offline
**Pasos:**
1. Conectar a internet
2. Iniciar sincronización
3. Medir tiempo

**Resultado Esperado:**
- ✅ Sincronización en < 10 segundos
- ✅ Todos los cambios aplicados
- ✅ Sin datos duplicados o perdidos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## ✅ RESUMEN DE TESTS

**Total de Test Cases: 83**

| Módulo | Cantidad | Estado |
|--------|----------|--------|
| Autenticación | 7 | [ ] |
| Gestión de Viajes | 7 | [ ] |
| Gestión de Miembros | 9 | [ ] |
| Cronograma y Franjas | 5 | [ ] |
| Actividades | 5 | [ ] |
| Gastos y Finanzas | 9 | [ ] |
| Deudas y Pagos | 6 | [ ] |
| Reportes | 5 | [ ] |
| Conversión de Monedas | 3 | [ ] |
| Notificaciones | 3 | [ ] |
| Sincronización Offline | 4 | [ ] |
| Retiro de Miembros | 4 | [ ] |
| Escenarios Complejos | 2 | [ ] |
| Validaciones y Seguridad | 10 | [ ] |
| Performance | 3 | [ ] |

---

## 📋 Protocolo de Testing

### Antes de Cada Test Session
1. ✅ Limpiar base de datos de pruebas
2. ✅ Crear usuarios de prueba
3. ✅ Verificar conexión a internet
4. ✅ Preparar datos de prueba

### Durante Cada Test
1. ✅ Ejecutar pasos exactamente como descritos
2. ✅ Registrar resultado (PASS/FAIL)
3. ✅ Si FAIL, tomar screenshot
4. ✅ Documentar paso exacto donde falló

### Después de Cada Test Session
1. ✅ Contar: PASS vs FAIL
2. ✅ Calcular % de cobertura
3. ✅ Priorizar bugs críticos
4. ✅ Reportar a equipo de desarrollo

---

## 🐛 Formato de Reporte de Bug

Cuando encuentres un FAIL:

```
BUG-ID: [ID único]
Módulo: [Módulo del test]
Test Case: [TC-XXX]
Severity: CRÍTICO / ALTO / MEDIO / BAJO
Descripción: [Qué no funcionó]
Pasos para Reproducir:
  1. ...
  2. ...
Resultado Esperado: [Qué debería haber pasado]
Resultado Actual: [Qué pasó en su lugar]
Evidencia: [Screenshot/video]
Environment: [navegador, SO, versión app]
Fecha Reportado: [DD/MM/YYYY]
Asignado a: [Developer]
Estado: ABIERTO / EN PROGRESO / RESUELTO
```

---

## 🎯 Métricas de Éxito

- ✅ **Coverage**: 100% de test cases ejecutados
- ✅ **Pass Rate**: > 95% de tests pasando
- ✅ **Critical Bugs**: 0 bugs críticos
- ✅ **Performance**: Todos los tests dentro de SLA
- ✅ **Security**: Sin vulnerabilidades de seguridad

---

## 📝 Notas Finales

- Este documento es **vivo** y debe actualizarse con cada cambio en la app
- Agregar nuevos test cases según nuevas funcionalidades
- Mantener registro histórico de ejecuciones
- Usar herramientas como Postman para automatizar tests de API
- Considerar testing manual para UX, automatizado para APIs

---

## 🚀 Próximos Pasos Después de Testing

1. **Corregir bugs encontrados** (priorizar por severity)
2. **Ejecutar tests de regresión** (verificar que correcciones no rompan nada)
3. **Testing de UAT** (usuarios reales validan funcionalidad)
4. **Preparar producción** (backups, monitoreo, alertas)
5. **Deploy y monitoreo post-lanzamiento**  - Entidades: Ana (1), Familia Ruiz (1), Familia López (1) = 3 entidades
  - Por entidad: $250,000 ÷ 3 = $83,333
  - Deudas generadas:
    - Ana: $0 (ella pagó)
    - Familia Ruiz paga $83,333 total
      - Internamente: $83,333 ÷ 3 = $27,777 c/u
    - Familia López paga $83,333 total
      - Internamente: $83,333 ÷ 2 = $41,666 c/u
- ✅ Auditoría registra división por subgrupos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-037: Crear Gasto Privado de Subgrupo
**Descripción:** Gasto que solo afecta a miembros del subgrupo
**Precondición:** Subgrupo "Familia Ruiz" existe
**Pasos:**
1. Crear gasto: "Paseo privado Familia Ruiz" $5,000
2. Tipo: "Gasto Subgrupo Privado"
3. Seleccionar subgrupo: "Familia Ruiz"
4. Asignar a: Jorge, Diego, Lucas
5. Guardar

**Resultado Esperado:**
- ✅ Gasto creado
- ✅ NO aparece en gastos generales
- ✅ División: $5,000 ÷ 3 = $1,666 c/u
- ✅ Deudas generadas solo entre los 3
- ✅ Ana, Laura, Xenia NO ven este gasto en deudas generales
- ✅ En reporte, aparece como "Gasto Privado Subgrupo"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-038: Crear Gasto con Divisiones Múltiples
**Descripción:** Cada uno paga lo que consumió (camping)
**Precondición:** 5 miembros en viaje
**Pasos:**
1. Crear 5 gastos individuales:
   - Ana: "Camping - Pase Ana" $2,000
   - Laura: "Camping - Pase Laura" $2,000
   - Xenia: "Camping - Pase Xenia" $2,000
   - Jorge: "Camping - Pase Jorge" $2,000
   - Diego: "Camping - Pase Diego" $2,000
2. Tipo: "Personal" para cada uno
3. Guardar cada uno

**Resultado Esperado:**
- ✅ 5 registros separados creados
- ✅ NO se generan deudas cruzadas
- ✅ Cada gasto es personal
- ✅ En reporte, aparecen 5 líneas de $2,000
- ✅ Total: $10,000

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-039: Crear Gasto Hijo (Diferencia)
**Descripción:** Registrar diferencia encontrada después
**Precondición:** Gasto "Cena" ($250,000) ya registrado hace 2 horas
**Pasos:**
1. Ir a ese gasto
2. Hacer clic en "Agregar Diferencia"
3. Completar:
   - Monto faltante: $2,000
   - Observación: "Encontré el ticket, tenía servicio que no registré"
4. Guardar

**Resultado Esperado:**
- ✅ Gasto hijo creado (id_gasto = 1002)
- ✅ Vinculado a gasto padre (id_gasto = 1001)
- ✅ Observación guardada
- ✅ Deudas recalculadas:
  - Cada uno debe $400 extra ($2,000 ÷ 5)
- ✅ Auditoría: "Gasto hijo creado del gasto padre 1001"
- ✅ En reportes, aparecen vinculados

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-040: Editar Gasto Dentro de 1 Hora
**Descripción:** Editar gasto recién creado
**Precondición:** Gasto creado hace 30 minutos
**Pasos:**
1. Ir a gasto "Cena"
2. Hacer clic en "Editar"
3. Cambiar monto: $250,000 → $260,000
4. Guardar

**Resultado Esperado:**
- ✅ Gasto actualizado
- ✅ Deudas recalculadas automáticamente
- ✅ Cada uno debe ahora $52,000 (en lugar de $50,000)
- ✅ Todos notificados del cambio
- ✅ Auditoría registra cambio

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-041: Intentar Editar Gasto Después de 1 Hora (Bloqueado)
**Descripción:** No se puede editar después de plazo
**Precondición:** Gasto creado hace 2 horas
**Pasos:**
1. Ir a gasto
2. Intentar hacer clic en "Editar"

**Resultado Esperado:**
- ✅ Botón "Editar" deshabilitado
- ✅ Mensaje: "Solo se pueden editar gastos dentro de 1 hora"
- ✅ Opción: "Crear gasto hijo con diferencia"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-042: Eliminar Gasto No Pagado
**Descripción:** Eliminar gasto que aún no fue pagado
**Precondición:** Gasto sin confirmación de pago
**Pasos:**
1. Ir a gasto "Cena"
2. Hacer clic en "Eliminar"
3. Confirmar

**Resultado Esperado:**
- ✅ Gasto eliminado
- ✅ Deudas canceladas automáticamente
- ✅ Auditoría registra eliminación

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-043: Intentar Eliminar Gasto Ya Pagado (Bloqueado)
**Descripción:** No se puede eliminar gasto confirmado
**Precondición:** Gasto pagado y confirmado
**Pasos:**
1. Intentar eliminar gasto pagado

**Resultado Esperado:**
- ✅ Error: "No se puede eliminar gasto pagado"
- ✅ Opción: "Marcar como cancelado" (registra como pérdida)

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 💸 MÓDULO 7: DEUDAS Y PAGOS

### TC-044: Ver Deudas Pendientes
**Descripción:** Usuario ve todas sus deudas
**Precondición:** Viaje con gastos registrados
**Pasos:**
1. Ir a Deudas y Pagos
2. Ver sección "Lo que Debo Pagar"

**Resultado Esperado:**
- ✅ Tabla muestra:
  - Para Quién: Ana García
  - Monto: $50,000
  - Concepto: Cena en restaurante
  - Estado: Pendiente
  - Botón: Pagar

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-045: Ver Créditos Pendientes
**Descripción:** Usuario ve quién le debe
**Precondición:** Usuario pagó gastos
**Pasos:**
1. Ir a Deudas y Pagos
2. Ver sección "Lo que Me Deben"

**Resultado Esperado:**
- ✅ Tabla muestra:
  - De Quién: Laura, Xenia, Familia Ruiz
  - Monto: $50,000 c/u
  - Concepto: Cena en restaurante
  - Estado: Pendiente

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-046: Registrar Pago Manual
**Descripción:** Usuario registra pago fuera de la app
**Precondición:** Deuda pendiente de Laura a Ana ($50,000)
**Pasos:**
1. Laura va a Deudas
2. Hace clic en "Pagar" para deuda de $50,000
3. Selecciona: "Transferencia Bancaria"
4. Monto: $50,000
5. Adjunta comprobante (foto)
6. Hace clic en "Registrar Pago"

**Resultado Esperado:**
- ✅ Pago registrado con estado "Pendiente Confirmación"
- ✅ Ana recibe notificación: "Laura registró pago de $50,000"
- ✅ Ana puede ver comprobante
- ✅ Ana tiene botón "Confirmar" o "Rechazar"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-047: Confirmar Pago Recibido
**Descripción:** Acreedor confirma que recibió dinero
**Precondición:** Pago pendiente confirmación
**Pasos:**
1. Ana recibe notificación
2. Abre detalles del pago
3. Hace clic en "Confirmar Pago"

**Resultado Esperado:**
- ✅ Deuda marcada como "Pagada"
- ✅ Fecha de pago registrada
- ✅ Laura recibe confirmación: "Tu pago fue confirmado"
- ✅ Auditoría registra confirmación

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-048: Generar Link de Mercado Pago
**Descripción:** Crear link de pago automático
**Precondición:** Deuda pendiente
**Pasos:**
1. Ana hace clic en "Pagar por Mercado Pago"
2. Sistema genera link de pago

**Resultado Esperado:**
- ✅ QR generado
- ✅ Link de pago: mercadopago.com/checkout/...
- ✅ Laura recibe notificación con link
- ✅ Laura abre link y paga
- ✅ Pago se confirma automáticamente
- ✅ Deuda marcada como "Pagada"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-049: Rechazar Pago Registrado
**Descripción:** Acreedor rechaza pago
**Precondición:** Pago pendiente confirmación
**Pasos:**
1. Ana ve detalles del pago
2. Hace clic en "Rechazar"
3. Selecciona motivo: "Monto incorrecto"
4. Confirma

**Resultado Esperado:**
- ✅ Pago rechazado
- ✅ Deuda sigue "Pendiente"
- ✅ Laura notificada: "Tu pago fue rechazado: monto incorrecto"
- ✅ Auditoría registra rechazo

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 📊 MÓDULO 8: REPORTES

### TC-050: Generar Resumen Financiero Persona
**Descripción:** Usuario ve su resumen personal
**Precondición:** Viaje con gastos registrados
**Pasos:**
1. Ir a Deudas y Pagos
2. Hacer clic en "Mi Resumen Financiero"

**Resultado Esperado:**
- ✅ Muestra:
  - Gasto personal total: $50,000
  - Gasto grupal total: $250,000
  - Mi parte del grupal: $50,000
  - Debo pagar: $50,000
  - Me deben: $0
  - Balance neto: -$50,000
- ✅ Desglose por categoría

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-051: Generar Reporte Completo del Viaje
**Descripción:** Admin genera reporte general
**Precondición:** Viaje finalizado o en curso
**Pasos:**
1. Ir a Reportes
2. Hacer clic en "Resumen Financiero"

**Resultado Esperado:**
- ✅ PDF generado con:
  - Datos del viaje
  - Gasto total por categoría
  - Gasto por miembro
  - Deuda total pendiente
  - Miembros y roles

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-052: Generar Liquidación Final
**Descripción:** Crear documento de quién debe a quién
**Precondición:** Viaje finalizado
**Pasos:**
1. Ir a Reportes
2. Hacer clic en "Liquidación Final"
3. Hacer clic en "Descargar PDF"

**Resultado Esperado:**
- ✅ PDF con transacciones necesarias:
  - Laura paga $50,000 a Ana
  - Xenia paga $50,000 a Ana
  - Familia Ruiz paga $150,000 a Ana
- ✅ Instrucciones de transferencia
- ✅ Pagos ya confirmados marcados
- ✅ Incluye fechas y referencias

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-053: Generar Excel Completo
**Descripción:** Exportar todos los datos en Excel
**Precondición:** Viaje con datos
**Pasos:**
1. Ir a Reportes
2. Hacer clic en "Descargar Excel"

**Resultado Esperado:**
- ✅ Archivo .xlsx descargado
- ✅ Hojas:
  - Resumen General
  - Desglose de Gastos
  - Deudas Finales
  - Por Miembro
  - Cronograma
- ✅ Datos completos y formateados
- ✅ Funciones de cálculo en Excel

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-054: Ver Auditoría de Cambios
**Descripción:** Revisar historial de modificaciones
**Precondición:** Viaje con cambios registrados
**Pasos:**
1. Ir a Reportes
2. Hacer clic en "Auditoría de Cambios"

**Resultado Esperado:**
- ✅ Tabla cronológica con:
  - Fecha/Hora del cambio
  - Usuario que hizo el cambio
  - Tipo (crear, editar, eliminar)
  - Tabla afectada
  - Cambio anterior → Cambio nuevo
  - Observaciones
- ✅ Filtrable por usuario, tipo, fecha

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🌍 MÓDULO 9: CONVERSIÓN DE MONEDAS

### TC-055: Gasto en Moneda Diferente (Internacional)
**Descripción:** Registrar gasto en CLP o USD automáticamente
**Precondición:** Viaje es internacional (Argentina + Chile)
**Pasos:**
1. Crear gasto: "Comida en Santiago"
2. Monto: 15,000 CLP
3. Moneda: CLP
4. Guardar

**Resultado Esperado:**
- ✅ Sistema convierte automáticamente:
  - 15,000 CLP = 4,400 ARS (aprox)
  - 15,000 CLP = 18 USD (aprox)
- ✅ En tabla de gastos muestra 3 monedas
- ✅ Deudas calculadas en ARS (moneda base)
- ✅ En reportes muestra 3 columnas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-056: Actualizar Tipos de Cambio Manualmente
**Descripción:** Admin actualiza tasas de cambio
**Precondición:** Viaje internacional
**Pasos:**
1. Ir a Configuración del Viaje
2. Hacer clic en "Tipos de Cambio"
3. Cambiar:
   - 1 USD = 955 ARS (era 950)
   - 1 CLP = 0.28 ARS (era 0.27)
4. Guardar

**Resultado Esperado:**
- ✅ Tasas actualizadas
- ✅ Sistema recalcula todos los gastos
- ✅ Deudas recalculadas automáticamente
- ✅ Muestra: "5 gastos recalculados, 8 deudas actualizadas"
- ✅ Auditoría registra cambio de tasas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-057: API de Cambio Automático
**Descripción:** Sistema consulta API automáticamente
**Precondición:** Viaje internacional, conexión a internet
**Pasos:**
1. Cada mañana a las 8am, sistema consulta API
2. Si tasas cambian significativamente (>5%), notifica

**Resultado Esperado:**
- ✅ Tasas se actualizan automáticamente
- ✅ Admin recibe notificación si hay cambios grandes
- ✅ Histórico de cambios de tasa guardado
- ✅ En reporte, incluye fecha de actualización

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🔔 MÓDULO 10: NOTIFICACIONES

### TC-058: Recibir Notificación de Nuevo Gasto
**Descripción:** Usuarios reciben alerta cuando se registra gasto
**Precondición:** Gasto creado
**Pasos:**
1. Ana registra "Cena" $250,000
2. Sistema envía notificación a todos

**Resultado Esperado:**
- ✅ Título: "¡Nuevo gasto registrado!"
- ✅ Contenido: "Ana registró Cena de $250,000"
- ✅ Canales: Push + Email (según config)
- ✅ Link directo a detalles del gasto
- ✅ Todos reciben dentro de 5 segundos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-059: Configurar Canales de Notificación
**Descripción:** Admin personaliza cómo se notifica
**Precondición:** Viaje creado
**Pasos:**
1. Ir a Configuración del Viaje
2. Ir a "Notificaciones"
3. Para "Nuevo Gasto":
   - Destinatarios: "Todos"
   - Canales: Push + Email
   - Mensaje: "¡Nuevo gasto! Revisa los detalles"
4. Para "Pago Pendiente":
   - Destinatarios: "Solo Admins"
   - Canales: Email + WhatsApp
5. Guardar

**Resultado Esperado:**
- ✅ Configuración guardada
- ✅ Notificaciones futuras respetan esta config
- ✅ Si usuario desactivó push, se envía email
- ✅ Auditoría registra cambios de configuración

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-060: Desactivar Notificaciones
**Descripción:** Usuario desactiva notificaciones
**Precondición:** Usuario logueado
**Pasos:**
1. Ir a Perfil
2. Ir a "Preferencias"
3. Toggle "Notificaciones" = OFF
4. Guardar

**Resultado Esperado:**
- ✅ Notificaciones desactivadas
- ✅ No recibe push ni emails
- ✅ En Dashboard, NO aparece badge de notificaciones

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 📱 MÓDULO 11: SINCRONIZACIÓN OFFLINE

### TC-061: Descargar Datos para Offline
**Descripción:** Usuario descarga datos del viaje para ver offline
**Precondición:** Usuario logueado en viaje
**Pasos:**
1. Ir a Cronograma
2. Hacer clic en "Descargar para Offline"

**Resultado Esperado:**
- ✅ Datos descargados localmente (localStorage/SQLite)
- ✅ Icono de offline aparece
- ✅ Datos incluyen: gastos, deudas, cronograma, miembros
- ✅ Tamaño < 5MB

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-062: Ver Datos Sin Conexión (Modo Lectura)
**Descripción:** Visualizar datos offline
**Precondición:** Datos descargados, sin conexión internet
**Pasos:**
1. Apagar WiFi y datos móviles
2. Abrir app
3. Ir a Cronograma

**Resultado Esperado:**
- ✅ App funciona
- ✅ Muestra datos descargados
- ✅ NO se pueden crear/editar gastos
- ✅ Muestra icono: "Modo Offline - Solo lectura"
- ✅ Botón: "Cambios se sincronizarán al conectar"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-063: Sincronizar Datos al Reconectar
**Descripción:** Sincronización automática cuando vuelve conexión
**Precondición:** Datos offline descargados
**Pasos:**
1. Conectar a WiFi
2. Sistema detecta conexión
3. Sincronización comienza automáticamente

**Resultado Esperado:**
- ✅ Notificación: "Sincronizando datos..."
- ✅ Datos se actualizan
- ✅ Si no hay conflictos: sincronización silenciosa
- ✅ Si hay conflictos: notificar usuario
- ✅ Tiempo de sync < 3 segundos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-064: Detectar Conflictos de Sincronización
**Descripción:** Dos usuarios editan lo mismo offline
**Precondición:** Ambos tienen datos offline
**Pasos:**
1. Usuario A y B descargan datos
2. Ambos se quedan sin conexión
3. Usuario A edita: franja fecha de 10 Ene → 11 Ene
4. Usuario B edita: franja fecha de 10 Ene → 12 Ene
5. Ambos se conectan

**Resultado Esperado:**
- ✅ Sistema detecta conflicto
- ✅ Muestra a User A: "¿Cuál cambio prefieres?"
  - Opción 1: 11 Ene (tu cambio)
  - Opción 2: 12 Ene (cambio de User B)
- ✅ User A elige
- ✅ Sistema aplica cambio elegido
- ✅ Auditoría registra ambos cambios y cuál se aceptó

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🔄 MÓDULO 12: RETIRO DE MIEMBROS

### TC-065: Retiro Sin Gastos
**Descripción:** Miembro se retira sin haber participado en gastos
**Precondición:** Miembro sin deudas ni créditos
**Pasos:**
1. Laura hace clic en "Salir del Viaje"
2. Confirma

**Resultado Esperado:**
- ✅ Laura eliminada del viaje
- ✅ NO aparece en deudas
- ✅ Estado: "retirado"
- ✅ Auditoría registra retiro sin liquidación

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-066: Retiro con Gastos No Consumidos
**Descripción:** Miembro se retira antes de consumir gasto registrado
**Precondición:** 
- Gastos registrados pero no ocurrieron aún
- Ejemplo: alojamiento en franja futura
- Jaime debe pagar $50,000 a Ana

**Pasos:**
1. Jaime hace clic en "Salir del Viaje"
2. Sistema calcula: deuda futura $50,000 a Ana
3. Sistema ofrece: "¿Quieres que tu parte se redistribuya?"
4. Jaime selecciona: "Sí, redistributuye mi parte"
5. Confirma

**Resultado Esperado:**
- ✅ Gasto de Jaime removido
- ✅ Los otros 4 ahora dividen el gasto completo
- ✅ Cada uno debe menos
- ✅ Jaime: estado "retirado", deuda $0
- ✅ Auditoría registra redistribución

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-067: Retiro en Viaje en Curso (Opción Generosa)
**Descripción:** Miembro en viaje elige regalar su parte
**Precondición:** 
- Viaje en curso (hoy 08/04)
- Gastos ya ocurrieron
- María debe pagar $50,000 total
- Alojamiento pagado que María no usará (valuado $20,000)

**Pasos:**
1. María hace clic en "Salir del Viaje"
2. Sistema detecta gastos consumidos + no consumidos
3. Muestra opciones:
   - "Generoso: Regalar mi parte ($50,000 + $20,000 = $70,000)"
   - "Estricto: Quiero que me devuelvan mi parte no consumida ($20,000)"
4. María elige: "Generoso"
5. Confirma

**Resultado Esperado:**
- ✅ María se retira
- ✅ Deuda $0
- ✅ Crédito devuelto $0
- ✅ Los otros reciben crédito extra: $70,000 ÷ 4 = $17,500 c/u
- ✅ Auditoría: "María se retira generosamente, su parte se distribuye"
- ✅ Notificación a otros: "María fue generosa, ahorras $17,500"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-068: Retiro en Viaje en Curso (Opción Estricta)
**Descripción:** Miembro elige recuperar su dinero
**Precondición:** María con misma situación anterior
**Pasos:**
1. María elige: "Estricto"
2. Confirma

**Resultado Esperado:**
- ✅ María se retira
- ✅ Deuda consumida: $50,000 (paga como todos)
- ✅ Crédito por no consumir: $20,000 (se le devuelve)
- ✅ Balance final: -$30,000 (debe pagar)
- ✅ Notificación: "Recibirás reembolso de $20,000"
- ✅ Auditoría registra opción elegida

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🧪 ESCENARIOS COMPLEJOS

### TC-069: Escenario Completo 1 - Crear Viaje a Liquidación
**Descripción:** Flujo completo desde 0 hasta final
**Precondición:** Ninguna

**Pasos:**
1. Ana crea viaje "Bariloche 2026"
2. Invita a Laura, Xenia, Jorge, Diego (menor)
3. Crea cronograma: 05-15 Ene (2 franjas)
4. Registra 2 alojamientos
5. Crea 3 actividades
6. Registra 5 gastos (comida, transporte, entradas)
7. Edita 1 gasto (diferencia)
8. Registra pagos manuales
9. Genera reportes
10. Descarga liquidación final

**Resultado Esperado:**
- ✅ Todo funciona sin errores
- ✅ Deudas calculadas correctamente
- ✅ Reportes generados
- ✅ Liquidación clara y precisa

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-070: Escenario Compl ejo 2 - Viaje Internacional con Cambios
**Descripción:** Viaje Argentina + Chile con cambios de tasas
**Precondición:** Ninguna

**Pasos:**
1. Ana crea viaje "Argentina-Chile 2026"
2. Invita 4 miembros
3. Crea franjas: Argentina (05-10) + Chile (12-15)
4. Registra gasto en ARS: $50,000
5. Registra gasto en CLP: 30,000
6. Registra gasto en USD: $100
7. Admin actualiza tasa USD: $950 → $960
8. Sistema recalcula deudas
9. Genera reporte en 3 monedas

**Resultado Esperado:**
- ✅ Conversiones correctas# Plan Viaje App - Guía de Testing

## 📋 Introducción

Esta guía contiene todos los **test cases** para validar cada funcionalidad de la aplicación. Los tests están organizados por módulo y se pueden ejecutar manualmente o automatizar.

**Formato de cada test:**
```
ID: TC-XXX
Módulo: [Módulo]
Descripción: [Qué se prueba]
Precondición: [Estado inicial requerido]
Pasos: [1. Paso 1, 2. Paso 2, ...]
Resultado Esperado: [Qué debe pasar]
Resultado Actual: [Completar después de ejecutar]
Estado: ✅ PASS / ❌ FAIL
Notas: [Cualquier observación]
```

---

## 🔐 MÓDULO 1: AUTENTICACIÓN Y USUARIOS

### TC-001: Registro de Usuario Exitoso
**Descripción:** Usuario se registra con email y contraseña válidos
**Precondición:** Usuario no está registrado
**Pasos:**
1. Ir a pantalla de login
2. Hacer clic en "Registrarse"
3. Completar: email, nombre, apellido, contraseña
4. Hacer clic en "Crear Cuenta"

**Resultado Esperado:**
- ✅ Cuenta creada
- ✅ Usuario logueado automáticamente
- ✅ Redirige a Dashboard

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-002: Registro con Email Duplicado
**Descripción:** Intentar registrar con email que ya existe
**Precondición:** Email ana@example.com ya está registrado
**Pasos:**
1. Ir a pantalla de registro
2. Ingresar email: ana@example.com
3. Completar otros campos
4. Hacer clic en "Crear Cuenta"

**Resultado Esperado:**
- ✅ Muestra error: "Email ya registrado"
- ✅ No se crea la cuenta
- ✅ Permanece en formulario de registro

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-003: Registro con Teléfono OTP
**Descripción:** Registrarse usando teléfono + OTP
**Precondición:** Ninguna
**Pasos:**
1. Ir a pantalla de registro
2. Seleccionar opción "Teléfono"
3. Ingresar: +5491123456789
4. Hacer clic en "Enviar OTP"
5. Recibir código por SMS
6. Ingresar código OTP (6 dígitos)
7. Completar nombre, apellido, contraseña
8. Hacer clic en "Crear Cuenta"

**Resultado Esperado:**
- ✅ OTP enviado (mensaje de confirmación)
- ✅ OTP válido por 5 minutos
- ✅ Máximo 3 intentos fallidos
- ✅ Cuenta creada después de validar OTP
- ✅ Usuario logueado

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-004: Login con Credenciales Correctas
**Descripción:** Usuario logueado exitosamente
**Precondición:** Usuario ya está registrado (ana@example.com / password123)
**Pasos:**
1. Ir a pantalla de login
2. Ingresar email: ana@example.com
3. Ingresar contraseña: password123
4. Hacer clic en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Login exitoso
- ✅ JWT token generado
- ✅ Redirige a Dashboard
- ✅ Muestra lista de viajes del usuario

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-005: Login con Contraseña Incorrecta
**Descripción:** Intento de login con contraseña incorrecta
**Precondición:** Usuario existe (ana@example.com)
**Pasos:**
1. Ingresar email: ana@example.com
2. Ingresar contraseña: passwordWrong
3. Hacer clic en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Error: "Email o contraseña incorrectos"
- ✅ No logueado
- ✅ Permanece en pantalla de login

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-006: Login con Google
**Descripción:** Autenticación via Google OAuth
**Precondición:** Navegador permite pop-ups
**Pasos:**
1. Ir a pantalla de login
2. Hacer clic en "Google"
3. Completar login de Google
4. Autorizar acceso a la app

**Resultado Esperado:**
- ✅ Pop-up de Google abre
- ✅ Usuario se autentica
- ✅ Redirige a Dashboard
- ✅ Datos de usuario completos

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-007: Logout
**Descripción:** Usuario cierra sesión
**Precondición:** Usuario logueado
**Pasos:**
1. Hacer clic en perfil (esquina superior)
2. Hacer clic en "Cerrar Sesión"
3. Confirmar

**Resultado Esperado:**
- ✅ Sesión cerrada
- ✅ JWT token invalidado
- ✅ Redirige a pantalla de login
- ✅ Datos locales borrados

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## ✈️ MÓDULO 2: GESTIÓN DE VIAJES

### TC-008: Crear Viaje Exitosamente
**Descripción:** Usuario crea un nuevo viaje
**Precondición:** Usuario logueado, sin viajes creados aún
**Pasos:**
1. Ir a Dashboard
2. Hacer clic en "+ Nuevo Viaje"
3. Completar:
   - Nombre: "Bariloche 2026"
   - Tipo: "Familia"
   - Alcance: "Nacional"
   - Fecha inicio: 05/01/2026
   - Fecha fin: 15/01/2026
4. Hacer clic en "Crear Viaje"

**Resultado Esperado:**
- ✅ Viaje creado con id_viaje
- ✅ Usuario es admin_principal automáticamente
- ✅ Estado = "planificacion"
- ✅ Viaje aparece en Dashboard
- ✅ Redirige a Detalle del Viaje

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-009: Crear Viaje con Fechas Inválidas
**Descripción:** Intento de crear viaje con fecha_inicio > fecha_fin
**Precondición:** Usuario logueado
**Pasos:**
1. Ir a "+ Nuevo Viaje"
2. Ingresar:
   - Fecha inicio: 15/01/2026
   - Fecha fin: 05/01/2026
3. Hacer clic en "Crear Viaje"

**Resultado Esperado:**
- ✅ Error: "Fecha inicio debe ser menor que fecha fin"
- ✅ Viaje no se crea
- ✅ Permanece en formulario

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-010: Crear Viaje con Duración > 365 días
**Descripción:** Validar límite de duración máxima
**Precondición:** Usuario logueado
**Pasos:**
1. Ir a "+ Nuevo Viaje"
2. Ingresar:
   - Fecha inicio: 01/01/2026
   - Fecha fin: 05/01/2027 (más de 365 días)
3. Hacer clic en "Crear Viaje"

**Resultado Esperado:**
- ✅ Error: "Duración máxima del viaje es 365 días"
- ✅ Viaje no se crea

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-011: Ver Detalle del Viaje
**Descripción:** Usuario ve información completa del viaje
**Precondición:** Viaje creado (Bariloche 2026)
**Pasos:**
1. En Dashboard, hacer clic en viaje "Bariloche 2026"
2. Verificar información mostrada

**Resultado Esperado:**
- ✅ Muestra nombre, período, tipo, alcance
- ✅ Muestra admin principal/secundario
- ✅ Muestra lista de miembros (5)
- ✅ Muestra resumen financiero
- ✅ Botones: Ver Cronograma, Agregar Gasto, Ver Deudas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-012: Editar Nombre del Viaje
**Descripción:** Admin edita nombre del viaje
**Precondición:** Viaje existe, usuario es admin principal
**Pasos:**
1. Ir a Detalle del Viaje
2. Hacer clic en nombre del viaje (editable)
3. Cambiar a: "Bariloche + Mendoza 2026"
4. Hacer clic en "Guardar"

**Resultado Esperado:**
- ✅ Nombre actualizado
- ✅ En Dashboard aparece con nombre nuevo
- ✅ Auditoría registrada

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-013: Eliminar Viaje Vacío
**Descripción:** Admin elimina viaje sin registros
**Precondición:** Viaje sin gastos, alojamientos, ni miembros
**Pasos:**
1. Ir a Detalle del Viaje
2. Hacer clic en "Configuración"
3. Hacer clic en "Eliminar Viaje"
4. Confirmar

**Resultado Esperado:**
- ✅ Viaje eliminado permanentemente
- ✅ Desaparece del Dashboard
- ✅ No aparece en reportes

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-014: Intentar Eliminar Viaje con Gastos
**Descripción:** Validar que no se puede eliminar viaje con registros
**Precondición:** Viaje tiene gastos registrados
**Pasos:**
1. Ir a Detalle del Viaje
2. Hacer clic en "Configuración"
3. Hacer clic en "Eliminar Viaje"

**Resultado Esperado:**
- ✅ Error: "No se puede eliminar un viaje con registros"
- ✅ Viaje NO se elimina
- ✅ Muestra opción: "Ver los registros"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 👥 MÓDULO 3: GESTIÓN DE MIEMBROS

### TC-015: Invitar Miembro por Teléfono
**Descripción:** Admin invita miembro usando contacto de teléfono
**Precondición:** Viaje creado, admin logueado
**Pasos:**
1. Ir a Detalle del Viaje
2. Hacer clic en "+ Invitar Miembros"
3. Seleccionar: "Contactos del Teléfono"
4. Seleccionar contacto "Laura López" (+5491123456789)
5. Seleccionar canales: WhatsApp, Email
6. Hacer clic en "Enviar Invitación"

**Resultado Esperado:**
- ✅ Invitación enviada por WhatsApp
- ✅ Invitación enviada por Email
- ✅ Laura aparece en lista con estado "Pendiente"
- ✅ Link de invitación contiene token válido
- ✅ Token expira en 7 días

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-016: Invitar Miembro por Email Manualmente
**Descripción:** Admin invita manualmente por email
**Precondición:** Viaje creado
**Pasos:**
1. Ir a "+ Invitar Miembros"
2. Seleccionar tipo: "Email"
3. Ingresar: xenia@example.com
4. Hacer clic en "+ Agregar"

**Resultado Esperado:**
- ✅ Email de invitación enviado
- ✅ Xenia aparece en lista "Pendiente"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-017: Aceptar Invitación (Nuevo Usuario)
**Descripción:** Usuario sin registrar acepta invitación
**Precondición:** Invitación enviada a +5491123456789
**Pasos:**
1. Usuario recibe link en WhatsApp: miapp.com/viaje/123?token=xyz789
2. Hacer clic en link
3. App abre (o redirige a descargar)
4. Usuario se registra (email, nombre, contraseña)
5. Usuario ya está en el viaje automáticamente

**Resultado Esperado:**
- ✅ App abre / redirige a descargar
- ✅ Después de registrarse, usuario es miembro del viaje
- ✅ Estado: "Aceptado"
- ✅ Usuario puede ver viaje en su Dashboard

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-018: Aceptar Invitación (Usuario Registrado)
**Descripción:** Usuario registrado acepta invitación
**Precondición:** Usuario existe, recibe invitación
**Pasos:**
1. Usuario recibe link
2. Usuario ya está logueado (en otra pestaña)
3. Hacer clic en link
4. Sistema detecta que está logueado
5. Automáticamente se agrega al viaje

**Resultado Esperado:**
- ✅ Redirección inmediata al viaje
- ✅ Usuario es miembro sin necesidad de confirmar nada más
- ✅ Viaje aparece en Dashboard

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-019: Rechazar Invitación
**Descripción:** Usuario rechaza invitación
**Precondición:** Invitación pendiente
**Pasos:**
1. Usuario recibe link
2. Hace clic en "Rechazar Invitación"
3. Confirma el rechazo

**Resultado Esperado:**
- ✅ Invitación eliminada
- ✅ Admin notificado: "Usuario rechazó invitación"
- ✅ Usuario NO aparece en lista de miembros

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-020: Promover Miembro a Admin Secundario
**Descripción:** Admin principal promueve miembro
**Precondición:** Viaje tiene miembro "Laura"
**Pasos:**
1. Ir a "Invitar Miembros"
2. En tabla de miembros, tomar fila de Laura
3. Hacer clic en "Hacer Admin"
4. Confirmar

**Resultado Esperado:**
- ✅ Laura ahora es "Admin Secundario"
- ✅ Laura recibe notificación
- ✅ Laura puede editar cronograma y alojamientos
- ✅ Laura NO puede eliminar el viaje
- ✅ Auditoría registrada

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-021: Admin Principal se Retira - Asignar Nuevo Admin
**Descripción:** Si admin principal se va, se asigna admin secundario
**Precondición:** Viaje tiene Admin Principal (Ana) y Admin Secundario (Jorge)
**Pasos:**
1. Ana hace clic en "Salir del Viaje"
2. Confirma retiro
3. Sistema automáticamente asigna Jorge como Admin Principal

**Resultado Esperado:**
- ✅ Ana se retira del viaje
- ✅ Jorge se convierte en Admin Principal
- ✅ Jorge recibe notificación
- ✅ Sistema busca nuevo Admin Secundario entre miembros activos
- ✅ Ana aparece como "Retirado" en auditoría

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-022: Remover Miembro sin Deudas
**Descripción:** Admin remueve miembro que no tiene gastos
**Precondición:** Viaje sin gastos, miembro es "Laura"
**Pasos:**
1. Ir a "Invitar Miembros"
2. En tabla, seleccionar Laura
3. Hacer clic en "Eliminar Miembro"
4. Confirmar

**Resultado Esperado:**
- ✅ Laura eliminada del viaje
- ✅ No aparece en lista de miembros
- ✅ Auditoría registrada

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-023: Intentar Remover Miembro con Deudas Pendientes
**Descripción:** No se puede remover si tiene deudas
**Precondición:** Laura tiene deuda pendiente de $41,670
**Pasos:**
1. Ir a "Invitar Miembros"
2. Intentar eliminar Laura

**Resultado Esperado:**
- ✅ Error: "No se puede remover, hay deudas pendientes"
- ✅ Opción: "Ver deudas" o "Pausa el Viaje"
- ✅ Laura NO se elimina

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-024: Registrar Menor de Edad
**Descripción:** Registrar menor (Diego, 14 años) con responsable
**Precondición:** Viaje creado
**Pasos:**
1. Ir a "Invitar Miembros"
2. Hacer clic en "¿Es un menor?"
3. Seleccionar edad: 14 años
4. Seleccionar responsable legal: Ana García
5. Ingresar presupuesto máximo diario: $5,000
6. Enviar invitación

**Resultado Esperado:**
- ✅ Diego aparece con badge "Menor"
- ✅ Ana (responsable) recibe notificación
- ✅ Ana puede ver todos los gastos de Diego
- ✅ Diego tiene límite de $5,000 por día
- ✅ Cuando Diego intenta gastar más, se bloquea

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 📅 MÓDULO 4: CRONOGRAMA Y FRANJAS

### TC-025: Crear Franja Exitosamente
**Descripción:** Admin crea franja de alojamiento
**Precondición:** Viaje creado (05 Ene - 15 Ene 2026)
**Pasos:**
1. Ir a Cronograma
2. Hacer clic en "+ Agregar Franja"
3. Completar:
   - Nombre: "Villa Traful"
   - Fecha inicio: 05/01/2026
   - Fecha fin: 10/01/2026
4. Hacer clic en "Guardar"

**Resultado Esperado:**
- ✅ Franja creada
- ✅ Aparece en cronograma
- ✅ Orden de secuencia = 1
- ✅ Estado = "programada"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-026: Crear Franja con Fechas Fuera del Viaje
**Descripción:** Validación de fechas
**Precondición:** Viaje es 05-15 Ene
**Pasos:**
1. Intentar crear franja: 20 Ene - 25 Ene

**Resultado Esperado:**
- ✅ Error: "Fechas deben estar dentro del viaje (05-15 Ene)"
- ✅ Franja no se crea

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-027: Cascada Automática - Extender Franja
**Descripción:** Al extender franja, las siguientes se corren automáticamente
**Precondición:** 
- Franja 1: Villa Traful (05-10 Ene)
- Franja 2: Bariloche (10-14 Ene)

**Pasos:**
1. Editar Franja 1
2. Cambiar fecha fin: 10 Ene → 11 Ene
3. Guardar

**Resultado Esperado:**
- ✅ Franja 1 ahora: 05-11 Ene
- ✅ Franja 2 automáticamente: 12-15 Ene (se corrió 1 día)
- ✅ Todos notificados del cambio
- ✅ Auditoría registra: "Cascada aplicada a 1 franja"
- ✅ Actividades de Franja 2 se reajustan en fechas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-028: Días Intermedios Detectados Automáticamente
**Descripción:** Sistema detecta días sin franja asignada
**Precondición:**
- Franja 1: Villa Traful (05-10 Ene)
- Franja 2: Bariloche (12-15 Ene)
- Día 11 sin asignar

**Pasos:**
1. Ver Cronograma
2. Verificar información de días intermedios

**Resultado Esperado:**
- ✅ Muestra aviso: "Día 11 sin franja asignada"
- ✅ Permite agregar actividades en día 11
- ✅ NO afecta la cascada automática
- ✅ Opción para asignar a franja existente o crear nueva

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-029: Editar Franja Pasada (Bloqueado)
**Descripción:** No se puede editar franja que ya ocurrió
**Precondición:** 
- Hoy es 08/01/2026
- Franja: 05-10 Ene (ya pasó)

**Pasos:**
1. Intentar editar Franja Villa Traful
2. Cambiar nombre

**Resultado Esperado:**
- ✅ Error: "No se puede editar franjas pasadas"
- ✅ Botón "Editar" deshabilitado
- ✅ Opción: "Ver detalles" (solo lectura)

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 🎫 MÓDULO 5: ACTIVIDADES

### TC-030: Crear Actividad Gratuita
**Descripción:** Crear actividad sin costo
**Precondición:** Franja "Villa Traful" existe
**Pasos:**
1. En Cronograma, ir a día 06/01
2. Hacer clic en "+ Agregar Actividad"
3. Completar:
   - Nombre: "Desayuno en hotel"
   - Tipo: "Comida"
   - Es paga: NO
   - Asignar a: Todos
4. Guardar

**Resultado Esperado:**
- ✅ Actividad creada
- ✅ Estado = "programada"
- ✅ NO genera gasto en finanzas
- ✅ Aparece en cronograma

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-031: Crear Actividad Paga (No Pagada)
**Descripción:** Crear actividad con costo pero aún no pagada
**Precondición:** Franja existe
**Pasos:**
1. "+ Agregar Actividad"
2. Completar:
   - Nombre: "Entrada Parque Dinosaurios"
   - Es paga: SÍ
   - Valor: $15,000
   - Estado pago: "No pagada"
   - Asignar a: Todos
3. Guardar

**Resultado Esperado:**
- ✅ Actividad creada
- ✅ Muestra valor referencial
- ✅ NO genera gasto aún
- ✅ Estado pago = "no_pagada"
- ✅ Cuando se complete, se puede marcar como pagada

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-032: Marcar Actividad como Completada
**Descripción:** Cambiar estado a completada
**Precondición:** Actividad "Entrada Parque" está "programada"
**Pasos:**
1. En Cronograma, ir a actividad
2. Hacer clic en "Cambiar Estado"
3. Seleccionar: "Completada"
4. Guardar

**Resultado Esperado:**
- ✅ Estado = "completada"
- ✅ Aparece con checkmark o icono diferente
- ✅ Si era paga y no pagada, sigue sin afectar finanzas

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-033: Cancelar Actividad Pagada (Costo Perdido)
**Descripción:** Cancelar actividad que fue pagada
**Precondición:** Actividad "Entrada Parque" ($15,000) ya fue pagada
**Pasos:**
1. Ir a actividad
2. Cambiar estado a "Cancelada"
3. Motivo: "Se suspendió por lluvia"
4. Confirmar

**Resultado Esperado:**
- ✅ Estado = "cancelada"
- ✅ Se crea gasto automático: "Costo Perdido - Entrada Parque $15,000"
- ✅ Aparece en finanzas como "pérdida"
- ✅ Se distribuye entre miembros (división normal)
- ✅ Auditoría registra: "Actividad cancelada, costo registrado como pérdida"

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-034: Editar Actividad
**Descripción:** Modificar detalles de actividad
**Precondición:** Actividad creada
**Pasos:**
1. Ir a actividad "Entrada Parque"
2. Hacer clic en "Editar"
3. Cambiar valor: $15,000 → $18,000
4. Guardar

**Resultado Esperado:**
- ✅ Actividad actualizada
- ✅ Si aún no fue pagada, se actualiza solo el valor
- ✅ Si ya fue pagada, opción de crear gasto diferencia

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

## 💰 MÓDULO 6: GASTOS Y FINANZAS

### TC-035: Crear Gasto Grupal (División por Todos)
**Descripción:** Registrar gasto que se divide entre todos
**Precondición:** Viaje tiene 5 miembros
**Pasos:**
1. Ir a Detalle del Viaje
2. Hacer clic en "+ Agregar Gasto"
3. Completar:
   - Descripción: "Cena en restaurante"
   - Monto: $250,000
   - Categoría: "Comida"
   - Tipo: "Gasto Grupal"
   - Quién pagó: Ana García
   - Asignar a: Todos (por defecto)
   - Fecha: 06/01/2026
4. Guardar

**Resultado Esperado:**
- ✅ Gasto creado
- ✅ Estado = "pendiente"
- ✅ Deudas generadas automáticamente:
  - Laura debe $50,000 a Ana
  - Xenia debe $50,000 a Ana
  - Jorge debe $50,000 a Ana
  - Diego debe $50,000 a Ana
  - Ana pagó, no debe nada
- ✅ División correcta: $250,000 ÷ 5 = $50,000 c/u
- ✅ Todos reciben notificación

**Resultado Actual:** [pendiente]
**Estado:** [ ] PASS [ ] FAIL
**Notas:**

---

### TC-036: Crear Gasto con Subgrupos
**Descripción:** Gasto se divide inteligentemente por subgrupos
**Precondición:** 
- 5 miembros
- Subgrupo "Familia Ruiz" (Jorge, Diego, Lucas)
- Subgrupo "Familia López" (Laura, Xenia)
- Ana sin subgrupo

**Pasos:**
1. Crear gasto: "Cena" $250,000
2. Tipo: "Gasto Grupal"
3. Asignar a: Todos
4. Guardar

**Resultado Esperado:**
- ✅ Cálculo automático:
  - Entidades: Ana (1