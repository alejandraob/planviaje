* Puntos Clave de la Arquitectura
- Tablas Más Complejas:

- GASTOS + GASTOS_SUBGRUPO + DEUDAS + DEUDAS_SUBGRUPO

- Maneja divisiones inteligentes con subgrupos
- Gastos padre-hijo (diferencias de tickets)
- Deudas cascada (quién le debe a quién)


* MIEMBROS_VIAJE

- Rol jerárquico (admin principal → admin secundario → miembro)
- Menores con responsable legal
- Estados: activo / pausado / retirado


* FRANJAS + ACTIVIDADES

- Cascada automática cuando se edita fecha fin
- Detección de días intermedios sin asignar
- Edición solo a futuro si viaje comenzó


* AUDITORIA

- Registro de TODOS los cambios (quién, qué, cuándo)
- Estado anterior vs estado nuevo en JSON
- Necesario para compliance y debugging



## Relaciones Críticas:
VIAJES
├── MIEMBROS_VIAJE (con roles jerárquicos)
│   ├── SUBGRUPO_MIEMBROS (múltiples subgrupos por miembro)
│   │   └── DEUDAS_SUBGRUPO
│   └── GASTOS → DEUDAS (grupo general)
├── FRANJAS (con cascada automática)
│   ├── ACTIVIDADES
│   └── ALOJAMIENTOS
├── GASTOS (grupo general, algunos con referencia padre-hijo)
├── DEUDAS (quién le debe a quién)
│   └── PAGOS (confirmación de pago)
└── NOTIFICACIONES + AUDITORIA (transversales)

1. Respuestas Consistentes
Todos los endpoints responden en el mismo formato (success, data, error, timestamp)
2. Transacciones Atómicas
Crear gasto = crear registro + calcular deudas + notificar (todo o nada)
3. Divisiones Inteligentes
Si hay subgrupos, el sistema calcula automáticamente cuánto debe cada uno
4. Cascada Automática
Editar fecha de franja → se corren todas las franjas siguientes automáticamente
5. Offline-First
Datos cacheados localmente, sincronización cuando hay conexión