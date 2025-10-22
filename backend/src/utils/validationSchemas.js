/**
 * Validation Schemas
 * Joi schemas for request validation
 */

const Joi = require('joi');

// ==================== VIAJE SCHEMAS ====================

const crearViajeSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  tipo: Joi.string().valid('individual', 'amigos', 'familia').required(),
  alcance: Joi.string().valid('nacional', 'internacional').required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().greater(Joi.ref('fecha_inicio')).required(),
  descripcion: Joi.string().max(500).optional(),
  max_miembros: Joi.number().integer().min(1).max(30).default(30),
  max_subgrupos: Joi.number().integer().min(1).max(30).default(30),
  max_franjas: Joi.number().integer().min(1).default(999)
});

const editarViajeSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  descripcion: Joi.string().max(500).optional(),
  estado: Joi.string().valid('planificacion', 'en_curso', 'finalizado', 'cancelado').optional(),
  max_miembros: Joi.number().integer().min(1).max(30).optional(),
  max_subgrupos: Joi.number().integer().min(1).max(30).optional()
});

// ==================== MIEMBRO VIAJE SCHEMAS ====================

const invitarMiembroSchema = Joi.object({
  email: Joi.string().email().required(),
  es_menor: Joi.boolean().default(false),
  id_responsable_legal: Joi.number().integer().optional(),
  presupuesto_maximo_diario: Joi.number().positive().optional()
});

const actualizarMiembroSchema = Joi.object({
  presupuesto_maximo_diario: Joi.number().positive().allow(null).optional(),
  id_responsable_legal: Joi.number().integer().allow(null).optional(),
  es_menor: Joi.boolean().optional()
});

const cambiarAdminSchema = Joi.object({
  id_usuario_nuevo_admin: Joi.number().integer().positive().required()
});

// ==================== GASTO SCHEMAS ====================

const crearGastoSchema = Joi.object({
  id_usuario_pagador: Joi.number().integer().required(),
  descripcion: Joi.string().min(3).max(200).required(),
  monto_ars: Joi.number().positive().precision(2).required(),
  monto_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_usd: Joi.number().positive().precision(2).optional().allow(null),
  categoria: Joi.string().valid('comida', 'transporte', 'alojamiento', 'entradas', 'otros').required(),
  tipo_gasto: Joi.string().valid('personal', 'grupal', 'subgrupo_privado', 'actividad_compartida').required(),
  tipo_division: Joi.string().valid('todos_miembros', 'miembros_especificos', 'subgrupos', 'individual').required(),
  fecha: Joi.date().iso().required(),
  miembros_asignados: Joi.array().items(Joi.object({
    id_miembro_viaje: Joi.number().integer().required(),
    monto_corresponde: Joi.number().positive().precision(2).required()
  })).optional(),
  id_gasto_padre: Joi.number().integer().optional().allow(null),
  observacion_diferencia: Joi.string().max(200).optional().allow(null),
  url_comprobante: Joi.string().uri().optional().allow(null),
  id_alojamiento_referencia: Joi.number().integer().optional().allow(null),
  id_actividad_referencia: Joi.number().integer().optional().allow(null)
});

const editarGastoSchema = Joi.object({
  descripcion: Joi.string().min(3).max(200).optional(),
  monto_ars: Joi.number().positive().precision(2).optional(),
  monto_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_usd: Joi.number().positive().precision(2).optional().allow(null),
  categoria: Joi.string().valid('comida', 'transporte', 'alojamiento', 'entradas', 'otros').optional(),
  fecha: Joi.date().iso().optional(),
  miembros_asignados: Joi.array().items(Joi.object({
    id_miembro_viaje: Joi.number().integer().required(),
    monto_corresponde: Joi.number().positive().precision(2).required()
  })).optional(),
  observacion_diferencia: Joi.string().max(200).optional().allow(null),
  url_comprobante: Joi.string().uri().optional().allow(null)
});

const actualizarEstadoGastoSchema = Joi.object({
  estado_gasto: Joi.string().valid('pendiente', 'pagado', 'parcialmente_pagado', 'cancelado').required(),
  observacion: Joi.string().max(200).optional()
});

const idGastoParamSchema = Joi.object({
  id: Joi.number().integer().required(),
  idGasto: Joi.number().integer().required()
});

