/**
 * Automated API Testing Script
 * Runs all endpoints and validates responses
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let TOKEN = null;
let VIAJE_ID = null;
let FRANJA_ID = null;
let ALOJAMIENTO_ID = null;
let ACTIVIDAD_ID = null;
let GASTO_ID = null;
let DEUDA_ID = null;
let PAGO_ID = null;
let SUBGRUPO_ID = null;
let MIEMBRO_ID = null;
let NOTIFICACION_ID = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Test results
let results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Execute a test case
 */
async function runTest(name, testFn) {
  results.total++;
  try {
    await testFn();
    results.passed++;
    log.success(name);
    return true;
  } catch (error) {
    results.failed++;
    const errorMsg = error.response?.data?.error || error.message;
    log.error(`${name}: ${errorMsg}`);
    results.errors.push({ test: name, error: errorMsg });
    return false;
  }
}

/**
 * 1. Authentication Tests
 */
async function testAuthentication() {
  log.section('TESTING AUTHENTICATION');

  await runTest('Dev Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/dev-login`, {
      email: 'test@example.com',
      password: 'test123'
    });

    if (!response.data.success) throw new Error('Login failed');
    if (!response.data.data.accessToken) throw new Error('No token received');

    TOKEN = response.data.data.accessToken;
    log.info(`Token obtained: ${TOKEN.substring(0, 20)}...`);
  });

  await runTest('Get Current User', async () => {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get user');
    if (!response.data.data.email) throw new Error('No email in response');
    log.info(`User: ${response.data.data.email}`);
  });
}

/**
 * 2. Viajes Tests
 */
