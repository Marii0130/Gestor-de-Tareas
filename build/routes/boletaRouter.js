"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const boletaController_1 = require("../controllers/boletaController");
const router = express_1.default.Router();
// Listar todas las boletas
router.get('/listarBoletas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.consultarTodos)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al listar boletas',
            detalles: errorMessage
        });
    }
}));
// Mostrar formulario para crear boleta
router.get('/crearBoleta', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.mostrarCrear)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al cargar formulario',
            detalles: errorMessage
        });
    }
}));
// Crear nueva boleta
router.post('/', (0, boletaController_1.validar)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearBoleta', {
            errors: errors.array(),
            boleta: req.body,
            condicionesOpciones: [
                'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
                'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
            ]
        });
    }
    try {
        yield (0, boletaController_1.insertar)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al crear boleta',
            detalles: errorMessage
        });
    }
}));
// Actualizar estado de la boleta (esperando_repuestos, reparado, etc.)
router.post('/:id/:nuevoEstado', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.actualizarEstado)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado';
        res.status(500).render('error', {
            mensaje: 'Error al cambiar estado',
            detalles: errorMessage
        });
    }
}));
// Obtener boleta por ID (detalles específicos)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.obtenerPorId)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al obtener boleta',
            detalles: errorMessage
        });
    }
}));
exports.default = router;
