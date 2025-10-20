# Plan Viaje App - Resumen Ejecutivo

## 📌 Idea General

**Plan Viaje** es una aplicación web y móvil que permite a usuarios organizar viajes en grupo (familia, amigos o individual) y gestionar de manera inteligente tanto la **logística del viaje** como las **finanzas compartidas**.

La app resuelve el problema común: *"¿Quién pagó qué? ¿Cuánto me debe cada uno?"* automatizando cálculos complejos de divisiones, subgrupos y conversiones de monedas.

---

## 🎯 Objetivo Principal

Diseñar una **aplicación funcional e intuitiva** que permita:

1. **Organizar cronograma** del viaje (franjas, actividades, cambios en cascada)
2. **Gestionar miembros** (roles jerárquicos, menores de edad con responsables)
3. **Registrar gastos** (individuales, grupales, por subgrupos)
4. **Calcular deudas automáticamente** (incluyendo divisiones inteligentes)
5. **Generar reportes** (liquidación final, PDF, Excel)
6. **Sincronización offline** (ver datos sin conexión)

---

## 🌍 Cobertura Geográfica

- **Fase 1 (MVP)**: Argentina (enfoque en pesos argentinos)
- **Fase 2**: Soporte internacional (Argentina + Chile + USD)
- **Futuro**: Expandir a otros países

---

## 👥 Tipos de Usuarios

### 1. **Usuario Individual**
- Viaja solo
- Solo registro de gastos personales
- Sin divisiones de deudas

### 2. **Usuario en Grupo (Amigos/Familia)**
- Participa en viajes compartidos
- Puede ser miembro o administrador
- Acceso a finanzas compartidas

### 3. **Administrador Principal**
- Crea el viaje
- Invita miembros
- Gestiona cronograma y alojamientos
- Puede eliminar el viaje (si está vacío)
- Si se retira, asigna automáticamente admin secundario

### 4. **Administrador Secundario**
- Puede editar cronograma y alojamientos
- No puede eliminar el viaje
- No puede eliminar admin principal
- Si admin principal se va, se convierte en principal

### 5. **Menores de Edad (0-18 años)**
- Pueden crear gastos personales
- Responsable legal ve todos sus gastos
- Límite de presupuesto diario configurable
- Aprenden sobre finanzas participando

---

## 💡 Funcionalidades Principales

### A. Gestión de Viajes
- ✅ Crear viaje (individual/familia/amigos)
- ✅ Invitar miembros por teléfono o email
- ✅ Gestión de roles (admin principal/secundario/miembro)
- ✅ Crear subgrupos (Familia Gómez, amigos cercanos, etc)
- ✅ Retiro de miembros con liquidación automática

### B. Cronograma y Franjas
- ✅ Crear franjas de alojamiento con fechas
- ✅ Cascada automática (editar fecha → todas las siguientes se corren)
- ✅ Días intermedios sin asignar
- ✅ Crear actividades por día/franja
- ✅ Estados de actividades (programada, completada, cancelada, suspendida)

### C. Alojamientos
- ✅ Registrar alojamiento con link (Booking, Airbnb, etc)
- ✅ Estados de pago (no pagado, pagado, parcialmente pagado)
- ✅ Crear gasto automático cuando se marca como pagado
- ✅ Soporte para 3 monedas (ARS, CLP, USD)

### D. Gastos Inteligentes
- ✅ **Gastos Individuales**: Solo registra el usuario
- ✅ **Gastos Grupales**: Se divide automáticamente entre miembros/subgrupos
- ✅ **Gastos de Subgrupo**: Solo se divide entre miembros del subgrupo
- ✅ **Gastos Compartibles**: Opción privada o que se sume al general
- ✅ **Gastos Hijo**: Registrar diferencias encontradas después (ej: ticket perdido)
- ✅ **División Inteligente**: Subgrupos cuentan como 1 entidad en la división

### E. Finanzas y Deudas
- ✅ Cálculo automático de deudas
- ✅ Matriz de quién debe a quién
- ✅ Confirmación mutua de pagos
- ✅ Integración con Mercado Pago (pagos automáticos)
- ✅ Registros de auditoría completos

