- SendGrid (Firebase Email o Nodemailer gratis)
- APIs complejas (todo es simple y gratuito)

**Lo que SÍ necesitas**:
- Firebase (autenticación + realtime + storage)
- Mercado Pago (pagos)
- Cloudinary (almacenamiento de fotos)
- ExchangeRate-API (tipos de cambio)

Todo GRATIS para fase MVP.# Estructura de Proyecto Backend y Frontend

## 📁 ESTRUCTURA COMPLETA DEL PROYECTO

```
plan-viaje/
├── backend/                    # Servidor Node.js + Express
├── frontend/                   # React Web
├── mobile/                     # React Native (futuro)
└── docs/                       # Documentación
```

---

## 🖥️ BACKEND - ESTRUCTURA DETALLADA

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Conexión PostgreSQL + Sequelize
│   │   ├── firebase.js         # Firebase Admin config
│   │   ├── environment.js      # Variables de entorno
│   │   └── constants.js        # Constantes globales
│   │
│   ├── models/                 # Modelos Sequelize (ORM)
│   │   ├── User.js             # Tabla: USUARIOS
│   │   ├── Viaje.js            # Tabla: VIAJES
│   │   ├── MiembroViaje.js     # Tabla: MIEMBROS_VIAJE
│   │   ├── Gasto.js            # Tabla: GASTOS
│   │   ├── Deuda.js            # Tabla: DEUDAS
│   │   ├── Franja.js           # Tabla: FRANJAS
│   │   ├── Alojamiento.js      # Tabla: ALOJAMIENTOS
│   │   ├── Actividad.js        # Tabla: ACTIVIDADES
│   │   ├── Subgrupo.js         # Tabla: SUBGRUPOS
│   │   ├── Pago.js             # Tabla: PAGOS
│   │   ├── Notificacion.js     # Tabla: NOTIFICACIONES
│   │   ├── Auditoria.js        # Tabla: AUDITORIA
│   │   └── index.js            # Exporta todos los modelos
│   │
│   ├── routes/                 # Rutas API
│   │   ├── auth.routes.js      # POST /auth/register, /login, etc
│   │   ├── usuarios.routes.js  # GET /usuarios/{id}, PATCH /usuarios/{id}
│   │   ├── viajes.routes.js    # CRUD /viajes
│   │   ├── miembros.routes.js  # CRUD /viajes/{id}/miembros
│   │   ├── gastos.routes.js    # CRUD /viajes/{id}/gastos
│   │   ├── deudas.routes.js    # GET /viajes/{id}/deudas, POST /pagos
│   │   ├── franjas.routes.js   # CRUD /viajes/{id}/franjas
│   │   ├── alojamientos.routes.js
│   │   ├── actividades.routes.js
│   │   ├── subgrupos.routes.js
│   │   ├── notificaciones.routes.js
│   │   ├── reportes.routes.js
│   │   └── index.js            # Importa todas las rutas
│   │
│   ├── controllers/            # Controladores (lógica de endpoints)
│   │   ├── authController.js
│   │   │   ├── register()
│   │   │   ├── login()
│   │   │   ├── sendOtp()
│   │   │   ├── verifyOtp()
│   │   │   └── logout()
│   │   │
│   │   ├── viajesController.js
│   │   │   ├── crearViaje()
│   │   │   ├── obtenerViaje()
│   │   │   ├── editarViaje()
│   │   │   ├── eliminarViaje()
│   │   │   └── listarMisViajes()
│   │   │
│   │   ├── gastosController.js
│   │   │   ├── crearGasto()
│   │   │   ├── editarGasto()
│   │   │   ├── obtenerGastos()
│   │   │   ├── crearGastoHijo()
│   │   │   └── eliminarGasto()
│   │   │
│   │   ├── deudasController.js
│   │   │   ├── obtenerDeudas()
│   │   │   ├── registrarPago()
│   │   │   ├── confirmarPago()
│   │   │   └── rechazarPago()
│   │   │
│   │   ├── miembrosController.js
│   │   ├── franjasController.js
│   │   ├── alojamientosController.js
│   │   ├── actividadesController.js
│   │   ├── subgruposController.js
│   │   ├── reportesController.js
│   │   └── notificacionesController.js
│   │
│   ├── services/               # Lógica de negocio compleja
│   │   ├── gastosService.js
│   │   │   ├── generarDeudas()      # Calcula divisiones inteligentes
│   │   │   ├── recalcularDeudas()
│   │   │   └── calcularDivisionPorSubgrupos()
│   │   │
│   │   ├── deudasService.js
│   │   │   ├── liquidarMiembro()
│   │   │   ├── calcularBalance()
│   │   │   └── obtenerMatrizDeudas()
│   │   │
│   │   ├── franjasService.js
│   │   │   ├── aplicarCascada()     # Extiende franjas siguientes
│   │   │   ├── detectarDiasIntermedios()
│   │   │   └── validarFechas()
│   │   │
│   │   ├── miembrosService.js
│   │   │   ├── verificarRetiro()
│   │   │   ├── asignarNuevoAdmin()
│   │   │   └── retirarMiembro()
│   │   │
│   │   ├── reportesService.js
│   │   │   ├── generarPDF()
│   │   │   ├── generarExcel()
│   │   │   └── generarLiquidacion()
│   │   │
│   │   ├── notificacionesService.js
│   │   │   ├── enviarNotificacion()
│   │   │   └── enviarPorCanales()
│   │   │
│   │   ├── cambiosMonedaService.js
│   │   │   ├── obtenerTasas()
│   │   │   └── convertir()
│   │   │
│   │   └── firebaseService.js
│   │       ├── crearUsuario()
│   │       ├── enviarOtp()
│   │       └── verificarToken()
│   │
│   ├── middleware/             # Middleware (funciones intermedias)
│   │   ├── auth.js             # Verificar JWT token
│   │   ├── errorHandler.js     # Manejo de errores
│   │   ├── validations.js      # Validar datos con Joi
│   │   ├── cors.js             # CORS configurado
│   │   ├── rateLimit.js        # Rate limiting
│   │   ├── logger.js           # Logging de requests
│   │   └── notFound.js         # 404 handler
│   │
│   ├── utils/                  # Funciones utilitarias
│   │   ├── jwt.js              # Crear/verificar JWT
│   │   ├── bcrypt.js           # Hash de contraseñas
│   │   ├── validators.js       # Validaciones custom
│   │   ├── formatters.js       # Formatear respuestas
│   │   ├── errors.js           # Clases de error personalizadas
│   │   └── logger.js           # Winston logger
│   │
│   ├── migrations/             # Migraciones Sequelize (crear tablas)
│   │   ├── 20240101-create-users.js
│   │   ├── 20240102-create-viajes.js
│   │   ├── 20240103-create-gastos.js
│   │   └── ...
│   │
│   ├── seeders/                # Datos de prueba
│   │   ├── 20240101-seed-users.js
│   │   └── 20240102-seed-viajes.js
│   │
│   └── app.js                  # Instancia principal de Express
│
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js                   # Punto de entrada (npm start)
├── .sequelizerc                # Config de Sequelize CLI
└── README.md
```

---

## 📱 FRONTEND - ESTRUCTURA DETALLADA

```
frontend/
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── OtpInput.tsx
│   │   │
│   │   ├── Viajes/
│   │   │   ├── ViajCard.tsx
│   │   │   ├── ViajList.tsx
│   │   │   ├── ViajForm.tsx
│   │   │   └── ViajHeader.tsx
│   │   │
│   │   ├── Gastos/
│   │   │   ├── GastoForm.tsx
│   │   │   ├── GastoList.tsx
│   │   │   ├── GastoCard.tsx
│   │   │   └── GastosFilters.tsx
│   │   │
│   │   ├── Deudas/
│   │   │   ├── DeudasTable.tsx
│   │   │   ├── PagoForm.tsx
│   │   │   └── LiquidacionFinal.tsx
│   │   │
│   │   ├── Cronograma/
│   │   │   ├── FranjaCard.tsx
│   │   │   ├── FranjaForm.tsx
│   │   │   ├── ActividadCard.tsx
│   │   │   └── Cronograma.tsx
│   │   │
│   │   ├── Miembros/
│   │   │   ├── InvitarMiembros.tsx
│   │   │   ├── MiembrosList.tsx
│   │   │   └── MiembroCard.tsx
│   │   │
│   │   ├── Common/
│   │   │   ├── Header.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   └── Layout/
│   │       ├── MainLayout.tsx
│   │       ├── AuthLayout.tsx
│   │       └── DashboardLayout.tsx
│   │
│   ├── pages/                  # Páginas (se mapean a rutas)
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── OtpVerify.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx   # Lista de viajes
│   │   │
│   │   ├── viajes/
│   │   │   ├── CrearViaje.tsx
│   │   │   ├── ViajDetalle.tsx
│   │   │   ├── InvitarMiembros.tsx
│   │   │   └── ConfiguracionViaje.tsx
│   │   │
│   │   ├── gastos/
│   │   │   ├── CrearGasto.tsx
│   │   │   ├── ListaGastos.tsx
│   │   │   └── DetalleGasto.tsx
│   │   │
│   │   ├── deudas/
│   │   │   ├── DeudasPago.tsx
│   │   │   └── ReporteLiquidacion.tsx
│   │   │
│   │   ├── cronograma/
│   │   │   └── CronogramaPage.tsx
│   │   │
│   │   ├── reportes/
│   │   │   └── ReportesPage.tsx
│   │   │
│   │   ├── perfil/
│   │   │   └── PerfilUsuario.tsx
│   │   │
│   │   └── notfound/
│   │       └── NotFound.tsx
│   │
│   ├── hooks/                  # Hooks personalizados React
│   │   ├── useAuth.ts          # Autenticación
│   │   ├── useGastos.ts        # Llamadas a gastos API
│   │   ├── useDeudas.ts        # Llamadas a deudas API
│   │   ├── useViajes.ts        # Llamadas a viajes API
│   │   ├── useFetch.ts         # Fetch genérico
│   │   └── useLocalStorage.ts  # Local storage
│   │
│   ├── services/               # Servicios (llamadas a API)
│   │   ├── api.ts              # Instancia de axios configurada
│   │   ├── authService.ts
│   │   │   ├── register()
│   │   │   ├── login()
│   │   │   ├── logout()
│   │   │   └── sendOtp()
│   │   │
│   │   ├── viajesService.ts
│   │   │   ├── crearViaje()
│   │   │   ├── obtenerViaje()
│   │   │   ├── listarViajes()
│   │   │   └── editarViaje()
│   │   │
│   │   ├── gastosService.ts
│   │   │   ├── crearGasto()
│   │   │   ├── obtenerGastos()
│   │   │   ├── editarGasto()
│   │   │   └── eliminarGasto()
│   │   │
│   │   ├── deudasService.ts
│   │   │   ├── obtenerDeudas()
│   │   │   ├── registrarPago()
│   │   │   └── confirmarPago()
│   │   │
│   │   ├── reportesService.ts
│   │   │   ├── generarPDF()
│   │   │   └── generarExcel()
│   │   │
│   │   └── notificacionesService.ts
│   │
│   ├── store/                  # Estado global (Zustand)
│   │   ├── authStore.ts        # Estado de autenticación
│   │   ├── viajeStore.ts       # Estado del viaje actual
│   │   ├── gastosStore.ts      # Estado de gastos
│   │   ├── notificacionesStore.ts
│   │   └── uiStore.ts          # Estado de UI (modales, etc)
│   │
│   ├── types/                  # Tipos TypeScript
│   │   ├── auth.ts             # Tipos: User, AuthResponse
│   │   ├── viajes.ts           # Tipos: Viaje, Franja
│   │   ├── gastos.ts           # Tipos: Gasto, Deuda
│   │   ├── api.ts              # Tipos: ApiResponse
│   │   └── index.ts            # Exporta todos
│   │
│   ├── utils/                  # Funciones utilitarias
│   │   ├── formatters.ts       # Formatear moneda, fechas
│   │   ├── validators.ts       # Validar datos
│   │   ├── localStorage.ts     # Manejo de local storage
│   │   ├── errorHandler.ts     # Manejo de errores
│   │   └── constants.ts        # Constantes (URLs, etc)
│   │
│   ├── styles/                 # Estilos globales
│   │   ├── index.css           # Estilos globales
│   │   ├── tailwind.config.js  # Configuración Tailwind
│   │   └── theme.ts            # Variables de tema
│   │
│   ├── App.tsx                 # Componente raíz
│   ├── main.tsx                # Punto de entrada React
│   ├── App.css
│   └── index.html              # HTML base
│
├── public/                     # Archivos estáticos
│   ├── logo.png
│   ├── favicon.ico
│   └── manifest.json
│
├── .env                        # Variables de entorno
├── .env.example
├── .gitignore
├── tsconfig.json               # Configuración TypeScript
├── vite.config.ts              # Configuración Vite
├── tailwind.config.js          # Configuración Tailwind
├── postcss.config.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔄 FLUJO DE DATOS: FRONTEND ↔ BACKEND

