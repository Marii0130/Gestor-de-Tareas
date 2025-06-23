import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
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

// Listar boletas
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

// Mostrar formulario de creación
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
    // Recuperar datos para mostrar nuevamente el formulario con errores
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

// Mostrar formulario de modificación
router.get('/modificarBoleta/:id', async (req: Request, res: Response) => {
  try {
    const boleta = await consultarUno(req, res);
    if (!boleta) {
      return res.status(404).render('error', { 
        mensaje: 'Boleta no encontrada' 
      });
    }

    const condiciones_iniciales_array = boleta.condiciones_iniciales
      ? boleta.condiciones_iniciales.split(',').map(c => c.trim())
      : [];

    boleta.senado = boleta.senado ?? 0;
    boleta.total = boleta.total ?? 0;

    const estados = [
      'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
      'reparando', 'esperando_repuestos', 'reparado', 'entregado',
      'cancelado', 'no_reparado'
    ];

    const condicionesOpciones = [
      'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
      'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
    ];

    res.render('modificarBoleta', { 
      boleta, 
      estados, 
      condicionesOpciones, 
      condiciones_iniciales_array,
      pagina: 'Modificar Boleta'
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { 
      mensaje: 'Error al cargar boleta para modificación',
      detalles: errorMessage
    });
  }
});

// Actualizar boleta (CORRECCIÓN PRINCIPAL)
router.put('/:id', validar(), async (req: Request, res: Response) => {
  console.log('Datos del formulario recibidos:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const boleta = await consultarUno(req, res);
    return res.status(400).render('modificarBoleta', {
      errors: errors.array(),
      boleta: { ...boleta, ...req.body },
      estados: [
        'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
        'reparando', 'esperando_repuestos', 'reparado', 'entregado',
        'cancelado', 'no_reparado'
      ],
      condicionesOpciones: [
        'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
        'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
      ],
      condiciones_iniciales_array: req.body.condiciones_iniciales || []
    });
  }

  try {
    await modificar(req, res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).render('error', { 
      mensaje: 'Error al modificar boleta',
      detalles: errorMessage
    });
  }
});

// Eliminar boleta
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await eliminar(req, res);
  } catch (err) {
    console.error('Error en PUT:', err);
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar boleta',
      error: errorMessage
    });
  }
});

export default router;