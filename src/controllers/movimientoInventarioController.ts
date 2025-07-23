import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { MovimientoInventario, TipoMovimiento } from '../models/movimientoInventarioModel';
import { Producto } from '../models/productoModel';

const movimientoRepo = AppDataSource.getRepository(MovimientoInventario);
const productoRepo = AppDataSource.getRepository(Producto);

export const listarMovimientos = async (req: Request, res: Response) => {
  try {
    const movimientos = await movimientoRepo.find({
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
    res.render('listarMovimientos', {
      movimientos,
      pagina: 'Movimientos de Inventario',
    });
  } catch (error) {
    console.error('Error listarMovimientos:', error);
    res.status(500).send('Error al listar movimientos');
  }
};

export const mostrarCrearMovimiento = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepo.find();
    res.render('crearMovimiento', {
      productos,
      pagina: 'Nuevo Movimiento',
      errors: [],
      data: {},
    });
  } catch (error) {
    console.error('Error mostrarCrearMovimiento:', error);
    res.status(500).send('Error al cargar formulario');
  }
};

export const crearMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productoId, tipo, cantidad, motivo } = req.body;
    const errors: { msg: string }[] = [];

    if (!productoId) errors.push({ msg: 'Debe seleccionar un producto' });
    if (!tipo || !Object.values(TipoMovimiento).includes(tipo)) errors.push({ msg: 'Tipo de movimiento inválido' });

    const cantidadNum = Number(cantidad);
    if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0) errors.push({ msg: 'Cantidad debe ser un número mayor a 0' });

    if (errors.length > 0) {
      const productos = await productoRepo.find();
      res.status(400).render('crearMovimiento', {
        productos,
        pagina: 'Nuevo Movimiento',
        errors,
        data: req.body
      });
      return;
    }

    const producto = await productoRepo.findOneBy({ id: Number(productoId) });
    if (!producto) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    if (tipo === TipoMovimiento.ENTRADA) {
      producto.stock += cantidadNum;
    } else {
      if (producto.stock < cantidadNum) {
        const productos = await productoRepo.find();
        res.status(400).render('crearMovimiento', {
          productos,
          pagina: 'Nuevo Movimiento',
          errors: [{ msg: 'Stock insuficiente para realizar salida' }],
          data: req.body
        });
        return;
      }
      producto.stock -= cantidadNum;
    }

    const nuevoMovimiento = movimientoRepo.create({
      producto,
      tipo,
      cantidad: cantidadNum,
      motivo: motivo || null
    });

    await productoRepo.save(producto);
    await movimientoRepo.save(nuevoMovimiento);

    res.redirect('/movimientos');

  } catch (error) {
    console.error('Error crearMovimiento:', error);
    res.status(500).render('error', { mensaje: 'Error al crear movimiento' });
  }
};
