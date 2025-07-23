"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reparacionesRealizadasController_1 = require("../controllers/reparacionesRealizadasController");
const router = (0, express_1.Router)();
router.get('/', reparacionesRealizadasController_1.mostrarFormularioReparaciones);
router.post('/', reparacionesRealizadasController_1.generarReporteReparaciones);
exports.default = router;
