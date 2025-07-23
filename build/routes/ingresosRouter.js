"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ingresosController_1 = require("../controllers/ingresosController");
const router = (0, express_1.Router)();
router.get('/', ingresosController_1.mostrarFormularioIngresos);
router.post('/buscar', ingresosController_1.buscarIngresos);
router.post('/generar', ingresosController_1.generarReporteIngresos);
exports.default = router;
