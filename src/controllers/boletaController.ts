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

// Listar todas las boletas
export const consultarTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const estado = req.query.estado as string || '';
    const clienteNombre = (req.query.cliente as string || '').trim();

    // Query builder para aplicar filtros dinámicos
    let query = boletaRepo.createQueryBuilder('boleta')
      .leftJoinAndSelect('boleta.cliente', 'cliente');

    if (estado) {
      query = query.andWhere('boleta.estado = :estado', { estado });
    }

    if (clienteNombre) {
      // Postgres, MySQL, SQLite: usar LOWER para case insensitive
      query = query.andWhere('LOWER(cliente.nombre) LIKE :clienteNombre', { clienteNombre: `%${clienteNombre.toLowerCase()}%` });
    }

    const boletas = await query.getMany();

    // Lista de estados para el select filtro en la vista
    const estados = [
      '', // opción "Todos"
      'recibido', 'en_diagnostico', 'presupuesto_enviado', 'aprobado',
      'reparando', 'esperando_repuestos', 'reparado', 'entregado',
      'cancelado', 'no_reparado', 'entregado_no_reparado'
    ];

    res.render('listarBoletas', { 
      boletas, 
      pagina: 'Listado de Boletas',
      estados,
      filtroEstado: estado,
      filtroCliente: clienteNombre
    });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al obtener boletas' });
  }
};

// Mostrar formulario de creación
export const mostrarCrear = async (req: Request, res: Response) => {
  res.render('crearBoleta', {
    pagina: 'Crear Boleta',
    condicionesOpciones,
    errors: [],
    boleta: {}
  });
};

// Insertar nueva boleta
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
      senado: parseFloat(req.body.senado) || 0,
      costo: parseFloat(req.body.costo) || 0,
      total: parseFloat(req.body.total) || 0,
      cliente
    });

    await boletaRepo.save(boleta);
    res.redirect('/boletas/listarBoletas');
  } catch (error) {
    console.error("Error al crear:", error);
    res.status(500).render('error', { mensaje: 'Error al crear boleta' });
  }
};

// Cambiar estado
export const actualizarEstado = async (req: Request, res: Response) => {
  const { id, nuevoEstado } = req.params;

  const boleta = await boletaRepo.findOneBy({ id: parseInt(id) });

  if (!boleta) {
    return res.status(404).render('error', {
      mensaje: 'Boleta no encontrada',
      detalles: `ID: ${id}`
    });
  }

  // Si se está enviando presupuesto, se guarda también el total
  if (nuevoEstado === 'presupuesto_enviado' && req.body.total) {
    boleta.total = parseFloat(req.body.total);
  }

  boleta.estado = nuevoEstado;

  // Si se marca como reparado, se guarda la fecha actual como fecha_reparacion
  if (nuevoEstado === 'reparado') {
    boleta.fecha_reparacion = new Date();
  }

  await boletaRepo.save(boleta);
  res.redirect('/boletas/listarBoletas');
};

// Obtener una boleta por ID
export const obtenerPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const boleta = await boletaRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['cliente']
    });

    if (!boleta) {
      return res.status(404).render('error', {
        mensaje: 'Boleta no encontrada',
        detalles: `ID: ${id}`
      });
    }

    res.render('detalleBoleta', { boleta });
  } catch (error) {
    console.error('Error al buscar boleta por ID:', error);
    res.status(500).render('error', {
      mensaje: 'Error interno al buscar boleta'
    });
  }
};

// Validaciones
export const validar = () => [
  body('clienteNombre').notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('clienteTelefono').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
  body('articulo').notEmpty().withMessage('El artículo es obligatorio'),
  body('marca').notEmpty().withMessage('La marca es obligatoria'),
  body('modelo').notEmpty().withMessage('El modelo es obligatorio'),
  body('falla').notEmpty().withMessage('La falla es obligatoria'),
  body('fecha_ingreso').notEmpty().withMessage('La fecha de ingreso es obligatoria').isDate(),
  body('senado').optional().isFloat({ min: 0 }),
  body('costo').optional().isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo'),
  body('total').optional().isFloat({ min: 0 })
];
