const { Gasto, Deuda, MiembroViaje, User, sequelize } = require('../models');
const { MONEDAS } = require('../config/constants');
const cambiosMonedaService = require('./cambiosMonedaService');

class DeudasService {
  /**
   * Calcula las deudas de un viaje específico
   * Calcula cuánto debe cada usuario a cada otro usuario
   */
  async calcularDeudasViaje(viajeId, monedaReferencia = MONEDAS.ARS) {
    try {
      // 1. Obtener todos los gastos del viaje
      const gastos = await Gasto.findAll({
        where: {
          id_viaje: viajeId,
          confirmado: true
        },
        include: [{
          model: User,
          as: 'pagador',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }]
      });

      if (gastos.length === 0) {
        return { deudas: [], resumen: {} };
      }

      // 2. Obtener todos los miembros del viaje
      const miembros = await MiembroViaje.findAll({
        where: { id_viaje: viajeId },
        include: [{
          model: User,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email']
        }]
      });

      const totalMiembros = miembros.length;
      if (totalMiembros === 0) {
        throw new Error('No hay miembros en este viaje');
      }

      // 3. Calcular balance de cada usuario (cuánto pagó vs cuánto debería pagar)
      const balances = {};
      let totalGastado = 0;

      // Inicializar balances
      miembros.forEach(miembro => {
        balances[miembro.id_usuario] = {
          usuario: miembro.usuario,
          pagado: 0,
          debe_pagar: 0,
          balance: 0 // positivo = le deben, negativo = debe
        };
      });

      // Calcular total pagado por cada usuario
      gastos.forEach(gasto => {
        const montoEnReferencia = this._obtenerMontoEnMoneda(gasto, monedaReferencia);
        balances[gasto.id_usuario_pagador].pagado += montoEnReferencia;
        totalGastado += montoEnReferencia;
      });

      // Calcular cuánto debe pagar cada usuario (división equitativa)
      const montoPorPersona = totalGastado / totalMiembros;
      Object.keys(balances).forEach(userId => {
        balances[userId].debe_pagar = montoPorPersona;
        balances[userId].balance = balances[userId].pagado - montoPorPersona;
      });

      // 4. Calcular deudas entre usuarios (algoritmo de simplificación)
      const deudas = this._calcularDeudasOptimizadas(balances, monedaReferencia);

      // 5. Guardar deudas en la base de datos
      await this._guardarDeudas(viajeId, deudas, monedaReferencia);

      return {
        deudas,
        resumen: {
          total_gastado: totalGastado,
          monto_por_persona: montoPorPersona,
          total_miembros: totalMiembros,
          moneda_referencia: monedaReferencia,
          balances
        }
      };
    } catch (error) {
      console.error('Error calculando deudas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el monto del gasto en la moneda especificada
   */
  _obtenerMontoEnMoneda(gasto, moneda) {
    switch (moneda) {
      case MONEDAS.USD:
        return parseFloat(gasto.monto_usd || 0);
      case MONEDAS.CLP:
        return parseFloat(gasto.monto_clp || 0);
      case MONEDAS.ARS:
      default:
        return parseFloat(gasto.monto_ars || 0);
    }
  }

  /**
   * Algoritmo para calcular deudas optimizadas (mínimo número de transacciones)
   * Usa el método de acreedores y deudores
   */
  _calcularDeudasOptimizadas(balances, monedaReferencia) {
    const deudas = [];

    // Separar en acreedores (balance positivo) y deudores (balance negativo)
    const acreedores = [];
    const deudores = [];

    Object.entries(balances).forEach(([userId, data]) => {
      if (data.balance > 0.01) { // Umbral para evitar centavos
        acreedores.push({
          id_usuario: parseInt(userId),
          usuario: data.usuario,
          monto: data.balance
        });
      } else if (data.balance < -0.01) {
        deudores.push({
          id_usuario: parseInt(userId),
          usuario: data.usuario,
          monto: Math.abs(data.balance)
        });
      }
    });

    // Emparejar acreedores y deudores
    let i = 0, j = 0;
    while (i < acreedores.length && j < deudores.length) {
      const acreedor = acreedores[i];
      const deudor = deudores[j];

      const montoTransferencia = Math.min(acreedor.monto, deudor.monto);

      if (montoTransferencia > 0.01) {
        deudas.push({
          id_usuario_deudor: deudor.id_usuario,
          nombre_deudor: `${deudor.usuario.nombre} ${deudor.usuario.apellido}`,
          id_usuario_acreedor: acreedor.id_usuario,
          nombre_acreedor: `${acreedor.usuario.nombre} ${acreedor.usuario.apellido}`,
          monto: parseFloat(montoTransferencia.toFixed(2)),
          moneda: monedaReferencia
        });
      }

      acreedor.monto -= montoTransferencia;
      deudor.monto -= montoTransferencia;

      if (acreedor.monto < 0.01) i++;
      if (deudor.monto < 0.01) j++;
    }

    return deudas;
  }

  /**
   * Guarda las deudas calculadas en la base de datos
   */
  async _guardarDeudas(viajeId, deudas, monedaReferencia) {
    try {
      // Eliminar deudas anteriores del viaje
      await Deuda.destroy({ where: { id_viaje: viajeId } });

      // Convertir deudas a todas las monedas y guardar
      const deudasParaGuardar = [];

      for (const deuda of deudas) {
        const montosConvertidos = await cambiosMonedaService.convertirGastoATodasLasMonedas(
          deuda.monto,
          monedaReferencia
        );

        deudasParaGuardar.push({
          id_viaje: viajeId,
          id_usuario_deudor: deuda.id_usuario_deudor,
          id_usuario_acreedor: deuda.id_usuario_acreedor,
          monto_ars: montosConvertidos.monto_ars,
          monto_clp: montosConvertidos.monto_clp,
          monto_usd: montosConvertidos.monto_usd,
          moneda_original: monedaReferencia,
          estado_deuda: 'pendiente'
        });
      }

      if (deudasParaGuardar.length > 0) {
        await Deuda.bulkCreate(deudasParaGuardar);
      }

      return deudasParaGuardar;
    } catch (error) {
      console.error('Error guardando deudas:', error);
      throw error;
    }
  }

  /**
   * Obtiene las deudas de un viaje
   */
  async obtenerDeudasViaje(viajeId, monedaReferencia = MONEDAS.ARS) {
    try {
      const deudas = await Deuda.findAll({
        where: { id_viaje: viajeId },
        include: [
          {
            model: User,
            as: 'deudor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          },
          {
            model: User,
            as: 'acreedor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ],
        order: [['monto_ars', 'DESC']]
      });

      // Formatear respuesta
      return deudas.map(deuda => ({
        id_deuda: deuda.id_deuda,
        deudor: {
          id: deuda.deudor.id_usuario,
          nombre: `${deuda.deudor.nombre} ${deuda.deudor.apellido}`
        },
        acreedor: {
          id: deuda.acreedor.id_usuario,
          nombre: `${deuda.acreedor.nombre} ${deuda.acreedor.apellido}`
        },
        monto: this._obtenerMontoDeDeuda(deuda, monedaReferencia),
        moneda: monedaReferencia,
        estado: deuda.estado_deuda,
        fecha_calculo: deuda.createdAt
      }));
    } catch (error) {
      console.error('Error obteniendo deudas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el monto de la deuda en la moneda especificada
   */
  _obtenerMontoDeDeuda(deuda, moneda) {
    switch (moneda) {
      case MONEDAS.USD:
        return parseFloat(deuda.monto_usd || 0);
      case MONEDAS.CLP:
        return parseFloat(deuda.monto_clp || 0);
      case MONEDAS.ARS:
      default:
        return parseFloat(deuda.monto_ars || 0);
    }
  }

  /**
   * Marca una deuda como pagada
   */
  async marcarDeudaPagada(deudaId) {
    try {
      const deuda = await Deuda.findByPk(deudaId);
      if (!deuda) {
        throw new Error('Deuda no encontrada');
      }

      await deuda.update({
        estado_deuda: 'pagada',
        fecha_pago: new Date()
      });

      return deuda;
    } catch (error) {
      console.error('Error marcando deuda como pagada:', error);
      throw error;
    }
  }

  /**
   * Obtiene las deudas de un usuario específico (lo que debe y lo que le deben)
   */
  async obtenerDeudasUsuario(usuarioId, viajeId = null, monedaReferencia = MONEDAS.ARS) {
    try {
      const whereClause = {};
      if (viajeId) {
        whereClause.id_viaje = viajeId;
      }

      // Deudas donde el usuario es deudor (debe dinero)
      const deudasPorPagar = await Deuda.findAll({
        where: {
          ...whereClause,
          id_usuario_deudor: usuarioId,
          estado_deuda: 'pendiente'
        },
        include: [
          {
            model: User,
            as: 'acreedor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      });

      // Deudas donde el usuario es acreedor (le deben dinero)
      const deudasPorCobrar = await Deuda.findAll({
        where: {
          ...whereClause,
          id_usuario_acreedor: usuarioId,
          estado_deuda: 'pendiente'
        },
        include: [
          {
            model: User,
            as: 'deudor',
            attributes: ['id_usuario', 'nombre', 'apellido', 'email']
          }
        ]
      });

      // Calcular totales
      const totalPorPagar = deudasPorPagar.reduce((sum, deuda) =>
        sum + this._obtenerMontoDeDeuda(deuda, monedaReferencia), 0);

      const totalPorCobrar = deudasPorCobrar.reduce((sum, deuda) =>
        sum + this._obtenerMontoDeDeuda(deuda, monedaReferencia), 0);

      return {
        por_pagar: {
          deudas: deudasPorPagar.map(d => ({
            id_deuda: d.id_deuda,
            acreedor: `${d.acreedor.nombre} ${d.acreedor.apellido}`,
            monto: this._obtenerMontoDeDeuda(d, monedaReferencia),
            moneda: monedaReferencia
          })),
          total: totalPorPagar
        },
        por_cobrar: {
          deudas: deudasPorCobrar.map(d => ({
            id_deuda: d.id_deuda,
            deudor: `${d.deudor.nombre} ${d.deudor.apellido}`,
            monto: this._obtenerMontoDeDeuda(d, monedaReferencia),
            moneda: monedaReferencia
          })),
          total: totalPorCobrar
        },
        balance_neto: totalPorCobrar - totalPorPagar,
        moneda: monedaReferencia
      };
    } catch (error) {
      console.error('Error obteniendo deudas de usuario:', error);
      throw error;
    }
  }
}

module.exports = new DeudasService();
