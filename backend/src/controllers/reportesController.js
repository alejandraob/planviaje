const reportesService = require('../services/reportesService');
const { MONEDAS } = require('../config/constants');

class ReportesController {
  /**
   * Genera un reporte completo del viaje
   * GET /api/viajes/:id/reportes
   */
  async generarReporteViaje(req, res, next) {
    try {
      const { id } = req.params;
      const { moneda_referencia = MONEDAS.ARS } = req.query;

      const reporte = await reportesService.generarReporteViaje(
        parseInt(id),
        moneda_referencia
      );

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Genera reporte de gastos por período
   * GET /api/viajes/:id/reportes/periodo
   */
  async generarReportePorPeriodo(req, res, next) {
    try {
      const { id } = req.params;
      const {
        periodo = 'dia',
        moneda_referencia = MONEDAS.ARS
      } = req.query;

      const reporte = await reportesService.generarReportePorPeriodo(
        parseInt(id),
        periodo,
        moneda_referencia
      );

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Genera reporte comparativo entre monedas
   * GET /api/viajes/:id/reportes/monedas
   */
  async generarReporteComparativoMonedas(req, res, next) {
    try {
      const { id } = req.params;

      const reporte = await reportesService.generarReporteComparativoMonedas(
        parseInt(id)
      );

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportesController();
