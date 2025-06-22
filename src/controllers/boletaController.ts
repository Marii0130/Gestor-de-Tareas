import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Boleta } from '../models/boletaModel';
import { Cliente } from '../models/clienteModel';
import { body, validationResult } from 'express-validator';

const boletaRepo = AppDataSource.getRepository(Boleta);
const clienteRepo = AppDataSource.getRepository(Cliente);

const condicionesOpciones = [
  'con cable',
  'con control',
  'pantalla manchada',
  'faltan tornillos',
  'sin cable',
  'sin control',
  'pantalla rayada',
  'desarmado'
];

// Listar todas las boletas
export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const boletas = await boletaRepo.find({ relations: ['cliente'] });
    res.render('listarBoletas', {
      boletas,
      pagina: 'Listado de Boletas'
    });
  } catch (error) {
    res.status(500).send('Error al obtener boletas');
  }
};

// Consultar una boleta específica
export const consultarUno = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const boleta = await boletaRepo.findOne({ where: { id }, relations: ['cliente'] });
    return boleta || null;
  } catch (error) {
    return null;
  }
};

// Mostrar formulario para crear boleta
export const mostrarCrear = async (req: Request, res: Response) => {
  try {
    const clientes = await clienteRepo.find();
    res.render('crearBoleta', {
      pagina: 'Crear Boleta',
      clientes,
      condicionesOpciones,
      errors: [],
      boleta: {}
    });
  } catch (error) {
    res.status(500).send('Error al cargar formulario');
  }
};

// Insertar nueva boleta (y cliente nuevo si es necesario)
export const insertar = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const clientes = await clienteRepo.find();
    return res.status(400).render('crearBoleta', {
      errors: errors.array(),
      clientes,
      condicionesOpciones,
      boleta: req.body
    });
  }
  try {
    // Crear cliente nuevo si no se recibe clienteId, o buscarlo si existe
    let cliente;
    if (req.body.clienteId) {
      cliente = await clienteRepo.findOneBy({ id: parseInt(req.body.clienteId) });
      if (!cliente) return res.status(400).send('Cliente inválido');
    } else {
      cliente = clienteRepo.create({
        nombre: req.body.clienteNombre,
        telefono: req.body.clienteTelefono,
        domicilio: req.body.clienteDomicilio || ''
      });
      await clienteRepo.save(cliente);
    }

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
    res.status(500).send('Error al crear boleta');
  }
};

// Modificar boleta existente
export const modificar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array());
  }
  try {
    const boleta = await boletaRepo.findOneBy({ id });
    if (!boleta) {
      return res.status(404).send('Boleta no encontrada');
    }
    boletaRepo.merge(boleta, req.body);
    await boletaRepo.save(boleta);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    res.status(500).send('Error al modificar boleta');
  }
};

// Eliminar boleta
export const eliminar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    await boletaRepo.delete(id);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    res.status(500).send('Error al eliminar boleta');
  }
};

// Validaciones para insertar/modificar boleta
export const validar = () => {
  return [
    body('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
    body('articulo').notEmpty().withMessage('El artículo es obligatorio'),
    body('marca').notEmpty().withMessage('La marca es obligatoria'),
    body('modelo').notEmpty().withMessage('El modelo es obligatorio'),
    body('falla').notEmpty().withMessage('La falla es obligatoria'),
    body('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate().withMessage('Debe ser una fecha válida'),
  ];
};