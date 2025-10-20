# Casos de Uso - Plan Viaje App

## 1. GESTIÓN DE USUARIOS Y AUTENTICACIÓN

### CU-001: Registrar Nuevo Usuario
**Actor Principal**: Usuario No Autenticado
**Precondición**: Usuario tiene una invitación a viaje o quiere crear uno
**Flujo Principal**:
1. Usuario accede a la app (sin cuenta)
2. Elige: "Crear Cuenta" o "Tengo una Invitación"
3. Si es crear cuenta: Ingresa email/teléfono y elige método (Google, Facebook, WhatsApp)
4. Completa datos: Nombre, Apellido, Avatar (opcional)
5. Sistema envía OTP por SMS (one-time code)
6. Usuario valida OTP
7. Cuenta creada, usuario logea automáticamente

**Postcondición**: Usuario está autenticado y puede crear/unirse a viajes

---

### CU-002: Iniciar Sesión
**Actor Principal**: Usuario Registrado
**Precondición**: Usuario tiene cuenta en la app
**Flujo Principal**:
1. Usuario abre app
2. Elige método de login (Google, Facebook, Teléfono con OTP)
3. Sistema valida credenciales
4. Usuario logea, ve sus viajes activos

**Postcondición**: Usuario autenticado, acceso a viajes

---

### CU-003: Recuperar Contraseña / Reset por Teléfono
**Actor Principal**: Usuario Registrado (olvida acceso)
**Precondición**: Usuario registrado pero no puede ingresar
**Flujo Principal**:
1. Usuario en pantalla de login, toca "¿Olvidaste tu contraseña?"
2. Ingresa teléfono/email
3. Sistema envía OTP por SMS
4. Usuario valida OTP
5. Puede resetear contraseña o acceder directamente

**Postcondición**: Acceso restaurado

---

### CU-004: Cerrar Sesión
**Actor Principal**: Usuario Autenticado
**Precondición**: Usuario está logueado
**Flujo Principal**:
1. Usuario toca ícono de perfil
2. Selecciona "Cerrar Sesión"
3. Sistema confirma logout
4. Usuario vuelve a pantalla de login

**Postcondición**: Sesión cerrada

---

## 2. GESTIÓN DE VIAJES

### CU-005: Crear Nuevo Viaje
**Actor Principal**: Usuario Autenticado
**Precondición**: Usuario logueado
**Flujo Principal**:
1. Usuario toca "+ Nuevo Viaje"
2. Ingresa nombre del viaje (ej: "Bariloche 2026")
3. Selecciona tipo: Solo / Con Amigos / En Familia
4. Selecciona alcance: Nacional / Internacional
5. Ingresa fecha inicio y fecha fin (mín 1 día, máx 1 año)
6. Ingresa descripción (opcional)
7. Sistema asigna ID único al viaje
8. Usuario queda como Administrador Principal
9. Sistema crea estructura base del viaje

**Postcondición**: Viaje creado, usuario puede invitar miembros

---

### CU-006: Invitar Miembros al Viaje
**Actor Principal**: Administrador Principal/Secundario
**Precondición**: Viaje creado (CU-005)
**Flujo Principal**:
1. Admin toca "Invitar Miembros"
2. Sistema accede a agenda de contactos del teléfono (con permiso)
3. Admin selecciona 1 o más contactos (máx 30 miembros incluido admin)
4. Para cada contacto:
   - Si es teléfono: genera link con token + ID viaje
   - Si es email: envía email con link + token
5. Opcional: Admin puede marcar "Omitir por ahora"
6. Sistema envía invitación por WhatsApp (teléfono) o email
7. Invitación contiene: Nombre viaje, período, link con token `miapp.com/viaje/abc123?token=xyz789`

**Flujo Alternativo (Sin contactos en el momento)**:
1. Admin ingresa teléfono/email manualmente
2. Mismo flujo de invitación

**Postcondición**: Invitaciones enviadas, contactos reciben link con token

---

### CU-007: Aceptar Invitación a Viaje
**Actor Principal**: Usuario Invitado (no registrado o registrado)
**Precondición**: Usuario recibe invitación con token válido
**Flujo Principal**:
1. Usuario hace clic en link desde WhatsApp/Email
2. App abre o redirige a descargar (si no tiene)
3. Sistema valida token
4. Si usuario NO está registrado: Flujo CU-001 (registrarse)
5. Si usuario SÍ está registrado: Logea automáticamente
6. Sistema asigna usuario al viaje con rol "Miembro"
7. Usuario ve viaje en su lista
8. Sistema notifica al admin que X usuario aceptó la invitación

**Flujo Alternativo (Rechazar invitación)**:
1. Usuario hace clic en link
2. Selecciona "Rechazar invitación"
3. Sistema descarta invitación
4. Notifica al admin del rechazo

**Postcondición**: Usuario es miembro del viaje o invitación rechazada

---

### CU-008: Ver Detalles del Viaje
**Actor Principal**: Miembro del Viaje
**Precondición**: Usuario es miembro del viaje
**Flujo Principal**:
1. Usuario selecciona viaje de su lista
2. Sistema muestra: Nombre, período, tipo, miembros, descripción
3. Usuario ve pestañas: Cronograma, Finanzas, Alojamientos, Miembros, Configuración (solo admin)

**Postcondición**: Usuario ve información general del viaje

---

