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
exports.alertasInventario = exports.validarProductoModificar = exports.validarProductoCrear = exports.eliminar = exports.modificar = exports.insertar = exports.mostrarCrear = exports.consultarUno = exports.listarProductos = exports.categoriasDisponibles = void 0;
const conexion_1 = require("../db/conexion");
const productoModel_1 = require("../models/productoModel");
const movimientoInventarioModel_1 = require("../models/movimientoInventarioModel");
const express_validator_1 = require("express-validator");
const productoRepo = conexion_1.AppDataSource.getRepository(productoModel_1.Producto);
const movimientoRepo = conexion_1.AppDataSource.getRepository(movimientoInventarioModel_1.MovimientoInventario);
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
// Insertar nuevo producto y registrar movimiento de entrada
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
        // Crear la entidad Producto con los datos recibidos
        const producto = productoRepo.create({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            stock: parseInt(req.body.stock, 10),
            precio_compra: parseFloat(req.body.precio_compra),
            precio_venta: parseFloat(req.body.precio_venta),
            stock_minimo: parseInt(req.body.stock_minimo, 10)
        });
        // Guardar el producto en la base de datos
        const productoGuardado = yield productoRepo.save(producto);
        // Si stock > 0, crear movimiento de entrada
        if (productoGuardado.stock > 0) {
            const movimiento = movimientoRepo.create({
                producto: { id: productoGuardado.id }, // Referencia por id para evitar error TS
                tipo: movimientoInventarioModel_1.TipoMovimiento.ENTRADA,
                cantidad: productoGuardado.stock,
                motivo: 'Alta de nuevo producto',
                fecha: new Date()
            });
            yield movimientoRepo.save(movimiento);
        }
        res.redirect('/inventario');
    }
    catch (error) {
        console.error('Error al crear producto:', error);
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
            producto: { id, stock_minimo: req.body.stock_minimo },
            pagina: 'Modificar Producto',
            categoriasDisponibles: exports.categoriasDisponibles
        });
    }
    try {
        const producto = yield productoRepo.findOneBy({ id });
        if (!producto)
            return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
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
const validarProductoCrear = () => [
    (0, express_validator_1.body)('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    (0, express_validator_1.body)('categoria').notEmpty().withMessage('La categoría es obligatoria'),
    (0, express_validator_1.body)('stock').isInt({ min: 1 }).withMessage('El stock debe ser un número entero positivo y al menos 1'),
    (0, express_validator_1.body)('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido'),
    (0, express_validator_1.body)('precio_venta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser válido'),
    (0, express_validator_1.body)('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo o cero')
];
exports.validarProductoCrear = validarProductoCrear;
const validarProductoModificar = () => [
    (0, express_validator_1.body)('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo o cero')
];
exports.validarProductoModificar = validarProductoModificar;
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
