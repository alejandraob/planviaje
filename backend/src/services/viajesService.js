const { Viaje, MiembroViaje, User, ConfiguracionViaje } = require('../models');
const logger = require('../utils/logger');
const { ROLES_VIAJE, ESTADOS_VIAJE } = require('../config/constants');

/**
 * Servicio de Gesti├│n de Viajes
 */
class ViajesService {
  /**
   * Crea un nuevo viaje
   * @param {Object} data - Datos del viaje
   * @param {number} usuarioCreadorId - ID del usuario creador
   * @returns {Promise<Object>} Viaje creado
   */
  async crearViaje(data, usuarioCreadorId) {
    try {
      const {
        nombre,
        nombre_viaje,
        descripcion,
        fecha_inicio,
        fecha_fin,
        tipo_viaje = 'amigos',
        alcance = 'nacional',
        moneda_principal = 'ARS',
        estado_viaje = 'planificacion'
      } = data;

      // Crear el viaje
      const viaje = await Viaje.create({
        nombre_viaje: nombre_viaje || nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        tipo_viaje,
        alcance,
        moneda_principal,
        estado_viaje,
        id_usuario_creador: usuarioCreadorId
      });

      // Agregar al creador como Admin Principal
      await MiembroViaje.create({
        id_viaje: viaje.id_viaje,
        id_usuario: usuarioCreadorId,
        rol: 'admin_principal',
        estado_confirmacion: 'confirmado'
      });

      // Crear configuraci├│n por defecto
      await ConfiguracionViaje.create({
        id_viaje: viaje.id_viaje,
        moneda_principal: moneda_principal,
        permitir_gastos_offline: true,
        requiere_confirmacion_gastos: false,
        limite_gasto_individual: null
      });

      logger.info(`Viaje creado: ${viaje.id_viaje} - ${viaje.nombre_viaje}`);

      return viaje;
    } catch (error) {
      logger.error('Error al crear viaje:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los viajes de un usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} Lista de viajes
   */
  async obtenerViajesDeUsuario(usuarioId) {
    try {
      const miembros = await MiembroViaje.findAll({
        where: { id_usuario: usuarioId },
        include: [
          {
            model: Viaje,
            as: 'viaje'
          }
        ]
      });

      const viajes = miembros.map(m => ({
        ...m.viaje.toJSON(),
        rol: m.rol,
        estado_confirmacion: m.estado_confirmacion
      }));

      return viajes;
    } catch (error) {
      logger.error('Error al obtener viajes del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle de un viaje
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Detalle del viaje
   */
  async obtenerViajeDetalle(viajeId) {
    try {
      const viaje = await Viaje.findByPk(viajeId, {
        include: [
          {
            model: MiembroViaje,
            as: 'miembros',
            include: [
              {
                model: User,
                as: 'usuario',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'avatar_url']
              }
            ]
          },
          {
            model: ConfiguracionViaje,
            as: 'configuracion'
          }
        ]
      });

      if (!viaje) {
        throw new Error('Viaje no encontrado');
      }

      return viaje;
    } catch (error) {
      logger.error('Error al obtener detalle del viaje:', error);
      throw error;
    }
  }

  /**
   * Actualiza un viaje
   * @param {number} viajeId - ID del viaje
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Viaje actualizado
   */
  async actualizarViaje(viajeId, data) {
    try {
      const viaje = await Viaje.findByPk(viajeId);

      if (!viaje) {
        throw new Error('Viaje no encontrado');
      }

      await viaje.update(data);

      logger.info(`Viaje actualizado: ${viajeId}`);

      return viaje;
    } catch (error) {
      logger.error('Error al actualizar viaje:', error);
      throw error;
    }
  }

  /**
   * Elimina un viaje
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<boolean>} Resultado de la operaci├│n
   */
  async eliminarViaje(viajeId) {
    try {
      const viaje = await Viaje.findByPk(viajeId);

      if (!viaje) {
        throw new Error('Viaje no encontrado');
      }

      await viaje.destroy();

      logger.info(`Viaje eliminado: ${viajeId}`);

      return true;
    } catch (error) {
      logger.error('Error al eliminar viaje:', error);
      throw error;
    }
  }

  /**
   * Agrega un miembro al viaje
   * @param {number} viajeId - ID del viaje
   * @param {number} usuarioId - ID del usuario
   * @param {string} rol - Rol del miembro
   * @returns {Promise<Object>} Miembro creado
   */
  async agregarMiembro(viajeId, usuarioId, rol = 'miembro') {
    try {
      const miembro = await MiembroViaje.create({
        id_viaje: viajeId,
        id_usuario: usuarioId,
        rol: rol,
        estado_confirmacion: 'pendiente'
      });

      logger.info(`Miembro agregado al viaje ${viajeId}: usuario ${usuarioId}`);

      return miembro;
    } catch (error) {
      logger.error('Error al agregar miembro:', error);
      throw error;
    }
  }
}

module.exports = new ViajesService();
