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
exports.generarReporteIngresos = exports.buscarIngresos = exports.mostrarFormularioIngresos = void 0;
const typeorm_1 = require("typeorm");
const conexion_1 = require("../db/conexion");
const ventaModel_1 = require("../models/ventaModel");
const boletaModel_1 = require("../models/boletaModel");
const reporteModel_1 = require("../models/reporteModel");
const repoVenta = conexion_1.AppDataSource.getRepository(ventaModel_1.Venta);
const repoBoleta = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const repoReporte = conexion_1.AppDataSource.getRepository(reporteModel_1.Reporte);
// 1. Mostrar formulario sin datos
const mostrarFormularioIngresos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('ingresosPorFecha', { datos: null, tipo: null, periodo: null });
});
exports.mostrarFormularioIngresos = mostrarFormularioIngresos;
// 2. Buscar ingresos y mostrar resultados
const buscarIngresos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tipo, semana, mes } = req.body;
    let fechaInicio, fechaFin;
    let periodo = '';
    if (tipo === 'semanal' && semana) {
        const [anio, semanaStr] = semana.split('-W');
        const semanaNum = parseInt(semanaStr);
        const primerDia = new Date(`${anio}-01-01`);
        const diasOffset = (semanaNum - 1) * 7;
        fechaInicio = new Date(primerDia.getTime() + diasOffset * 86400000);
        fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay() + 1);
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 6);
        periodo = semana;
    }
    else if (tipo === 'mensual' && mes) {
        const [anio, mesStr] = mes.split('-');
        const mesNum = parseInt(mesStr);
        fechaInicio = new Date(Number(anio), mesNum - 1, 1);
        fechaFin = new Date(Number(anio), mesNum, 0);
        periodo = mes;
    }
    else {
        // Si no hay fecha válida, renderizamos sin datos
        return res.render('ingresosPorFecha', { datos: null, tipo: null, periodo: null });
    }
    // Ventas registradas
    const ventas = yield repoVenta.find({
        where: { fecha: (0, typeorm_1.Between)(fechaInicio, fechaFin) }
    });
    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0);
    // Señales de boletas (boletas con seña, en estado 'reparando' o posterior)
    const boletasConSeña = yield repoBoleta.find({
        where: {
            fechaSenado: (0, typeorm_1.Between)(fechaInicio, fechaFin),
            estado: (0, typeorm_1.In)(['reparando', 'reparado', 'entregado'])
        }
    });
    const totalSeñas = boletasConSeña.reduce((sum, b) => sum + Number(b.senado || 0), 0);
    // Entregas de boletas (solo las que fueron reparadas)
    const boletasEntregadas = yield repoBoleta.find({
        where: {
            fechaEntrega: (0, typeorm_1.Between)(fechaInicio, fechaFin),
            estado: 'entregado'
        }
    });
    const totalEntregas = boletasEntregadas.reduce((sum, b) => sum + (Number(b.total || 0) - Number(b.senado || 0)), 0);
    const totalIngresos = totalVentas + totalSeñas + totalEntregas;
    const datos = {
        totalIngresos,
        totalVentas,
        totalSeñas,
        totalEntregas
    };
    const reporteExistente = yield repoReporte.findOne({
        where: {
            tipo: 'ingresos',
            parametros: JSON.stringify({ tipo, periodo })
        }
    });
    res.render('ingresosPorFecha', {
        datos,
        tipo,
        periodo,
        reporteYaGenerado: !!reporteExistente
    });
});
exports.buscarIngresos = buscarIngresos;
// 3. Generar y guardar el reporte
const generarReporteIngresos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tipo, periodo, totalIngresos, totalVentas, totalSeñas, totalEntregas } = req.body;
    const nuevoReporte = repoReporte.create({
        tipo: 'ingresos',
        parametros: JSON.stringify({ tipo, periodo }),
        resumen: JSON.stringify({
            totalIngresos: Number(totalIngresos) || 0,
            totalVentas: Number(totalVentas) || 0,
            totalSeñas: Number(totalSeñas) || 0,
            totalEntregas: Number(totalEntregas) || 0
        })
    });
    yield repoReporte.save(nuevoReporte);
    res.redirect('/reportes'); // Cambia esta ruta si quieres ir a otro lugar después de guardar
});
exports.generarReporteIngresos = generarReporteIngresos;
