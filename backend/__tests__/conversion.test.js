/**
 * Tests de Conversi├│n de Monedas
 * Plan Viaje - Backend
 */

const request = require('supertest');
const app = require('../src/app');
const { sequelize, Gasto, Deuda, TasaCambio, User } = require('../src/models');

describe('­ƒîì M├ôDULO: Conversi├│n de Monedas', () => {

  let token;
  let adminToken;
  let viajeId;

  // Setup: antes de todos los tests
  beforeAll(async () => {
    // Conectar a BD de test
    await sequelize.sync({ force: true });

    // Crear usuario de prueba directamente
    await User.create({
      id_usuario: 1,
      firebase_uid: 'test-uid-123',
      email: 'ana@test.com',
      nombre: 'Ana',
      apellido: 'Garc├¡a',
      telefono: '+5491234567890',
      pais_residencia: 'Argentina',
      es_menor: false,
      activo: true
    });

    // No necesitamos tokens reales para estos tests
    token = 'fake-token';
    adminToken = 'fake-token';

    // Crear viaje internacional
    const viajeResponse = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre_viaje: 'Argentina-Chile 2026',
        tipo_viaje: 'amigos',
        alcance: 'internacional',
        fecha_inicio: '2026-01-05',
        fecha_fin: '2026-01-15',
        moneda_principal: 'ARS'
      });
    viajeId = viajeResponse.body.data.id_viaje;

    // Crear tasas iniciales
    await TasaCambio.bulkCreate([
      { moneda_base: 'USD', moneda_destino: 'ARS', tasa: 950.00, fuente: 'test' },
      { moneda_base: 'USD', moneda_destino: 'CLP', tasa: 850.00, fuente: 'test' },
      { moneda_base: 'CLP', moneda_destino: 'ARS', tasa: 0.28, fuente: 'test' },
      { moneda_base: 'ARS', moneda_destino: 'USD', tasa: 0.00105, fuente: 'test' },
      { moneda_base: 'ARS', moneda_destino: 'CLP', tasa: 0.86, fuente: 'test' },
      { moneda_base: 'CLP', moneda_destino: 'USD', tasa: 0.00118, fuente: 'test' }
    ]);
  });

  // Cleanup: despu├®s de todos los tests
  afterAll(async () => {
    await sequelize.close();
  });

  // =========================================
  // TC-085: Crear gasto en USD
  // =========================================
  describe('TC-085: Crear Gasto en USD', () => {
    test('Debe crear gasto en USD y convertir a ARS y CLP', async () => {
      const response = await request(app)
        .post(`/api/viajes/${viajeId}/gastos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          descripcion: 'Hotel Santiago',
          monto_usd: 150,
          moneda_original: 'USD',
          tipo_gasto: 'individual',
          categoria: 'alojamiento',
          id_usuario_pagador: 1,
          fecha_gasto: '2026-01-06'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const gasto = response.body.data;

      // Verificar moneda original
      expect(gasto.moneda_original).toBe('USD');
      expect(gasto.monto_usd).toBe(150);

      // Verificar conversiones
      expect(gasto.monto_ars).toBe(142500); // 150 ├ù 950
      expect(gasto.monto_clp).toBe(127500); // 150 ├ù 850

      // Tolerancia de ┬▒1 por redondeos
      expect(Math.abs(gasto.monto_ars - 142500)).toBeLessThanOrEqual(1);
      expect(Math.abs(gasto.monto_clp - 127500)).toBeLessThanOrEqual(1);
    });
  });

  // =========================================
  // TC-086: Crear gasto en CLP
  // =========================================
  describe('TC-086: Crear Gasto en CLP', () => {
    test('Debe crear gasto en CLP y convertir a ARS y USD', async () => {
      const response = await request(app)
        .post(`/api/viajes/${viajeId}/gastos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          descripcion: 'Comida en Valpara├¡so',
          monto_clp: 50000,
          moneda_original: 'CLP',
          tipo_gasto: 'individual',
          categoria: 'comida',
          id_usuario_pagador: 1,
          fecha_gasto: '2026-01-07'
        });

      expect(response.status).toBe(201);

      const gasto = response.body.data;

      expect(gasto.moneda_original).toBe('CLP');
      expect(gasto.monto_clp).toBe(50000);
      expect(gasto.monto_ars).toBe(14000); // 50000 ├ù 0.28
      expect(gasto.monto_usd).toBe(59); // 50000 ├ù 0.00118 Ôëê 59
    });
  });

  // =========================================
  // TC-087: Actualizar tasas de cambio
  // =========================================
  describe('TC-087: Actualizar Tasas de Cambio', () => {
    let gastoId;
    let montoArsInicial;

    beforeAll(async () => {
      // Crear un gasto con tasa inicial
      const gastoResponse = await request(app)
        .post(`/api/viajes/${viajeId}/gastos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          descripcion: 'Gasto para actualizar',
          monto_usd: 100,
          moneda_original: 'USD',
          tipo_gasto: 'individual',
          categoria: 'otros',
          id_usuario_pagador: 1,
          fecha_gasto: '2026-01-08'
        });

      gastoId = gastoResponse.body.data.id_gasto;
      montoArsInicial = gastoResponse.body.data.monto_ars; // 95000
    });

    test('Debe actualizar tasas y recalcular gastos', async () => {
      // Actualizar tasa USD ÔåÆ ARS de 950 a 960
      const updateResponse = await request(app)
        .post('/api/tasas-cambio')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moneda_base: 'USD',
          moneda_destino: 'ARS',
          tasa: 960,
          fuente: 'manual'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.message).toContain('recalculados');

      // Verificar que el gasto fue recalculado
      const gastoActualizado = await Gasto.findByPk(gastoId);

      expect(gastoActualizado.monto_ars).toBe(96000); // 100 ├ù 960
      expect(gastoActualizado.monto_ars).toBeGreaterThan(montoArsInicial);
      expect(gastoActualizado.monto_ars - montoArsInicial).toBe(1000); // Incremento de 1000
    });

    test('Debe recalcular deudas despu├®s de actualizar tasas', async () => {
      // Si el gasto era grupal, las deudas tambi├®n deben actualizarse
      // Este test asume que hay deudas asociadas al gasto

      const deudasResponse = await request(app)
        .get(`/api/viajes/${viajeId}/deudas`)
        .set('Authorization', `Bearer ${token}`);

      expect(deudasResponse.status).toBe(200);

      // Verificar que las deudas est├ín en ARS y fueron actualizadas
      const deudas = deudasResponse.body.data;
      deudas.forEach(deuda => {
        expect(deuda.monto_ars).toBeDefined();
        expect(typeof deuda.monto_ars).toBe('number');
      });
    });
  });

  // =========================================
  // TC-088: Consultar API de tasas externa
  // =========================================
  describe('TC-088: API Externa de Tasas', () => {
    test('Debe consultar ExchangeRate-API y actualizar tasas', async () => {
      const response = await request(app)
        .post('/api/tasas-cambio/actualizar-automatico')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasas_actualizadas).toBeGreaterThan(0);
      expect(response.body.data.fuente).toBe('ExchangeRate-API');
    }, 10000); // Timeout de 10s porque consulta API externa
  });

  // =========================================
  // TC-089: Reporte en 3 monedas
  // =========================================
  describe('TC-089: Reporte Comparativo 3 Monedas', () => {
    test('Debe generar reporte con columnas USD, ARS, CLP', async () => {
      const response = await request(app)
        .get(`/api/viajes/${viajeId}/reportes/resumen-financiero`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const reporte = response.body.data;

      // Verificar que el reporte tiene totales en las 3 monedas
      expect(reporte.total_usd).toBeDefined();
      expect(reporte.total_ars).toBeDefined();
      expect(reporte.total_clp).toBeDefined();

      // Verificar que cada gasto tiene las 3 conversiones
      reporte.gastos.forEach(gasto => {
        expect(gasto.monto_usd).toBeDefined();
        expect(gasto.monto_ars).toBeDefined();
        expect(gasto.monto_clp).toBeDefined();
      });

      // Verificar nota de tasas
      expect(reporte.nota_tasas).toContain('Tasas del');
    });
  });

  // =========================================
  // TC-090: Deudas en moneda base (ARS)
  // =========================================
  describe('TC-090: Deudas en Moneda Base', () => {
    beforeAll(async () => {
      // Crear varios gastos en diferentes monedas
      await request(app)
        .post(`/api/viajes/${viajeId}/gastos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          descripcion: 'Gasto en ARS',
          monto_ars: 100000,
          moneda_original: 'ARS',
          tipo_gasto: 'grupal',
          categoria: 'comida',
          id_usuario_pagador: 1,
          fecha_gasto: '2026-01-09'
        });

      await request(app)
        .post(`/api/viajes/${viajeId}/gastos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          descripcion: 'Gasto en USD',
          monto_usd: 100,
          moneda_original: 'USD',
          tipo_gasto: 'grupal',
          categoria: 'transporte',
          id_usuario_pagador: 1,
          fecha_gasto: '2026-01-10'
        });
    });

    test('Todas las deudas deben estar expresadas en ARS', async () => {
      const response = await request(app)
        .get(`/api/viajes/${viajeId}/deudas`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deudas = response.body.data;

      // Verificar que TODAS las deudas est├ín en ARS
      deudas.forEach(deuda => {
        expect(deuda.monto_ars).toBeDefined();
        expect(typeof deuda.monto_ars).toBe('number');
        expect(deuda.monto_ars).toBeGreaterThan(0);

        // monto_usd y monto_clp son opcionales
        // pero si existen, deben ser correctos
        if (deuda.monto_usd) {
          expect(typeof deuda.monto_usd).toBe('number');
        }
        if (deuda.monto_clp) {
          expect(typeof deuda.monto_clp).toBe('number');
        }
      });
    });

    test('Balance neto debe estar en ARS', async () => {
      const response = await request(app)
        .get(`/api/viajes/${viajeId}/deudas/balance`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const balance = response.body.data;

      expect(balance.balance_neto_ars).toBeDefined();
      expect(typeof balance.balance_neto_ars).toBe('number');
    });
  });

  // =========================================
  // TC-091: Conversi├│n manual (fallback)
  // =========================================
  describe('TC-091: Conversi├│n Manual (Fallback)', () => {
    test('Admin puede ingresar tasa manualmente', async () => {
      const response = await request(app)
        .post('/api/tasas-cambio/manual')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moneda_base: 'USD',
          moneda_destino: 'ARS',
          tasa: 955,
          fuente: 'Banco Naci├│n - Manual'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.fuente).toContain('Manual');
      expect(response.body.data.tasa).toBe(955);
    });
  });

  // =========================================
  // TC-092: Historial de tasas
  // =========================================
  describe('TC-092: Historial de Tasas de Cambio', () => {
    test('Debe obtener hist├│rico completo de tasas', async () => {
      const response = await request(app)
        .get('/api/tasas-cambio/historial')
        .set('Authorization', `Bearer ${token}`)
        .query({
          moneda_base: 'USD',
          moneda_destino: 'ARS'
        });

      expect(response.status).toBe(200);

      const historial = response.body.data;

      expect(Array.isArray(historial)).toBe(true);
      expect(historial.length).toBeGreaterThan(0);

      // Verificar estructura de cada registro
      historial.forEach(registro => {
        expect(registro.moneda_base).toBe('USD');
        expect(registro.moneda_destino).toBe('ARS');
        expect(registro.tasa).toBeDefined();
        expect(registro.fecha_vigencia).toBeDefined();
        expect(registro.fuente).toBeDefined();
      });

      // Verificar orden cronol├│gico (m├ís reciente primero)
      for (let i = 1; i < historial.length; i++) {
        const fechaActual = new Date(historial[i].fecha_vigencia);
        const fechaAnterior = new Date(historial[i - 1].fecha_vigencia);
        expect(fechaActual.getTime()).toBeLessThanOrEqual(fechaAnterior.getTime());
      }
    });
  });

  // =========================================
  // PERFORMANCE TEST
  // =========================================
  describe('Performance: Rec├ílculo Masivo de Tasas', () => {
    test('Debe recalcular 100 gastos en menos de 5 segundos', async () => {
      // Crear 100 gastos en USD
      const gastos = Array.from({ length: 100 }, (_, i) => ({
        descripcion: `Gasto ${i + 1}`,
        monto_usd: 10 + i,
        moneda_original: 'USD',
        tipo_gasto: 'individual',
        categoria: 'otros',
        id_usuario_pagador: 1,
        fecha_gasto: '2026-01-11'
      }));

      // Insertar en paralelo
      await Promise.all(
        gastos.map(gasto =>
          request(app)
            .post(`/api/viajes/${viajeId}/gastos`)
            .set('Authorization', `Bearer ${token}`)
            .send(gasto)
        )
      );

      // Medir tiempo de actualizaci├│n de tasas
      const inicio = Date.now();

      const response = await request(app)
        .post('/api/tasas-cambio')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moneda_base: 'USD',
          moneda_destino: 'ARS',
          tasa: 970
        });

      const duracion = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracion).toBeLessThan(5000); // Menos de 5 segundos
      expect(response.body.data.gastos_recalculados).toBeGreaterThanOrEqual(100);

      console.log(`Ô£à ${response.body.data.gastos_recalculados} gastos recalculados en ${duracion}ms`);
    }, 10000); // Timeout de 10s
  });

});
