/**
 * Models Index
 * Central export for all Sequelize models with associations
 */

const { sequelize } = require('../config/database');

// Import all models
const Usuario = require('./Usuario');
const Viaje = require('./Viaje');
const MiembroViaje = require('./MiembroViaje');
const Cronograma = require('./Cronograma');
const Franja = require('./Franja');
const Alojamiento = require('./Alojamiento');
const Actividad = require('./Actividad');
const Subgrupo = require('./Subgrupo');
const SubgrupoMiembro = require('./SubgrupoMiembro');
const Gasto = require('./Gasto');
const GastoSubgrupo = require('./GastoSubgrupo');
const Deuda = require('./Deuda');
const DeudaSubgrupo = require('./DeudaSubgrupo');
const Pago = require('./Pago');
const Notificacion = require('./Notificacion');
const Auditoria = require('./Auditoria');
const ConfiguracionViaje = require('./ConfiguracionViaje');
const TasasCambio = require('./TasasCambio');

/**
 * Define model associations
 */
const setupAssociations = () => {
  // ==================== USUARIO ASSOCIATIONS ====================

  // Usuario -> Viajes (as admin principal)
  Usuario.hasMany(Viaje, {
    foreignKey: 'id_admin_principal',
    as: 'viajesComoAdminPrincipal'
  });
  Viaje.belongsTo(Usuario, {
    foreignKey: 'id_admin_principal',
    as: 'adminPrincipal'
  });

  // Usuario -> Viajes (as admin secundario)
  Usuario.hasMany(Viaje, {
    foreignKey: 'id_admin_secundario_actual',
    as: 'viajesComoAdminSecundario'
  });
  Viaje.belongsTo(Usuario, {
    foreignKey: 'id_admin_secundario_actual',
    as: 'adminSecundario'
  });

  // Usuario -> MiembroViaje
  Usuario.hasMany(MiembroViaje, {
    foreignKey: 'id_usuario',
    as: 'participaciones'
  });
  MiembroViaje.belongsTo(Usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario'
  });

  // Usuario -> Alojamientos (as creador)
  Usuario.hasMany(Alojamiento, {
    foreignKey: 'id_usuario_creador',
    as: 'alojamientosCreados'
  });

  // Usuario -> Alojamientos (as reserva)
  Usuario.hasMany(Alojamiento, {
    foreignKey: 'id_usuario_reserva',
    as: 'alojamientosReservados'
  });

  // Usuario -> Actividades (as creador)
  Usuario.hasMany(Actividad, {
    foreignKey: 'id_usuario_creador',
    as: 'actividadesCreadas'
  });

  // Usuario -> Actividades (as pago)
  Usuario.hasMany(Actividad, {
    foreignKey: 'id_usuario_pago',
    as: 'actividadesPagadas'
  });

  // Usuario -> Gastos (as creador)
  Usuario.hasMany(Gasto, {
    foreignKey: 'id_usuario_creador',
    as: 'gastosCreados'
  });

  // Usuario -> Gastos (as pagador)
  Usuario.hasMany(Gasto, {
    foreignKey: 'id_usuario_pagador',
    as: 'gastosPagados'
  });

  // Usuario -> Deudas (as acreedor)
  Usuario.hasMany(Deuda, {
    foreignKey: 'id_acreedor',
    as: 'deudasComoAcreedor'
  });

  // Usuario -> Deudas (as deudor)
  Usuario.hasMany(Deuda, {
    foreignKey: 'id_deudor',
    as: 'deudasComoDeudor'
  });

  // Usuario -> Subgrupos (as representante)
  Usuario.hasMany(Subgrupo, {
    foreignKey: 'id_representante',
    as: 'subgruposComoRepresentante'
  });

  // ==================== VIAJE ASSOCIATIONS ====================

  // Viaje -> MiembroViaje
  Viaje.hasMany(MiembroViaje, {
    foreignKey: 'id_viaje',
    as: 'miembros'
  });
  MiembroViaje.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Cronograma (1:1)
  Viaje.hasOne(Cronograma, {
    foreignKey: 'id_viaje',
    as: 'cronograma'
  });
  Cronograma.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Franjas
  Viaje.hasMany(Franja, {
    foreignKey: 'id_viaje',
    as: 'franjas'
  });
  Franja.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Alojamientos
  Viaje.hasMany(Alojamiento, {
    foreignKey: 'id_viaje',
    as: 'alojamientos'
  });
  Alojamiento.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Actividades
  Viaje.hasMany(Actividad, {
    foreignKey: 'id_viaje',
    as: 'actividades'
  });
  Actividad.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Subgrupos
  Viaje.hasMany(Subgrupo, {
    foreignKey: 'id_viaje',
    as: 'subgrupos'
  });
  Subgrupo.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Gastos
  Viaje.hasMany(Gasto, {
    foreignKey: 'id_viaje',
    as: 'gastos'
  });
  Gasto.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Deudas
  Viaje.hasMany(Deuda, {
    foreignKey: 'id_viaje',
    as: 'deudas'
  });
  Deuda.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Notificaciones
  Viaje.hasMany(Notificacion, {
    foreignKey: 'id_viaje',
    as: 'notificaciones'
  });
  Notificacion.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> Auditoria
  Viaje.hasMany(Auditoria, {
    foreignKey: 'id_viaje',
    as: 'auditorias'
  });
  Auditoria.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> ConfiguracionViaje (1:1)
  Viaje.hasOne(ConfiguracionViaje, {
    foreignKey: 'id_viaje',
    as: 'configuracion'
  });
  ConfiguracionViaje.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // Viaje -> TasasCambio (1:1)
  Viaje.hasOne(TasasCambio, {
    foreignKey: 'id_viaje',
    as: 'tasasCambio'
  });
  TasasCambio.belongsTo(Viaje, {
    foreignKey: 'id_viaje',
    as: 'viaje'
  });

  // ==================== CRONOGRAMA ASSOCIATIONS ====================

  // Cronograma -> Franjas
  Cronograma.hasMany(Franja, {
    foreignKey: 'id_cronograma',
    as: 'franjas'
  });
  Franja.belongsTo(Cronograma, {
    foreignKey: 'id_cronograma',
    as: 'cronograma'
  });

  // ==================== FRANJA ASSOCIATIONS ====================

  // Franja -> Alojamientos
  Franja.hasMany(Alojamiento, {
    foreignKey: 'id_franja',
    as: 'alojamientos'
  });
  Alojamiento.belongsTo(Franja, {
    foreignKey: 'id_franja',
    as: 'franja'
  });

  // Franja -> Actividades
  Franja.hasMany(Actividad, {
    foreignKey: 'id_franja',
    as: 'actividades'
  });
  Actividad.belongsTo(Franja, {
    foreignKey: 'id_franja',
    as: 'franja'
  });

  // ==================== ALOJAMIENTO ASSOCIATIONS ====================

  // Alojamiento -> Usuario (creador)
  Alojamiento.belongsTo(Usuario, {
    foreignKey: 'id_usuario_creador',
    as: 'usuarioCreador'
  });

  // Alojamiento -> Usuario (usuario reserva)
  Alojamiento.belongsTo(Usuario, {
    foreignKey: 'id_usuario_reserva',
    as: 'usuarioReserva'
  });

  // ==================== ACTIVIDAD ASSOCIATIONS ====================

  // Actividad -> Usuario (creador)
  Actividad.belongsTo(Usuario, {
    foreignKey: 'id_usuario_creador',
    as: 'usuarioCreador'
  });

  // Actividad -> Usuario (usuario pago)
  Actividad.belongsTo(Usuario, {
    foreignKey: 'id_usuario_pago',
    as: 'usuarioPago'
  });

  // ==================== SUBGRUPO ASSOCIATIONS ====================

  // Subgrupo -> SubgrupoMiembro
  Subgrupo.hasMany(SubgrupoMiembro, {
    foreignKey: 'id_subgrupo',
    as: 'miembros'
  });
  SubgrupoMiembro.belongsTo(Subgrupo, {
    foreignKey: 'id_subgrupo',
    as: 'subgrupo'
  });

  // Subgrupo -> MiembroViaje (representante)
  Subgrupo.belongsTo(MiembroViaje, {
    foreignKey: 'id_representante',
    as: 'representante'
  });

  // SubgrupoMiembro -> MiembroViaje
  SubgrupoMiembro.belongsTo(MiembroViaje, {
    foreignKey: 'id_miembro_viaje',
    as: 'miembroViaje'
  });

  // Subgrupo -> GastoSubgrupo
  Subgrupo.hasMany(GastoSubgrupo, {
    foreignKey: 'id_subgrupo',
    as: 'gastos'
  });
  GastoSubgrupo.belongsTo(Subgrupo, {
    foreignKey: 'id_subgrupo',
    as: 'subgrupo'
  });

  // Subgrupo -> DeudaSubgrupo
  Subgrupo.hasMany(DeudaSubgrupo, {
    foreignKey: 'id_subgrupo',
    as: 'deudas'
  });
  DeudaSubgrupo.belongsTo(Subgrupo, {
    foreignKey: 'id_subgrupo',
    as: 'subgrupo'
  });

  // ==================== GASTO ASSOCIATIONS ====================

  // Gasto -> Usuario (creador)
  Gasto.belongsTo(Usuario, {
    foreignKey: 'id_usuario_creador',
    as: 'creador'
  });

  // Gasto -> Usuario (pagador)
  Gasto.belongsTo(Usuario, {
    foreignKey: 'id_usuario_pagador',
    as: 'pagador'
  });

  // Gasto -> Alojamiento (referencia)
  Gasto.belongsTo(Alojamiento, {
    foreignKey: 'id_alojamiento_referencia',
    as: 'alojamientoReferencia'
  });

  // Gasto -> Actividad (referencia)
  Gasto.belongsTo(Actividad, {
    foreignKey: 'id_actividad_referencia',
    as: 'actividadReferencia'
  });

  // Gasto -> Gasto (padre-hijo)
  Gasto.hasMany(Gasto, {
    foreignKey: 'id_gasto_padre',
    as: 'gastosHijos'
  });
  Gasto.belongsTo(Gasto, {
    foreignKey: 'id_gasto_padre',
    as: 'gastoPadre'
  });

  // Gasto -> Deudas
  Gasto.hasMany(Deuda, {
    foreignKey: 'id_gasto',
    as: 'deudas'
  });
  Deuda.belongsTo(Gasto, {
    foreignKey: 'id_gasto',
    as: 'gasto'
  });

  // ==================== DEUDA ASSOCIATIONS ====================

  // Deuda -> Usuario (acreedor)
  Deuda.belongsTo(Usuario, {
    foreignKey: 'id_acreedor',
    as: 'acreedor'
  });

  // Deuda -> Usuario (deudor)
  Deuda.belongsTo(Usuario, {
    foreignKey: 'id_deudor',
    as: 'deudor'
  });

  // Deuda -> Pagos
  Deuda.hasMany(Pago, {
    foreignKey: 'id_deuda',
    as: 'pagos'
  });
  Pago.belongsTo(Deuda, {
    foreignKey: 'id_deuda',
    as: 'deuda'
  });

  // ==================== PAGO ASSOCIATIONS ====================

  // Pago -> Usuario (pagador)
  Pago.belongsTo(Usuario, {
    foreignKey: 'id_pagador',
    as: 'pagador'
  });

  // Pago -> Usuario (confirmador)
  Pago.belongsTo(Usuario, {
    foreignKey: 'id_confirmador',
    as: 'confirmador'
  });

  // ==================== OTHER ASSOCIATIONS ====================

  // MiembroViaje -> Usuario (responsable legal)
  MiembroViaje.belongsTo(Usuario, {
    foreignKey: 'id_responsable_legal',
    as: 'responsableLegal'
  });

  // Notificacion -> Usuario (destinatario)
  Notificacion.belongsTo(Usuario, {
    foreignKey: 'id_usuario_destinatario',
    as: 'destinatario'
  });

  // Auditoria -> Usuario (quien hizo la acción)
  Auditoria.belongsTo(Usuario, {
    foreignKey: 'id_usuario_accion',
    as: 'usuarioAccion'
  });
};

// Initialize associations
setupAssociations();

// Export all models
module.exports = {
  sequelize,
  Usuario,
  Viaje,
  MiembroViaje,
  Cronograma,
  Franja,
  Alojamiento,
  Actividad,
  Subgrupo,
  SubgrupoMiembro,
  Gasto,
  GastoSubgrupo,
  Deuda,
  DeudaSubgrupo,
  Pago,
  Notificacion,
  Auditoria,
  ConfiguracionViaje,
  TasasCambio
};
