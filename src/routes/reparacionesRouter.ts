import { Router } from 'express'
import {
  mostrarReparaciones,
  mostrarFormSenar,
  senarBoleta,
  mostrarConfirmarEntrega,
  entregarBoleta, 
  mostrarHistorial
} from '../controllers/reparacionesController'

const router = Router()

// Mostrar todas las reparaciones relevantes
router.get('/', mostrarReparaciones)

// Mostrar formulario de señado
router.get('/senar/:id', mostrarFormSenar)

// Procesar señado
router.post('/senar/:id', senarBoleta)

// Mostrar formulario de entrega
router.get('/entregar/:id', mostrarConfirmarEntrega)

// Procesar entrega
router.post('/entregar/:id', entregarBoleta)

router.get('/historial', mostrarHistorial);

export default router
