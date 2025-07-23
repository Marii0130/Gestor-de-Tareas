"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gananciasController_1 = require("../controllers/gananciasController");
const router = (0, express_1.Router)();
// Mostrar formulario para generar reporte de costos y ganancias
router.get('/', gananciasController_1.mostrarFormularioCostosGanancias);
// Procesar formulario y mostrar resultados
router.post('/', gananciasController_1.generarReporteCostosGanancias);
// Guardar el reporte generado en base de datos
router.post('/guardar', gananciasController_1.guardarReporteCostosGanancias);
exports.default = router;