### CU-009: Gestionar Miembros (Roles y Permisos)
**Actor Principal**: Administrador Principal
**Precondición**: Usuario es admin principal del viaje
**Flujo Principal**:
1. Admin abre sección "Miembros"
2. Ve lista de miembros con sus roles (Admin Principal, Admin Secundario, Miembro)
3. Admin puede:
   - **Promover a Admin Secundario**: Selecciona miembro → "Hacer Admin"
   - **Descender Admin Secundario**: Selecciona admin secondary → "Remover Rol de Admin"
   - **Eliminar miembro**: Si viaje aún sin gastos/alojamientos (CU-028) → Confirmación → Eliminado
4. Si Admin Principal se va (CU-027):
   - Sistema selecciona primer Admin Secundario como nuevo Admin Principal
   - Notifica al nuevo admin
5. Sistema registra cada cambio en auditoría

**Postcondición**: Estructura de roles actualizada, auditoría registrada

---

### CU-010: Abandonar Viaje (Miembro Regular)
**Actor Principal**: Miembro Regular del Viaje
**Precondición**: Usuario es miembro sin permisos de admin
**Flujo Principal**:
1. Miembro toca "Salir del Viaje"
2. Sistema verifica si hay gastos/deudas pendientes
3. Si NO hay: Confirmación → Usuario eliminado
4. Si HAY: Muestra opción de pausa (CU-027 - Retiro con Gastos)
5. Sistema notifica a admins del retiro
6. Usuario desaparece de lista de miembros (excepto en reportes)

**Postcondición**: Usuario removido del viaje o puesto en pausa

---

### CU-011: Eliminar Viaje Completo
**Actor Principal**: Administrador Principal
**Precondición**: Usuario es admin principal
**Flujo Principal**:
1. Admin abre "Configuración del Viaje"
2. Toca "Eliminar Viaje"
3. Sistema verifica si hay gastos/alojamientos registrados
4. Si NO hay: Confirmación → Viaje eliminado permanentemente
5. Si HAY: Sistema rechaza eliminación con mensaje "No se puede eliminar un viaje con registros"

**Postcondición**: Viaje eliminado (solo si está vacío) o rechazo de operación

---

## 3. GESTIÓN DE CRONOGRAMA Y FRANJAS

### CU-012: Crear Cronograma Base del Viaje
**Actor Principal**: Administrador
**Precondición**: Viaje creado (CU-005)
**Flujo Principal**:
1. Admin abre sección "Cronograma"
2. Sistema muestra: Fecha inicio - Fecha fin (calculadas desde CU-005)
3. Admin elige:
   - **Rápido**: Sistema crea automáticamente UNA franja general con el período completo
   - **Detallado**: Pasar a CU-013
4. Si "Rápido": Franja creada con estado "Sin Asignar", admin puede luego editar (CU-013)

**Postcondición**: Cronograma base creado, admin puede agregar franjas

---

### CU-013: Crear/Editar Franja de Alojamiento
**Actor Principal**: Administrador
**Precondición**: Cronograma existe (CU-012)
**Flujo Principal**:
1. Admin toca "+ Agregar Franja"
2. Ingresa:
   - Nombre lugar (ej: "Villa Traful")
   - Fecha inicio (ej: 05/01/2026)
   - Fecha fin (ej: 10/01/2026)
   - Descripción (opcional)
3. Sistema valida que fecha inicio < fecha fin y ambas dentro del viaje
4. Sistema crea franja
5. **Si hay franja siguiente**: Sistema verifica espacios vacíos:
   - Si hay días sin asignar entre esta franja y la siguiente → Marca como "Días Intermedios"
   - Estos días pueden tener actividades pero "no restan" del período siguiente
6. Franja creada con estado "Programada"

**Flujo Alternativo (Editar Franja Existente)**:
1. Admin selecciona franja existente
2. Puede cambiar: Nombre, fecha inicio, fecha fin
3. **Validación importante**: 
   - Si cambia fecha fin, la franja siguiente se corre automáticamente (Cascada)
   - Sistema calcula la diferencia de días y corre todo lo subsecuente
   - Notifica a todos los miembros del cambio en cascada
4. Si la franja ya tiene actividades/gastos, sistema notifica del impacto

**Precondición para Editar**: 
- Solo puede editar franjas a futuro (si viaje ya comenzó)
- Si es hoy o antes, no se puede editar

**Postcondición**: Franja creada/editada, cascada de cambios aplicada si aplica

---

### CU-014: Crear Días Intermedios (Sin Franja)
**Actor Principal**: Administrador
**Precondición**: Hay días sin asignar entre franjas
**Flujo Principal**:
1. Sistema detecta automáticamente días no asignados
2. Admin puede:
   - **Opción A**: Dejarlos como "Flotantes" (sin franja, pero se pueden agregar actividades)
   - **Opción B**: Marcarlos como "Días de Viaje Libre" (pueden tener gastos/actividades)
   - **Opción C**: Asignarlos retroactivamente a una franja nueva
3. Sistema permite que haya actividades en días intermedios
4. Estas actividades NO afectan la cascada automáticamente

**Postcondición**: Días intermedios definidos, actividades posibles

---

### CU-015: Crear Actividad en Franja
**Actor Principal**: Administrador / Miembro
**Precondición**: Franja existe (CU-013) o hay días intermedios (CU-014)
**Flujo Principal**:
1. Miembro selecciona una franja o día específico
2. Toca "+ Agregar Actividad"
3. Ingresa:
   - Nombre (ej: "Parque Dinosaurios")
   - Fecha (dentro del rango de la franja)
   - Hora (opcional)
   - Descripción
   - Tipo: Gratuita / Paga
4. Si es Paga:
   - Ingresa valor referencial
   - Selecciona moneda (ARS / CLP / USD según país)
   - Opción: "Ya está pagada" o "Se paga en el momento"
   - Si está pagada: Ingresa quién pagó
