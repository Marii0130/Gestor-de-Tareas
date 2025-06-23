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
exports.alertasInventario = exports.validarProducto = exports.eliminar = exports.modificar = exports.insertar = exports.mostrarCrear = exports.consultarUno = exports.listarProductos = exports.categoriasDisponibles = void 0;
const conexion_1 = require("../db/conexion");
const productoModel_1 = require("../models/productoModel");
const express_validator_1 = require("express-validator");
const productoRepo = conexion_1.AppDataSource.getRepository(productoModel_1.Producto);
// Lista de categorías disponibles (como estados en boletas)
exports.categoriasDisponibles = Object.values(productoModel_1.CategoriaProducto);
// Consultar todos los productos
const listarProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield productoRepo.find();
        res.render('listarProductos', {
            productos,
            pagina: 'Listado de Productos'
        });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener productos' });
    }
});
exports.listarProductos = listarProductos;
// Consultar un producto por ID
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        return yield productoRepo.findOneBy({ id });
    }
    catch (error) {
        return null;
    }
});
exports.consultarUno = consultarUno;
// Mostrar formulario para crear producto
const mostrarCrear = (req, res) => {
    res.render('crearProducto', {
        pagina: 'Crear Producto',
        errors: [],
        producto: {},
        categoriasDisponibles: exports.categoriasDisponibles
    });
};
exports.mostrarCrear = mostrarCrear;
// Insertar nuevo producto
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearProducto', {
            errors: errors.array(),
            producto: req.body,
            pagina: 'Crear Producto',
            categoriasDisponibles: exports.categoriasDisponibles
        });
    }
    try {
        const producto = productoRepo.create(req.body);
        yield productoRepo.save(producto);
        res.redirect('/inventario');
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al crear producto' });
    }
});
exports.insertar = insertar;
// Modificar producto existente
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('modificarProducto', {
            errors: errors.array(),
            producto: Object.assign(Object.assign({}, req.body), { id }),
            pagina: 'Modificar Producto',
            categoriasDisponibles: exports.categoriasDisponibles
        });
    }
    try {
        const producto = yield productoRepo.findOneBy({ id });
        if (!producto)
            return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
        producto.nombre = req.body.nombre;
        producto.categoria = req.body.categoria;
        producto.stock = parseInt(req.body.stock, 10);
        producto.precio_compra = parseFloat(req.body.precio_compra);
        producto.precio_venta = parseFloat(req.body.precio_venta);
        producto.stock_minimo = parseInt(req.body.stock_minimo, 10);
        yield productoRepo.save(producto);
        res.redirect('/inventario');
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al modificar producto' });
    }
});
exports.modificar = modificar;
// Eliminar producto
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    try {
        const producto = yield productoRepo.findOneBy({ id });
        if (!producto)
            return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
        yield productoRepo.remove(producto);
        res.redirect('/inventario');
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al eliminar producto' });
    }
});
exports.eliminar = eliminar;
// Validaciones
const validarProducto = () => [
    (0, express_validator_1.body)('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    (0, express_validator_1.body)('categoria').notEmpty().withMessage('La categoría es obligatoria'),
    (0, express_validator_1.body)('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número positivo'),
    (0, express_validator_1.body)('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido'),
    (0, express_validator_1.body)('precio_venta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser válido'),
    (0, express_validator_1.body)('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo')
];
exports.validarProducto = validarProducto;
const alertasInventario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield productoRepo.find();
        const productosConBajoStock = productos.filter(p => p.stock <= p.stock_minimo);
        res.render('alertasInventario', {
            productos: productosConBajoStock,
            pagina: 'Alertas de Inventario'
        });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener alertas de inventario' });
    }
});
exports.alertasInventario = alertasInventario;
