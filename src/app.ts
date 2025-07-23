import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import methodOverride from 'method-override';
import { AppDataSource } from './db/conexion';
import { Producto } from './models/productoModel';

import boletaRouter from './routes/boletaRouter';
import inventarioRouter from './routes/inventarioRouter';
import ventasRouter from './routes/ventasRouter';
import reparacionesRouter from './routes/reparacionesRouter'
import reportesRouter from './routes/reportesRouter'
import ingresosRouter from './routes/ingresosRouter'
import reporteReparacionesRouter from './routes/reparacionesRealizadasRouter'
import gananciasRouter from './routes/gananciasRouter'
import movimientoInventarioRouter from './routes/movimientoInventarioRouter';

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
app.get('/', async (req: Request, res: Response) => {
  try {
    const productoRepo = AppDataSource.getRepository(Producto);
    const productos = await productoRepo.find();
    const alertas = productos.filter(p => p.stock <= p.stock_minimo);

    res.render('index', {
      pagina: 'Inicio',
      alertas
    });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al cargar el inicio' });
  }
});

// Rutas específicas
app.use('/boletas', boletaRouter);
app.use('/inventario', inventarioRouter);
app.use('/ventas', ventasRouter);
app.use('/reparaciones', reparacionesRouter)
app.use('/reportes', reportesRouter)
app.use('/reportes/ingresos', ingresosRouter)
app.use('/reportes/reparaciones', reporteReparacionesRouter)
app.use('/reportes/ganancias', gananciasRouter)
app.use('/movimientos', movimientoInventarioRouter);

export default app;