5. Asignación:
   - Por defecto: "Todos los miembros"
   - Opción: Seleccionar miembros específicos
6. Estado inicial: "Programada"

**Postcondición**: Actividad creada, visible en cronograma

---

### CU-016: Editar Actividad
**Actor Principal**: Administrador / Creador de Actividad
**Precondición**: Actividad existe (CU-015)
**Flujo Principal**:
1. Miembro selecciona actividad
2. Toca "Editar"
3. Puede cambiar: Nombre, fecha, hora, descripción, asignación
4. **Validación**: Si la actividad ya pasó, puede editar pero solo fecha/descripción (no cambiar estado)
5. Si cambia fecha y lleva a otro día/franja:
   - Sistema valida si la nueva fecha está dentro de período válido
   - Actualiza la asignación si es necesario
6. Si cambio de dinero/estado, genera un registro de auditoría

**Postcondición**: Actividad actualizada, historial registrado

---

### CU-017: Marcar Actividad como Completada/Cancelada
**Actor Principal**: Administrador / Miembro
**Precondición**: Actividad existe, fecha pasó o admin lo marca manualmente
**Flujo Principal**:
1. Selecciona actividad
2. Toca botón de estado (ej: "Marcar Completada" o "Cancelada")
3. Si se marca Cancelada y era Paga/Pagada:
   - **Si NO fue pagada**: Solo cambia estado, no afecta finanzas
   - **Si fue pagada y aún no consumida**: Marca como "Costo Perdido", entra a finanzas como gasto irrecuperable
   - **Si fue pagada y parcialmente consumida**: Admin puede dividir el costo
4. Sistema notifica a miembros afectados

**Postcondición**: Estado de actividad actualizado

---

### CU-018: Eliminar Actividad
**Actor Principal**: Administrador
**Precondición**: Actividad existe (CU-015)
**Flujo Principal**:
1. Admin selecciona actividad
2. Toca "Eliminar"
3. Sistema valida:
   - **Si es Gratuita**: Se elimina sin restricción
   - **Si es Paga pero NO pagada**: Se elimina sin restricción
   - **Si es Paga y ya fue pagada**: Se rechaza eliminación con mensaje "Actividad pagada no puede ser eliminada, marca como Cancelada"
4. Si se puede eliminar: Confirmación → Eliminada

**Postcondición**: Actividad eliminada o rechazo de operación

---

## 4. GESTIÓN DE ALOJAMIENTOS

### CU-019: Registrar Alojamiento
**Actor Principal**: Administrador / Miembro
**Precondición**: Viaje creado, franja de alojamiento existe
**Flujo Principal**:
1. Miembro abre sección "Alojamientos"
2. Toca "+ Registrar Alojamiento"
3. Ingresa:
   - Nombre (ej: "Booking - Cabaña Villa Traful")
   - Link del sitio de reserva (ej: link de Booking)
   - Fecha check-in
   - Hora check-in (opcional)
   - Fecha check-out
   - Hora check-out (opcional)
   - Descripción/Ubicación
4. Estado de pago:
   - **No pagado (se paga en sitio)**: Solo nombre y referencias
   - **Pagado (anticipo)**: Ingresa monto total
     - Si es Nacional: Monto en ARS
     - Si es Internacional: Ingresa monto en ARS + equivalencia en CLP/USD
   - **Parcialmente pagado**: Ingresa monto pagado + monto faltante
5. Quién realizó la reserva (si pagó)
6. Asignación: Por defecto todos los miembros, opción de seleccionar específicos

**Postcondición**: Alojamiento registrado, datos de financiero pendiente

---

### CU-020: Editar Alojamiento
**Actor Principal**: Administrador / Creador del Alojamiento
**Precondición**: Alojamiento existe (CU-019)
**Flujo Principal**:
1. Miembro selecciona alojamiento
2. Toca "Editar"
3. Puede cambiar: Nombre, fechas, horarios, descripción, monto, estado
4. **Si cambia fecha check-in/out y afecta la franja**:
   - Sistema advierte: "Esto puede afectar el cronograma"
   - Si el alojamiento está fuera de una franja, lo corre automáticamente
   - Cascada de cambios (CU-013)
5. Sistema registra cambios en auditoría

**Postcondición**: Alojamiento actualizado, impactos aplicados

---

### CU-021: Eliminar Alojamiento
**Actor Principal**: Administrador
**Precondición**: Alojamiento existe (CU-019)
**Flujo Principal**:
1. Admin selecciona alojamiento
2. Toca "Eliminar"
3. Sistema valida:
   - **Si NO fue pagado**: Se elimina sin restricción
   - **Si fue pagado**: Se rechaza con mensaje "No se puede eliminar alojamiento pagado"
4. Si se puede eliminar: Confirmación → Eliminado

**Postcondición**: Alojamiento eliminado o rechazo

---

### CU-022: Registrar Pago de Alojamiento (Estado: Se paga en sitio)
**Actor Principal**: Miembro que paga
**Precondición**: Alojamiento registrado con estado "Se paga en sitio"
**Flujo Principal**:
1. Miembro abre alojamiento
2. Toca "Pagar Alojamiento"
3. Ingresa monto pagado (puede ser diferente al estimado)
4. Ingresa fecha/hora de pago
5. Adjunta comprobante (opcional)
6. Sistema crea gasto en finanzas:
   - Tipo: Alojamiento
   - Monto: Lo ingresado
   - Quién pagó: El miembro actual
   - Estado: "Pendiente de confirmación de otros"
7. Otros miembros reciben notificación: "X pagó alojamiento, revisa detalles"

**Postcondición**: Gasto de alojamiento registrado en finanzas, pendiente de confirmación