### Ejemplo: Crear Gasto

```typescript
// FRONTEND - Componente React
// src/pages/gastos/CrearGasto.tsx

import { useGastos } from '../../hooks/useGastos';

export const CrearGasto = ({ idViaje }: Props) => {
  const { crearGasto, loading } = useGastos(idViaje);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevoGasto = {
      descripcion: 'Cena en restaurante',
      monto_ars: 250000,
      categoria: 'comida',
      tipo_gasto: 'grupal',
      id_usuario_pagador: 1,
      fecha: '2026-01-06'
    };

    // Llama al servicio que hace la llamada HTTP
    await crearGasto(nuevoGasto);
  };

  return <form onSubmit={handleSubmit}>...</form>;
};

// ──────────────────────────────────────────────────

// FRONTEND - Hook personalizado
// src/hooks/useGastos.ts

import { useState } from 'react';
import { gastosService } from '../services/gastosService';

export const useGastos = (idViaje: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearGasto = async (gasto) => {
    setLoading(true);
    try {
      // Llama al servicio
      const response = await gastosService.crearGasto(idViaje, gasto);
      console.log('Gasto creado:', response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { crearGasto, loading, error };
};

// ──────────────────────────────────────────────────

// FRONTEND - Servicio (llamada HTTP)
// src/services/gastosService.ts

import api from './api';

export const gastosService = {
  crearGasto: async (idViaje: number, gasto) => {
    // POST http://localhost:3001/api/viajes/123/gastos
    const response = await api.post(
      `/viajes/${idViaje}/gastos`,
      gasto
    );
    return response.data;
  },

  obtenerGastos: async (idViaje: number) => {
    // GET http://localhost:3001/api/viajes/123/gastos
    const response = await api.get(`/viajes/${idViaje}/gastos`);
    return response.data;
  }
};

// ──────────────────────────────────────────────────

// BACKEND - Ruta
// backend/src/routes/gastos.routes.js

const router = require('express').Router();
const { crearGasto } = require('../controllers/gastosController');
const { auth } = require('../middleware/auth');

// POST /api/viajes/:idViaje/gastos
router.post('/:idViaje/gastos', auth, crearGasto);

module.exports = router;

// ──────────────────────────────────────────────────

// BACKEND - Controlador
// backend/src/controllers/gastosController.js

const { Gasto } = require('../models');
const gastosService = require('../services/gastosService');

const crearGasto = async (req, res) => {
  try {
    const { idViaje } = req.params;
    const { descripcion, monto_ars, categoria, tipo_gasto } = req.body;
    const userId = req.user.id;  // Del JWT

    // Validación
    if (!monto_ars || monto_ars <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto debe ser mayor a 0'
      });
    }

    // Crear gasto en BD
    const gasto = await Gasto.create({
      id_viaje: idViaje,
      id_usuario_pagador: userId,
      descripcion,
      monto_ars,
      categoria,
      tipo_gasto
    });

    // Llamar al servicio para generar deudas
    await gastosService.generarDeudas(idViaje, gasto.id_gasto, monto_ars);

    // Responder al frontend
    res.status(201).json({
      success: true,
      data: gasto,
      message: 'Gasto creado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { crearGasto };

// ──────────────────────────────────────────────────

// BACKEND - Servicio (lógica compleja)
// backend/src/services/gastosService.js

const { Deuda, MiembroViaje, Subgrupo } = require('../models');

const generarDeudas = async (idViaje, idGasto, montoTotal) => {
  // Obtener todos los miembros del viaje
  const miembros = await MiembroViaje.findAll({
    where: { id_viaje: idViaje, estado_participacion: 'activo' }
  });

  // Calcular división por subgrupos
  const divisiones = await calcularDivisiones(miembros);
  
  // Crear deudas para cada miembro
  const deudas = [];
  for (const { idMiembro, montoPaga } of divisiones) {
    const deuda = await Deuda.create({
      id_viaje: idViaje,
      id_gasto: idGasto,
      id_acreedor: 1, // quien pagó
      id_deudor: idMiembro,
      monto_ars: montoPaga,
      estado_deuda: 'pendiente'
    });
    deudas.push(deuda);
  }

  return deudas;
};

module.exports = { generarDeudas };
```

