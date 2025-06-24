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
exports.mostrarHistorial = exports.mostrarConfirmarEntrega = exports.mostrarEntrega = exports.entregarBoleta = exports.senarBoleta = exports.mostrarFormSenar = exports.mostrarReparaciones = void 0;
const typeorm_1 = require("typeorm");
const conexion_1 = require("../db/conexion");
const boletaModel_1 = require("../models/boletaModel");
const boletaRepository = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
function extraerPulgadas(articulo) {
    const regex = /(\d{1,2})"/;
    const match = articulo.match(regex);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}
function obtenerPrecioPorPulgadas(pulgadas) {
    if (pulgadas >= 50)
        return 8000;
    if (pulgadas >= 43)
        return 7000;
    if (pulgadas >= 40)
        return 6000;
    if (pulgadas >= 32)
        return 4000;
    return 0;
}
const mostrarReparaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boletas = yield boletaRepository.find({
        where: { estado: (0, typeorm_1.In)(['aprobado', 'reparado', 'cancelado', 'no_reparado']) },
        relations: ['cliente']
    });
    res.render('listarReparaciones', { boletas });
});
exports.mostrarReparaciones = mostrarReparaciones;
const mostrarFormSenar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const boleta = yield boletaRepository.findOneBy({ id });
    if (!boleta || boleta.estado !== 'aprobado') {
        res.status(400).send('No se puede señar esta boleta.');
        return;
    }
    res.render('senarBoleta', { boleta, pagina: 'Señar Boleta' });
});
exports.mostrarFormSenar = mostrarFormSenar;
const senarBoleta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const boleta = yield boletaRepository.findOneBy({ id });
    if (!boleta || boleta.estado !== 'aprobado') {
        res.status(400).send('No se puede señar esta boleta.');
        return;
    }
    const senado = parseFloat(req.body.senado);
    if (isNaN(senado) || senado < 0) {
        res.status(400).send('Monto inválido.');
        return;
    }
    boleta.senado = senado;
    boleta.fechaSenado = new Date();
    boleta.estado = 'reparando';
    yield boletaRepository.save(boleta);
    res.redirect('/reparaciones');
});
exports.senarBoleta = senarBoleta;
const entregarBoleta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boleta = yield boletaRepository.findOneBy({ id: Number(req.params.id) });
    if (!boleta) {
        res.status(404).send('Boleta no encontrada');
        return;
    }
    const nuevoTotal = parseFloat(req.body.total);
    if (!isNaN(nuevoTotal) && nuevoTotal >= 0) {
        boleta.total = nuevoTotal;
    }
    if (boleta.estado === 'reparado') {
        boleta.estado = 'entregado';
    }
    else if (['cancelado', 'no_reparado'].includes(boleta.estado)) {
        boleta.estado = 'entregado_no_reparado';
    }
    else {
        res.status(400).send('No se puede entregar esta boleta.');
        return;
    }
    boleta.fechaEntrega = new Date();
    yield boletaRepository.save(boleta);
    res.render('entregaExitosa', {
        boleta,
        totalPagado: boleta.total - (boleta.senado || 0),
        fechaEntrega: boleta.fechaEntrega.toLocaleString()
    });
});
exports.entregarBoleta = entregarBoleta;
const mostrarEntrega = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boleta = yield boletaRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['cliente']
    });
    if (!boleta) {
        res.status(404).send('Boleta no encontrada');
        return;
    }
    let totalAPagar = boleta.total;
    if (boleta.estado === 'reparado') {
        totalAPagar = boleta.total - (boleta.senado || 0);
    }
    res.render('confirmarEntrega', {
        boleta,
        totalAPagar
    });
});
exports.mostrarEntrega = mostrarEntrega;
const mostrarConfirmarEntrega = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const boleta = yield boletaRepository.findOne({
        where: { id },
        relations: ['cliente']
    });
    if (!boleta) {
        res.status(404).send('Boleta no encontrada');
        return;
    }
    let totalAPagar = boleta.total;
    if (['cancelado', 'no_reparado'].includes(boleta.estado)) {
        const pulgadas = extraerPulgadas(boleta.articulo);
        if (pulgadas !== null) {
            const precioConsulta = obtenerPrecioPorPulgadas(pulgadas);
            if (precioConsulta > 0) {
                boleta.total = precioConsulta;
                totalAPagar = precioConsulta;
            }
        }
    }
    else if (boleta.estado === 'reparado') {
        totalAPagar = boleta.total - (boleta.senado || 0);
    }
    res.render('confirmarEntrega', {
        boleta,
        totalAPagar
    });
});
exports.mostrarConfirmarEntrega = mostrarConfirmarEntrega;
const mostrarHistorial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boletas = yield boletaRepository.find({
            where: { estado: (0, typeorm_1.In)(['reparando', 'reparado', 'cancelado', 'no_reparado', 'entregado', 'entregado_no_reparado']) },
            relations: ['cliente']
        });
        const historial = [];
        boletas.forEach(b => {
            if (b.senado && b.senado > 0) {
                historial.push({
                    id: b.id,
                    tipo: 'Seña',
                    fecha: b.fechaSenado || new Date(),
                    totalPagado: Number(b.senado),
                    tipoReparacion: ['reparado', 'entregado'].includes(b.estado) ? 'Reparado' : 'No Reparado',
                    senado: Number(b.senado),
                    costo: Number(b.costo || 0),
                    boleta: b
                });
            }
            if (['entregado', 'entregado_no_reparado'].includes(b.estado)) {
                const totalPagadoEntrega = Number(b.total) - Number(b.senado || 0);
                historial.push({
                    id: b.id,
                    tipo: 'Entrega',
                    fecha: b.fechaEntrega || new Date(),
                    totalPagado: totalPagadoEntrega,
                    tipoReparacion: b.estado === 'entregado' ? 'Reparado' : 'No Reparado',
                    senado: Number(b.senado || 0),
                    costo: Number(b.costo || 0),
                    boleta: b
                });
            }
        });
        // Ordenar de más reciente a más viejo
        historial.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        res.render('historialReparaciones', { historial, pagina: 'Historial de Movimientos' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el historial de reparaciones');
    }
});
exports.mostrarHistorial = mostrarHistorial;
