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
const boletaController_1 = require("../controllers/boletaController");
const router = express_1.default.Router();
router.get('/listarBoletas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.consultarTodos)(req, res);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.get('/crearBoleta', (req, res) => {
    res.render('crearBoleta', { pagina: 'Crear Boleta' });
});
// Aquí usamos el middleware validar() que debe devolver un array
router.post('/', (0, boletaController_1.validar)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.insertar)(req, res);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
    }
}));
router.get('/modificarBoleta/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boleta = yield (0, boletaController_1.consultarUno)(req, res);
        if (!boleta) {
            res.status(404).send('Boleta no encontrada');
            return;
        }
        res.render('modificarBoleta', { boleta });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.modificar)(req, res);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, boletaController_1.eliminar)(req, res);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
    }
}));
exports.default = router;
