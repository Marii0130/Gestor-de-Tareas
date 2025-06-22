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
exports.validar = exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = void 0;
const conexion_1 = require("../db/conexion");
const boletaModel_1 = require("../models/boletaModel");
const clienteModel_1 = require("../models/clienteModel");
const express_validator_1 = require("express-validator");
const boletaRepo = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const clienteRepo = conexion_1.AppDataSource.getRepository(clienteModel_1.Cliente);
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boletas = yield boletaRepo.find({ relations: ['cliente'] });
        res.render('listarBoletas', { boletas, pagina: 'Listado de Boletas' });
    }
    catch (error) {
        res.status(500).send('Error al obtener boletas');
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        const boleta = yield boletaRepo.findOne({ where: { id }, relations: ['cliente'] });
        return boleta || null;
    }
    catch (error) {
        return null;
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearBoleta', { errors: errors.array() });
    }
    try {
        const cliente = yield clienteRepo.findOneBy({ id: req.body.clienteId });
        if (!cliente)
            return res.status(400).send('Cliente inválido');
        const boleta = boletaRepo.create(Object.assign(Object.assign({}, req.body), { cliente, estado: req.body.estado || 'recibido' }));
        yield boletaRepo.save(boleta);
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        res.status(500).send('Error al crear boleta');
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }
    try {
        const boleta = yield boletaRepo.findOneBy({ id });
        if (!boleta) {
            return res.status(404).send('Boleta no encontrada');
        }
        boletaRepo.merge(boleta, req.body);
        yield boletaRepo.save(boleta);
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        res.status(500).send('Error al modificar boleta');
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        yield boletaRepo.delete(id);
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        res.status(500).send('Error al eliminar boleta');
    }
});
exports.eliminar = eliminar;
const validar = () => {
    return [
        (0, express_validator_1.body)('clienteId').isInt().withMessage('El cliente es obligatorio'),
        (0, express_validator_1.body)('articulo').notEmpty().withMessage('El artículo es obligatorio'),
        (0, express_validator_1.body)('marca').notEmpty().withMessage('La marca es obligatoria'),
        (0, express_validator_1.body)('modelo').notEmpty().withMessage('El modelo es obligatorio'),
        (0, express_validator_1.body)('falla').notEmpty().withMessage('La falla es obligatoria'),
    ];
};
exports.validar = validar;
