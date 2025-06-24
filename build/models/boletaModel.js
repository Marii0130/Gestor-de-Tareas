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
exports.Boleta = void 0;
const typeorm_1 = require("typeorm");
const clienteModel_1 = require("./clienteModel");
let Boleta = class Boleta {
};
exports.Boleta = Boleta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Boleta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => clienteModel_1.Cliente, cliente => cliente.boleta, {
        cascade: true,
        onDelete: 'CASCADE',
        eager: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", clienteModel_1.Cliente)
], Boleta.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Boleta.prototype, "articulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Boleta.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Boleta.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Boleta.prototype, "falla", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'recibido',
            'en_diagnostico',
            'presupuesto_enviado',
            'aprobado',
            'reparando',
            'esperando_repuestos',
            'reparado',
            'entregado',
            'cancelado',
            'no_reparado',
            'entregado_no_reparado'
        ],
        default: 'recibido'
    }),
    __metadata("design:type", String)
], Boleta.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Boleta.prototype, "condiciones_iniciales", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Boleta.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Boleta.prototype, "fecha_ingreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Boleta.prototype, "fecha_reparacion", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Boleta.prototype, "senado", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Boleta.prototype, "costo", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Boleta.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Boleta.prototype, "fechaEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Boleta.prototype, "fechaSenado", void 0);
exports.Boleta = Boleta = __decorate([
    (0, typeorm_1.Entity)('boletas')
], Boleta);