---

## 5. GESTIÓN DE FINANZAS - GASTOS INDIVIDUALES Y COMPARTIDOS

### CU-023: Registrar Gasto Individual
**Actor Principal**: Cualquier Miembro
**Precondición**: Viaje es individual
**Flujo Principal**:
1. Miembro abre "Finanzas"
2. Toca "+ Nuevo Gasto"
3. Interfaz muestra solo "Gasto Personal"
4. Ingresa:
   - Descripción (ej: "Nafta")
   - Monto
   - Categoría: Comida / Transporte / Alojamiento / Entradas / Otros
   - Moneda: ARS (si es nacional) o ARS + CLP + USD (si es internacional)
   - Fecha
   - Comprobante/Foto (opcional)
5. Sistema registra como gasto personal, no afecta divisiones
6. Miembro ve su gasto total al final del viaje

**Postcondición**: Gasto personal registrado, visible solo para el usuario

---

### CU-024: Registrar Gasto Compartido (Grupo General)
**Actor Principal**: Cualquier Miembro
**Precondición**: Viaje es en grupo (Amigos/Familia)
**Flujo Principal**:
1. Miembro abre "Finanzas"
2. Toca "+ Nuevo Gasto"
3. Selecciona tipo:
   - **Gasto Personal**: Solo el miembro
   - **Gasto Grupo**: Va a CU-024
4. Si es Gasto Grupo:
   - Ingresa descripción (ej: "Cena")
   - Monto total
   - Categoría
   - Moneda
   - Quién pagó (por defecto el actual, puede cambiar)
   - Asignación:
     - **Opción A (Predeterminada)**: Divide entre todos los miembros presentes + subgrupos
     - **Opción B**: Selecciona miembros/subgrupos específicos
     - **Opción C**: Indicación de división personalizada
5. Sistema calcula automáticamente:
   - Si hay subgrupos: Cada subgrupo cuenta como 1 entidad
   - Ejemplo: 5 entidades (Ana, Laura, Xenia, SubgrupoRuiz[3], SubgrupoPatiño[1]) = 250k / 5 = 50k por entidad
   - SubgrupoRuiz paga 50k × 3 miembros = 150k
6. Sistema genera deudas automáticas
7. Si quién pagó ≠ quién lo registra, crea notificación

**Postcondición**: Gasto compartido registrado, deudas generadas

---

### CU-025: Registrar Gasto Privado de Subgrupo
**Actor Principal**: Miembro del Subgrupo
**Precondición**: Viaje tiene subgrupos, usuario es parte de uno
**Flujo Principal**:
1. Miembro abre "Finanzas"
2. Toca "+ Nuevo Gasto"
3. Selecciona tipo: "Gasto Subgrupo Privado"
4. Ingresa:
   - Descripción (ej: "Cena familia Ruiz")
   - Monto
   - Categoría
   - Moneda
   - Quién pagó
   - Asignación: Solo miembros del subgrupo
5. Sistema calcula división solo entre miembros del subgrupo
   - Ejemplo: Cena $5000, 3 miembros = $1666.67 c/u
6. Este gasto NO se suma al grupo general
7. Otros subgrupos NO ven este gasto

**Postcondición**: Gasto privado de subgrupo registrado, deudas solo dentro del subgrupo

---

### CU-026: Registrar Múltiples Gastos Individuales (Formato: Cada uno Paga lo Suyo)
**Actor Principal**: Miembros del Grupo
**Precondición**: Gasto ocurre donde cada uno paga diferente (ej: camping)
**Flujo Principal**:
1. Miembro A abre "Finanzas"
2. Toca "+ Nuevo Gasto"
3. Selecciona: "Gasto Personal en Actividad Grupal"
4. Ingresa:
   - Descripción: (ej: "Camping - Pase Ana")
   - Monto pagado por Ana
   - Categoría
   - Moneda
5. Sistema crea gasto individual de Ana, NO lo comparte automáticamente
6. Miembro B hace lo mismo: "Camping - Pase Laura"
7. Sistema mantiene registros separados (6 registros para 6 personas)
8. En reportes finales: Se ve desagregado

**Postcondición**: Múltiples gastos individuales registrados bajo el mismo evento/actividad

---

### CU-027: Editar Gasto (Con Referencia a Padre)
**Actor Principal**: Creador del Gasto / Administrador
**Precondición**: Gasto existe (CU-023 a CU-026)
**Flujo Principal**:
1. Miembro selecciona gasto
2. Toca "Editar"
3. **Caso 1: Mismo día de creación + sin pagos registrados**:
   - Puede editar: Descripción, monto, categoría, asignación
   - Deudas se recalculan automáticamente
4. **Caso 2: Detecta diferencia en monto (descubre ticket perdido)**:
   - Toca "Agregar Gasto Faltante"
   - Ingresa descripción: (ej: "Servicio no registrado 2k")
   - Crea gasto HIJO referenciando al PADRE (CU-027 Alt)
   - Nuevo gasto se vincula: "Diferencia del gasto 'Cena' del 12/10"
5. Sistema notifica a miembros afectados de cambios de deuda

**Flujo Alternativo: Crear Gasto Hijo (Diferencia)**:
1. Miembro selecciona gasto existente
2. Toca "Agregar Diferencia"
3. Ingresa:
   - Monto faltante
   - Descripción (ej: "Encontré el ticket, había servicio de $2000")
4. Sistema crea nuevo gasto hijo, referencia al padre
5. Deudas se agregan automáticamente
6. En auditoría: Aparece "Gasto hijo creado del gasto padre del 12/10"

**Postcondición**: Gasto editado, deudas recalculadas o gasto hijo creado

