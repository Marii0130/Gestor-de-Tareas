"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reparacionesController_1 = require("../controllers/reparacionesController");
const router = (0, express_1.Router)();
// Mostrar todas las reparaciones relevantes
router.get('/', reparacionesController_1.mostrarReparaciones);
// Mostrar formulario de señado
router.get('/senar/:id', reparacionesController_1.mostrarFormSenar);
// Procesar señado
router.post('/senar/:id', reparacionesController_1.senarBoleta);
// Mostrar formulario de entrega
router.get('/entregar/:id', reparacionesController_1.mostrarConfirmarEntrega);
// Procesar entrega
router.post('/entregar/:id', reparacionesController_1.entregarBoleta);
router.get('/historial', reparacionesController_1.mostrarHistorial);
exports.default = router;
