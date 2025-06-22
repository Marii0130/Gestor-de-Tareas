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
const clienteModel_1 = require("../models/clienteModel");
const express_validator_1 = require("express-validator");
const clienteRepo = conexion_1.AppDataSource.getRepository(clienteModel_1.Cliente);
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield clienteRepo.find({ relations: ['boletas'] });
        res.render('listarClientes', { clientes, pagina: 'Listado de Clientes' });
    }
    catch (error) {
        res.status(500).send('Error al obtener clientes');
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        const cliente = yield clienteRepo.findOne({ where: { id }, relations: ['boletas'] });
        return cliente || null;
    }
    catch (error) {
        return null;
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearCliente', { errors: errors.array() });
    }
    try {
        const cliente = clienteRepo.create(req.body);
        yield clienteRepo.save(cliente);
        res.redirect('/clientes/listarClientes');
    }
    catch (error) {
        res.status(500).send('Error al crear cliente');
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
        const cliente = yield clienteRepo.findOneBy({ id });
        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }
        clienteRepo.merge(cliente, req.body);
        yield clienteRepo.save(cliente);
        res.redirect('/clientes/listarClientes');
    }
    catch (error) {
        res.status(500).send('Error al modificar cliente');
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        yield clienteRepo.delete(id);
        res.redirect('/clientes/listarClientes');
    }
    catch (error) {
        res.status(500).send('Error al eliminar cliente');
    }
});
exports.eliminar = eliminar;
const validar = () => {
    return [
        (0, express_validator_1.body)('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        (0, express_validator_1.body)('domicilio').notEmpty().withMessage('El domicilio es obligatorio'),
        (0, express_validator_1.body)('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    ];
};
exports.validar = validar;