const gastosFiltrosSchema = Joi.object({
  categoria: Joi.string().valid('comida', 'transporte', 'alojamiento', 'entradas', 'otros').optional(),
  tipo_gasto: Joi.string().valid('personal', 'grupal', 'subgrupo_privado', 'actividad_compartida').optional(),
  estado_gasto: Joi.string().valid('pendiente', 'pagado', 'parcialmente_pagado', 'cancelado').optional(),
  fecha_desde: Joi.date().iso().optional(),
  fecha_hasta: Joi.date().iso().optional(),
  id_usuario_pagador: Joi.number().integer().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== DEUDA SCHEMAS ====================

const crearDeudaSchema = Joi.object({
  id_acreedor: Joi.number().integer().required(),
  id_deudor: Joi.number().integer().required(),
  id_gasto: Joi.number().integer().required(),
  monto_ars: Joi.number().positive().precision(2).required(),
  monto_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_usd: Joi.number().positive().precision(2).optional().allow(null),
  fecha_vencimiento: Joi.date().iso().optional().allow(null),
  observacion: Joi.string().max(500).optional().allow(null)
});

const editarDeudaSchema = Joi.object({
  monto_ars: Joi.number().positive().precision(2).optional(),
  monto_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_usd: Joi.number().positive().precision(2).optional().allow(null),
  fecha_vencimiento: Joi.date().iso().optional().allow(null),
  observacion: Joi.string().max(500).optional().allow(null)
});

const actualizarEstadoDeudaSchema = Joi.object({
  estado_deuda: Joi.string().valid('pendiente', 'pagada', 'cancelada', 'pausada').required(),
  observacion: Joi.string().max(500).optional()
});

const idDeudaParamSchema = Joi.object({
  id: Joi.number().integer().required(),
  idDeuda: Joi.number().integer().required()
});

const deudasFiltrosSchema = Joi.object({
  estado_deuda: Joi.string().valid('pendiente', 'pagada', 'cancelada', 'pausada').optional(),
  id_acreedor: Joi.number().integer().optional(),
  id_deudor: Joi.number().integer().optional(),
  id_gasto: Joi.number().integer().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== PAGO SCHEMAS ====================

const registrarPagoSchema = Joi.object({
  monto_ars: Joi.number().positive().precision(2).required(),
  monto_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_usd: Joi.number().positive().precision(2).optional().allow(null),
  metodo_pago: Joi.string().valid('efectivo', 'transferencia', 'tarjeta', 'otro').default('transferencia'),
  comprobante_url: Joi.string().uri().optional().allow(null),
  observacion: Joi.string().max(500).optional().allow(null)
});

const rechazarPagoSchema = Joi.object({
  motivo_rechazo: Joi.string().max(500).optional()
});

const idPagoParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idDeuda: Joi.number().integer().positive().required(),
  idPago: Joi.number().integer().positive().required()
});

const pagosFiltrosSchema = Joi.object({
  estado_pago: Joi.string().valid('pendiente', 'confirmado', 'rechazado').optional(),
  metodo_pago: Joi.string().valid('efectivo', 'transferencia', 'tarjeta', 'otro').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== NOTIFICACION SCHEMAS ====================

const enviarNotificacionSchema = Joi.object({
  id_usuario_destinatario: Joi.number().integer().positive().required(),
  id_viaje: Joi.number().integer().positive().required(),
  tipo_evento: Joi.string().valid('nuevo_gasto', 'pago_pendiente', 'cambio_cronograma', 'miembro_retiro', 'nuevo_miembro', 'otra').required(),
  titulo: Joi.string().min(1).max(200).required(),
  contenido: Joi.string().min(1).max(1000).required(),
  canales: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    whatsapp: Joi.boolean().optional()
  }).required(),
  url_accion: Joi.string().uri().optional().allow(null)
});

const difundirNotificacionSchema = Joi.object({
  id_viaje: Joi.number().integer().positive().required(),
  tipo_evento: Joi.string().valid('nuevo_gasto', 'pago_pendiente', 'cambio_cronograma', 'miembro_retiro', 'nuevo_miembro', 'otra').required(),
  titulo: Joi.string().min(1).max(200).required(),
  contenido: Joi.string().min(1).max(1000).required(),
  canales: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    whatsapp: Joi.boolean().optional()
  }).required(),
  url_accion: Joi.string().uri().optional().allow(null),
  excluir_usuario: Joi.number().integer().positive().optional()
});

const idNotificacionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const notificacionesFiltrosSchema = Joi.object({
  id_viaje: Joi.number().integer().positive().optional(),
  tipo_evento: Joi.string().valid('nuevo_gasto', 'pago_pendiente', 'cambio_cronograma', 'miembro_retiro', 'nuevo_miembro', 'otra').optional(),
  leida: Joi.string().valid('true', 'false').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const marcarTodasLeidasQuerySchema = Joi.object({
  id_viaje: Joi.number().integer().positive().optional()
});

// ==================== FRANJA SCHEMAS ====================

const crearFranjaSchema = Joi.object({
  nombre_lugar: Joi.string().min(2).max(100).required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().greater(Joi.ref('fecha_inicio')).required(),
  descripcion: Joi.string().max(500).optional()
});

const editarFranjaSchema = Joi.object({
  nombre_lugar: Joi.string().min(2).max(100).optional(),
  fecha_inicio: Joi.date().iso().optional(),
  fecha_fin: Joi.date().iso().optional(),
  descripcion: Joi.string().max(500).optional(),
  estado_franja: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada').optional()
});

const reordenarFranjaSchema = Joi.object({
  nuevo_orden: Joi.number().integer().min(1).required()
});

const idFranjaParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idFranja: Joi.number().integer().positive().required()
});

const franjasFiltrosSchema = Joi.object({
  estado: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== ALOJAMIENTO SCHEMAS ====================

const crearAlojamientoSchema = Joi.object({
  id_franja: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().min(2).max(100).required(),
  link_reserva: Joi.string().uri().optional().allow(null),
  fecha_checkin: Joi.date().iso().required(),
  hora_checkin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required(),
  hora_checkout: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  ubicacion_descripcion: Joi.string().max(500).optional().allow(null),
  monto_total_ars: Joi.number().positive().precision(2).optional().allow(null),
  monto_total_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_total_usd: Joi.number().positive().precision(2).optional().allow(null),
  monto_pagado_ars: Joi.number().min(0).precision(2).optional().default(0),
  id_usuario_reserva: Joi.number().integer().optional().allow(null),
  miembros_asignados: Joi.array().items(Joi.number().integer()).optional().allow(null)
});

const editarAlojamientoSchema = Joi.object({
  id_franja: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().min(2).max(100).optional(),
  link_reserva: Joi.string().uri().optional().allow(null),
  fecha_checkin: Joi.date().iso().optional(),
  hora_checkin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  fecha_checkout: Joi.date().iso().optional(),
  hora_checkout: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  ubicacion_descripcion: Joi.string().max(500).optional().allow(null),
  monto_total_ars: Joi.number().positive().precision(2).optional().allow(null),
  monto_total_clp: Joi.number().positive().precision(2).optional().allow(null),
  monto_total_usd: Joi.number().positive().precision(2).optional().allow(null),
  monto_pagado_ars: Joi.number().min(0).precision(2).optional(),
  id_usuario_reserva: Joi.number().integer().optional().allow(null),
  miembros_asignados: Joi.array().items(Joi.number().integer()).optional().allow(null)
});

const actualizarPagoAlojamientoSchema = Joi.object({
  monto_pagado_ars: Joi.number().min(0).precision(2).required()
});

const idAlojamientoParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idAlojamiento: Joi.number().integer().positive().required()
});

const alojamientosFiltrosSchema = Joi.object({
  id_franja: Joi.number().integer().optional(),
  estado_pago: Joi.string().valid('no_pagado', 'pagado', 'parcialmente_pagado').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== ACTIVIDAD SCHEMAS ====================

const crearActividadSchema = Joi.object({
  id_franja: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().min(2).max(100).required(),
  fecha: Joi.date().iso().required(),
  hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  descripcion: Joi.string().max(500).optional().allow(null),
  tipo_actividad: Joi.string().valid('entrada', 'visita', 'comida', 'transporte', 'otro').required(),
  es_paga: Joi.boolean().default(false),
  valor_referencial_ars: Joi.number().positive().precision(2).optional().allow(null),
  valor_referencial_clp: Joi.number().positive().precision(2).optional().allow(null),
  valor_referencial_usd: Joi.number().positive().precision(2).optional().allow(null),
  id_usuario_pago: Joi.number().integer().optional().allow(null),
  miembros_asignados: Joi.array().items(Joi.number().integer()).min(1).required()
});

const editarActividadSchema = Joi.object({
  id_franja: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().min(2).max(100).optional(),
  fecha: Joi.date().iso().optional(),
  hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null),
  descripcion: Joi.string().max(500).optional().allow(null),
  tipo_actividad: Joi.string().valid('entrada', 'visita', 'comida', 'transporte', 'otro').optional(),
  es_paga: Joi.boolean().optional(),
  valor_referencial_ars: Joi.number().positive().precision(2).optional().allow(null),
  valor_referencial_clp: Joi.number().positive().precision(2).optional().allow(null),
  valor_referencial_usd: Joi.number().positive().precision(2).optional().allow(null),
  id_usuario_pago: Joi.number().integer().optional().allow(null),
  miembros_asignados: Joi.array().items(Joi.number().integer()).min(1).optional(),
  estado_actividad: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada', 'suspendida').optional()
});

const actualizarPagoActividadSchema = Joi.object({
  id_usuario_pago: Joi.number().integer().required()
});

const idActividadParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idActividad: Joi.number().integer().positive().required()
});

