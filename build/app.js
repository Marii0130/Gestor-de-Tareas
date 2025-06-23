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
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const method_override_1 = __importDefault(require("method-override"));
const conexion_1 = require("./db/conexion");
const productoModel_1 = require("./models/productoModel");
const boletaRouter_1 = __importDefault(require("./routes/boletaRouter"));
const inventarioRouter_1 = __importDefault(require("./routes/inventarioRouter"));
const app = (0, express_1.default)();
// Configurar motor de vistas (Pug)
app.set('view engine', 'pug');
// Las vistas están en build/public/views
app.set('views', path_1.default.join(__dirname, 'public', 'views'));
// Carpeta pública para archivos estáticos (CSS, imágenes, JS)
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Middleware
app.use((0, method_override_1.default)('_method'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
// Ruta principal
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productoRepo = conexion_1.AppDataSource.getRepository(productoModel_1.Producto);
        const productos = yield productoRepo.find();
        const alertas = productos.filter(p => p.stock <= p.stock_minimo);
        res.render('index', {
            pagina: 'Inicio',
            alertas
        });
    }
    catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cargar el inicio' });
    }
}));
// Rutas específicas
app.use('/boletas', boletaRouter_1.default);
app.use('/inventario', inventarioRouter_1.default);
exports.default = app;
