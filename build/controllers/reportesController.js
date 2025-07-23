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
exports.mostrarListaReportes = void 0;
const conexion_1 = require("../db/conexion");
const reporteModel_1 = require("../models/reporteModel");
const repoReporte = conexion_1.AppDataSource.getRepository(reporteModel_1.Reporte);
// Mostrar la lista de reportes guardados
const mostrarListaReportes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reportes = yield repoReporte.find({ order: { fechaCreacion: 'DESC' } });
        // Convertimos los strings JSON para mostrarlos más fácil en la vista
        const reportesConResumen = reportes.map(r => (Object.assign(Object.assign({}, r), { parametrosObj: r.parametros ? JSON.parse(r.parametros) : null, resumenObj: r.resumen ? JSON.parse(r.resumen) : null })));
        res.render('listarReportes', {
            pagina: 'Reportes guardados',
            reportes: reportesConResumen
        });
    }
    catch (error) {
        console.error('Error al obtener lista de reportes:', error);
        res.status(500).send('Error al obtener la lista de reportes');
    }
});
exports.mostrarListaReportes = mostrarListaReportes;
