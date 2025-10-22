const { TasaCambio, Gasto, Deuda } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const axios = require('axios');
const { MONEDAS } = require('../config/constants');

/**
 * Servicio de Conversi├│n de Monedas
 * Maneja conversiones entre ARS, CLP y USD
 */
class CambiosMonedaService {
  /**
   * Obtiene la tasa de cambio actual entre dos monedas
   * @param {string} monedaBase - Moneda origen (USD, CLP, ARS)
   * @param {string} monedaDestino - Moneda destino (USD, CLP, ARS)
   * @returns {Promise<number>} Tasa de cambio
   */
  async obtenerTasaActual(monedaBase, monedaDestino) {
    try {
      // Si son la misma moneda, la tasa es 1
      if (monedaBase === monedaDestino) {
        return 1;
      }

      // Buscar tasa activa m├ís reciente
      const tasa = await TasaCambio.findOne({
        where: {
          moneda_base: monedaBase,
          moneda_destino: monedaDestino,
          activo: true
        },
        order: [['fecha_vigencia', 'DESC']]
      });

      if (!tasa) {
        throw new Error(
          `No se encontr├│ tasa de cambio para ${monedaBase}/${monedaDestino}`
        );
      }

      return parseFloat(tasa.tasa);
    } catch (error) {
      logger.error('Error al obtener tasa actual:', error);
      throw error;
    }
  }

  /**
   * Convierte un monto de una moneda a otra
   * @param {number} monto - Monto a convertir
   * @param {string} monedaOrigen - Moneda origen
   * @param {string} monedaDestino - Moneda destino
   * @returns {Promise<number>} Monto convertido
   */
  async convertirMonto(monto, monedaOrigen, monedaDestino) {
    try {
      if (monedaOrigen === monedaDestino) {
        return monto;
      }

      const tasa = await this.obtenerTasaActual(monedaOrigen, monedaDestino);
      const montoConvertido = monto * tasa;

      // Redondear a 2 decimales
      return Math.round(montoConvertido * 100) / 100;
    } catch (error) {
      logger.error('Error al convertir monto:', error);
      throw error;
    }
  }

  /**
   * Convierte un gasto a las 3 monedas
   * @param {number} monto - Monto original
   * @param {string} monedaOriginal - Moneda en que se registr├│
   * @returns {Promise<Object>} Objeto con monto_ars, monto_clp, monto_usd
   */
  async convertirGastoATodasLasMonedas(monto, monedaOriginal) {
    try {
      const resultado = {
        monto_ars: 0,
        monto_clp: 0,
        monto_usd: 0
      };

      // Asignar el monto original
      if (monedaOriginal === MONEDAS.ARS) {
        resultado.monto_ars = monto;
      } else if (monedaOriginal === MONEDAS.CLP) {
        resultado.monto_clp = monto;
      } else if (monedaOriginal === MONEDAS.USD) {
        resultado.monto_usd = monto;
      }

      // Convertir a las otras monedas
      if (monedaOriginal === MONEDAS.USD) {
        resultado.monto_ars = await this.convertirMonto(monto, MONEDAS.USD, MONEDAS.ARS);
        resultado.monto_clp = await this.convertirMonto(monto, MONEDAS.USD, MONEDAS.CLP);
      } else if (monedaOriginal === MONEDAS.CLP) {
        resultado.monto_ars = await this.convertirMonto(monto, MONEDAS.CLP, MONEDAS.ARS);
        resultado.monto_usd = await this.convertirMonto(monto, MONEDAS.CLP, MONEDAS.USD);
      } else if (monedaOriginal === MONEDAS.ARS) {
        resultado.monto_usd = await this.convertirMonto(monto, MONEDAS.ARS, MONEDAS.USD);
        resultado.monto_clp = await this.convertirMonto(monto, MONEDAS.ARS, MONEDAS.CLP);
      }

      return resultado;
    } catch (error) {
      logger.error('Error al convertir gasto a todas las monedas:', error);
      throw error;
    }
  }