---

## 📡 SOBRE LAS APIS EXTERNAS (Google Key, etc)

### ¿QUÉ APIs NECESITAS? (MUY IMPORTANTE LEER)

#### 1. **AUTENTICACIÓN - Firebase (GRATIS)**
```
NO necesitas Google Key
Firebase ya maneja:
✅ Email + Contraseña
✅ Google OAuth (integrado)
✅ Facebook OAuth (integrado)
✅ SMS/OTP para teléfono
✅ Tokens JWT automáticos

Setup en Firebase Console:
- Ir a console.firebase.google.com
- Crear proyecto "plan-viaje"
- Ir a Authentication
- Habilitar: Email, Google, Facebook, Phone
- Descargar credenciales JSON
- Usar en backend con firebase-admin SDK
```

#### 2. **TIPOS DE CAMBIO - ExchangeRate-API (GRATIS)**
```
API: https://api.exchangerate-api.com
Límite: 1500 requests/mes (gratis)
NO necesita key para requests básicos

Alternativas:
- Fixer.io (requiere clave)
- Exchangerate-api.com (1 clave gratis)
- O ingreso manual en app

Ejemplo:
GET https://api.exchangerate-api.com/v4/latest/ARS
→ Retorna tasas ARS a otras monedas
```

#### 3. **PAGOS - Mercado Pago (GRATIS)**
```
API: https://www.mercadopago.com.ar
Requiere: Cuenta en Mercado Pago + credenciales

Setup:
1. Crear cuenta en mercadopago.com.ar
2. Ir a "Credenciales" en Settings
3. Copiar: Access Token y Public Key
4. Usar en backend: npm install mercadopago
5. Uso para generar links de pago

El SDK se usa SOLO en backend
NO necesita ir al frontend (por seguridad)
```

