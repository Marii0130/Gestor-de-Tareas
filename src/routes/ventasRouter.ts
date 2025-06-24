import { Router } from 'express';
import {
  mostrarFormularioVenta,
  registrarVenta,
  listarVentas
} from '../controllers/ventasController';

const router = Router();

router.get('/crear', mostrarFormularioVenta);
router.post('/crear', registrarVenta);
router.get('/listar', listarVentas);

export default router;
