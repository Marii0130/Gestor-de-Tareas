import { Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Producto, CategoriaProducto } from '../models/productoModel';
import { MovimientoInventario, TipoMovimiento } from '../models/movimientoInventarioModel';
import { validationResult, body } from 'express-validator';

const productoRepo = AppDataSource.getRepository(Producto);
const movimientoRepo = AppDataSource.getRepository(MovimientoInventario);

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
// Insertar nuevo producto y registrar movimiento de entrada
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
    // Crear la entidad Producto con los datos recibidos
    const producto = productoRepo.create({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      stock: parseInt(req.body.stock, 10),
      precio_compra: parseFloat(req.body.precio_compra),
      precio_venta: parseFloat(req.body.precio_venta),
      stock_minimo: parseInt(req.body.stock_minimo, 10)
    });

    // Guardar el producto en la base de datos
    const productoGuardado = await productoRepo.save(producto);

    // Si stock > 0, crear movimiento de entrada
    if (productoGuardado.stock > 0) {
      const movimiento = movimientoRepo.create({
        producto: { id: productoGuardado.id }, // Referencia por id para evitar error TS
        tipo: TipoMovimiento.ENTRADA,
        cantidad: productoGuardado.stock,
        motivo: 'Alta de nuevo producto',
        fecha: new Date()
      });

      await movimientoRepo.save(movimiento);
    }

    res.redirect('/inventario');
  } catch (error) {
    console.error('Error al crear producto:', error);
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
      producto: { id, stock_minimo: req.body.stock_minimo },
      pagina: 'Modificar Producto',
      categoriasDisponibles
    });
  }

  try {
    const producto = await productoRepo.findOneBy({ id });
    if (!producto) return res.status(404).render('error', { mensaje: 'Producto no encontrado' });

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
export const validarProductoCrear = () => [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('categoria').notEmpty().withMessage('La categoría es obligatoria'),
  body('stock').isInt({ min: 1 }).withMessage('El stock debe ser un número entero positivo y al menos 1'),
  body('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido'),
  body('precio_venta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser válido'),
  body('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo o cero')
];

export const validarProductoModificar = () => [
  body('stock_minimo').isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número positivo o cero')
];

export const alertasInventario = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepo.find();
    const productosConBajoStock = productos.filter(p => p.stock <= p.stock_minimo);

    res.render('alertasInventario', {
      productos: productosConBajoStock,
      pagina: 'Alertas de Inventario'
    });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al obtener alertas de inventario' });
  }
};