#### 4. **NOTIFICACIONES - Firebase Cloud Messaging (GRATIS)**
```
NO necesitas clave extra
Ya está en Firebase

Para push:
1. Frontend: Firebase Messaging SDK
2. Backend: Firebase Admin SDK
3. Automático con tu proyecto Firebase
```

#### 5. **ALMACENAMIENTO - Google Cloud Storage (PAGO)**
```
Opción A: Google Cloud Storage
- Primeros 5GB gratis
- Luego: $0.020 por GB

Opción B: Usar Firebase Storage (INCLUIDO)
- Primeros 1GB gratis
- Luego: $0.18 por GB

Opción C: Usar Cloudinary (MÁS FÁCIL)
- Plan gratis: 10GB
- No requiere tarjeta
- URL: cloudinary.com
- Libre para proyectos pequeños
```

#### 6. **EMAILS - SendGrid (GRATIS)**
```
Plan gratis: 100 emails/día
Para mayor volumen: plan pago

O usar Firebase Email (más simple)
```

---

## 🔑 CUÁLES SON LOS .ENV QUE NECESITAS

### Backend (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plan_viaje
DB_USER=postgres
DB_PASSWORD=tucontraseña

# Firebase
FIREBASE_PROJECT_ID=plan-viaje-xxx
FIREBASE_PRIVATE_KEY=ey...
FIREBASE_CLIENT_EMAIL=firebase-...@...iam.gserviceaccount.com

