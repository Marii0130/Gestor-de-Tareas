import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Cliente } from '../models/clienteModel';
import { body, validationResult } from 'express-validator';

const clienteRepo = AppDataSource.getRepository(Cliente);

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const clientes = await clienteRepo.find({ relations: ['boletas'] });
    res.render('listarClientes', { clientes, pagina: 'Listado de Clientes' });
  } catch (error) {
    res.status(500).send('Error al obtener clientes');
  }
};

export const consultarUno = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const cliente = await clienteRepo.findOne({ where: { id }, relations: ['boletas'] });
    return cliente || null;
  } catch (error) {
    return null;
  }
};

export const insertar = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('crearCliente', { errors: errors.array() });
  }
  try {
    const cliente = clienteRepo.create(req.body);
    await clienteRepo.save(cliente);
    res.redirect('/clientes/listarClientes');
  } catch (error) {
    res.status(500).send('Error al crear cliente');
  }
};

export const modificar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array());
  }
  try {
    const cliente = await clienteRepo.findOneBy({ id });
    if (!cliente) {
      return res.status(404).send('Cliente no encontrado');
    }
    clienteRepo.merge(cliente, req.body);
    await clienteRepo.save(cliente);
    res.redirect('/clientes/listarClientes');
  } catch (error) {
    res.status(500).send('Error al modificar cliente');
  }
};

export const eliminar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    await clienteRepo.delete(id);
    res.redirect('/clientes/listarClientes');
  } catch (error) {
    res.status(500).send('Error al eliminar cliente');
  }
};

export const validar = () => {
  return [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('domicilio').notEmpty().withMessage('El domicilio es obligatorio'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  ];
};