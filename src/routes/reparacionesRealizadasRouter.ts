import { Router } from 'express'
import {
  mostrarFormularioReparaciones,
  buscarReparaciones,
  generarReporteReparaciones
} from '../controllers/reparacionesRealizadasController'

const router = Router()

router.get('/', mostrarFormularioReparaciones)
router.post('/buscar', buscarReparaciones)
router.post('/generar', generarReporteReparaciones)

export default router
