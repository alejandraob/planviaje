const { Gasto, GastoSubgrupo, MiembroViaje, Viaje } = require('../models');
const cambiosMonedaService = require('./cambiosMonedaService');
const logger = require('../utils/logger');
const { MONEDAS, TIPOS_GASTO, CATEGORIAS_GASTO } = require('../config/constants');

/**
 * Servicio de Gesti├│n de Gastos
 */
class GastosService {
  /**
   * Crea un nuevo gasto con conversi├│n autom├ítica de monedas
   * @param {Object} data - Datos del gasto
   * @returns {Promise<Object>} Gasto creado
   */
  async crearGasto(data) {
    try {
      const {
        id_viaje,
        id_usuario_pago,
        id_usuario_pagador,
        descripcion,
        categoria,
        tipo_gasto = 'grupal',
        moneda_original,
        monto_ars,
        monto_clp,
        monto_usd,
        fecha_gasto,
        comprobante_url,
        notas
      } = data;

      // Usar id_usuario_pagador o id_usuario_pago (el que venga)
      const usuarioPagador = id_usuario_pagador || id_usuario_pago;

      // Determinar el monto original seg├║n la moneda
      let montoOriginal;
      if (moneda_original === MONEDAS.ARS) {
        montoOriginal = monto_ars;
      } else if (moneda_original === MONEDAS.CLP) {
        montoOriginal = monto_clp;
      } else if (moneda_original === MONEDAS.USD) {
        montoOriginal = monto_usd;
      }

      if (!montoOriginal || montoOriginal <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Convertir a todas las monedas
      const montosConvertidos = await cambiosMonedaService.convertirGastoATodasLasMonedas(
        montoOriginal,
        moneda_original
      );

      // Crear el gasto
      const gasto = await Gasto.create({
        id_viaje,
        id_usuario_pagador: usuarioPagador,
        descripcion,
        categoria,
        tipo_gasto,
        moneda_original,
        monto_ars: montosConvertidos.monto_ars,
        monto_clp: montosConvertidos.monto_clp,
        monto_usd: montosConvertidos.monto_usd,
        fecha_gasto: fecha_gasto || new Date(),
        comprobante_url,
        notas,
        confirmado: true
      });

      logger.info(`Gasto creado: ${gasto.id_gasto} - ${descripcion} - ${montoOriginal} ${moneda_original}`);
      logger.info(`Conversiones: ARS ${montosConvertidos.monto_ars}, CLP ${montosConvertidos.monto_clp}, USD ${montosConvertidos.monto_usd}`);

      // Convertir los montos DECIMAL a n├║meros para la respuesta
      return {
        ...gasto.toJSON(),
        monto_ars: parseFloat(gasto.monto_ars),
        monto_clp: parseFloat(gasto.monto_clp),
        monto_usd: parseFloat(gasto.monto_usd)
      };
    } catch (error) {
      logger.error('Error al crear gasto:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los gastos de un viaje
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Array>} Lista de gastos
   */
  async obtenerGastosPorViaje(viajeId) {
    try {
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId },
        include: [
          {
            model: MiembroViaje,
            as: 'usuario_pago',
            attributes: ['id_usuario', 'rol']
          }
        ],
        order: [['fecha_gasto', 'DESC']]
      });

      return gastos;
    } catch (error) {
      logger.error('Error al obtener gastos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un gasto por ID
   * @param {number} gastoId - ID del gasto
   * @returns {Promise<Object>} Gasto
   */
  async obtenerGastoPorId(gastoId) {
    try {
      const gasto = await Gasto.findByPk(gastoId, {
        include: [
          {
            model: MiembroViaje,
            as: 'usuario_pago'
          },
          {
            model: GastoSubgrupo,
            as: 'subgrupos'
          }
        ]
      });

      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      return gasto;
    } catch (error) {
      logger.error('Error al obtener gasto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un gasto
   * @param {number} gastoId - ID del gasto
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Gasto actualizado
   */
  async actualizarGasto(gastoId, data) {
    try {
      const gasto = await Gasto.findByPk(gastoId);

      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      // Si se actualiza el monto, reconvertir a todas las monedas
      if (data.monto_ars || data.monto_clp || data.monto_usd) {
        const monedaOriginal = data.moneda_original || gasto.moneda_original;

        let montoOriginal;
        if (monedaOriginal === MONEDAS.ARS) {
          montoOriginal = data.monto_ars || gasto.monto_ars;
        } else if (monedaOriginal === MONEDAS.CLP) {
          montoOriginal = data.monto_clp || gasto.monto_clp;
        } else if (monedaOriginal === MONEDAS.USD) {
          montoOriginal = data.monto_usd || gasto.monto_usd;
        }

        const montosConvertidos = await cambiosMonedaService.convertirGastoATodasLasMonedas(
          montoOriginal,
          monedaOriginal
        );

        data.monto_ars = montosConvertidos.monto_ars;
        data.monto_clp = montosConvertidos.monto_clp;
        data.monto_usd = montosConvertidos.monto_usd;
      }

      await gasto.update(data);

      logger.info(`Gasto actualizado: ${gastoId}`);

      return gasto;
    } catch (error) {
      logger.error('Error al actualizar gasto:', error);
      throw error;
    }
  }

  /**
   * Elimina un gasto
   * @param {number} gastoId - ID del gasto
   * @returns {Promise<boolean>} Resultado de la operaci├│n
   */
  async eliminarGasto(gastoId) {
    try {
      const gasto = await Gasto.findByPk(gastoId);

      if (!gasto) {
        throw new Error('Gasto no encontrado');
      }

      await gasto.destroy();

      logger.info(`Gasto eliminado: ${gastoId}`);

      return true;
    } catch (error) {
      logger.error('Error al eliminar gasto:', error);
      throw error;
    }
  }

  /**
   * Calcula el total de gastos de un viaje en una moneda espec├¡fica
   * @param {number} viajeId - ID del viaje
   * @param {string} moneda - Moneda (ARS, CLP, USD)
   * @returns {Promise<number>} Total de gastos
   */
  async calcularTotalGastos(viajeId, moneda = 'ARS') {
    try {
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId }
      });

      let total = 0;

      for (const gasto of gastos) {
        if (moneda === MONEDAS.ARS) {
          total += parseFloat(gasto.monto_ars);
        } else if (moneda === MONEDAS.CLP) {
          total += parseFloat(gasto.monto_clp);
        } else if (moneda === MONEDAS.USD) {
          total += parseFloat(gasto.monto_usd);
        }
      }

      return Math.round(total * 100) / 100;
    } catch (error) {
      logger.error('Error al calcular total de gastos:', error);
      throw error;
    }
  }
}

module.exports = new GastosService();
