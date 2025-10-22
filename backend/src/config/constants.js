module.exports = {
  // Roles de usuario
  ROLES: {
    ADMIN_PRINCIPAL: 'admin_principal',
    ADMIN_SECUNDARIO: 'admin_secundario',
    MIEMBRO: 'miembro'
  },

  // Tipos de viaje
  TIPOS_VIAJE: {
    INDIVIDUAL: 'individual',
    AMIGOS: 'amigos',
    FAMILIA: 'familia'
  },

  // Alcance del viaje
  ALCANCE_VIAJE: {
    NACIONAL: 'nacional',
    INTERNACIONAL: 'internacional'
  },

  // Estados de participaci├│n
  ESTADOS_PARTICIPACION: {
    ACTIVO: 'activo',
    PAUSADO: 'pausado',
    RETIRADO: 'retirado'
  },

  // Tipos de gasto
  TIPOS_GASTO: {
    INDIVIDUAL: 'individual',
    GRUPAL: 'grupal',
    SUBGRUPO: 'subgrupo'
  },

  // Categor├¡as de gasto
  CATEGORIAS_GASTO: {
    COMIDA: 'comida',
    TRANSPORTE: 'transporte',
    ALOJAMIENTO: 'alojamiento',
    ENTRADAS: 'entradas',
    OTROS: 'otros'
  },

  // Estados de deuda
  ESTADOS_DEUDA: {
    PENDIENTE: 'pendiente',
    PAGADO: 'pagado',
    CONFIRMADO: 'confirmado'
  },

  // Estados de actividad
  ESTADOS_ACTIVIDAD: {
    PROGRAMADA: 'programada',
    COMPLETADA: 'completada',
    CANCELADA: 'cancelada',
    SUSPENDIDA: 'suspendida'
  },

  // Estados de alojamiento
  ESTADOS_ALOJAMIENTO: {
    NO_PAGADO: 'no_pagado',
    PAGADO: 'pagado',
    PARCIALMENTE_PAGADO: 'parcialmente_pagado'
  },

  // Monedas
  MONEDAS: {
    ARS: 'ARS',
    CLP: 'CLP',
    USD: 'USD'
  },

  // L├¡mites
  LIMITES: {
    MAX_MIEMBROS_VIAJE: 30,
    MAX_SUBGRUPOS_VIAJE: 30,
    MAX_DURACION_VIAJE_DIAS: 365,
    MIN_DURACION_VIAJE_DIAS: 1,
    MAX_FILE_SIZE_MB: 10,
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024
  },

  // Tipos de notificaci├│n
  TIPOS_NOTIFICACION: {
    NUEVO_GASTO: 'nuevo_gasto',
    PAGO_PENDIENTE: 'pago_pendiente',
    PAGO_CONFIRMADO: 'pago_confirmado',
    INVITACION_VIAJE: 'invitacion_viaje',
    CAMBIO_CRONOGRAMA: 'cambio_cronograma',
    MIEMBRO_RETIRADO: 'miembro_retirado',
    CAMBIO_ROL: 'cambio_rol'
  },

  // Canales de notificaci├│n
  CANALES_NOTIFICACION: {
    PUSH: 'push',
    EMAIL: 'email',
    WHATSAPP: 'whatsapp'
  },

  // M├®todos de pago
  METODOS_PAGO: {
    EFECTIVO: 'efectivo',
    TRANSFERENCIA: 'transferencia',
    MERCADO_PAGO: 'mercado_pago',
    TARJETA: 'tarjeta'
  },

  // Tipos de acci├│n en auditor├¡a
  TIPOS_ACCION_AUDITORIA: {
    CREAR: 'crear',
    EDITAR: 'editar',
    ELIMINAR: 'eliminar',
    CAMBIO_ESTADO: 'cambio_estado'
  }
};
