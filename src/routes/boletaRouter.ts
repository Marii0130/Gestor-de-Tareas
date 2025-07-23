import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  consultarTodos,
  insertar,
  validar,
  mostrarCrear,
  actualizarEstado,
  obtenerPorId
} from '../controllers/boletaController';

const router = express.Router();

// Listar todas las boletas
router.get('/listarBoletas', async (req: Request, res: Response) => {
  try {
    await consultarTodos(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', {
      mensaje: 'Error al listar boletas',
      detalles: errorMessage
    });
  }
});

// Mostrar formulario para crear boleta
router.get('/crearBoleta', async (req: Request, res: Response) => {
  try {
    await mostrarCrear(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', {
      mensaje: 'Error al cargar formulario',
      detalles: errorMessage
    });
  }
});

// Crear nueva boleta
router.post('/', validar(), async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
    await insertar(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', {
      mensaje: 'Error al crear boleta',
      detalles: errorMessage
    });
  }
});

// Actualizar estado de la boleta (esperando_repuestos, reparado, etc.)
router.post('/:id/:nuevoEstado', async (req: Request, res: Response) => {
  try {
    await actualizarEstado(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado';
    res.status(500).render('error', {
      mensaje: 'Error al cambiar estado',
      detalles: errorMessage
    });
  }
});

// Obtener boleta por ID (detalles específicos)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await obtenerPorId(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', {
      mensaje: 'Error al obtener boleta',
      detalles: errorMessage
    });
  }
});

export default router;
