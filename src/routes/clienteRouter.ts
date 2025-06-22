import express, { Request, Response, NextFunction } from 'express';
import {
    consultarTodos,
    consultarUno,
    insertar,
    modificar,
    eliminar,
    validar
} from '../controllers/clienteController';

const router = express.Router();

// Listar clientes
router.get('/listarClientes', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await consultarTodos(req, res);
    } catch (err) {
        next(err);
    }
});

// Formulario para crear cliente
router.get('/crearCliente', (req: Request, res: Response) => {
    res.render('crearCliente', {
        pagina: 'Crear Cliente',
    });
});

// Insertar cliente con validación
router.post('/', validar(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await insertar(req, res);
    } catch (err) {
        next(err);
    }
});

// Formulario para modificar cliente
router.get('/modificarCliente/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cliente = await consultarUno(req, res);
        if (!cliente) {
            res.status(404).send('Cliente no encontrado');
            return;
        }
        res.render('modificarCliente', { cliente });
    } catch (err) {
        next(err);
    }
});

// Modificar cliente
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await modificar(req, res);
    } catch (err) {
        next(err);
    }
});

// Eliminar cliente
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await eliminar(req, res);
    } catch (err) {
        next(err);
    }
});

export default router;