"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardarReporteCostosGanancias = exports.generarReporteCostosGanancias = exports.mostrarFormularioCostosGanancias = void 0;
const typeorm_1 = require("typeorm");
const conexion_1 = require("../db/conexion");
const movimientoInventarioModel_1 = require("../models/movimientoInventarioModel");
const boletaModel_1 = require("../models/boletaModel");
const reporteModel_1 = require("../models/reporteModel");
const ventaModel_1 = require("../models/ventaModel");
const repoMovimiento = conexion_1.AppDataSource.getRepository(movimientoInventarioModel_1.MovimientoInventario);
const repoBoleta = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const repoReporte = conexion_1.AppDataSource.getRepository(reporteModel_1.Reporte);
const repoVenta = conexion_1.AppDataSource.getRepository(ventaModel_1.Venta);
function obtenerRangoMensual(mes) {
    const [anioStr, mesStr] = mes.split('-');
    const anio = parseInt(anioStr, 10);
    const mesIndex = parseInt(mesStr, 10) - 1;
    const inicio = new Date(anio, mesIndex, 1);
    const fin = new Date(anio, mesIndex + 1, 0);
    const formato = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    return `${formato(inicio)} - ${formato(fin)}`;
}
const mostrarFormularioCostosGanancias = (req, res) => {
    res.render('costosGanancias', {
        datos: null,
        periodo: null,
        mes: null,
        reporteYaGenerado: false
    });
};
exports.mostrarFormularioCostosGanancias = mostrarFormularioCostosGanancias;
const generarReporteCostosGanancias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const movimientos = yield repoMovimiento.find({
        where: { fecha: (0, typeorm_1.Between)(fechaInicio, fechaFin) },
        relations: ['producto']
    });
    // Boletas entregadas en el rango
    const boletas = yield repoBoleta.find({
        where: { fechaEntrega: (0, typeorm_1.Between)(fechaInicio, fechaFin) }
    });
    // Total ventas dentro del rango
    const totalVentasRaw = yield repoVenta
        .createQueryBuilder('venta')
        .select('SUM(venta.total)', 'total')
        .where('venta.fecha BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
        .getRawOne();
    const totalVentas = Number(totalVentasRaw.total) || 0;
    // Total señas pagadas (boletas en estados 'aprobado' o 'reparando')
    const totalSeniasRaw = yield repoBoleta
        .createQueryBuilder('boleta')
        .select('SUM(boleta.senado)', 'total')
        .where('boleta.estado IN (:...estados)', { estados: ['aprobado', 'reparando'] })
        .andWhere('boleta.fechaSenado BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
        .getRawOne();
    const totalSenias = Number(totalSeniasRaw.total) || 0;
    // Total entregas cobradas (boletas entregadas)
    const totalEntregasRaw = yield repoBoleta
        .createQueryBuilder('boleta')
        .select('SUM(boleta.total - boleta.senado)', 'total')
        .where('boleta.estado IN (:...estados)', { estados: ['entregado', 'entregado_no_reparado'] })
        .andWhere('boleta.fechaEntrega BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin })
        .getRawOne();
    const totalEntregas = Number(totalEntregasRaw.total) || 0;
    // Movimientos SALIDA que son pérdidas (motivo != "Venta registrada")
    const movimientosSalidaPerdidas = movimientos.filter(m => m.tipo === movimientoInventarioModel_1.TipoMovimiento.SALIDA && m.motivo !== 'Venta registrada');
    const totalPerdidas = movimientosSalidaPerdidas.reduce((sum, m) => { var _a; return sum + m.cantidad * Number(((_a = m.producto) === null || _a === void 0 ? void 0 : _a.precio_compra) || 0); }, 0);
    // Costos: entradas + costo boletas + pérdidas
    const totalCostosProductos = movimientos
        .filter(m => m.tipo === movimientoInventarioModel_1.TipoMovimiento.ENTRADA)
        .reduce((sum, m) => { var _a; return sum + m.cantidad * Number(((_a = m.producto) === null || _a === void 0 ? void 0 : _a.precio_compra) || 0); }, 0);
    const totalCostosBoletas = boletas.reduce((sum, b) => sum + Number(b.costo || 0), 0);
    const totalCostos = totalCostosProductos + totalCostosBoletas + totalPerdidas;
    // Total ingresos: ventas + señas + entregas (sin sumar movimientosSalidaVentas para no duplicar)
    const totalIngresos = totalVentas + totalSenias + totalEntregas;
    const ganancia = totalIngresos - totalCostos;
    const datos = { totalIngresos, totalCostos, ganancia };
    const reporteExistente = yield repoReporte.findOne({
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
});
exports.generarReporteCostosGanancias = generarReporteCostosGanancias;
const guardarReporteCostosGanancias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield repoReporte.save(nuevoReporte);
    res.redirect('/reportes');
});
exports.guardarReporteCostosGanancias = guardarReporteCostosGanancias;
