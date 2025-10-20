# Stack Técnico - Plan Viaje App

## 🎯 Decisión Tecnológica Final

Basándome en tu perfil (semi-junior en programación, más cómodo con PHP/MySQL, dificultad con JS) y los requisitos del proyecto, aquí está el stack recomendado:

---

## 💻 FRONTEND

### Web - React + TypeScript
```
Framework: React 18.x
Lenguaje: TypeScript (mejora PHP → JS transition)
Styling: Tailwind CSS
State Management: Zustand (más simple que Redux)
HTTP Client: Axios
Build Tool: Vite
Package Manager: npm
```

**¿Por qué React?**
- Similar a componentes en frameworks modernos
- Aprenderás JavaScript de manera gradual
- Amplio ecosistema
- Fácil para principiantes

**¿Por qué TypeScript?**
- Tipado fuerte (como PHP modern)
- Mejor autocompletado
- Menos errores en runtime

---

### Mobile - React Native (Expo)
```
Framework: React Native + Expo
Lenguaje: TypeScript
Targeting: iOS + Android
Package Manager: npm
```

**¿Por qué Expo?**
- No necesitas Xcode ni Android Studio
- Deploy más fácil
- Comparte código con Web (React)

---

## 🖥️ BACKEND

### Node.js + Express
```
Runtime: Node.js 20.x LTS
Framework: Express.js 4.x
Lenguaje: JavaScript (o TypeScript)
Package Manager: npm
Port: 3001 (desarrollo)
```

**¿Por qué Node.js?**
- JavaScript (lo que aprenderás en frontend)
- Eco-sistema enorme (npm)
- Fácil de aprender viniendo de PHP
- Asincronía manejable

**¿Por qué Express?**
- Minimalista (como Laravel sin tanto peso)
- Amplio soporte
- Middleware pattern es familiar

### Estructura de Backend
```
/backend
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── viajes.routes.js
│   │   ├── gastos.routes.js
│   │   └── ...
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── viajasController.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Viaje.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── ...
│   ├── services/
│   │   ├── gastosService.js
│   │   ├── deudasService.js
│   │   └── ...
│   └── app.js
├── .env
└── server.js
```

---

## 🗄️ BASE DE DATOS

### PostgreSQL (Principal)
```
Version: 15.x
Cliente: Node postgres (node-postgres)
ORM: Sequelize (similar a Eloquent de Laravel)
Connection Pool: PgBouncer
```

**¿Por qué PostgreSQL?**
- Mejor para relaciones complejas
- JSONB para datos flexibles
- Mejor que MySQL para este proyecto
- Fácil de aprender desde MySQL

**¿Por qué Sequelize?**
- ORM similar a Laravel/Eloquent
- Familiar para alguien de PHP
- Migraciones incluidas

### Firestore (Opcional - Realtime)
```
Para sincronización en tiempo real
Backup para datos offline
Alternativa más adelante
```

---

## 🔐 AUTENTICACIÓN

### Firebase Auth
```
Métodos:
- Email + Contraseña
- Google OAuth
- Facebook OAuth
- Teléfono + OTP (Firebase SMS)

Librería: firebase/auth
```

**¿Por qué Firebase?**
- OTP/SMS gratuito
- Social login sin complicaciones
- JWT tokens automáticos

---

## 🔄 APIs y LLAMADAS

### Axios (HTTP Client)
```javascript
// Ejemplo simple
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Uso
const gastos = await api.get('/viajes/123/gastos');
```

---

## 💾 ALMACENAMIENTO

### Backend
```
Base de datos: PostgreSQL
Cache: Redis (opcional, para escalabilidad)
Archivos: Google Cloud Storage (comprobantes, fotos)
```

### Frontend
```
Local Storage: Para tokens y preferencias
IndexedDB: Para datos offline (sync)
```

---

## 🔔 NOTIFICACIONES

### Firebase Cloud Messaging (FCM)
```
Push Notifications: Firebase FCM
Email: SendGrid o Gmail API
SMS: Firebase SMS + Twilio
WhatsApp: Twilio WhatsApp API (futuro)
```