async function testViajes() {
  log.section('TESTING VIAJES');

  await runTest('List Viajes', async () => {
    const response = await axios.get(`${BASE_URL}/viajes`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list viajes');
    if (!response.data.data.viajes) throw new Error('No viajes in response');

    // Use the first viaje for testing
    if (response.data.data.viajes.length > 0) {
      VIAJE_ID = response.data.data.viajes[0].id_viaje;
      log.info(`Found ${response.data.data.viajes.length} viajes, using ID: ${VIAJE_ID} for tests`);
    } else {
      throw new Error('No viajes found. Please create a viaje first.');
    }
  });

  await runTest('Get Viaje Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get viaje');
    const viaje = response.data.data.viaje || response.data.data;
    if (viaje.id_viaje !== VIAJE_ID) throw new Error('Wrong viaje returned');
  });

  await runTest('Get Viaje Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    const stats = response.data.data.estadisticas || response.data.data;
    if (typeof stats.total_miembros !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 3. Franjas Tests
 */
async function testFranjas() {
  log.section('TESTING FRANJAS');

  await runTest('Create Franja', async () => {
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/franjas`, {
      nombre_lugar: 'Cordoba Test',
      fecha_inicio: '2026-01-05',
      fecha_fin: '2026-01-08',
      descripcion: 'Test stop'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create franja');
    FRANJA_ID = response.data.data.id_franja;
    const franjaData = response.data.data;
    log.info(`Franja created with ID: ${FRANJA_ID}, dates: ${franjaData.fecha_inicio} to ${franjaData.fecha_fin}`);
  });

  await runTest('List Franjas', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/franjas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list franjas');
    if (!Array.isArray(response.data.data)) throw new Error('Invalid response format');
  });

  await runTest('Get Franja Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/franjas/${FRANJA_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get franja');
    if (response.data.data.id_franja !== FRANJA_ID) throw new Error('Wrong franja returned');
  });

  await runTest('Update Franja', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/franjas/${FRANJA_ID}`, {
      descripcion: 'Updated description'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update franja');
  });

  await runTest('Get Franjas Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/franjas/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.total_franjas !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 4. Alojamientos Tests
 */
async function testAlojamientos() {
  log.section('TESTING ALOJAMIENTOS');

  await runTest('Create Alojamiento', async () => {
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos`, {
      id_franja: FRANJA_ID,
      nombre: 'Hotel Test',
      fecha_checkin: '2026-01-04',
      fecha_checkout: '2026-01-07',
      monto_total_ars: 100000,
      monto_pagado_ars: 50000
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create alojamiento');
    ALOJAMIENTO_ID = response.data.data.id_alojamiento;
    log.info(`Alojamiento created with ID: ${ALOJAMIENTO_ID}`);
  });

  await runTest('List Alojamientos', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list alojamientos');
    if (!Array.isArray(response.data.data)) throw new Error('Invalid response format');
  });

  await runTest('Get Alojamiento Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos/${ALOJAMIENTO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get alojamiento');
    if (response.data.data.id_alojamiento !== ALOJAMIENTO_ID) throw new Error('Wrong alojamiento returned');
  });

  await runTest('Update Alojamiento Payment', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos/${ALOJAMIENTO_ID}/pago`, {
      monto_pagado_ars: 100000
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update payment');
    if (response.data.data.estado_pago !== 'pagado') throw new Error('Payment status not updated');
  });

  await runTest('Get Alojamientos Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.total_alojamientos !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 5. Actividades Tests
 */
async function testActividades() {
  log.section('TESTING ACTIVIDADES');

  await runTest('Create Actividad', async () => {
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/actividades`, {
      id_franja: FRANJA_ID,
      nombre: 'City Tour',
      fecha: '2026-01-06',
      tipo_actividad: 'visita',
      es_paga: true,
      valor_referencial_ars: 5000,
      miembros_asignados: [2]
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create actividad');
    ACTIVIDAD_ID = response.data.data.id_actividad;
    log.info(`Actividad created with ID: ${ACTIVIDAD_ID}`);
  });

  await runTest('List Actividades', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/actividades`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list actividades');
    if (!Array.isArray(response.data.data)) throw new Error('Invalid response format');
  });

  await runTest('Get Actividad Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/actividades/${ACTIVIDAD_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get actividad');
    if (response.data.data.id_actividad !== ACTIVIDAD_ID) throw new Error('Wrong actividad returned');
  });

  await runTest('Update Actividad', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/actividades/${ACTIVIDAD_ID}`, {
      descripcion: 'Updated description'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update actividad');
  });

  await runTest('Get Actividades Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/actividades/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.total_actividades !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 6. Gastos Tests
 */
async function testGastos() {
  log.section('TESTING GASTOS');

  await runTest('Create Gasto', async () => {
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/gastos`, {
      id_usuario_pagador: 2,
      descripcion: 'Cena grupal',
      monto_ars: 15000,
      categoria: 'comida',
      tipo_gasto: 'grupal',
      tipo_division: 'todos_miembros',
      fecha: '2026-01-06'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create gasto');
    GASTO_ID = response.data.data.id_gasto;
    log.info(`Gasto created with ID: ${GASTO_ID}`);
  });

  await runTest('List Gastos', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/gastos`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list gastos');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of gastos');
  });

  await runTest('Get Gasto Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/gastos/${GASTO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get gasto');
    if (response.data.data.id_gasto !== GASTO_ID) throw new Error('Wrong gasto returned');
  });

  await runTest('Update Gasto', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/gastos/${GASTO_ID}`, {
      descripcion: 'Cena grupal - Actualizada',
      monto_ars: 16000
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update gasto');
  });

  await runTest('Get Gastos Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/gastos/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.totales.total_gastos !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 7. Deudas Tests
 */
async function testDeudas() {
  log.section('TESTING DEUDAS');

  await runTest('Create Deuda', async () => {
    // Usuario 1 es el deudor, Usuario 2 es el acreedor
    // Esto permite que usuario 1 registre pagos en testPagos
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/deudas`, {
      id_acreedor: 2,
      id_deudor: 1,
      id_gasto: GASTO_ID,
      monto_ars: 8000,
      observacion: 'Parte del gasto de cena'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create deuda');
    DEUDA_ID = response.data.data.id_deuda;
    log.info(`Deuda created with ID: ${DEUDA_ID}`);
  });

  await runTest('List Deudas', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list deudas');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of deudas');
  });

  await runTest('Get Deuda Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get deuda');
    if (response.data.data.id_deuda !== DEUDA_ID) throw new Error('Wrong deuda returned');
  });

  await runTest('Update Deuda', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}`, {
      monto_ars: 8000,
      observacion: 'Monto ajustado'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update deuda');
  });

  await runTest('Get Deudas Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.totales.total_deudas !== 'number') throw new Error('Invalid statistics');
  });

  await runTest('Get Deudas Summary', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/resumen`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get summary');
    if (typeof response.data.data.balance !== 'number') throw new Error('Invalid summary');
  });
}

/**
 * 8. Pagos Tests
 */
async function testPagos() {
  log.section('TESTING PAGOS');

  await runTest('Register Payment', async () => {
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos`, {
      monto_ars: 4000,
      metodo_pago: 'transferencia',
      observacion: 'Pago parcial de deuda'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to register payment');
    PAGO_ID = response.data.data.id_pago;
    log.info(`Payment registered with ID: ${PAGO_ID}`);
  });

  await runTest('List Pagos', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list pagos');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of pagos');
  });

  await runTest('Get Pago Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos/${PAGO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get pago');
    if (response.data.data.id_pago !== PAGO_ID) throw new Error('Wrong pago returned');
  });

  await runTest('Confirm Payment', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos/${PAGO_ID}/confirmar`, {}, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to confirm payment');
    if (response.data.data.estado_pago !== 'confirmado') throw new Error('Payment not confirmed');
  });

  await runTest('Get Pagos Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.total_pagado !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 9. Notificaciones Tests
 */
async function testNotificaciones() {
  log.section('TESTING NOTIFICACIONES');

  await runTest('Send Notification to User', async () => {
    // Enviamos notificación al usuario 1 (el mismo que está logueado)
    // para poder acceder a ella en los siguientes tests
    const response = await axios.post(`${BASE_URL}/notificaciones`, {
      id_usuario_destinatario: 1,
      id_viaje: VIAJE_ID,
      tipo_evento: 'nuevo_gasto',
      titulo: 'Nuevo gasto registrado',
      contenido: 'Se ha registrado un nuevo gasto de prueba',
      canales: {
        push: true,
        email: true,
        whatsapp: false
      }
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to send notification');
    NOTIFICACION_ID = response.data.data.id_notificacion;
    log.info(`Notification created with ID: ${NOTIFICACION_ID}`);
  });

  await runTest('List Notifications', async () => {
    const response = await axios.get(`${BASE_URL}/notificaciones`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list notifications');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of notifications');
  });

  await runTest('Get Notification Details', async () => {
    const response = await axios.get(`${BASE_URL}/notificaciones/${NOTIFICACION_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get notification');
    if (response.data.data.id_notificacion !== NOTIFICACION_ID) throw new Error('Wrong notification returned');
  });

  await runTest('Get Unread Count', async () => {
    const response = await axios.get(`${BASE_URL}/notificaciones/no-leidas/conteo`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get unread count');
    if (typeof response.data.data.no_leidas !== 'number') throw new Error('Invalid count');
  });

  await runTest('Mark Notification as Read', async () => {
    const response = await axios.put(`${BASE_URL}/notificaciones/${NOTIFICACION_ID}/leer`, {}, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to mark as read');
    if (!response.data.data.leida) throw new Error('Notification not marked as read');
  });

  await runTest('Get Notifications Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/notificaciones/estadisticas`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get statistics');
    if (typeof response.data.data.totales.total !== 'number') throw new Error('Invalid statistics');
  });
}

/**
 * 10. Test Subgrupos
 */
async function testSubgrupos() {
  log.section('TESTING SUBGRUPOS');

  // First, get MIEMBRO_ID from the viaje members
  await runTest('Get Miembro ID', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/miembros`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get members');
    if (!response.data.data.miembros || response.data.data.miembros.length === 0) {
      throw new Error('No members found in viaje');
    }

    MIEMBRO_ID = response.data.data.miembros[0].id_miembro_viaje;
    log.info(`Using miembro ID: ${MIEMBRO_ID}`);
  });

  await runTest('Create Subgrupo', async () => {
    const timestamp = Date.now();
    const response = await axios.post(`${BASE_URL}/viajes/${VIAJE_ID}/subgrupos`, {
      nombre: `Grupo Test ${timestamp}`,
      descripcion: 'Subgrupo de prueba automatizada',
      id_representante: MIEMBRO_ID,
      miembros: [MIEMBRO_ID]
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to create subgrupo');
    SUBGRUPO_ID = response.data.data.id_subgrupo;
    log.info(`Subgrupo created with ID: ${SUBGRUPO_ID}`);
  });

  await runTest('List Subgrupos', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/subgrupos`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to list subgrupos');
    if (!Array.isArray(response.data.data)) throw new Error('Expected array of subgrupos');
  });

  await runTest('Get Subgrupo Details', async () => {
    const response = await axios.get(`${BASE_URL}/viajes/${VIAJE_ID}/subgrupos/${SUBGRUPO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to get subgrupo');
    if (response.data.data.id_subgrupo !== SUBGRUPO_ID) throw new Error('Wrong subgrupo returned');
  });

  await runTest('Update Subgrupo', async () => {
    const response = await axios.put(`${BASE_URL}/viajes/${VIAJE_ID}/subgrupos/${SUBGRUPO_ID}`, {
      nombre: 'Grupo A - Actualizado',
      descripcion: 'Descripción actualizada'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to update subgrupo');
  });
}

/**
 * 11. Cleanup - Delete created resources
 */
async function cleanup() {
  log.section('CLEANUP');

  await runTest('Delete Notificacion', async () => {
    const response = await axios.delete(`${BASE_URL}/notificaciones/${NOTIFICACION_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete notification');
  });

  await runTest('Delete Subgrupo', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/subgrupos/${SUBGRUPO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete subgrupo');
  });

  await runTest('Delete Pago', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}/pagos/${PAGO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    // Payment deletion may fail if it's confirmed, which is expected
    // We'll just log it and continue
    if (!response.data.success) {
      log.warn('Could not delete pago (might be confirmed)');
    }
  });

  await runTest('Delete Deuda', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/deudas/${DEUDA_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete deuda');
  });

  await runTest('Delete Gasto', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/gastos/${GASTO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete gasto');
  });

  await runTest('Delete Actividad', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/actividades/${ACTIVIDAD_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete actividad');
  });

  await runTest('Delete Alojamiento', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/alojamientos/${ALOJAMIENTO_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete alojamiento');
  });

  await runTest('Delete Franja', async () => {
    const response = await axios.delete(`${BASE_URL}/viajes/${VIAJE_ID}/franjas/${FRANJA_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.data.success) throw new Error('Failed to delete franja');
  });

  log.info('Skipping viaje deletion (using existing viaje)');
}

/**
 * Print final results
 */
function printResults() {
  log.section('TEST RESULTS');

  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);

  if (results.errors.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.test}: ${err.error}`);
    });
  }

  console.log('\n');

  if (results.failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.error(`${results.failed} test(s) failed`);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║         Plan Viaje Backend - Automated Testing             ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`Testing API at: ${BASE_URL}`);
  log.info('Starting tests...\n');

  try {
    await testAuthentication();
    await testViajes();
    await testFranjas();
    await testAlojamientos();
    await testActividades();
    await testGastos();
    await testDeudas();
    await testPagos();
    await testNotificaciones();
    await testSubgrupos();
    await cleanup();
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
  }

  printResults();

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
