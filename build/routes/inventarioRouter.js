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
const inventarioController_1 = require("../controllers/inventarioController");
const router = express_1.default.Router();
// Listar productos
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, inventarioController_1.listarProductos)(req, res);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al listar productos', detalles: msg });
    }
}));
// Mostrar formulario de creación
router.get('/crear', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, inventarioController_1.mostrarCrear)(req, res);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al cargar formulario', detalles: msg });
    }
}));
// Insertar nuevo producto
router.post('/', (0, inventarioController_1.validarProducto)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('crearProducto', {
            errors: errors.array(),
            producto: req.body,
            pagina: 'Crear Producto'
        });
    }
    try {
        yield (0, inventarioController_1.insertar)(req, res);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al crear producto', detalles: msg });
    }
}));
// Mostrar formulario de modificación
router.get('/modificar/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const producto = yield (0, inventarioController_1.consultarUno)(req, res);
        if (!producto) {
            return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
        }
        res.render('modificarProducto', {
            producto,
            pagina: 'Modificar Producto',
            errors: []
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al cargar producto', detalles: msg });
    }
}));
// Modificar producto
router.put('/:id', (0, inventarioController_1.validarProducto)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('modificarProducto', {
            errors: errors.array(),
            producto: Object.assign(Object.assign({}, req.body), { id: req.params.id }),
            pagina: 'Modificar Producto'
        });
    }
    try {
        yield (0, inventarioController_1.modificar)(req, res);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al modificar producto', detalles: msg });
    }
}));
// Eliminar producto
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, inventarioController_1.eliminar)(req, res);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        res.status(500).render('error', { mensaje: 'Error al eliminar producto', detalles: msg });
    }
}));
router.get('/alertas', inventarioController_1.alertasInventario);
exports.default = router;
