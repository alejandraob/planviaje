const { Gasto, Deuda, MiembroViaje, User, Viaje, sequelize } = require('../models');
const { MONEDAS } = require('../config/constants');
const { Op } = require('sequelize');

class ReportesService {
  /**
   * Genera un reporte completo del viaje con todos los gastos y deudas
   */
  async generarReporteViaje(viajeId, monedaReferencia = MONEDAS.ARS) {
    try {
      // 3. Obtener todos los gastos
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId },
        include: [{
          model: User,
          as: 'pagador',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }],
        order: [['fecha_gasto', 'DESC']]
      });

      // Calcular totales en las 3 monedas
      const totales = {
        total_ars: 0,
        total_clp: 0,
        total_usd: 0
      };

      const gastosFormateados = gastos.map(gasto => {
        totales.total_ars += parseFloat(gasto.monto_ars || 0);
        totales.total_clp += parseFloat(gasto.monto_clp || 0);
        totales.total_usd += parseFloat(gasto.monto_usd || 0);

        return {
          id_gasto: gasto.id_gasto,
          descripcion: gasto.descripcion,
          categoria: gasto.categoria,
          monto_ars: parseFloat(gasto.monto_ars || 0),
          monto_clp: parseFloat(gasto.monto_clp || 0),
          monto_usd: parseFloat(gasto.monto_usd || 0),
          moneda_original: gasto.moneda_original,
          fecha_gasto: gasto.fecha_gasto,
          pagador: gasto.pagador ? `${gasto.pagador.nombre} ${gasto.pagador.apellido}` : 'Desconocido'
        };
      });

      // Obtener fecha de la última tasa actualizada
      const { TasaCambio } = require('../models');
      const ultimaTasa = await TasaCambio.findOne({
        order: [['fecha_actualizacion', 'DESC']],
        attributes: ['fecha_actualizacion']
      });

      const fechaTasa = ultimaTasa ? new Date(ultimaTasa.fecha_actualizacion).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR');

      return {
        total_ars: parseFloat(totales.total_ars.toFixed(2)),
        total_clp: parseFloat(totales.total_clp.toFixed(2)),
        total_usd: parseFloat(totales.total_usd.toFixed(2)),
        gastos: gastosFormateados,
        nota_tasas: `Tasas del ${fechaTasa}`,
        fecha_generacion: new Date()
      };
    } catch (error) {
      console.error('Error generando reporte de viaje:', error);
      throw error;
    }
  }

  /**
   * Calcula estadísticas generales de gastos
   */
  _calcularEstadisticasGastos(gastos, monedaReferencia) {
    if (gastos.length === 0) {
      return {
        total: 0,
        promedio: 0,
        maximo: 0,
        minimo: 0,
        confirmados: 0,
        pendientes: 0
      };
    }

    const montos = gastos.map(g => this._obtenerMontoEnMoneda(g, monedaReferencia));
    const total = montos.reduce((sum, monto) => sum + monto, 0);
    const confirmados = gastos.filter(g => g.confirmado).length;

    return {
      total: parseFloat(total.toFixed(2)),
      promedio: parseFloat((total / gastos.length).toFixed(2)),
      promedio_por_persona: 0, // Se calculará después
      maximo: parseFloat(Math.max(...montos).toFixed(2)),
      minimo: parseFloat(Math.min(...montos).toFixed(2)),
      total_gastos: gastos.length,
      confirmados,
      pendientes: gastos.length - confirmados,
      moneda: monedaReferencia
    };
  }

  /**
   * Calcula estadísticas por usuario
   */
  _calcularEstadisticasPorUsuario(miembros, gastos, deudas, monedaReferencia) {
    const estadisticas = {};

    miembros.forEach(miembro => {
      const userId = miembro.id_usuario;
      const usuario = miembro.usuario;

      // Gastos pagados por este usuario
      const gastosPagados = gastos.filter(g => g.id_usuario_pagador === userId);
      const totalPagado = gastosPagados.reduce(
        (sum, g) => sum + this._obtenerMontoEnMoneda(g, monedaReferencia),
        0
      );

      // Deudas del usuario
      const deudasUsuario = deudas.filter(d => d.id_usuario_deudor === userId && d.estado_deuda === 'pendiente');
      const totalDeudas = deudasUsuario.reduce(
        (sum, d) => sum + this._obtenerMontoDeDeuda(d, monedaReferencia),
        0
      );

      // Dinero que le deben
      const creditosUsuario = deudas.filter(d => d.id_usuario_acreedor === userId && d.estado_deuda === 'pendiente');
      const totalCreditos = creditosUsuario.reduce(
        (sum, d) => sum + this._obtenerMontoDeDeuda(d, monedaReferencia),
        0
      );

      estadisticas[userId] = {
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        email: usuario.email,
        gastos_realizados: gastosPagados.length,
        total_pagado: parseFloat(totalPagado.toFixed(2)),
        total_debe: parseFloat(totalDeudas.toFixed(2)),
        total_le_deben: parseFloat(totalCreditos.toFixed(2)),
        balance_neto: parseFloat((totalCreditos - totalDeudas).toFixed(2)),
        moneda: monedaReferencia
      };
    });

    return estadisticas;
  }

  /**
   * Calcula gastos agrupados por categoría
   */
  _calcularGastosPorCategoria(gastos, monedaReferencia) {
    const categorias = {};

    gastos.forEach(gasto => {
      const categoria = gasto.categoria_gasto || 'Sin categoría';
      const monto = this._obtenerMontoEnMoneda(gasto, monedaReferencia);

      if (!categorias[categoria]) {
        categorias[categoria] = {
          total: 0,
          cantidad: 0,
          gastos: []
        };
      }

      categorias[categoria].total += monto;
      categorias[categoria].cantidad += 1;
      categorias[categoria].gastos.push({
        descripcion: gasto.descripcion,
        monto: parseFloat(monto.toFixed(2)),
        fecha: gasto.fecha_gasto
      });
    });

    // Calcular porcentajes
    const totalGeneral = Object.values(categorias).reduce((sum, cat) => sum + cat.total, 0);

    Object.keys(categorias).forEach(cat => {
      categorias[cat].total = parseFloat(categorias[cat].total.toFixed(2));
      categorias[cat].promedio = parseFloat((categorias[cat].total / categorias[cat].cantidad).toFixed(2));
      categorias[cat].porcentaje = parseFloat(((categorias[cat].total / totalGeneral) * 100).toFixed(2));
    });

    return categorias;
  }

  /**
   * Calcula gastos agrupados por día
   */
  _calcularGastosPorDia(gastos, monedaReferencia) {
    const dias = {};

    gastos.forEach(gasto => {
      const fecha = new Date(gasto.fecha_gasto).toISOString().split('T')[0];
      const monto = this._obtenerMontoEnMoneda(gasto, monedaReferencia);

      if (!dias[fecha]) {
        dias[fecha] = {
          total: 0,
          cantidad: 0,
          gastos: []
        };
      }

      dias[fecha].total += monto;
      dias[fecha].cantidad += 1;
      dias[fecha].gastos.push({
        descripcion: gasto.descripcion,
        categoria: gasto.categoria_gasto,
        monto: parseFloat(monto.toFixed(2)),
        pagador: gasto.pagador ? `${gasto.pagador.nombre} ${gasto.pagador.apellido}` : 'Desconocido'
      });
    });

    // Formatear totales
    Object.keys(dias).forEach(fecha => {
      dias[fecha].total = parseFloat(dias[fecha].total.toFixed(2));
      dias[fecha].promedio = parseFloat((dias[fecha].total / dias[fecha].cantidad).toFixed(2));
    });

    return dias;
  }

  /**
   * Genera reporte de gastos por período (día/semana/mes)
   */
  async generarReportePorPeriodo(viajeId, periodo = 'dia', monedaReferencia = MONEDAS.ARS) {
    try {
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId },
        order: [['fecha_gasto', 'ASC']]
      });

      if (gastos.length === 0) {
        return { periodos: [], total: 0 };
      }

      const periodos = {};
      let formatoFecha;

      switch (periodo) {
        case 'semana':
          formatoFecha = (fecha) => {
            const d = new Date(fecha);
            const semana = Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
            return `${d.getFullYear()}-W${semana}`;
          };
          break;
        case 'mes':
          formatoFecha = (fecha) => {
            const d = new Date(fecha);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          };
          break;
        case 'dia':
        default:
          formatoFecha = (fecha) => new Date(fecha).toISOString().split('T')[0];
      }

      gastos.forEach(gasto => {
        const clave = formatoFecha(gasto.fecha_gasto);
        const monto = this._obtenerMontoEnMoneda(gasto, monedaReferencia);

        if (!periodos[clave]) {
          periodos[clave] = { total: 0, cantidad: 0 };
        }

        periodos[clave].total += monto;
        periodos[clave].cantidad += 1;
      });

      const resultado = Object.entries(periodos).map(([periodo, datos]) => ({
        periodo,
        total: parseFloat(datos.total.toFixed(2)),
        cantidad: datos.cantidad,
        promedio: parseFloat((datos.total / datos.cantidad).toFixed(2))
      }));

      const totalGeneral = resultado.reduce((sum, p) => sum + p.total, 0);

      return {
        tipo_periodo: periodo,
        periodos: resultado,
        total: parseFloat(totalGeneral.toFixed(2)),
        moneda: monedaReferencia
      };
    } catch (error) {
      console.error('Error generando reporte por período:', error);
      throw error;
    }
  }

  /**
   * Genera reporte comparativo entre monedas
   */
  async generarReporteComparativoMonedas(viajeId) {
    try {
      const gastos = await Gasto.findAll({
        where: { id_viaje: viajeId }
      });

      if (gastos.length === 0) {
        return {
          totales: { ARS: 0, CLP: 0, USD: 0 },
          por_moneda_original: {}
        };
      }

      // Totales en cada moneda
      const totales = {
        ARS: gastos.reduce((sum, g) => sum + parseFloat(g.monto_ars || 0), 0),
        CLP: gastos.reduce((sum, g) => sum + parseFloat(g.monto_clp || 0), 0),
        USD: gastos.reduce((sum, g) => sum + parseFloat(g.monto_usd || 0), 0)
      };

      // Gastos agrupados por moneda original
      const porMonedaOriginal = {
        ARS: { cantidad: 0, total_original: 0 },
        CLP: { cantidad: 0, total_original: 0 },
        USD: { cantidad: 0, total_original: 0 }
      };

      gastos.forEach(gasto => {
        const moneda = gasto.moneda_original;
        porMonedaOriginal[moneda].cantidad += 1;
        porMonedaOriginal[moneda].total_original += this._obtenerMontoEnMoneda(gasto, moneda);
      });

      return {
        totales: {
          ARS: parseFloat(totales.ARS.toFixed(2)),
          CLP: parseFloat(totales.CLP.toFixed(2)),
          USD: parseFloat(totales.USD.toFixed(2))
        },
        por_moneda_original: {
          ARS: {
            cantidad: porMonedaOriginal.ARS.cantidad,
            total: parseFloat(porMonedaOriginal.ARS.total_original.toFixed(2)),
            promedio: porMonedaOriginal.ARS.cantidad > 0
              ? parseFloat((porMonedaOriginal.ARS.total_original / porMonedaOriginal.ARS.cantidad).toFixed(2))
              : 0
          },
          CLP: {
            cantidad: porMonedaOriginal.CLP.cantidad,
            total: parseFloat(porMonedaOriginal.CLP.total_original.toFixed(2)),
            promedio: porMonedaOriginal.CLP.cantidad > 0
              ? parseFloat((porMonedaOriginal.CLP.total_original / porMonedaOriginal.CLP.cantidad).toFixed(2))
              : 0
          },
          USD: {
            cantidad: porMonedaOriginal.USD.cantidad,
            total: parseFloat(porMonedaOriginal.USD.total_original.toFixed(2)),
            promedio: porMonedaOriginal.USD.cantidad > 0
              ? parseFloat((porMonedaOriginal.USD.total_original / porMonedaOriginal.USD.cantidad).toFixed(2))
              : 0
          }
        },
        total_gastos: gastos.length
      };
    } catch (error) {
      console.error('Error generando reporte comparativo de monedas:', error);
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
}

module.exports = new ReportesService();
