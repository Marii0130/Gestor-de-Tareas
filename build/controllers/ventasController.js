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
exports.listarVentas = exports.registrarVenta = exports.mostrarFormularioVenta = void 0;
const conexion_1 = require("../db/conexion");
const ventaModel_1 = require("../models/ventaModel");
const detalleVentaModel_1 = require("../models/detalleVentaModel");
const productoModel_1 = require("../models/productoModel");
const ventaRepo = conexion_1.AppDataSource.getRepository(ventaModel_1.Venta);
const detalleRepo = conexion_1.AppDataSource.getRepository(detalleVentaModel_1.DetalleVenta);
const productoRepo = conexion_1.AppDataSource.getRepository(productoModel_1.Producto);
const mostrarFormularioVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield productoRepo.find();
        res.render('crearVenta', {
            productos,
            pagina: 'Nueva Venta'
        });
    }
    catch (error) {
        res.status(500).send('Error al cargar el formulario de venta');
    }
});
exports.mostrarFormularioVenta = mostrarFormularioVenta;
const registrarVenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = req.body.productos; // [{ id: "1", cantidad: 2 }, ...]
        if (!productos || productos.length === 0) {
            res.status(400).send('No se seleccionaron productos para la venta.');
            return;
        }
        const venta = new ventaModel_1.Venta();
        venta.total = 0;
        venta.detalles = [];
        for (const item of productos) {
            const producto = yield productoRepo.findOneBy({ id: parseInt(item.id, 10) });
            if (!producto)
                continue;
            const cantidad = parseInt(item.cantidad, 10);
            const detalle = new detalleVentaModel_1.DetalleVenta();
            detalle.producto = producto;
            detalle.cantidad = cantidad;
            detalle.precio_unitario = producto.precio_venta;
            venta.total += cantidad * producto.precio_venta;
            venta.detalles.push(detalle);
            producto.stock -= cantidad;
            yield productoRepo.save(producto);
        }
        yield ventaRepo.save(venta);
        res.redirect('/ventas/listar');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar la venta');
    }
});
exports.registrarVenta = registrarVenta;
const listarVentas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ventas = yield ventaRepo.find({ relations: ['detalles', 'detalles.producto'] });
        res.render('listarVentas', {
            ventas,
            pagina: 'Listado de Ventas'
        });
    }
    catch (error) {
        res.status(500).send('Error al listar ventas');
    }
});
exports.listarVentas = listarVentas;
