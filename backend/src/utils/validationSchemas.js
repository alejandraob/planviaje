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
  email: Joi.string().email().optional(),
  telefono: Joi.string().pattern(/^\+?549?[0-9]{10,13}$/).optional(),
  rol: Joi.string().valid('miembro', 'admin_secundario').default('miembro'),
  es_menor: Joi.boolean().default(false),
  id_responsable_legal: Joi.number().integer().when('es_menor', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  presupuesto_maximo_diario: Joi.number().positive().optional(),
  canales: Joi.array().items(Joi.string().valid('email', 'whatsapp', 'sms')).min(1).required()
}).or('email', 'telefono');

const actualizarMiembroSchema = Joi.object({
  rol: Joi.string().valid('miembro', 'admin_secundario', 'admin_principal').optional(),
  presupuesto_maximo_diario: Joi.number().positive().allow(null).optional(),
  estado_participacion: Joi.string().valid('activo', 'pausado', 'retirado').optional(),
  opcion_retiro_generoso: Joi.string().valid('generoso', 'estricto').optional()
});

// ==================== GASTO SCHEMAS ====================

const crearGastoSchema = Joi.object({
  descripcion: Joi.string().min(3).max(200).required(),
  monto_ars: Joi.number().positive().precision(2).required(),
  monto_clp: Joi.number().positive().precision(2).optional(),
  monto_usd: Joi.number().positive().precision(2).optional(),
  categoria: Joi.string().valid('comida', 'transporte', 'alojamiento', 'entradas', 'otros').required(),
  tipo_gasto: Joi.string().valid('personal', 'grupal', 'subgrupo_privado', 'actividad_compartida').required(),
  tipo_division: Joi.string().valid('todos_miembros', 'miembros_especificos', 'subgrupos', 'individual').required(),
  fecha: Joi.date().iso().required(),
  miembros_asignados: Joi.array().items(Joi.object({
    id_miembro_viaje: Joi.number().integer().required(),
    monto_corresponde: Joi.number().positive().precision(2).optional()
  })).optional(),
  id_gasto_padre: Joi.number().integer().optional(),
  observacion_diferencia: Joi.string().max(200).when('id_gasto_padre', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  url_comprobante: Joi.string().uri().optional()
});

const editarGastoSchema = Joi.object({
  descripcion: Joi.string().min(3).max(200).optional(),
  monto_ars: Joi.number().positive().precision(2).optional(),
  observacion_diferencia: Joi.string().max(200).optional(),
  estado_gasto: Joi.string().valid('pendiente', 'pagado', 'parcialmente_pagado', 'cancelado').optional()
});

// ==================== FRANJA SCHEMAS ====================

const crearFranjaSchema = Joi.object({
  nombre_lugar: Joi.string().min(2).max(100).required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().greater(Joi.ref('fecha_inicio')).required(),
  descripcion: Joi.string().max(500).optional(),
  orden_secuencia: Joi.number().integer().min(1).required()
});

const editarFranjaSchema = Joi.object({
  nombre_lugar: Joi.string().min(2).max(100).optional(),
  fecha_inicio: Joi.date().iso().optional(),
  fecha_fin: Joi.date().iso().optional(),
  descripcion: Joi.string().max(500).optional(),
  estado_franja: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada').optional()
});

// ==================== ALOJAMIENTO SCHEMAS ====================

const crearAlojamientoSchema = Joi.object({
  id_franja: Joi.number().integer().optional(),
  nombre: Joi.string().min(2).max(100).required(),
  link_reserva: Joi.string().uri().optional(),
  fecha_checkin: Joi.date().iso().required(),
  hora_checkin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required(),
  hora_checkout: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  ubicacion_descripcion: Joi.string().max(500).optional(),
  estado_pago: Joi.string().valid('no_pagado', 'pagado', 'parcialmente_pagado').required(),
  monto_total_ars: Joi.number().positive().precision(2).optional(),
  monto_total_clp: Joi.number().positive().precision(2).optional(),
  monto_total_usd: Joi.number().positive().precision(2).optional(),
  miembros_asignados: Joi.array().items(Joi.number().integer()).optional()
});

// ==================== ACTIVIDAD SCHEMAS ====================

const crearActividadSchema = Joi.object({
  id_franja: Joi.number().integer().optional(),
  nombre: Joi.string().min(2).max(100).required(),
  fecha: Joi.date().iso().required(),
  hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  descripcion: Joi.string().max(500).optional(),
  tipo_actividad: Joi.string().valid('entrada', 'visita', 'comida', 'transporte', 'otro').required(),
  es_paga: Joi.boolean().default(false),
  valor_referencial_ars: Joi.number().positive().precision(2).when('es_paga', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  valor_referencial_clp: Joi.number().positive().precision(2).optional(),
  valor_referencial_usd: Joi.number().positive().precision(2).optional(),
  miembros_asignados: Joi.array().items(Joi.number().integer()).min(1).required()
});

// ==================== SUBGRUPO SCHEMAS ====================

const crearSubgrupoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  descripcion: Joi.string().max(500).optional(),
  id_representante: Joi.number().integer().required(),
  miembros: Joi.array().items(Joi.number().integer()).min(1).required()
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

module.exports = {
  // Viaje
  crearViajeSchema,
  editarViajeSchema,

  // Miembro
  invitarMiembroSchema,
  actualizarMiembroSchema,

  // Gasto
  crearGastoSchema,
  editarGastoSchema,

  // Franja
  crearFranjaSchema,
  editarFranjaSchema,

  // Alojamiento
  crearAlojamientoSchema,

  // Actividad
  crearActividadSchema,

  // Subgrupo
  crearSubgrupoSchema,

  // Common
  idParamSchema,
  paginationSchema
};
