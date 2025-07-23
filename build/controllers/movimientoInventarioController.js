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
exports.crearMovimiento = exports.mostrarCrearMovimiento = exports.listarMovimientos = void 0;
const conexion_1 = require("../db/conexion");
const movimientoInventarioModel_1 = require("../models/movimientoInventarioModel");
const productoModel_1 = require("../models/productoModel");
const movimientoRepo = conexion_1.AppDataSource.getRepository(movimientoInventarioModel_1.MovimientoInventario);
const productoRepo = conexion_1.AppDataSource.getRepository(productoModel_1.Producto);
const listarMovimientos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movimientos = yield movimientoRepo.find({
            relations: ['producto'],
            order: { fecha: 'DESC' },
        });
        res.render('listarMovimientos', {
            movimientos,
            pagina: 'Movimientos de Inventario',
        });
    }
    catch (error) {
        console.error('Error listarMovimientos:', error);
        res.status(500).send('Error al listar movimientos');
    }
});
exports.listarMovimientos = listarMovimientos;
const mostrarCrearMovimiento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield productoRepo.find();
        res.render('crearMovimiento', {
            productos,
            pagina: 'Nuevo Movimiento',
            errors: [],
            data: {},
        });
    }
    catch (error) {
        console.error('Error mostrarCrearMovimiento:', error);
        res.status(500).send('Error al cargar formulario');
    }
});
exports.mostrarCrearMovimiento = mostrarCrearMovimiento;
const crearMovimiento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productoId, tipo, cantidad, motivo } = req.body;
        const errors = [];
        if (!productoId)
            errors.push({ msg: 'Debe seleccionar un producto' });
        if (!tipo || !Object.values(movimientoInventarioModel_1.TipoMovimiento).includes(tipo))
            errors.push({ msg: 'Tipo de movimiento inválido' });
        const cantidadNum = Number(cantidad);
        if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0)
            errors.push({ msg: 'Cantidad debe ser un número mayor a 0' });
        if (errors.length > 0) {
            const productos = yield productoRepo.find();
            res.status(400).render('crearMovimiento', {
                productos,
                pagina: 'Nuevo Movimiento',
                errors,
                data: req.body
            });
            return;
        }
        const producto = yield productoRepo.findOneBy({ id: Number(productoId) });
        if (!producto) {
            res.status(404).send('Producto no encontrado');
            return;
        }
        if (tipo === movimientoInventarioModel_1.TipoMovimiento.ENTRADA) {
            producto.stock += cantidadNum;
        }
        else {
            if (producto.stock < cantidadNum) {
                const productos = yield productoRepo.find();
                res.status(400).render('crearMovimiento', {
                    productos,
                    pagina: 'Nuevo Movimiento',
                    errors: [{ msg: 'Stock insuficiente para realizar salida' }],
                    data: req.body
                });
                return;
            }
            producto.stock -= cantidadNum;
        }
        const nuevoMovimiento = movimientoRepo.create({
            producto,
            tipo,
            cantidad: cantidadNum,
            motivo: motivo || null
        });
        yield productoRepo.save(producto);
        yield movimientoRepo.save(nuevoMovimiento);
        res.redirect('/movimientos');
    }
    catch (error) {
        console.error('Error crearMovimiento:', error);
        res.status(500).render('error', { mensaje: 'Error al crear movimiento' });
    }
});
exports.crearMovimiento = crearMovimiento;
