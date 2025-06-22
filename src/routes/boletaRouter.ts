import express, { Request, Response } from 'express';
import {
  consultarTodos,
  consultarUno,
  insertar,
  modificar,
  eliminar,
  validar,
  mostrarCrear
} from '../controllers/boletaController';

const router = express.Router();

router.get('/listarBoletas', async (req: Request, res: Response) => {
  try {
    await consultarTodos(req, res);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
});

// Aquí llamamos a mostrarCrear que prepara el formulario con datos necesarios
router.get('/crearBoleta', async (req: Request, res: Response) => {
  try {
    await mostrarCrear(req, res);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
});

// Middleware de validación antes de insertar
router.post('/', validar(), async (req: Request, res: Response) => {
  try {
    await insertar(req, res);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ mensaje: err.message });
    }
  }
});

router.get('/modificarBoleta/:id', async (req: Request, res: Response) => {
  try {
    const boleta = await consultarUno(req, res);
    if (!boleta) {
      res.status(404).send('Boleta no encontrada');
      return;
    }
    res.render('modificarBoleta', { boleta });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await modificar(req, res);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ mensaje: err.message });
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await eliminar(req, res);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ mensaje: err.message });
    }
  }
});

export default router;