import { Router } from 'express'
import { mostrarFormularioGanancias, generarReporteGanancias } from '../controllers/gananciasController'

const router = Router()

router.get('/', mostrarFormularioGanancias)
router.post('/', generarReporteGanancias)

export default router
