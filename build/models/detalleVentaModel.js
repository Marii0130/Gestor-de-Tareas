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
exports.DetalleVenta = void 0;
const typeorm_1 = require("typeorm");
const ventaModel_1 = require("./ventaModel");
const productoModel_1 = require("./productoModel");
let DetalleVenta = class DetalleVenta {
};
exports.DetalleVenta = DetalleVenta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ventaModel_1.Venta, venta => venta.detalles, { onDelete: 'CASCADE' }),
    __metadata("design:type", ventaModel_1.Venta)
], DetalleVenta.prototype, "venta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => productoModel_1.Producto, { eager: true }),
    __metadata("design:type", productoModel_1.Producto)
], DetalleVenta.prototype, "producto", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "precio_unitario", void 0);
exports.DetalleVenta = DetalleVenta = __decorate([
    (0, typeorm_1.Entity)()
], DetalleVenta);
