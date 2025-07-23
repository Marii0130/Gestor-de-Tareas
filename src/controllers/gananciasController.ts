import { Request, Response } from 'express';
import { Between } from 'typeorm';
import { AppDataSource } from '../db/conexion';
import { MovimientoInventario, TipoMovimiento } from '../models/movimientoInventarioModel';
import { Boleta } from '../models/boletaModel';
import { Reporte } from '../models/reporteModel';
import { Venta } from '../models/ventaModel';

const repoMovimiento = AppDataSource.getRepository(MovimientoInventario);
const repoBoleta = AppDataSource.getRepository(Boleta);
const repoReporte = AppDataSource.getRepository(Reporte);
const repoVenta = AppDataSource.getRepository(Venta);

function obtenerRangoMensual(mes: string): string {
  const [anioStr, mesStr] = mes.split('-');
  const anio = parseInt(anioStr, 10);
  const mesIndex = parseInt(mesStr, 10) - 1;
  const inicio = new Date(anio, mesIndex, 1);
  const fin = new Date(anio, mesIndex + 1, 0);
  const formato = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  return `${formato(inicio)} - ${formato(fin)}`;
}

export const mostrarFormularioCostosGanancias = (req: Request, res: Response) => {
  res.render('costosGanancias', {
    datos: null,
    periodo: null,
    mes: null,
    reporteYaGenerado: false
  });
};

export const generarReporteCostosGanancias = async (req: Request, res: Response) => {
  const { mes } = req.body;
  if (!mes) {
    return res.render('costosGanancias', {
      datos: null,
      periodo: null,
      mes,
      reporteYaGenerado: false
    });
  }

  const [anioStr, mesStr] = mes.split('-');
  const anio = parseInt(anioStr, 10);
  const mesNum = parseInt(mesStr, 10);
  const fechaInicio = new Date(anio, mesNum - 1, 1);
  const fechaFin = new Date(anio, mesNum, 0);
  fechaFin.setHours(23, 59, 59, 999);

  const periodo = obtenerRangoMensual(mes);
  const tipoRango = "Mensual"; // Fijo para este reporte

  // Movimientos con producto en el rango
  const movimientos = await repoMovimiento.find({
    where: { fecha: Between(fechaInicio, fechaFin) },
    relations: ['producto']
  });

  // Boletas entregadas en el rango
  const boletas = await repoBoleta.find({
    where: { fechaEntrega: Between(fechaInicio, fechaFin) }
  });

  // Total ventas dentro del rango
  const totalVentasRaw = await repoVenta
    .createQueryBuilder('venta')
    .select('SUM(venta.total)', 'total')
    .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
    .getRawOne();
  const totalVentas = Number(totalVentasRaw.total) || 0;

  // Total señas pagadas (boletas en estados 'aprobado' o 'reparando')
  const totalSeniasRaw = await repoBoleta
    .createQueryBuilder('boleta')
    .select('SUM(boleta.senado)', 'total')
    .where('boleta.estado IN (:...estados)', { estados: ['aprobado', 'reparando'] })
    .andWhere('boleta.fechaSenado BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
    .getRawOne();
  const totalSenias = Number(totalSeniasRaw.total) || 0;

  // Total entregas cobradas (boletas entregadas)
  const totalEntregasRaw = await repoBoleta
    .createQueryBuilder('boleta')
    .select('SUM(boleta.total - boleta.senado)', 'total')
    .where('boleta.estado IN (:...estados)', { estados: ['entregado', 'entregado_no_reparado'] })
    .andWhere('boleta.fechaEntrega BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
    .getRawOne();
  const totalEntregas = Number(totalEntregasRaw.total) || 0;

  // Movimientos SALIDA que son pérdidas (motivo != "Venta registrada")
  const movimientosSalidaPerdidas = movimientos.filter(
    m => m.tipo === TipoMovimiento.SALIDA && m.motivo !== 'Venta registrada'
  );
  const totalPerdidas = movimientosSalidaPerdidas.reduce(
    (sum, m) => sum + m.cantidad * Number(m.producto?.precio_compra || 0),
    0
  );

  // Costos: entradas + costo boletas + pérdidas
  const totalCostosProductos = movimientos
    .filter(m => m.tipo === TipoMovimiento.ENTRADA)
    .reduce((sum, m) => sum + m.cantidad * Number(m.producto?.precio_compra || 0), 0);

  const totalCostosBoletas = boletas.reduce((sum, b) => sum + Number(b.costo || 0), 0);

  const totalCostos = totalCostosProductos + totalCostosBoletas + totalPerdidas;

  // Total ingresos: ventas + señas + entregas (sin sumar movimientosSalidaVentas para no duplicar)
  const totalIngresos = totalVentas + totalSenias + totalEntregas;

  const ganancia = totalIngresos - totalCostos;

  const datos = { totalIngresos, totalCostos, ganancia };

  const reporteExistente = await repoReporte.findOne({
    where: {
      tipo: 'ganancias',
      parametros: JSON.stringify({ periodo, tipoRango })
    }
  });

  res.render('costosGanancias', {
    datos,
    periodo,
    mes,
    tipoRango,
    reporteYaGenerado: !!reporteExistente
  });
};

export const guardarReporteCostosGanancias = async (req: Request, res: Response) => {
  const { periodo, totalIngresos, totalCostos, ganancia } = req.body;

  const nuevoReporte = repoReporte.create({
    tipo: 'ganancias',
    parametros: JSON.stringify({ periodo,
      tipo: 'mensual' }),
    resumen: JSON.stringify({
      totalIngresos: Number(totalIngresos) || 0,
      totalCostos: Number(totalCostos) || 0,
      ganancia: Number(ganancia) || 0
    })
  });

  await repoReporte.save(nuevoReporte);
  res.redirect('/reportes');
};
