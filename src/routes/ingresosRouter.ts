import { Router } from 'express'
import { mostrarFormularioIngresos, generarReporteIngresos, buscarIngresos } from '../controllers/ingresosController'

const router = Router()

router.get('/', mostrarFormularioIngresos)
router.post('/buscar', buscarIngresos);
router.post('/generar', generarReporteIngresos)

export default router
