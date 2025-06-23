import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import methodOverride from 'method-override';

import boletaRouter from './routes/boletaRouter';

const app = express();

// Configurar motor de vistas (Pug)
app.set('view engine', 'pug');

// Las vistas están en build/public/views
app.set('views', path.join(__dirname, 'public', 'views'));

// Carpeta pública para archivos estáticos (CSS, imágenes, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Ruta principal
app.get('/', (req: Request, res: Response) => {
  res.render('index', {
    pagina: 'Inicio',
  });
});

// Rutas específicas
app.use('/boletas', boletaRouter);

export default app;
