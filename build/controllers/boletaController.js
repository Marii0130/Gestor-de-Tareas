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
exports.validar = exports.obtenerPorId = exports.actualizarEstado = exports.insertar = exports.mostrarCrear = exports.consultarTodos = void 0;
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
// Listar todas las boletas
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estado = req.query.estado || '';
        const clienteNombre = (req.query.cliente || '').trim();
        // Query builder para aplicar filtros dinámicos
        let query = boletaRepo.createQueryBuilder('boleta')
            .leftJoinAndSelect('boleta.cliente', 'cliente');
        if (estado) {
            query = query.andWhere('boleta.estado = :estado', { estado });
        }
        if (clienteNombre) {
            // Postgres, MySQL, SQLite: usar LOWER para case insensitive
            query = query.andWhere('LOWER(cliente.nombre) LIKE :clienteNombre', { clienteNombre: `%${clienteNombre.toLowerCase()}%` });
        }
        const boletas = yield query.getMany();
        // Lista de estados para el select filtro en la vista
        const estados = [
            '', // opción "Todos"
            'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
            'reparando', 'esperando_repuestos', 'reparado', 'entregado',
            'cancelado', 'no_reparado', 'entregado_no_reparado'
        ];
        res.render('listarBoletas', {
            boletas,
            pagina: 'Listado de Boletas',
            estados,
            filtroEstado: estado,
            filtroCliente: clienteNombre
        });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener boletas' });
    }
});
exports.consultarTodos = consultarTodos;
// Mostrar formulario de creación
const mostrarCrear = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('crearBoleta', {
        pagina: 'Crear Boleta',
        condicionesOpciones,
        errors: [],
        boleta: {}
    });
});
exports.mostrarCrear = mostrarCrear;
// Insertar nueva boleta
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
            senado: parseFloat(req.body.senado) || 0,
            costo: parseFloat(req.body.costo) || 0,
            total: parseFloat(req.body.total) || 0,
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
// Cambiar estado
const actualizarEstado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, nuevoEstado } = req.params;
    const boleta = yield boletaRepo.findOneBy({ id: parseInt(id) });
    if (!boleta) {
        return res.status(404).render('error', {
            mensaje: 'Boleta no encontrada',
            detalles: `ID: ${id}`
        });
    }
    // Si se está enviando presupuesto, se guarda también el total
    if (nuevoEstado === 'presupuesto_enviado' && req.body.total) {
        boleta.total = parseFloat(req.body.total);
    }
    boleta.estado = nuevoEstado;
    // Si se marca como reparado, se guarda la fecha actual como fecha_reparacion
    if (nuevoEstado === 'reparado') {
        boleta.fecha_reparacion = new Date();
    }
    yield boletaRepo.save(boleta);
    res.redirect('/boletas/listarBoletas');
});
exports.actualizarEstado = actualizarEstado;
// Obtener una boleta por ID
const obtenerPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const boleta = yield boletaRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['cliente']
        });
        if (!boleta) {
            return res.status(404).render('error', {
                mensaje: 'Boleta no encontrada',
                detalles: `ID: ${id}`
            });
        }
        res.render('detalleBoleta', { boleta });
    }
    catch (error) {
        console.error('Error al buscar boleta por ID:', error);
        res.status(500).render('error', {
            mensaje: 'Error interno al buscar boleta'
        });
    }
});
exports.obtenerPorId = obtenerPorId;
// Validaciones
const validar = () => [
    (0, express_validator_1.body)('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    (0, express_validator_1.body)('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
    (0, express_validator_1.body)('articulo').notEmpty().withMessage('El artículo es obligatorio'),
    (0, express_validator_1.body)('marca').notEmpty().withMessage('La marca es obligatoria'),
    (0, express_validator_1.body)('modelo').notEmpty().withMessage('El modelo es obligatorio'),
    (0, express_validator_1.body)('falla').notEmpty().withMessage('La falla es obligatoria'),
    (0, express_validator_1.body)('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate(),
    (0, express_validator_1.body)('senado').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('costo').optional().isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo'),
    (0, express_validator_1.body)('total').optional().isFloat({ min: 0 })
];
exports.validar = validar;
