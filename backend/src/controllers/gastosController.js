const gastosService = require('../services/gastosService');
const cambiosMonedaService = require('../services/cambiosMonedaService');
const logger = require('../utils/logger');

/**
 * Controlador de Gastos
 */
class GastosController {
  /**
   * Crea un nuevo gasto
   */
  async crearGasto(req, res, next) {
    try {
      const { id } = req.params; // id del viaje
      const gastoData = {
        ...req.body,
        id_viaje: parseInt(id), // Asegurar que sea un número
        id_usuario_pagador: req.body.id_usuario_pagador || req.body.id_usuario_pago || 1
      };

      const gasto = await gastosService.crearGasto(gastoData);

      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        data: gasto
      });
    } catch (error) {
      logger.error('Error en crearGasto controller:', error);
      next(error);
    }
  }

  /**
   * Obtiene todos los gastos de un viaje
   */
  async obtenerGastos(req, res, next) {
    try {
      const { id } = req.params; // id del viaje

      const gastos = await gastosService.obtenerGastosPorViaje(id);

      res.status(200).json({
        success: true,
        data: gastos
      });
    } catch (error) {
      logger.error('Error en obtenerGastos controller:', error);
      next(error);
    }
  }

  /**
   * Obtiene un gasto específico
   */
  async obtenerGasto(req, res, next) {
    try {
      const { gastoId } = req.params;

      const gasto = await gastosService.obtenerGastoPorId(gastoId);

      res.status(200).json({
        success: true,
        data: gasto
      });
    } catch (error) {
      logger.error('Error en obtenerGasto controller:', error);
      next(error);
    }
  }

  /**
   * Actualiza un gasto
   */
  async actualizarGasto(req, res, next) {
    try {
      const { gastoId } = req.params;

      const gasto = await gastosService.actualizarGasto(gastoId, req.body);

      res.status(200).json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: gasto
      });
    } catch (error) {
      logger.error('Error en actualizarGasto controller:', error);
      next(error);
    }
  }

  /**
   * Elimina un gasto
   */
  async eliminarGasto(req, res, next) {
    try {
      const { gastoId } = req.params;

      await gastosService.eliminarGasto(gastoId);

      res.status(200).json({
        success: true,
        message: 'Gasto eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error en eliminarGasto controller:', error);
      next(error);
    }
  }

  /**
   * Recalcula todos los gastos por cambio de tasa
   */
  async recalcularGastos(req, res, next) {
    try {
      const { id } = req.params; // id del viaje

      const resultado = await cambiosMonedaService.recalcularGastosPorCambioTasa(id);

      res.status(200).json({
        success: true,
        message: 'Gastos recalculados exitosamente',
        data: resultado
      });
    } catch (error) {
      logger.error('Error en recalcularGastos controller:', error);
      next(error);
    }
  }
}

module.exports = new GastosController();