---

### CU-028: Confirmar Pago de Deuda
**Actor Principal**: Acreedor (quien debe recibir dinero)
**Precondición**: Existe deuda pendiente hacia este miembro (CU-024, CU-025)
**Flujo Principal**:
1. Miembro A abre "Finanzas" → "Deudas Pendientes"
2. Ve: "Laura te debe $5000 por Cena del 12/10"
3. Toca sobre la deuda
4. Opciones:
   - **Marcar como Pagado**: Laura envió dinero fuera de la app
     - Requiere confirmación mutua (Laura debe confirmar que pagó)
   - **Solicitar Pago por Mercado Pago** (si está integrado):
     - Sistema genera link de pago
     - Laura recibe notificación con link
     - Si Laura paga: Se confirma automáticamente
5. Registro: Fecha/Hora de confirmación, método de pago, comprobante

**Flujo Alternativo: Pago Automático (Mercado Pago)**:
1. Laura recibe notificación: "Debes $5000 a Ana"
2. Toca "Pagar Ahora"
3. Sistema abre Mercado Pago
4. Laura confirma pago
5. Mercado Pago notifica a Ana: "Pago recibido"
6. Deuda marcada como saldada automáticamente

**Postcondición**: Deuda confirmada como pagada, registro actualizado

---

### CU-029: Generar Liquidación Automática en Retiro (Caso 2 y 3)
**Actor Principal**: Sistema (automático) / Miembro que se Retira
**Precondición**: Miembro se retira del viaje (CU-010, CU-027 - Retiro Pausado)
**Flujo Principal**:
1. Sistema detecta que Miembro X se retira
2. Analiza:
   - Gastos donde X participó (aún no ocurridos): Se elimina participación
   - Gastos donde X participó (ya ocurridos): Se calcula deuda final
   - Alojamientos reservados para X: Sistema reasigna a otros
3. Sistema genera "Liquidación al Retiro":
   - Muestra deuda total de X
   - Muestra créditos de X (si pagó por otros)
   - Balance final
4. Sistema actualiza deudas de otros miembros automáticamente
5. Ejemplo retiro Jaime del Caso 2:
   - Jaime debe devolver su parte del alojamiento: $12.500
   - Los 4 restantes se redistribuyen 50k cada uno (antes era 40k)
   - Notificación a Jaime: "Tu saldo al retirarse es débito de $12.500 a Dario"
   - Notificación a Dario: "Jaime se retira, debes devolverle $12.500"

**Postcondición**: Liquidación calculada, deudas finales generadas

---

### CU-030: Retiro Pausado con Opción de Generosidad (Caso 3)
**Actor Principal**: Miembro con Gastos Completos (en viaje en curso)
**Precondición**: Viaje en curso, hay alojamiento pagado por otros, miembro necesita irse
**Flujo Principal**:
1. Miembro X toca "Salir del Viaje"
2. Sistema detecta gastos no consumidos (ej: alojamiento pagado)
3. Sistema muestra opciones:
   - **Opción A (Generoso)**: "Donar mi parte a los demás"
     - Texto: "Chicos, no me devuelvan, que disfruten por mi"
     - Otros miembros reciben crédito automático
   - **Opción B (Estricto)**: "Necesito mi dinero de vuelta"
     - Acreedor debe transferir dinero a X
     - Balance final calculado
4. Estado del Miembro: "Pausado - Retiro Pendiente"
5. Miembro no aparece en lista de miembros activos
6. Pero sus gastos quedan en auditoría/reportes

**Postcondición**: Miembro pausado, financiero resuelto según su opción

---

### CU-031: Convertir Monedas en Gastos Internacionales
**Actor Principal**: Sistema (automático)
**Precondición**: Viaje es internacional, gasto ingresado en moneda local
**Flujo Principal**:
1. Miembro ingresa gasto: "Comida" = 15.000 CLP
2. Sistema valida que está en Chile (según franja de alojamiento)
3. Busca tipo de cambio:
   - **Opción A (API activa)**: Consulta ExchangeRate-API
   - **Opción B (Fallback manual)**: Admin ingresó manualmente al inicio del viaje
4. Sistema convierte:
   - 15.000 CLP → ARS (ej: 4.400 ARS)
   - 15.000 CLP → USD (ej: 18 USD)
5. Sistema muestra en gasto:
   - CLP: 15.000
   - ARS: 4.400
   - USD: 18
6. Deudas se calculan en ARS (moneda base del sistema)

**Postcondición**: Gasto convertido automáticamente a las 3 monedas

---

### CU-032: Actualizar Tipos de Cambio Manual (Fallback)
**Actor Principal**: Administrador
**Precondición**: API de conversión no funciona o viaje es internacional
**Flujo Principal**:
1. Admin abre "Configuración del Viaje"
2. Toca "Tipos de Cambio"
3. Actualiza valores manuales:
   - 1 USD = X ARS
   - 1 CLP = X ARS
4. Pueden actualizar en cualquier momento (ej: si cambio el dólar durante el viaje)
5. Sistema avisa: "Al cambiar tipos de cambio, se recalcularán todos los gastos"
6. Confirmación → Todos los gastos se recalculan automáticamente

**Postcondición**: Tipos de cambio actualizados, gastos recalculados

---

## 6. GESTIÓN DE SUBGRUPOS

### CU-033: Crear Subgrupo Familiar/Temático
**Actor Principal**: Administrador
**Precondición**: Viaje es de tipo "Familia" o "Amigos" con múltiples miembros
**Flujo Principal**:
1. Admin abre "Miembros"
2. Toca "+ Crear Subgrupo"
3. Ingresa:
   - Nombre del subgrupo (ej: "Familia Gómez Pérez")
   - Descripción (opcional)
