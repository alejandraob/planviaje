const deudasService = require('../services/deudasService');
const { MONEDAS } = require('../config/constants');

class DeudasController {
  /**
   * Calcula las deudas de un viaje
   * POST /api/viajes/:id/deudas/calcular
   */
  async calcularDeudas(req, res, next) {
    try {
      const { id } = req.params;
      const { moneda_referencia = MONEDAS.ARS } = req.body;

      const resultado = await deudasService.calcularDeudasViaje(
        parseInt(id),
        moneda_referencia
      );

      res.status(200).json({
        success: true,
        message: 'Deudas calculadas exitosamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las deudas de un viaje
   * GET /api/viajes/:id/deudas
   */
  async obtenerDeudas(req, res, next) {
    try {
      const { id } = req.params;
      const { moneda_referencia = MONEDAS.ARS } = req.query;

      const deudas = await deudasService.obtenerDeudasViaje(
        parseInt(id),
        moneda_referencia
      );

      res.status(200).json({
        success: true,
        data: deudas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca una deuda como pagada
   * PUT /api/deudas/:id/pagar
   */
  async marcarPagada(req, res, next) {
    try {
      const { id } = req.params;

      const deuda = await deudasService.marcarDeudaPagada(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Deuda marcada como pagada',
        data: deuda
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene las deudas de un usuario específico
   * GET /api/usuarios/:id/deudas
   */
  async obtenerDeudasUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { viaje_id, moneda_referencia = MONEDAS.ARS } = req.query;

      const deudas = await deudasService.obtenerDeudasUsuario(
        parseInt(id),
        viaje_id ? parseInt(viaje_id) : null,
        moneda_referencia
      );

      res.status(200).json({
        success: true,
        data: deudas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeudasController();
