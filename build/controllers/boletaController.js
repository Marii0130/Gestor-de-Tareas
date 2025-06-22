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
exports.validar = exports.eliminar = exports.modificar = exports.insertar = exports.mostrarCrear = exports.consultarUno = exports.consultarTodos = void 0;
const conexion_1 = require("../db/conexion");
const boletaModel_1 = require("../models/boletaModel");
const clienteModel_1 = require("../models/clienteModel");
const express_validator_1 = require("express-validator");
const boletaRepo = conexion_1.AppDataSource.getRepository(boletaModel_1.Boleta);
const clienteRepo = conexion_1.AppDataSource.getRepository(clienteModel_1.Cliente);
const condicionesOpciones = [
    'con cable',
    'con control',
    'pantalla manchada',
    'faltan tornillos',
    'sin cable',
    'sin control',
    'pantalla rayada',
    'desarmado'
];
// Listar todas las boletas
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boletas = yield boletaRepo.find({ relations: ['cliente'] });
        res.render('listarBoletas', {
            boletas,
            pagina: 'Listado de Boletas'
        });
    }
    catch (error) {
        res.status(500).send('Error al obtener boletas');
    }
});
exports.consultarTodos = consultarTodos;
// Consultar una boleta específica
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
// Mostrar formulario para crear boleta
const mostrarCrear = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientes = yield clienteRepo.find();
        res.render('crearBoleta', {
            pagina: 'Crear Boleta',
            clientes,
            condicionesOpciones,
            errors: [],
            boleta: {}
        });
    }
    catch (error) {
        res.status(500).send('Error al cargar formulario');
    }
});
exports.mostrarCrear = mostrarCrear;
// Insertar nueva boleta (y cliente nuevo si es necesario)
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const clientes = yield clienteRepo.find();
        return res.status(400).render('crearBoleta', {
            errors: errors.array(),
            clientes,
            condicionesOpciones,
            boleta: req.body
        });
    }
    try {
        // Crear cliente nuevo si no se recibe clienteId, o buscarlo si existe
        let cliente;
        if (req.body.clienteId) {
            cliente = yield clienteRepo.findOneBy({ id: parseInt(req.body.clienteId) });
            if (!cliente)
                return res.status(400).send('Cliente inválido');
        }
        else {
            cliente = clienteRepo.create({
                nombre: req.body.clienteNombre,
                telefono: req.body.clienteTelefono,
                domicilio: req.body.clienteDomicilio || ''
            });
            yield clienteRepo.save(cliente);
        }
        const condiciones_iniciales = Array.isArray(req.body.condiciones_iniciales)
            ? req.body.condiciones_iniciales.join(', ')
            : req.body.condiciones_iniciales || '';
        const boleta = boletaRepo.create({
            articulo: req.body.articulo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            falla: req.body.falla,
            estado: req.body.estado || 'recibido',
            condiciones_iniciales,
            observaciones: req.body.observaciones || '',
            fecha_ingreso: req.body.fecha_ingreso,
            fecha_reparacion: req.body.fecha_reparacion || null,
            senado: req.body.senado || 0,
            total: req.body.total || 0,
            cliente
        });
        yield boletaRepo.save(boleta);
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        res.status(500).send('Error al crear boleta');
    }
});
exports.insertar = insertar;
// Modificar boleta existente
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
// Eliminar boleta
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
// Validaciones para insertar/modificar boleta
const validar = () => {
    return [
        (0, express_validator_1.body)('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
        (0, express_validator_1.body)('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
        (0, express_validator_1.body)('articulo').notEmpty().withMessage('El artículo es obligatorio'),
        (0, express_validator_1.body)('marca').notEmpty().withMessage('La marca es obligatoria'),
        (0, express_validator_1.body)('modelo').notEmpty().withMessage('El modelo es obligatorio'),
        (0, express_validator_1.body)('falla').notEmpty().withMessage('La falla es obligatoria'),
        (0, express_validator_1.body)('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate().withMessage('Debe ser una fecha válida'),
    ];
};
exports.validar = validar;
