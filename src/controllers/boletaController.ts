import { Request, Response } from 'express';
import { AppDataSource } from '../bd/conexion';
import { Boleta } from '../models/boletaModel';
import { Cliente } from '../models/clienteModel';
import { body, validationResult } from 'express-validator';

const boletaRepo = AppDataSource.getRepository(Boleta);
const clienteRepo = AppDataSource.getRepository(Cliente);

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const boletas = await boletaRepo.find({ relations: ['cliente'] });
    res.render('listarBoletas', { boletas, pagina: 'Listado de Boletas' });
  } catch (error) {
    res.status(500).send('Error al obtener boletas');
  }
};

export const consultarUno = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const boleta = await boletaRepo.findOne({ where: { id }, relations: ['cliente'] });
    return boleta || null;
  } catch (error) {
    return null;
  }
};

export const insertar = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('crearBoleta', { errors: errors.array() });
  }
  try {
    const cliente = await clienteRepo.findOneBy({ id: req.body.clienteId });
    if (!cliente) return res.status(400).send('Cliente inválido');

    const boleta = boletaRepo.create({
      ...req.body,
      cliente,
      estado: req.body.estado || 'recibido',
    });
    await boletaRepo.save(boleta);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    res.status(500).send('Error al crear boleta');
  }
};

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

export const eliminar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    await boletaRepo.delete(id);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    res.status(500).send('Error al eliminar boleta');
  }
};

export const validar = () => {
  return [
    body('clienteId').isInt().withMessage('El cliente es obligatorio'),
    body('articulo').notEmpty().withMessage('El artículo es obligatorio'),
    body('marca').notEmpty().withMessage('La marca es obligatoria'),
    body('modelo').notEmpty().withMessage('El modelo es obligatorio'),
    body('falla').notEmpty().withMessage('La falla es obligatoria'),
  ];
};