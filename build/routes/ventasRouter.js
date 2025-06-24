"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ventasController_1 = require("../controllers/ventasController");
const router = (0, express_1.Router)();
router.get('/crear', ventasController_1.mostrarFormularioVenta);
router.post('/crear', ventasController_1.registrarVenta);
router.get('/listar', ventasController_1.listarVentas);
exports.default = router;