4. Selecciona miembros para el subgrupo (mín 1, máx 15 para subgrupos anidados)
5. Asigna representante del subgrupo (quien gestiona pagos internos)
6. Sistema valida que un miembro no esté en 2 subgrupos (ej: Ana está en Gómez Pérez, no puede estar en Patiño)
7. Sistema crea subgrupo con estado "Activo"
8. Notifica a miembros: "Fuiste asignado al subgrupo X"

**Postcondición**: Subgrupo creado, miembros asignados

---

### CU-034: Editar Subgrupo (Agregar/Remover Miembros)
**Actor Principal**: Administrador / Representante del Subgrupo
**Precondición**: Subgrupo existe (CU-033)
**Flujo Principal**:
1. Admin/Representante selecciona subgrupo
2. Toca "Editar"
3. Opciones:
   - **Agregar Miembro**: Solo si no está en otro subgrupo
   - **Remover Miembro**: Solo si no tiene deudas dentro del subgrupo
4. Si hay deudas internas (ej: Diego debe 2k a Jorge dentro del subgrupo):
   - Sistema rechaza remoción: "Diego tiene deuda interna pendiente"
5. Si cambio de representante: Notifica al nuevo
6. Sistema audita cambios

**Postcondición**: Subgrupo actualizado, membresía modificada

---

### CU-035: Eliminar Subgrupo
**Actor Principal**: Administrador
**Precondición**: Subgrupo existe (CU-033)
**Flujo Principal**:
1. Admin toca "Eliminar Subgrupo"
2. Sistema valida:
   - **Si el subgrupo NO tiene deudas internas**: Se puede eliminar
     - Miembros quedan en grupo general
   - **Si el subgrupo SÍ tiene deudas**: Se rechaza con "Resuelve deudas internas primero"
3. Si se puede eliminar: Confirmación → Subgrupo eliminado, miembros redistribuidos

**Postcondición**: Subgrupo eliminado o rechazo de operación

---

## 7. GESTIÓN DE MENORES DE EDAD

### CU-036: Registrar Menor en Viaje
**Actor Principal**: Administrador / Responsable Legal
**Precondición**: Viaje creado, admin quiere invitar a un menor
**Flujo Principal**:
1. Admin abre "Invitar Miembros"
2. Selecciona contacto
3. Sistema detecta/advierte: "¿Este es un menor de edad?"
4. Admin responde SÍ
5. Ingresa:
   - Edad del menor (ej: 15 años)
   - Responsable legal (selecciona de miembros del viaje)
   - Autorización/Consentimiento (checkbox)
6. Sistema marca al menor con etiqueta especial
7. Sistema asigna permisos:
   - Puede crear gastos personales
   - Puede ver gastos generales
   - NO puede modificar cronograma/alojamientos
   - Responsable legal recibe notificaciones de gastos del menor
8. Sistema envía invitación diferenciada (puede usar email de responsable)

**Postcondición**: Menor registrado con responsable, permisos limitados

---

### CU-037: Visualizar Gastos del Menor (Responsable Legal)
**Actor Principal**: Responsable Legal del Menor
**Precondición**: Menor registrado en viaje (CU-036)
**Flujo Principal**:
1. Responsable abre el viaje
2. En sección "Miembros", ve al menor con etiqueta especial
3. Toca sobre el menor → "Ver Detalles"
4. Ve:
   - Gastos personales del menor (todos)
   - Gastos compartidos donde el menor participó
   - Deudas del menor
   - Créditos del menor
5. Puede editar gastos del menor si es necesario
6. Recibe notificaciones en tiempo real de nuevos gastos

**Postcondición**: Responsable tiene visibilidad total sobre finanzas del menor

---

### CU-038: Limitar Gastos del Menor
**Actor Principal**: Responsable Legal
**Precondición**: Menor registrado (CU-036)
**Flujo Principal**:
1. Responsable abre opciones del menor
2. Puede establecer:
   - **Presupuesto máximo personal**: (ej: $50.000 por día)
   - Sistema bloquea nuevos gastos personales si se alcanza el límite
3. Puede también:
   - Ver historial de gastos del menor
   - Marcar gastos como "validados"

**Postcondición**: Límites de gasto configurados para el menor

---

## 8. NOTIFICACIONES Y COMUNICACIONES

### CU-039: Configurar Canales de Notificación
**Actor Principal**: Administrador
**Precondición**: Viaje creado
**Flujo Principal**:
1. Admin abre "Configuración" → "Notificaciones"
2. Por cada tipo de evento (pago vencido, cambio cronograma, nuevo gasto), puede:
   - Enviar a: Todos / Grupo Específico / Administradores
   - Canales: Push Notification / Email / WhatsApp
   - Mensaje: Predeterminado o personalizado
3. Ejemplo:
   - Evento: "Nuevo Gasto Registrado"
   - Enviar a: Todos
   - Canales: Push + Email
   - Mensaje: "¡Nuevo gasto registrado! Revisa los detalles en la app"
4. Sistema guarda configuración

**Postcondición**: Canales de notificación configurados

---

### CU-040: Enviar Notificación de Pago Pendiente
**Actor Principal**: Sistema (automático) / Administrador Manual
**Precondición**: Deuda existe y está próxima a vencer (ej: a 2 días del viaje)
**Flujo Principal**:
1. Sistema detecta: Viaje comienza en 2 días, hay pagos pendientes
2. Sistema auto-genera notificación:
   - "Hey! Ya hay que pagar el alojamiento de Villa Traful"
   - O notificación personalizada del admin