# JWT
JWT_SECRET=tusecreto_muy_largo_y_seguro_aqui

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_...

# ExchangeRate API
EXCHANGERATE_API_KEY=xxx (opcional, si usas plan pago)

# Firebase Storage / Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Twilio (para SMS, opcional)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# SendGrid (para emails)
SENDGRID_API_KEY=xxx

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```bash
# APIs
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=plan-viaje-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plan-viaje-xxx
VITE_FIREBASE_STORAGE_BUCKET=plan-viaje-xxx.appspot.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Facebook OAuth
VITE_FACEBOOK_APP_ID=xxx

# Mercado Pago
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxx
```

---

## 📊 RESUMEN: CUÁL CLAVE NECESITAS

| Servicio | Necesario | Costo | Setup |
|----------|-----------|-------|-------|
| Firebase | ✅ SÍ | Gratis | 10 min |
| Mercado Pago | ✅ SÍ | Gratis | 10 min |
| ExchangeRate | ❌ NO* | Gratis | 2 min |
| Google Cloud | ❌ NO** | Gratis 5GB | 15 min |
| Cloudinary | ❌ NO** | Gratis 10GB | 5 min |
| SendGrid | ❌ NO*** | Gratis 100/día | 5 min |
| Twilio | ❌ NO | Pago | 10 min |

*Opcional, puedes ingresar manual
**Eliges uno para almacenamiento
***Usa Firebase Email en su lugar

---

## 🚀 SETUP RÁPIDO (En Orden)

### 1. Firebase (5 min)
```bash
# Ir a console.firebase.google.com
# Crear proyecto "plan-viaje"
# Descargar JSON de credenciales
# Guardar en backend/config/firebase-key.json
```

### 2. Mercado Pago (5 min)
```bash
# Crear cuenta en mercadopago.com.ar
# Ir a Settings → Credenciales
# Copiar Access Token
# Guardar en .env como MERCADOPAGO_ACCESS_TOKEN
```

### 3. Cloudinary (5 min)
```bash
# Ir a cloudinary.com
# Sign up (gratis)
# Dashboard → Copiar credentials
# Guardar en .env
```

### 4. Listo
```
Ya tienes todo lo necesario
SIN pagar dinero
SIN necesitar tarjeta de crédito
```

---

## 💡 NOTA IMPORTANTE

**NO necesitas**:
- Google Cloud Storage (usa Cloudinary gratis)
- Twilio (Firebase SMS es suficiente)
- SendGrid (Firebase Email o No