const actividadesFiltrosSchema = Joi.object({
  id_franja: Joi.number().integer().optional(),
  tipo_actividad: Joi.string().valid('entrada', 'visita', 'comida', 'transporte', 'otro').optional(),
  estado_actividad: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada', 'suspendida').optional(),
  es_paga: Joi.string().valid('true', 'false').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== SUBGRUPO SCHEMAS ====================

const crearSubgrupoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  descripcion: Joi.string().max(500).optional(),
  id_representante: Joi.number().integer().required(),
  miembros: Joi.array().items(Joi.number().integer()).min(1).required()
});

const editarSubgrupoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).optional(),
  descripcion: Joi.string().max(500).optional().allow(null),
  id_representante: Joi.number().integer().optional()
});

const agregarMiembroSubgrupoSchema = Joi.object({
  id_miembro_viaje: Joi.number().integer().required()
});

const idSubgrupoParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idSubgrupo: Joi.number().integer().positive().required()
});

const idSubgrupoMiembroParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  idSubgrupo: Joi.number().integer().positive().required(),
  idMiembro: Joi.number().integer().positive().required()
});

// ==================== COMMON SCHEMAS ====================

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  order: Joi.string().valid('ASC', 'DESC').default('DESC'),
  orderBy: Joi.string().default('fecha_creacion')
});

const viajesFiltrosSchema = Joi.object({
  estado: Joi.string().valid('planificacion', 'en_curso', 'finalizado', 'cancelado').optional(),
  tipo: Joi.string().valid('individual', 'amigos', 'familia').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  // Viaje
  crearViajeSchema,
  editarViajeSchema,
  viajesFiltrosSchema,

  // Miembro
  invitarMiembroSchema,
  actualizarMiembroSchema,
  cambiarAdminSchema,

  // Gasto
  crearGastoSchema,
  editarGastoSchema,

  // Franja
  crearFranjaSchema,
  editarFranjaSchema,
  reordenarFranjaSchema,
  idFranjaParamSchema,
  franjasFiltrosSchema,

  // Alojamiento
  crearAlojamientoSchema,
  editarAlojamientoSchema,
  actualizarPagoAlojamientoSchema,
  idAlojamientoParamSchema,
  alojamientosFiltrosSchema,

  // Actividad
  crearActividadSchema,
  editarActividadSchema,
  actualizarPagoActividadSchema,
  idActividadParamSchema,
  actividadesFiltrosSchema,

  // Subgrupo
  crearSubgrupoSchema,
  editarSubgrupoSchema,
  agregarMiembroSubgrupoSchema,
  idSubgrupoParamSchema,
  idSubgrupoMiembroParamSchema,

  // Gasto
  crearGastoSchema,
  editarGastoSchema,
  actualizarEstadoGastoSchema,
  idGastoParamSchema,
  gastosFiltrosSchema,

  // Deuda
  crearDeudaSchema,
  editarDeudaSchema,
  actualizarEstadoDeudaSchema,
  idDeudaParamSchema,
  deudasFiltrosSchema,

  // Pago
  registrarPagoSchema,
  rechazarPagoSchema,
  idPagoParamSchema,
  pagosFiltrosSchema,

  // Notificacion
  enviarNotificacionSchema,
  difundirNotificacionSchema,
  idNotificacionParamSchema,
  notificacionesFiltrosSchema,
  marcarTodasLeidasQuerySchema,

  // Common
  idParamSchema,
  paginationSchema
};
