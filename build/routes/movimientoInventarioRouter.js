"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movimientoInventarioController_1 = require("../controllers/movimientoInventarioController");
const router = express_1.default.Router();
router.get('/', movimientoInventarioController_1.listarMovimientos);
router.get('/crear', movimientoInventarioController_1.mostrarCrearMovimiento);
router.post('/crear', movimientoInventarioController_1.crearMovimiento);
exports.default = router;
