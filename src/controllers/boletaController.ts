import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Boleta } from '../models/boletaModel';
import { Cliente } from '../models/clienteModel';
import { body, validationResult } from 'express-validator';

const boletaRepo = AppDataSource.getRepository(Boleta);
const clienteRepo = AppDataSource.getRepository(Cliente);

const condicionesOpciones = [
  'con cable', 'con control', 'pantalla manchada', 'faltan tornillos',
  'sin cable', 'sin control', 'pantalla rayada', 'desarmado'
];

export const consultarTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const boletas = await boletaRepo.find({ relations: ['cliente'] });
    res.render('listarBoletas', { boletas, pagina: 'Listado de Boletas' });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al obtener boletas' });
  }
};

export const consultarUno = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    return await boletaRepo.findOne({ where: { id }, relations: ['cliente'] });
  } catch (error) {
    return null;
  }
};

export const mostrarCrear = async (req: Request, res: Response) => {
  try {
    res.render('crearBoleta', {
      pagina: 'Crear Boleta',
      condicionesOpciones,
      errors: [],
      boleta: {}
    });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al cargar formulario' });
  }
};

export const insertar = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('crearBoleta', {
      errors: errors.array(),
      condicionesOpciones,
      boleta: req.body
    });
  }

  try {
    const cliente = clienteRepo.create({
      nombre: req.body.clienteNombre,
      telefono: req.body.clienteTelefono,
      domicilio: req.body.clienteDomicilio || ''
    });
    await clienteRepo.save(cliente);

    const condiciones_iniciales = Array.isArray(req.body.condiciones_iniciales)
      ? req.body.condiciones_iniciales.join(', ')
      : req.body.condiciones_iniciales || '';

    const boleta = boletaRepo.create({
      articulo: req.body.articulo,
      marca: req.body.marca,
      modelo: req.body.modelo,
      falla: req.body.falla,
      estado: req.body.estado || 'recibido',
      condiciones_iniciales,
      observaciones: req.body.observaciones || '',
      fecha_ingreso: req.body.fecha_ingreso,
      fecha_reparacion: req.body.fecha_reparacion || null,
      senado: req.body.senado || 0,
      total: req.body.total || 0,
      cliente
    });

    await boletaRepo.save(boleta);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    console.error("Error al crear:", error);
    res.status(500).render('error', { mensaje: 'Error al crear boleta' });
  }
};

// MODIFICACIÓN ACTUALIZADA
export const modificar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  try {
    const boleta = await boletaRepo.findOne({ 
      where: { id },
      relations: ['cliente']
    });

    if (!boleta || !boleta.cliente) {
      return res.status(404).render('error', { mensaje: 'Registro no encontrado' });
    }

    // Actualización de campos - ¡Asegúrate de incluir TODOS los campos!
    boleta.articulo = req.body.articulo;
    boleta.marca = req.body.marca;
    boleta.modelo = req.body.modelo;
    boleta.falla = req.body.falla;
    boleta.estado = req.body.estado;
    boleta.condiciones_iniciales = Array.isArray(req.body.condiciones_iniciales) 
      ? req.body.condiciones_iniciales.join(', ') 
      : req.body.condiciones_iniciales;
    boleta.observaciones = req.body.observaciones;
    boleta.fecha_ingreso = req.body.fecha_ingreso;
    boleta.fecha_reparacion = req.body.fecha_reparacion || null;
    boleta.senado = parseFloat(req.body.senado) || 0;
    boleta.total = parseFloat(req.body.total) || 0;

    // Actualizar datos del cliente también
    boleta.cliente.nombre = req.body.clienteNombre;
    boleta.cliente.telefono = req.body.clienteTelefono;
    boleta.cliente.domicilio = req.body.clienteDomicilio || '';

    // Guardar ambos en una transacción
    await AppDataSource.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.save(boleta.cliente);
      await transactionalEntityManager.save(boleta);
    });

    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    console.error('Error al modificar:', error);
    res.status(500).render('error', { 
      mensaje: 'Error al modificar boleta',
      detalles: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// ELIMINACIÓN ACTUALIZADA
export const eliminar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  try {
    const boleta = await boletaRepo.findOne({ 
      where: { id },
      relations: ['cliente']
    });

    if (!boleta) {
      return res.status(404).json({ success: false, message: 'Boleta no encontrada' });
    }

    // Eliminar ambos registros en transacción
    await AppDataSource.transaction(async transactionalEntityManager => {
      // Primero eliminar la boleta
      await transactionalEntityManager.remove(Boleta, boleta);
      
      // Luego eliminar el cliente asociado
      if (boleta.cliente) {
        await transactionalEntityManager.remove(Cliente, boleta.cliente);
      }
    });

    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).render('error', {
      mensaje: 'Error al eliminar registro',
      detalles: errorMessage
    });
  }
};

export const validar = () => [
  body('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
  body('articulo').notEmpty().withMessage('El artículo es obligatorio'),
  body('marca').notEmpty().withMessage('La marca es obligatoria'),
  body('modelo').notEmpty().withMessage('El modelo es obligatorio'),
  body('falla').notEmpty().withMessage('La falla es obligatoria'),
  body('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate(),
  body('senado').optional().isFloat({ min: 0 }),
  body('total').optional().isFloat({ min: 0 })
];