  /**
   * Recalcula todos los gastos de un viaje cuando cambia la tasa
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Resultado del rec├ílculo
   */
  async recalcularGastosPorCambioTasa(viajeId) {
    try {
      const gastosActualizados = [];

      // Obtener todos los gastos del viaje
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId }
      });

      // Recalcular cada gasto
      for (const gasto of gastos) {
        const montosConvertidos = await this.convertirGastoATodasLasMonedas(
          gasto.moneda_original === MONEDAS.USD ? gasto.monto_usd :
          gasto.moneda_original === MONEDAS.CLP ? gasto.monto_clp :
          gasto.monto_ars,
          gasto.moneda_original
        );

        // Actualizar el gasto
        await gasto.update({
          monto_ars: montosConvertidos.monto_ars,
          monto_clp: montosConvertidos.monto_clp,
          monto_usd: montosConvertidos.monto_usd
        });

        gastosActualizados.push(gasto.id_gasto);
      }

      logger.info(`Recalculados ${gastosActualizados.length} gastos del viaje ${viajeId}`);

      return {
        gastosActualizados: gastosActualizados.length,
        ids: gastosActualizados
      };
    } catch (error) {
      logger.error('Error al recalcular gastos:', error);
      throw error;
    }
  }

  /**
   * Actualiza las tasas de cambio desde ExchangeRate-API
   * @returns {Promise<Object>} Resultado de la actualizaci├│n
   */
  async actualizarTasasDesdeAPI() {
    try {
      const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD';

      logger.info('Consultando ExchangeRate-API...');
      const response = await axios.get(apiUrl);
      const rates = response.data.rates;

      const tasasCreadas = [];

      // Desactivar tasas anteriores
      await TasaCambio.update(
        { activo: false },
        { where: { activo: true } }
      );

      // USD ÔåÆ ARS
      const usdToArs = await TasaCambio.create({
        moneda_base: MONEDAS.USD,
        moneda_destino: MONEDAS.ARS,
        tasa: rates.ARS,
        fuente: 'ExchangeRate-API',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(usdToArs);

      // USD ÔåÆ CLP
      const usdToClp = await TasaCambio.create({
        moneda_base: MONEDAS.USD,
        moneda_destino: MONEDAS.CLP,
        tasa: rates.CLP,
        fuente: 'ExchangeRate-API',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(usdToClp);

      // Calcular tasas cruzadas
      // CLP ÔåÆ ARS
      const clpToArs = rates.ARS / rates.CLP;
      const clpToArsRecord = await TasaCambio.create({
        moneda_base: MONEDAS.CLP,
        moneda_destino: MONEDAS.ARS,
        tasa: clpToArs,
        fuente: 'ExchangeRate-API (calculado)',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(clpToArsRecord);

      // ARS ÔåÆ USD
      const arsToUsd = 1 / rates.ARS;
      const arsToUsdRecord = await TasaCambio.create({
        moneda_base: MONEDAS.ARS,
        moneda_destino: MONEDAS.USD,
        tasa: arsToUsd,
        fuente: 'ExchangeRate-API (calculado)',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(arsToUsdRecord);

      // ARS ÔåÆ CLP
      const arsToClp = rates.CLP / rates.ARS;
      const arsToClpRecord = await TasaCambio.create({
        moneda_base: MONEDAS.ARS,
        moneda_destino: MONEDAS.CLP,
        tasa: arsToClp,
        fuente: 'ExchangeRate-API (calculado)',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(arsToClpRecord);

      // CLP ÔåÆ USD
      const clpToUsd = 1 / rates.CLP;
      const clpToUsdRecord = await TasaCambio.create({
        moneda_base: MONEDAS.CLP,
        moneda_destino: MONEDAS.USD,
        tasa: clpToUsd,
        fuente: 'ExchangeRate-API (calculado)',
        fecha_vigencia: new Date(),
        activo: true
      });
      tasasCreadas.push(clpToUsdRecord);

      logger.info(`Ô£à Tasas actualizadas desde API: ${tasasCreadas.length} tasas`);

      return {
        success: true,
        tasasActualizadas: tasasCreadas.length,
        tasas: tasasCreadas.map(t => ({
          moneda_base: t.moneda_base,
          moneda_destino: t.moneda_destino,
          tasa: t.tasa
        }))
      };
    } catch (error) {
      logger.error('Error al actualizar tasas desde API:', error);
      throw error;
    }
  }

  /**
   * Crea una tasa de cambio manualmente (fallback)
   * @param {Object} data - Datos de la tasa
   * @returns {Promise<Object>} Tasa creada
   */
  async crearTasaManual(data) {
    try {
      const { moneda_base, moneda_destino, tasa, fuente = 'Manual' } = data;

      // Desactivar tasa anterior del mismo par
      await TasaCambio.update(
        { activo: false },
        {
          where: {
            moneda_base,
            moneda_destino,
            activo: true
          }
        }
      );

      // Crear nueva tasa
      const nuevaTasa = await TasaCambio.create({
        moneda_base,
        moneda_destino,
        tasa,
        fuente,
        fecha_vigencia: new Date(),
        activo: true
      });

      logger.info(`Tasa manual creada: ${moneda_base}/${moneda_destino} = ${tasa}`);

      return nuevaTasa;
    } catch (error) {
      logger.error('Error al crear tasa manual:', error);
      throw error;
    }
  }

  /**
   * Obtiene el hist├│rico de tasas de cambio
   * @param {string} monedaBase - Moneda base
   * @param {string} monedaDestino - Moneda destino
   * @returns {Promise<Array>} Hist├│rico de tasas
   */
  async obtenerHistorialTasas(monedaBase, monedaDestino) {
    try {
      const historial = await TasaCambio.findAll({
        where: {
          moneda_base: monedaBase,
          moneda_destino: monedaDestino
        },
        order: [['fecha_vigencia', 'DESC']],
        limit: 100
      });

      return historial;
    } catch (error) {
      logger.error('Error al obtener hist├│rico de tasas:', error);
      throw error;
    }
  }
}

module.exports = new CambiosMonedaService();
