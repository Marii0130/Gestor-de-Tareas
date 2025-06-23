import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  listarProductos,
  mostrarCrear,
  consultarUno,
  insertar,
  modificar,
  eliminar,
  validarProducto
} from '../controllers/inventarioController';

const router = express.Router();

// Listar productos
router.get('/', async (req: Request, res: Response) => {
  try {
    await listarProductos(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al listar productos', detalles: msg });
  }
});

// Mostrar formulario de creación
router.get('/crear', async (req: Request, res: Response) => {
  try {
    await mostrarCrear(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al cargar formulario', detalles: msg });
  }
});

// Insertar nuevo producto
router.post('/', validarProducto(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('crearProducto', {
      errors: errors.array(),
      producto: req.body,
      pagina: 'Crear Producto'
    });
  }

  try {
    await insertar(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al crear producto', detalles: msg });
  }
});

// Mostrar formulario de modificación
router.get('/modificar/:id', async (req: Request, res: Response) => {
  try {
    const producto = await consultarUno(req, res);
    if (!producto) {
      return res.status(404).render('error', { mensaje: 'Producto no encontrado' });
    }

    res.render('modificarProducto', {
      producto,
      pagina: 'Modificar Producto',
      errors: []
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al cargar producto', detalles: msg });
  }
});

// Modificar producto
router.put('/:id', validarProducto(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('modificarProducto', {
      errors: errors.array(),
      producto: { ...req.body, id: req.params.id },
      pagina: 'Modificar Producto'
    });
  }

  try {
    await modificar(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al modificar producto', detalles: msg });
  }
});

// Eliminar producto
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await eliminar(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { mensaje: 'Error al eliminar producto', detalles: msg });
  }
});

export default router;