### F. Conversión de Monedas
- ✅ API de tipos de cambio (fallback manual)
- ✅ Mostrar gastos en 3 monedas simultáneamente
- ✅ Recálculo automático si cambian tasas

### G. Reportes
- ✅ Resumen financiero personal
- ✅ Reporte completo del viaje
- ✅ Liquidación final (quién debe a quién)
- ✅ Descargas en PDF y Excel
- ✅ Auditoría de cambios (quién cambió qué, cuándo)

### H. Notificaciones
- ✅ Configurables por evento (nuevo gasto, pago pendiente, etc)
- ✅ Multi-canal (Push, Email, WhatsApp)
- ✅ Respeta preferencias de privacidad del usuario

### I. Sincronización Offline
- ✅ Descargar datos del viaje localmente
- ✅ Visualizar datos sin conexión (lectura)
- ✅ Detectar conflictos al sincronizar
- ✅ Resolución automática o manual

---

## 🔑 Características Únicas

### 1. **Divisiones Inteligentes con Subgrupos**
Si hay familia Ruiz (Jorge, Diego, Lucas) como subgrupo:
- Un gasto de $250k entre 5 entidades (Ana, Laura, Xenia, Familia Ruiz, Familia Patiño)
- Familia Ruiz paga su parte × 3 miembros
- Se divide internamente entre los 3

### 2. **Cascada Automática de Cambios**
- Extiendes Villa Traful → Bariloche automáticamente se corre
- Todos los miembros se notifican
- Las actividades se ajustan automáticamente

### 3. **Retiro de Miembro Inteligente**
- **Caso sin gastos**: Se elimina sin problemas
- **Caso con gastos sin consumir**: Se redistributen entre otros
- **Caso en viaje en curso**: Opción generosa (regala su parte) o estricta (le devuelven)

### 4. **Gastos Hijo (Diferencias)**
- Descubriste un ticket que faltaba? Crea gasto hijo
- Se vincula al gasto padre automáticamente
- Se recalculan deudas

### 5. **Soporte para Menores**
- Pueden participar del viaje
- Responsable legal ve todo
- Limites de presupuesto diario
- Aprenden de finanzas

### 6. **Datos Internacionales**
- Mostrar 3 columnas de monedas simultáneamente
- Conversión automática o manual
- Valores en 3 monedas en reportes finales

---

## 📊 Estructura de Datos

**24 Tablas principales:**
- USUARIOS
- VIAJES
- MIEMBROS_VIAJE
- CRONOGRAMA
- FRANJAS
- ALOJAMIENTOS
- ACTIVIDADES
- SUBGRUPOS / SUBGRUPO_MIEMBROS
- GASTOS / GASTOS_SUBGRUPO
- DEUDAS / DEUDAS_SUBGRUPO
- PAGOS
- NOTIFICACIONES
- AUDITORIA
- CONFIGURACION_VIAJE
- TASAS_CAMBIO

---

## 🔗 APIs y Endpoints

**52 endpoints principales** organizados en:
- Autenticación (7)
- Viajes (5)
- Miembros (5)
- Franjas (4)
- Actividades (3)
- Alojamientos (3)
- Gastos (6)
- Deudas (4)
- Subgrupos (3)
- Menores (2)
- Notificaciones (3)
- Reportes (5)
- Monedas (2)

---

## 🎨 Interfaz de Usuario

**9 Pantallas principales:**
1. Login/Registro
2. Dashboard (mis viajes)
3. Crear Viaje
4. Viaje Detalle
5. Invitar Miembros
6. Crear Gasto
7. Deudas y Pagos
8. Cronograma
9. Reportes Finales

---

## 📈 Limitaciones y Restricciones

| Recurso | Límite |
|---------|--------|
| Miembros por viaje | 30 |
| Subgrupos por viaje | 30 |
| Franjas por viaje | Sin límite |
| Duración máxima viaje | 365 días |
| Mínimo de viaje | 1 día |
| Tamaño archivos | 10 MB |

---

## 🚀 Roadmap de Desarrollo

