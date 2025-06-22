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
const clienteController_1 = require("../controllers/clienteController");
const router = express_1.default.Router();
// Listar clientes
router.get('/listarClientes', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, clienteController_1.consultarTodos)(req, res);
    }
    catch (err) {
        next(err);
    }
}));
// Formulario para crear cliente
router.get('/crearCliente', (req, res) => {
    res.render('crearCliente', {
        pagina: 'Crear Cliente',
    });
});
// Insertar cliente con validación
router.post('/', (0, clienteController_1.validar)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, clienteController_1.insertar)(req, res);
    }
    catch (err) {
        next(err);
    }
}));
// Formulario para modificar cliente
router.get('/modificarCliente/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cliente = yield (0, clienteController_1.consultarUno)(req, res);
        if (!cliente) {
            res.status(404).send('Cliente no encontrado');
            return;
        }
        res.render('modificarCliente', { cliente });
    }
    catch (err) {
        next(err);
    }
}));
// Modificar cliente
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, clienteController_1.modificar)(req, res);
    }
    catch (err) {
        next(err);
    }
}));
// Eliminar cliente
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, clienteController_1.eliminar)(req, res);
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
