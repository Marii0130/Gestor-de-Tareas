import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Venta } from '../models/ventaModel';
import { DetalleVenta } from '../models/detalleVentaModel';
import { Producto } from '../models/productoModel';

const ventaRepo = AppDataSource.getRepository(Venta);
const detalleRepo = AppDataSource.getRepository(DetalleVenta);
const productoRepo = AppDataSource.getRepository(Producto);

export const mostrarFormularioVenta = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepo.find();
    const venta = {
      total: 0,
    }
    res.render('crearVenta', {
      productos,
      venta,
      pagina: 'Nueva Venta'
    });
  } catch (error) {
    res.status(500).send('Error al cargar el formulario de venta');
  }
};


export const registrarVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = req.body.productos;// [{ id: "1", cantidad: 2 }, ...]

    if (!productos || productos.length === 0) {
      res.status(400).send('No se seleccionaron productos para la venta.');
      return;
    }

    const venta = new Venta();
    venta.total = 0;
    venta.detalles = [];

    for (const item of productos) {
      const producto = await productoRepo.findOneBy({ id: parseInt(item.id, 10) });
      if (!producto) continue;

      const cantidad = parseInt(item.cantidad, 10);
      const detalle = new DetalleVenta();
      detalle.producto = producto;
      detalle.cantidad = cantidad;
      detalle.precio_unitario = producto.precio_venta;

      venta.total += cantidad * producto.precio_venta;
      venta.detalles.push(detalle);

      producto.stock -= cantidad;
      await productoRepo.save(producto);
    }

    await ventaRepo.save(venta);
    res.redirect('/ventas/listar');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar la venta');
  }
};

export const listarVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await ventaRepo.find({ relations: ['detalles', 'detalles.producto'] });
    res.render('listarVentas', {
      ventas,
      pagina: 'Listado de Ventas'
    });
  } catch (error) {
    res.status(500).send('Error al listar ventas');
  }
};
