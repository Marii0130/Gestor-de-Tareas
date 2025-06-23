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
    'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
    'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
];
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boletas = yield boletaRepo.find({ relations: ['cliente'] });
        res.render('listarBoletas', { boletas, pagina: 'Listado de Boletas' });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener boletas' });
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        return yield boletaRepo.findOne({ where: { id }, relations: ['cliente'] });
    }
    catch (error) {
        return null;
    }
});
exports.consultarUno = consultarUno;
const mostrarCrear = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('crearBoleta', {
            pagina: 'Crear Boleta',
            condicionesOpciones,
            errors: [],
            boleta: {}
        });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cargar formulario' });
    }
});
exports.mostrarCrear = mostrarCrear;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearBoleta', {
            errors: errors.array(),
            condicionesOpciones,
            boleta: req.body
        });
    }
    try {
        const cliente = clienteRepo.create({
            nombre: req.body.clienteNombre,
            telefono: req.body.clienteTelefono,
            domicilio: req.body.clienteDomicilio || ''
        });
        yield clienteRepo.save(cliente);
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
        console.error("Error al crear:", error);
        res.status(500).render('error', { mensaje: 'Error al crear boleta' });
    }
});
exports.insertar = insertar;
// MODIFICACIÓN ACTUALIZADA
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const boleta = yield boletaRepo.findOne({
            where: { id },
            relations: ['cliente']
        });
        if (!boleta || !boleta.cliente) {
            return res.status(404).render('error', { mensaje: 'Registro no encontrado' });
        }
        // Actualización de campos - ¡Asegúrate de incluir TODOS los campos!
        boleta.articulo = req.body.articulo;
        boleta.marca = req.body.marca;
        boleta.modelo = req.body.modelo;
        boleta.falla = req.body.falla;
        boleta.estado = req.body.estado;
        boleta.condiciones_iniciales = Array.isArray(req.body.condiciones_iniciales)
            ? req.body.condiciones_iniciales.join(', ')
            : req.body.condiciones_iniciales;
        boleta.observaciones = req.body.observaciones;
        boleta.fecha_ingreso = req.body.fecha_ingreso;
        boleta.fecha_reparacion = req.body.fecha_reparacion || null;
        boleta.senado = parseFloat(req.body.senado) || 0;
        boleta.total = parseFloat(req.body.total) || 0;
        // Actualizar datos del cliente también
        boleta.cliente.nombre = req.body.clienteNombre;
        boleta.cliente.telefono = req.body.clienteTelefono;
        boleta.cliente.domicilio = req.body.clienteDomicilio || '';
        // Guardar ambos en una transacción
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            yield transactionalEntityManager.save(boleta.cliente);
            yield transactionalEntityManager.save(boleta);
        }));
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        console.error('Error al modificar:', error);
        res.status(500).render('error', {
            mensaje: 'Error al modificar boleta',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
exports.modificar = modificar;
// ELIMINACIÓN ACTUALIZADA
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        const boleta = yield boletaRepo.findOne({
            where: { id },
            relations: ['cliente']
        });
        if (!boleta) {
            return res.status(404).json({ success: false, message: 'Boleta no encontrada' });
        }
        // Eliminar ambos registros en transacción
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            // Primero eliminar la boleta
            yield transactionalEntityManager.remove(boletaModel_1.Boleta, boleta);
            // Luego eliminar el cliente asociado
            if (boleta.cliente) {
                yield transactionalEntityManager.remove(clienteModel_1.Cliente, boleta.cliente);
            }
        }));
        res.redirect('/boletas/listarBoletas');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al eliminar registro',
            detalles: errorMessage
        });
    }
});
exports.eliminar = eliminar;
const validar = () => [
    (0, express_validator_1.body)('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    (0, express_validator_1.body)('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
    (0, express_validator_1.body)('articulo').notEmpty().withMessage('El artículo es obligatorio'),
    (0, express_validator_1.body)('marca').notEmpty().withMessage('La marca es obligatoria'),
    (0, express_validator_1.body)('modelo').notEmpty().withMessage('El modelo es obligatorio'),
    (0, express_validator_1.body)('falla').notEmpty().withMessage('La falla es obligatoria'),
    (0, express_validator_1.body)('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate(),
    (0, express_validator_1.body)('senado').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('total').optional().isFloat({ min: 0 })
];
exports.validar = validar;
