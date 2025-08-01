"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producto = exports.CategoriaProducto = void 0;
const typeorm_1 = require("typeorm");
const movimientoInventarioModel_1 = require("./movimientoInventarioModel");
var CategoriaProducto;
(function (CategoriaProducto) {
    CategoriaProducto["ELECTRONICA"] = "electronica";
    CategoriaProducto["INSUMOS"] = "insumos";
    CategoriaProducto["MATERIALES_ELECTRICOS"] = "materiales_electricos";
})(CategoriaProducto || (exports.CategoriaProducto = CategoriaProducto = {}));
let Producto = class Producto {
};
exports.Producto = Producto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Producto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Producto.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CategoriaProducto,
    }),
    __metadata("design:type", String)
], Producto.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Producto.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Producto.prototype, "precio_compra", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Producto.prototype, "precio_venta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Producto.prototype, "stock_minimo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movimientoInventarioModel_1.MovimientoInventario, movimiento => movimiento.producto),
    __metadata("design:type", Array)
], Producto.prototype, "movimientos", void 0);
exports.Producto = Producto = __decorate([
    (0, typeorm_1.Entity)()
], Producto);