### **Fase 1 - MVP (2-3 semanas)**
- Autenticación básica
- Crear viaje + invitar miembros
- Cronograma simple (sin cascada)
- Gastos individuales + división simple
- Offline básico (lectura)

### **Fase 2 (1-2 semanas)**
- Cascada automática
- Subgrupos + divisiones inteligentes
- Alojamientos con estados
- Sincronización offline mejorada

### **Fase 3 (1-2 semanas)**
- Conversión de monedas
- Mercado Pago integration
- Notificaciones avanzadas
- Auditoría completa

### **Fase 4 - Polish**
- Mobile nativa (React Native/Flutter)
- Optimizaciones
- Testing

---

## 💻 Stack Técnico Propuesto

| Capa | Tecnología |
|------|-----------|
| Frontend Web | React + Tailwind |
| Frontend Mobile | React Native o Flutter |
| Backend | Node.js + Express |
| BD Principal | PostgreSQL |
| BD Realtime | Firestore |
| Autenticación | Firebase Auth |
| Notificaciones | Firebase Cloud Messaging |
| Pagos | Mercado Pago API |
| Monedas | ExchangeRate-API |
| Storage | Google Cloud Storage |

---

## 🎯 Casos de Uso Principales

### 1. **Crear Viaje y Organizar**
- Ana crea "Bariloche 2026"
- Invita a Laura, Xenia, Jorge, Diego
- Crea cronograma con 2 franjas
- Registra 2 alojamientos

### 2. **Registrar Gasto Complejo**
- Ana registra cena de $250k
- Sistema calcula automáticamente divisiones por subgrupos
- Genera deudas para Laura, Xenia, Jorge, Diego
- Notifica a todos

### 3. **Retiro en Viaje**
- Durante el viaje, María debe irse
- Sistema calcula lo que debe/le deben
- María elige opción generosa o estricta
- Deudas se liquidan automáticamente

### 4. **Generar Liquidación Final**
- Viaje terminó
- Admin genera reporte PDF
- Muestra matriz de pagos
- Todos descargan y se liquidan

---

## 📋 Validaciones Críticas

- ✅ Email único y válido
- ✅ Teléfono válido (Argentina)
- ✅ Fechas coherentes (inicio < fin)
- ✅ Montos > 0
- ✅ Divisiones correctas de gastos
- ✅ Un admin principal obligatorio
- ✅ Menor debe tener responsable legal
- ✅ Auditoría de todos los cambios

---

## 🔒 Seguridad

- JWT Token (24h access, 30d refresh)
- Encriptación de datos sensibles (CBU)
- Rate limiting (100-1000 req/hora)
- Validación servidor-side
- HTTPS obligatorio
- Permisos por rol

---

## 📊 Métricas de Éxito

- ✅ Usuarios pueden crear viaje en < 2 minutos
- ✅ Deudas calculadas automáticamente con 100% precisión
- ✅ App funciona offline
- ✅ Reportes generados en < 5 segundos
- ✅ Sincronización < 3 segundos
- ✅ Uptime > 99.5%

---

## 🔮 Futuro

- Integración con apps de viajes (Google Trips, Airbnb)
- Machine learning para sugerir presupuestos
- Gamification (logros, estadísticas)
- Integración con redes sociales
- Compartir gastos con personas sin registrarse
- Historial de viajes (comparar costos)

---

## 📝 Notas Finales

- **Flexible**: Soporta viajes individuales, familiares, con amigos
- **Inteligente**: Divisiones automáticas, cascadas, conversiones
- **Seguro**: Auditoría completa de cambios
- **Offline-First**: Funciona sin internet
- **Internacional**: Listo para expandir a otros países
- **Escalable**: Diseñado para crecer

---

## 👨‍💻 Estado Actual

✅ **Completado:**
- Especificación de 52 casos de uso
- ERD con 24 tablas
- 52 endpoints documentados
- 9 pantallas diseñadas (wireframes interactivos)
- Stack técnico definido
- Roadmap de desarrollo

⏳ **Próximo:**
- Guía de testing (test cases)
- Desarrollo de backend
- Desarrollo de frontend