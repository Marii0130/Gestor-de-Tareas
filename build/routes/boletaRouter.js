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
// Listar boletas
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
// Mostrar formulario de creación
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
        // Recuperar datos para mostrar nuevamente el formulario con errores
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
// Mostrar formulario de modificación
router.get('/modificarBoleta/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const boleta = yield (0, boletaController_1.consultarUno)(req, res);
        if (!boleta) {
            return res.status(404).render('error', {
                mensaje: 'Boleta no encontrada'
            });
        }
        const condiciones_iniciales_array = boleta.condiciones_iniciales
            ? boleta.condiciones_iniciales.split(',').map(c => c.trim())
            : [];
        boleta.senado = (_a = boleta.senado) !== null && _a !== void 0 ? _a : 0;
        boleta.total = (_b = boleta.total) !== null && _b !== void 0 ? _b : 0;
        const estados = [
            'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
            'reparando', 'esperando_repuestos', 'reparado', 'entregado',
            'cancelado', 'no_reparado'
        ];
        const condicionesOpciones = [
            'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
            'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
        ];
        res.render('modificarBoleta', {
            boleta,
            estados,
            condicionesOpciones,
            condiciones_iniciales_array,
            pagina: 'Modificar Boleta'
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al cargar boleta para modificación',
            detalles: errorMessage
        });
    }
}));
// Actualizar boleta (CORRECCIÓN PRINCIPAL)
router.put('/:id', (0, boletaController_1.validar)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Datos del formulario recibidos:', req.body);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const boleta = yield (0, boletaController_1.consultarUno)(req, res);
        return res.status(400).render('modificarBoleta', {
            errors: errors.array(),
            boleta: Object.assign(Object.assign({}, boleta), req.body),
            estados: [
                'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
                'reparando', 'esperando_repuestos', 'reparado', 'entregado',
                'cancelado', 'no_reparado'
            ],
            condicionesOpciones: [
                'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
                'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
            ],
            condiciones_iniciales_array: req.body.condiciones_iniciales || []
        });
    }
    try {
        yield (0, boletaController_1.modificar)(req, res);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', {
            mensaje: 'Error al modificar boleta',
            detalles: errorMessage
        });
    }
}));
// Eliminar boleta
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.eliminar)(req, res);
    }
    catch (err) {
        console.error('Error en PUT:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).json({
            success: false,
            message: 'Error al eliminar boleta',
            error: errorMessage
        });
    }
}));
exports.default = router;
