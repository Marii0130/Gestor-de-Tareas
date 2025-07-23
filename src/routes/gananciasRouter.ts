import { Router } from 'express';
import { 
  mostrarFormularioCostosGanancias, 
  generarReporteCostosGanancias, 
  guardarReporteCostosGanancias 
} from '../controllers/gananciasController';

const router = Router();

// Mostrar formulario para generar reporte de costos y ganancias
router.get('/', mostrarFormularioCostosGanancias);

// Procesar formulario y mostrar resultados
router.post('/', generarReporteCostosGanancias);

// Guardar el reporte generado en base de datos
router.post('/guardar', guardarReporteCostosGanancias);

export default router;
