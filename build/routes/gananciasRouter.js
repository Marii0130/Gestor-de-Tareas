"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gananciasController_1 = require("../controllers/gananciasController");
const router = (0, express_1.Router)();
router.get('/', gananciasController_1.mostrarFormularioGanancias);
router.post('/', gananciasController_1.generarReporteGanancias);
exports.default = router;
