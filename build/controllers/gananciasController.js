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
exports.generarReporteGanancias = exports.mostrarFormularioGanancias = void 0;
const typeorm_1 = require("typeorm");
const conexion_1 = require("../db/conexion");
const boletaModel_1 = require("../models/boletaModel"); // Ajusta según tu proyecto
const boletaRepo = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const mostrarFormularioGanancias = (req, res) => {
    res.render('costosGanancias', {
        pagina: 'Reporte de Costos y Ganancias',
        resultado: null
    });
};
exports.mostrarFormularioGanancias = mostrarFormularioGanancias;
const generarReporteGanancias = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fechaInicio, fechaFin } = req.body;
        if (!fechaInicio || !fechaFin) {
            res.status(400).send('Debe ingresar fecha de inicio y fin.');
            return;
        }
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        const boletas = yield boletaRepo.find({
            where: {
                estado: (0, typeorm_1.In)(['entregado', 'entregado_no_reparado']),
                fechaEntrega: (0, typeorm_1.Between)(inicio, fin)
            },
            relations: ['cliente']
        });
        const detalles = boletas.map(b => {
            const costo = b.costo || 0;
            const total = b.total || 0;
            const ganancia = total - costo;
            return { boleta: b, costo, total, ganancia };
        });
        const totalCostos = detalles.reduce((sum, d) => sum + d.costo, 0);
        const totalGanancias = detalles.reduce((sum, d) => sum + d.ganancia, 0);
        const promedioGanancia = detalles.length ? totalGanancias / detalles.length : 0;
        res.render('costosGanancias', {
            pagina: 'Reporte de Costos y Ganancias',
            resultado: {
                fechaInicio: inicio.toLocaleDateString(),
                fechaFin: fin.toLocaleDateString(),
                totalCostos: totalCostos.toFixed(2),
                totalGanancias: totalGanancias.toFixed(2),
                promedioGanancia: promedioGanancia.toFixed(2),
                detalles
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generarReporteGanancias = generarReporteGanancias;
