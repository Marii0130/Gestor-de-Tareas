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
exports.generarReporteReparaciones = exports.buscarReparaciones = exports.mostrarFormularioReparaciones = void 0;
const typeorm_1 = require("typeorm");
const conexion_1 = require("../db/conexion");
const boletaModel_1 = require("../models/boletaModel");
const reporteModel_1 = require("../models/reporteModel");
const repoBoleta = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const repoReporte = conexion_1.AppDataSource.getRepository(reporteModel_1.Reporte);
// Obtener lunes de la semana ISO
function getMondayOfWeek(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay() || 7;
    const monday = new Date(simple);
    monday.setDate(simple.getDate() - dow + 1);
    return monday;
}
const mostrarFormularioReparaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('reparacionesRealizadas', {
        datos: null,
        tipo: 'semanal',
        periodo: null,
        reporteYaGenerado: false,
        semana: '',
        mes: ''
    });
});
exports.mostrarFormularioReparaciones = mostrarFormularioReparaciones;
const buscarReparaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tipo, semana, mes } = req.body;
    let fechaInicio, fechaFin;
    let periodoTexto = '';
    let semanaFinal = '', mesFinal = '';
    if (tipo === 'semanal' && semana) {
        const [anioStr, semanaStr] = semana.split('-W');
        const anio = Number(anioStr);
        const semanaNum = parseInt(semanaStr);
        fechaInicio = getMondayOfWeek(anio, semanaNum);
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 6);
        periodoTexto = `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`;
        semanaFinal = semana;
    }
    else if (tipo === 'mensual' && mes) {
        const [anioStr, mesStr] = mes.split('-');
        const anio = Number(anioStr);
        const mesNum = parseInt(mesStr);
        fechaInicio = new Date(anio, mesNum - 1, 1);
        fechaFin = new Date(anio, mesNum, 0);
        periodoTexto = `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`;
        mesFinal = mes;
    }
    else {
        return res.render('reparacionesRealizadas', {
            datos: null,
            tipo,
            periodo: null,
            reporteYaGenerado: false,
            semana: '',
            mes: ''
        });
    }
    const [boletasEntregadas, boletasEntregadasNoReparadas, boletasRecibidas] = yield Promise.all([
        repoBoleta.find({
            where: {
                fechaEntrega: (0, typeorm_1.Between)(fechaInicio, fechaFin),
                estado: (0, typeorm_1.In)(['entregado'])
            }
        }),
        repoBoleta.find({
            where: {
                fechaEntrega: (0, typeorm_1.Between)(fechaInicio, fechaFin),
                estado: 'entregado_no_reparado'
            }
        }),
        repoBoleta.find({
            where: {
                fecha_ingreso: (0, typeorm_1.Between)(fechaInicio, fechaFin)
            }
        })
    ]);
    const totalEntregadas = boletasEntregadas.length;
    const totalEntregadasNoReparadas = boletasEntregadasNoReparadas.length;
    const totalRecibidas = boletasRecibidas.length;
    const datos = {
        totalEntregadas,
        totalEntregadasNoReparadas,
        totalRecibidas
    };
    const reporteExistente = yield repoReporte.findOne({
        where: {
            tipo: 'reparaciones',
            parametros: JSON.stringify({ tipo, periodo: periodoTexto })
        }
    });
    res.render('reparacionesRealizadas', {
        datos,
        tipo,
        periodo: periodoTexto,
        reporteYaGenerado: !!reporteExistente,
        semana: semanaFinal,
        mes: mesFinal
    });
});
exports.buscarReparaciones = buscarReparaciones;
const generarReporteReparaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tipo, periodo, totalEntregadas, totalEntregadasNoReparadas, totalRecibidas } = req.body;
    const reporteExistente = yield repoReporte.findOne({
        where: {
            tipo: 'reparaciones',
            parametros: JSON.stringify({ tipo, periodo })
        }
    });
    if (reporteExistente) {
        return res.redirect('/reportes');
    }
    const nuevoReporte = repoReporte.create({
        tipo: 'reparaciones',
        parametros: JSON.stringify({ tipo, periodo }),
        resumen: JSON.stringify({
            totalEntregadas: Number(totalEntregadas) || 0,
            totalEntregadasNoReparadas: Number(totalEntregadasNoReparadas) || 0,
            totalRecibidas: Number(totalRecibidas) || 0
        })
    });
    yield repoReporte.save(nuevoReporte);
    res.redirect('/reportes');
});
exports.generarReporteReparaciones = generarReporteReparaciones;