3. Envía a: Quién debe pagar (según configuración)
4. Canales: Push (si app instalada) → Email (si no lee push en 2 horas)
5. Sistema incluye link directo a deuda en app

**Postcondición**: Notificación enviada, miembros recordados

---

### CU-041: Notificar Cambio en Cascada de Cronograma
**Actor Principal**: Sistema (automático)
**Precondición**: Admin edita franja que causa cascada (CU-013)
**Flujo Principal**:
1. Admin extiende estadía en Villa Traful: Fin original 10/01 → Nueva fin 11/01
2. Sistema detecta:
   - Franja siguiente (Bariloche) se corre: 10/01 → 11/01
3. Sistema genera notificación automática:
   - "Admin cambió fecha de Villa Traful. Bariloche ahora comienza el 12/01"
4. Envía a: Todos los miembros
5. Adjunta: Lista de cambios aplicados

**Postcondición**: Todos notificados de cambios en cascada

---

### CU-042: Notificar Retiro de Miembro
**Actor Principal**: Sistema (automático)
**Precondición**: Miembro se retira del viaje (CU-010)
**Flujo Principal**:
1. Miembro X se retira
2. Sistema genera notificación a admins:
   - "María se retira del viaje. Su deuda: $5000 a Ana"
3. Si es caso pausado (CU-030):
   - "María se pausa. Eligió opción generosa/estricta"
4. Otros miembros reciben: "María ya no participa del viaje"

**Postcondición**: Admins y miembros notificados

---

## 9. REPORTES Y AUDITORÍA

### CU-043: Generar Reporte de Gastos Individual
**Actor Principal**: Cualquier Miembro
**Precondición**: Viaje finalizó o en curso
**Flujo Principal**:
1. Miembro abre "Reportes"
2. Selecciona: "Mi Resumen de Gastos"
3. Sistema genera:
   - **Gastos personales totales**: $X.XXX
   - **Gastos compartidos en los que participé**: $Y.YYY
   - **Deuda total**: $Z.ZZZ
   - **Crédito total**: $W.WWW
   - **Balance final**: (W - Z)
4. Desglose por categoría: Comida / Transporte / Alojamiento / Entradas / Otros
5. Si es internacional: Moneda original + equivalencia en ARS
6. Opción: Descargar como PDF

**Postcondición**: Reporte generado, usuario puede descargar

---

### CU-044: Generar Reporte de Gastos Completo del Viaje
**Actor Principal**: Administrador
**Precondición**: Viaje en curso o finalizado
**Flujo Principal**:
1. Admin abre "Reportes"
2. Selecciona: "Reporte Completo"
3. Sistema genera documento que incluye:
   - **Resumen del viaje**: Nombre, período, miembros
   - **Gastos por categoría**: Comida, Transporte, Alojamiento, Entradas, Otros
   - **Gastos por miembro**: Quién pagó qué
   - **Deudas finales**: Matriz de "Quién debe a quién"
   - **Subgrupos**: Gastos internos por subgrupo
   - **Cambios realizados**: Auditoría de modificaciones (admin, fecha, qué cambió)
4. Si es internacional: Tabla en 3 monedas (ARS, CLP, USD)
5. Opciones: Descargar como PDF / Excel / Compartir por email

**Postcondición**: Reporte completo generado, descargas posibles

---

### CU-045: Generar Reporte de Liquidación Final
**Actor Principal**: Administrador
**Precondición**: Viaje finalizó
**Flujo Principal**:
1. Admin abre "Reportes"
2. Selecciona: "Liquidación Final"
3. Sistema genera:
   - **Tabla de deudas**: Quién debe a quién (matriz)
   - **Instrucciones de pago**: "Ana debe transferir $5000 a Laura"
   - **Historial de pagos confirmados**: Quién pagó y cuándo
   - **Gastos no saldados**: Si hay deudas pendientes
   - **Información bancaria solicitada**: Si usuarios compartieron CBU (opcional)
4. Formato: PDF, Excel, o vista en app
5. Opción: Enviar por email a todos los miembros

**Postcondición**: Liquidación final disponible, descargable

---

### CU-046: Ver Auditoría de Cambios
**Actor Principal**: Administrador
**Precondición**: Viaje en curso
**Flujo Principal**:
1. Admin abre "Configuración" → "Auditoría"
2. Ve historial cronológico:
   - Fecha/Hora del cambio
   - Usuario que hizo el cambio
   - Tipo de cambio (ej: "Franja editada", "Gasto creado", "Miembro removido")
   - Detalles: Qué cambió (antes → después)
3. Puede filtrar por:
   - Tipo de evento
   - Usuario
   - Rango de fechas
4. Ejemplo: "12/10/2025 10:30 - Admin editó franja 'Villa Traful': Fin 10/01 → 11/01"

**Postcondición**: Auditoría visualizada

---

## 10. GESTIÓN DE CUENTA Y PERFIL

### CU-047: Editar Perfil de Usuario
**Actor Principal**: Usuario Autenticado
**Precondición**: Usuario logueado
**Flujo Principal**:
1. Usuario abre "Perfil"
2. Puede editar:
   - Nombre
   - Avatar
   - Email
   - Teléfono (re-validación)
   - Información bancaria (CBU argentina, para recibir transferencias)
3. Sistema guarda cambios
4. Si cambia email/teléfono: Re-validación requerida

**Postcondición**: Perfil actualizado

---

