"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = require("../controllers/reportesController");
const router = (0, express_1.Router)();
router.get('/', reportesController_1.mostrarListaReportes);
exports.default = router;
