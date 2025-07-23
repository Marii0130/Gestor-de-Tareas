import { Router } from 'express'
import { mostrarFormularioReparaciones, generarReporteReparaciones } from '../controllers/reparacionesRealizadasController'

const router = Router()

router.get('/', mostrarFormularioReparaciones)
router.post('/', generarReporteReparaciones)

export default router