### CU-048: Solicitar Eliminación de Cuenta
**Actor Principal**: Usuario Autenticado
**Precondición**: Usuario logueado
**Flujo Principal**:
1. Usuario abre "Perfil" → "Configuración Avanzada"
2. Toca "Eliminar Mi Cuenta"
3. Sistema valida:
   - **Si el usuario es miembro de viajes activos**: Sistema rechaza con "No puedes eliminar tu cuenta si eres miembro de viajes activos"
   - **Si el usuario es admin principal de un viaje**: Sistema rechaza con "Debes transferir administración antes"
4. Si puede: Confirmación + ingresa contraseña
5. Cuenta eliminada junto con datos personales
6. Pero gastos/deudas del usuario quedan en los viajes (anónimos)

**Postcondición**: Cuenta eliminada o rechazo

---

### CU-049: Configurar Preferencias de Privacidad
**Actor Principal**: Usuario Autenticado
**Precondición**: Usuario logueado
**Flujo Principal**:
1. Usuario abre "Perfil" → "Privacidad"
2. Opciones:
   - Ver mi información bancaria: Solo yo / Admins del viaje / Nadie
   - Notificaciones: Todos los eventos / Solo relevantes / Ninguna
   - Historial: Visible para todos / Solo admins / Solo yo
3. Sistema guarda preferencias por usuario

**Postcondición**: Preferencias de privacidad guardadas

---

## 11. SINCRONIZACIÓN OFFLINE

### CU-050: Sincronización Offline - Visualización
**Actor Principal**: Usuario sin conexión a internet
**Precondición**: Usuario está offline, viaje descargado previamente
**Flujo Principal**:
1. Usuario abre app sin conexión
2. App detecta offline, muestra icono en header
3. Usuario PUEDE:
   - Ver cronograma (información local)
   - Ver gastos (información local)
   - Ver miembros
   - Ver alojamientos
4. Usuario NO PUEDE:
   - Crear gastos nuevos
   - Editar gastos
   - Cambiar cronograma
   - Invitar miembros
5. Interfaz muestra: "Sin conexión - Visualización solo lectura"

**Postcondición**: App accesible en modo offline, lectura solamente

---

### CU-051: Sincronización Offline - Cola de Cambios
**Actor Principal**: Usuario que intenta cambios offline
**Precondición**: Usuario sin conexión, intenta crear/editar datos
**Flujo Principal**:
1. Usuario intenta crear un gasto sin conexión
2. Sistema muestra: "Sin conexión - Cambios se sincronizarán cuando regreses online"
3. Sistema RECHAZA la acción
4. Cuando usuario reconecta:
   - Sistema sincroniza automáticamente
   - Notifica: "Conexión restaurada. Sincronizando datos..."
   - Si hay conflictos (2 usuarios editaron lo mismo): Sistema muestra opción para elegir versión

**Postcondición**: Usuario informado, cambios sincronizados al conectar

---

## 12. ELIMINACIÓN AUTOMÁTICA DE DATOS

### CU-052: Eliminar Datos Post-Viaje (1 Año)
**Actor Principal**: Sistema (automático)
**Precondición**: Viaje finalizó hace 1 año
**Flujo Principal**:
1. Sistema ejecuta rutina cada mes
2. Busca viajes que finalizaron hace 365+ días
3. Para cada viaje encontrado:
   - Notifica a admin principal: "Tu viaje será eliminado en 7 días"
   - Admin puede hacer backup/descargar reportes
4. Después de 7 días: Viaje y todos sus datos se eliminan permanentemente
5. EXCEPTO: Datos de transacciones monetarias se guardan (compliance) por 3 años

**Postcondición**: Datos antiguos eliminados, información legal preservada

---

## RESUMEN DE RELACIONES ENTRE CASOS DE USO

```
CU-005 (Crear Viaje)
├─ CU-006 (Invitar Miembros)
│  ├─ CU-007 (Aceptar Invitación)
│  └─ CU-036 (Registrar Menor)
│
├─ CU-012 (Crear Cronograma)
│  ├─ CU-013 (Crear Franja)
│  │  └─ CU-015 (Crear Actividad)
│  │     └─ CU-016 (Editar Actividad)
│  └─ CU-019 (Registrar Alojamiento)
│
├─ CU-023 a CU-027 (Gestión Gastos)
│  ├─ CU-024 (Gasto Compartido)
│  ├─ CU-033 (Crear Subgrupo)
│  │  └─ CU-025 (Gasto Privado Subgrupo)
│  └─ CU-028 (Confirmar Pago)
│
├─ CU-009 (Gestionar Miembros/Roles)
│  ├─ CU-010 (Abandonar Viaje)
│  └─ CU-029/CU-030 (Retiro + Liquidación)
│
└─ CU-043 a CU-046 (Reportes)

CU-039 a CU-042 (Notificaciones - Transversales)
CU-050 a CU-051 (Sincronización Offline)
```

---

## Puntos clave del documento:

- Gestión de Usuarios: Autenticación multi-canal (Google, Facebook, Teléfono)
- Viajes y Miembros: Creación, invitaciones, roles jerárquicos
- Cronograma: Franjas con cascada automática, actividades, días intermedios
- Alojamientos: Estados de pago (no pagado, pagado, parcial)
- Finanzas: Gastos individuales, compartidos, subgrupos privados
- Gastos Complejos: Referencia padre-hijo para diferencias, divisiones inteligentes
- Menores: Registro, responsable legal, límites de presupuesto
- Retiros: Liquidación automática, casos de generosidad
- Monedas: Conversión automática ARS/CLP/USD
- Notificaciones: Configurables por admin, multi-canal
- Reportes: Individual, completo, liquidación final
- Offline: Sincronización automática, detección de conflictos
- Auditoría: Registro de todos los cambios
- Eliminación: Datos borrados después de 1 año