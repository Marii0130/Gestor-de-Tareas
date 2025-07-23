import express from 'express';
import {
  listarMovimientos,
  mostrarCrearMovimiento,
  crearMovimiento
} from '../controllers/movimientoInventarioController';

const router = express.Router();

router.get('/', listarMovimientos);
router.get('/crear', mostrarCrearMovimiento);
router.post('/crear', crearMovimiento);

export default router;
