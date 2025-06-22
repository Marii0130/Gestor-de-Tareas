import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import methodOverride from 'method-override';

import clienteRouter from './routes/clienteRouter';
import boletaRouter from './routes/boletaRouter';

const app = express();

// Configurar motor de vistas (opcional, solo si usás Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public', 'views'));

// Carpeta pública para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Ruta principal
app.get('/', (req: Request, res: Response) => {
    res.render('layout', {
        pagina: 'Gestor de Taller',
    });
});

// Rutas específicas
app.use('/clientes', clienteRouter);
app.use('/boletas', boletaRouter);

export default app;