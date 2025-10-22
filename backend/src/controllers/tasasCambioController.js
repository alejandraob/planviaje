const cambiosMonedaService = require('../services/cambiosMonedaService');
const logger = require('../utils/logger');

/**
 * Controlador de Tasas de Cambio
 */
class TasasCambioController {
  /**
   * Obtiene la tasa actual entre dos monedas
   */
  async obtenerTasaActual(req, res, next) {
    try {
      const { moneda_base, moneda_destino } = req.query;

      const tasa = await cambiosMonedaService.obtenerTasaActual(moneda_base, moneda_destino);

      res.status(200).json({
        success: true,
        data: {
          moneda_base,
          moneda_destino,
          tasa
        }
      });
    } catch (error) {
      logger.error('Error en obtenerTasaActual controller:', error);
      next(error);
    }
  }

  /**
   * Actualiza tasas desde API externa
   */
  async actualizarTasasDesdeAPI(req, res, next) {
    try {
      const resultado = await cambiosMonedaService.actualizarTasasDesdeAPI();

      res.status(200).json({
        success: true,
        message: 'Tasas actualizadas desde API externa',
        data: resultado
      });
    } catch (error) {
      logger.error('Error en actualizarTasasDesdeAPI controller:', error);
      next(error);
    }
  }

  /**
   * Crea una tasa manualmente (fallback)
   */
  async crearTasaManual(req, res, next) {
    try {
      const tasa = await cambiosMonedaService.crearTasaManual(req.body);

      res.status(201).json({
        success: true,
        message: 'Tasa creada manualmente',
        data: tasa
      });
    } catch (error) {
      logger.error('Error en crearTasaManual controller:', error);
      next(error);
    }
  }

  /**
   * Obtiene el hist├│rico de tasas
   */
  async obtenerHistorial(req, res, next) {
    try {
      const { moneda_base, moneda_destino } = req.query;

      const historial = await cambiosMonedaService.obtenerHistorialTasas(moneda_base, moneda_destino);

      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      logger.error('Error en obtenerHistorial controller:', error);
      next(error);
    }
  }
}

module.exports = new TasasCambioController();
