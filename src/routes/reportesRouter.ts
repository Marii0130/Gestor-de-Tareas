import { Router } from 'express'
import { mostrarListaReportes } from '../controllers/reportesController'

const router = Router()

router.get('/', mostrarListaReportes)

export default router
