/**
 * Application Constants
 * Global constants used throughout the application
 */

module.exports = {
  // User Status
  USER_STATUS: {
    ACTIVE: 'activo',
    PAUSED: 'pausado',
    DELETED: 'eliminado'
  },

  // Trip Types
  TRIP_TYPE: {
    INDIVIDUAL: 'individual',
    FRIENDS: 'amigos',
    FAMILY: 'familia'
  },

  // Trip Scope
  TRIP_SCOPE: {
    NATIONAL: 'nacional',
    INTERNATIONAL: 'internacional'
  },

  // Trip Status
  TRIP_STATUS: {
    PLANNING: 'planificacion',
    IN_PROGRESS: 'en_curso',
    FINISHED: 'finalizado',
    CANCELLED: 'cancelado'
  },

  // Member Roles
  MEMBER_ROLE: {
    ADMIN_PRINCIPAL: 'admin_principal',
    ADMIN_SECONDARY: 'admin_secundario',
    MEMBER: 'miembro'
  },

  // Member Participation Status
  PARTICIPATION_STATUS: {
    ACTIVE: 'activo',
    PAUSED: 'pausado',
    RETIRED: 'retirado'
  },

  // Expense Categories
  EXPENSE_CATEGORY: {
    FOOD: 'comida',
    TRANSPORT: 'transporte',
    LODGING: 'alojamiento',
    TICKETS: 'entradas',
    OTHERS: 'otros'
  },

  // Expense Types
  EXPENSE_TYPE: {
    PERSONAL: 'personal',
    GROUP: 'grupal',
    SUBGROUP_PRIVATE: 'subgrupo_privado',
    SHARED_ACTIVITY: 'actividad_compartida'
  },

  // Division Types
  DIVISION_TYPE: {
    ALL_MEMBERS: 'todos_miembros',
    SPECIFIC_MEMBERS: 'miembros_especificos',
    SUBGROUPS: 'subgrupos',
    INDIVIDUAL: 'individual'
  },

  // Expense Status
  EXPENSE_STATUS: {
    PENDING: 'pendiente',
    PAID: 'pagado',
    PARTIALLY_PAID: 'parcialmente_pagado',
    CANCELLED: 'cancelado'
  },

  // Debt Status
  DEBT_STATUS: {
    PENDING: 'pendiente',
    PAID: 'pagada',
    CANCELLED: 'cancelada',
    PAUSED: 'pausada'
  },

  // Payment Methods
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'transferencia_bancaria',
    CASH: 'efectivo',
    MERCADOPAGO: 'mercadopago',
    OTHER: 'otro'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING_CONFIRMATION: 'pendiente_confirmacion',
    CONFIRMED: 'confirmado',
    REJECTED: 'rechazado'
  },

  // Activity Types
  ACTIVITY_TYPE: {
    TICKET: 'entrada',
    VISIT: 'visita',
    FOOD: 'comida',
    TRANSPORT: 'transporte',
    OTHER: 'otro'
  },

  // Activity Status
  ACTIVITY_STATUS: {
    SCHEDULED: 'programada',
    IN_PROGRESS: 'en_curso',
    COMPLETED: 'completada',
    CANCELLED: 'cancelada',
    SUSPENDED: 'suspendida'
  },

  // Notification Event Types
  NOTIFICATION_EVENT: {
    NEW_EXPENSE: 'nuevo_gasto',
    PENDING_PAYMENT: 'pago_pendiente',
    SCHEDULE_CHANGE: 'cambio_cronograma',
    MEMBER_RETIRED: 'miembro_retiro',
    NEW_MEMBER: 'nuevo_miembro',
    OTHER: 'otra'
  },

  // Audit Event Types
  AUDIT_EVENT: {
    CREATE: 'crear',
    EDIT: 'editar',
    DELETE: 'eliminar',
    PAUSE: 'pausar'
  },

  // Currencies
  CURRENCY: {
    ARS: 'ARS',
    CLP: 'CLP',
    USD: 'USD'
  },

  // Exchange Rate Source
  EXCHANGE_SOURCE: {
    API: 'api',
    MANUAL: 'manual'
  },

  // Limits
  LIMITS: {
    MAX_MEMBERS: 30,
    MAX_SUBGROUPS: 30,
    MAX_TRIP_DURATION_DAYS: 365,
    MAX_FILE_SIZE_MB: 10,
    EDIT_EXPENSE_TIME_LIMIT_HOURS: 1
  }
};