---

## 💳 PAGOS

### Mercado Pago
```
SDK: @mercadopago/sdk-nodejs
Para: Confirmación automática de pagos
Webhook para: Actualizar estado de deudas
```

---

## 💱 CONVERSIÓN DE MONEDAS

### ExchangeRate-API
```
API: https://api.exchangerate-api.com
Actualizaciones: Diarias automáticas
Fallback: Ingreso manual en BD
```

---

## 📊 UTILIDADES

### Generación de Reportes
```
PDF: pdfkit o puppeteer
Excel: xlsx o exceljs
Formato: JSON → Documento
```

### Validaciones
```
Backend: joi (schema validation)
Frontend: zod o react-hook-form
```

### Logging
```
Winston (logging de errores)
Sentry (error tracking en prod)
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.0",
    "firebase-admin": "^12.0.0",
    "axios": "^1.6.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "winston": "^3.11.0",
    "pdfkit": "^0.13.0",
    "xlsx": "^0.18.5"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^10.7.0",
    "tailwindcss": "^3.3.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4"
  }
}
```

---

## 🚀 DEPLOYMENT

### Backend
```
Hosting: Heroku, Render, Railway o Vercel Functions
Database: Railway, Supabase o AWS RDS
Monitoreo: Sentry, New Relic
```

### Frontend
```
Hosting: Vercel o Netlify
CDN: Automático (Vercel)
```

### Mobile
```
iOS: TestFlight → App Store
Android: Google Play Console
OTA Updates: Expo EAS
```

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────┐
│   Frontend Web  │
│   (React)       │
└────────┬────────┘
         │
         │ HTTPS/REST
         ↓
┌─────────────────────────────────────┐
│        Backend (Node + Express)     │
│  - Routes                           │
│  - Controllers                      │
│  - Services (lógica de negocio)    │
│  - Middleware (auth, validación)   │
└────────┬────────────────────────────┘
         │
    ┌────┴─────┐
    ↓          ↓
┌─────────┐  ┌──────────┐
│PostgreSQL  │Firebase   │
│(BD SQL) │  │(Auth+RT) │
└─────────┘  └──────────┘
```

---

## 📝 GUÍA RÁPIDA: HACER UN REQUEST

### Frontend (React)
```typescript
// src/hooks/useGastos.ts
import axios from 'axios';
import { useAuth } from './useAuth';

