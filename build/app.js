"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const method_override_1 = __importDefault(require("method-override"));
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
app.get('/', (req, res) => {
    res.render('index', {
        pagina: 'Inicio',
    });
});
// Rutas específicas
app.use('/boletas', boletaRouter_1.default);
app.use('/inventario', inventarioRouter_1.default);
exports.default = app;
