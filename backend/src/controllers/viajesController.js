const viajesService = require('../services/viajesService');
const logger = require('../utils/logger');

/**
 * Controlador de Viajes
 */
class ViajesController {
  /**
   * Crea un nuevo viaje
   */
  async crearViaje(req, res, next) {
    try {
      const usuarioId = req.user?.id_usuario || req.body.id_usuario_creador || 1;

      const viaje = await viajesService.crearViaje(req.body, usuarioId);

      res.status(201).json({
        success: true,
        message: 'Viaje creado exitosamente',
        data: viaje
      });
    } catch (error) {
      logger.error('Error en crearViaje controller:', error);
      next(error);
    }
  }

  /**
   * Obtiene todos los viajes del usuario
   */
  async obtenerViajes(req, res, next) {
    try {
      const usuarioId = req.user?.id_usuario || req.query.id_usuario;

      const viajes = await viajesService.obtenerViajesDeUsuario(usuarioId);

      res.status(200).json({
        success: true,
        data: viajes
      });
    } catch (error) {
      logger.error('Error en obtenerViajes controller:', error);
      next(error);
    }
  }

  /**
   * Obtiene el detalle de un viaje
   */
  async obtenerViajeDetalle(req, res, next) {
    try {
      const { id } = req.params;

      const viaje = await viajesService.obtenerViajeDetalle(id);

      res.status(200).json({
        success: true,
        data: viaje
      });
    } catch (error) {
      logger.error('Error en obtenerViajeDetalle controller:', error);
      next(error);
    }
  }

  /**
   * Actualiza un viaje
   */
  async actualizarViaje(req, res, next) {
    try {
      const { id } = req.params;

      const viaje = await viajesService.actualizarViaje(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Viaje actualizado exitosamente',
        data: viaje
      });
    } catch (error) {
      logger.error('Error en actualizarViaje controller:', error);
      next(error);
    }
  }

  /**
   * Elimina un viaje
   */
  async eliminarViaje(req, res, next) {
    try {
      const { id } = req.params;

      await viajesService.eliminarViaje(id);

      res.status(200).json({
        success: true,
        message: 'Viaje eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error en eliminarViaje controller:', error);
      next(error);
    }
  }
}

module.exports = new ViajesController();
