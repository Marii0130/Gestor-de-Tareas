import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Producto, CategoriaProducto } from '../models/productoModel';
import { validationResult, body } from 'express-validator';

const productoRepo = AppDataSource.getRepository(Producto);

// Lista de categorías disponibles (como estados en boletas)
export const categoriasDisponibles = Object.values(CategoriaProducto);

// Consultar todos los productos
export const listarProductos = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepo.find();
    res.render('listarProductos', {
      productos,
      pagina: 'Listado de Productos'
    });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al obtener productos' });
  }
};

// Consultar un producto por ID
export const consultarUno = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    return await productoRepo.findOneBy({ id });
  } catch (error) {
    return null;
  }
};

// Mostrar formulario para crear producto
export const mostrarCrear = (req: Request, res: Response) => {
  res.render('crearProducto', {
    pagina: 'Crear Producto',
    errors: [],
    producto: {},
    categoriasDisponibles
  });
};

// Insertar nuevo producto
export const insertar = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('crearProducto', {
      errors: errors.array(),
      producto: req.body,
      pagina: 'Crear Producto',
      categoriasDisponibles
    });
  }

  try {
    const producto = productoRepo.create(req.body);
    await productoRepo.save(producto);
    res.redirect('/inventario');
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al crear producto' });
  }
};

// Modificar producto existente
export const modificar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('modificarProducto', {
      errors: errors.array(),
      producto: { ...req.body, id },
      pagina: 'Modificar Producto',
      categoriasDisponibles
    });
  }

  try {
    const producto = await productoRepo.findOneBy({ id });
    if (!producto) return res.status(404).render('error', { mensaje: 'Producto no encontrado' });

    producto.nombre = req.body.nombre;
    producto.categoria = req.body.categoria;
    producto.stock = parseInt(req.body.stock, 10);
    producto.precio_compra = parseFloat(req.body.precio_compra);
    producto.precio_venta = parseFloat(req.body.precio_venta);
    producto.stock_minimo = parseInt(req.body.stock_minimo, 10);

    await productoRepo.save(producto);
    res.redirect('/inventario');
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al modificar producto' });
  }
};

// Eliminar producto
export const eliminar = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const producto = await productoRepo.findOneBy({ id });
    if (!producto) return res.status(404).render('error', { mensaje: 'Producto no encontrado' });

    await productoRepo.remove(producto);
    res.redirect('/inventario');
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al eliminar producto' });
  }
};

// Validaciones
export const validarProducto = () => [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('categoria').notEmpty().withMessage('La categoría es obligatoria'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número positivo'),
  body('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido'),
  body('precio_venta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser válido'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo')
];