export const useGastos = (idViaje: number) => {
  const { token } = useAuth();
  const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const crearGasto = async (gasto: {
    descripcion: string;
    monto_ars: number;
    categoria: string;
  }) => {
    try {
      const response = await api.post(
        `/viajes/${idViaje}/gastos`,
        gasto
      );
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  return { crearGasto };
};

// Uso en componente
import { useGastos } from '../hooks/useGastos';

export const CrearGastoForm = ({ idViaje }) => {
  const { crearGasto } = useGastos(idViaje);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearGasto({
      descripcion: 'Cena',
      monto_ars: 250000,
      categoria: 'comida'
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Backend (Express)
```javascript
// routes/gastos.routes.js
const express = require('express');
const router = express.Router();
const { crearGasto } = require('../controllers/gastosController');
const { auth } = require('../middleware/auth');

// POST /api/viajes/:idViaje/gastos
router.post('/:idViaje/gastos', auth, crearGasto);

module.exports = router;

// ─────────────────────────────────────

// controllers/gastosController.js
const { Gasto, Deuda } = require('../models');
const gastosService = require('../services/gastosService');

const crearGasto = async (req, res) => {
  try {
    const { idViaje } = req.params;
    const { descripcion, monto_ars, categoria, tipo_gasto } = req.body;
    const userId = req.user.id;

    // Validación
    if (!monto_ars || monto_ars <= 0) {
      return res.status(400).json({
        error: 'Monto debe ser mayor a 0'
      });
    }

    // Crear gasto
    const gasto = await Gasto.create({
      id_viaje: idViaje,
      id_usuario_pagador: userId,
      descripcion,
      monto_ars,
      categoria,
      tipo_gasto
    });

    // Generar deudas automáticamente
    const deudas = await gastosService.generarDeudas(
      idViaje,
      gasto.id_gasto,
      monto_ars
    );

    // Notificar a miembros
    await notificacionService.enviarNotificacion(
      idViaje,
      `Nuevo gasto: ${descripcion} - $${monto_ars}`
    );

    res.status(201).json({
      success: true,
      data: { gasto, deudas }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearGasto };

// ─────────────────────────────────────

// services/gastosService.js
const { Deuda, Miembro, Subgrupo } = require('../models');

const generarDeudas = async (idViaje, idGasto, monto) => {
  // Lógica de divisiones inteligentes
  const miembros = await Miembro.findAll({
    where: { id_viaje: idViaje }
  });

  const deudas = [];
  const montosPorPersona = monto / miembros.length;

  for (const miembro of miembros) {
    await Deuda.create({
      id_viaje: idViaje,
      id_gasto: idGasto,
      id_acreedor: userId, // quien pagó
      id_deudor: miembro.id_usuario,
      monto_ars: montosPorPersona,
      estado_deuda: 'pendiente'
    });
  }

  return deudas;
};

module.exports = { generarDeudas };
```

---

## 📚 RECURSOS DE APRENDIZAJE

### Para Aprender Node.js + Express
- Udemy: "The Complete Node.js Developer Course"
- YouTube: Traversy Media - Express.js
- Docs: https://expressjs.com

### Para React
- React Docs: https://react.dev
- Vite Guide: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org/docs/

### Para PostgreSQL + Sequelize
- Sequelize Docs: https://sequelize.org
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Para Firebase
- Firebase Docs: https://firebase.google.com/docs

---

## 🛠️ HERRAMIENTAS DE DESARROLLO

### Local Development
```
Node.js 20.x (runtime)
npm (package manager)
Visual Studio Code (editor)
PostgreSQL 15 (local o Docker)
Docker (contenedores)
Postman (testing API)
DBeaver (gestor BD)
```

### Git Workflow
```
Repository: GitHub / GitLab
Branching: main, develop, feature/*
Commits: Convencionales (feat:, fix:, etc)
PR Reviews: Antes de merge
```

---

## 📊 RESUMEN FINAL DEL STACK

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Frontend Web** | React + TypeScript | Moderno, escalable, gran comunidad |
| **Frontend Mobile** | React Native + Expo | Código compartido, deploy fácil |
| **Backend** | Node.js + Express | JS en backend, aprendizaje continuo |
| **BD Principal** | PostgreSQL + Sequelize | Relaciones complejas, ORM familiar |
| **Autenticación** | Firebase Auth | OTP, Social login sin complicaciones |
| **Realtime** | Firebase Firestore | Sync offline, sencillo |
| **Notificaciones** | Firebase FCM | Push nativo, fácil integración |
| **Pagos** | Mercado Pago | Argentina, fácil API |
| **Hosting** | Vercel (Frontend) + Render/Railway (Backend) | Gratuito/económico, fácil deploy |

---

## 🎓 TU CURVA DE APRENDIZAJE

```
Semana 1-2: Node.js + Express básico
  ↓
Semana 3: PostgreSQL + Sequelize
  ↓
Semana 4: React básico + componentes
  ↓
Semana 5-6: Integración Frontend + Backend
  ↓
Semana 7: Firebase Auth
  ↓
Semana 8: Optimizaciones
  ↓
Semana 9-10: Testing + Deploy
```

---

## ✅ VENTAJA DE ESTE STACK PARA TI

✅ **JavaScript** en todo (frontend + backend = menos contexto switching)
✅ **ORM similar** a Eloquent (Sequelize es familiar)
✅ **PostgreSQL** mejor que MySQL para relaciones
✅ **TypeScript** mejora la transición PHP → JavaScript
✅ **Comunidad grande** = muchos recursos
✅ **Costo bajo** = herramientas gratuitas/baratas
✅ **Escalable** = puede crecer con el proyecto