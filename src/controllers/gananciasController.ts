import { RequestHandler } from 'express'
import { Between, In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Boleta } from '../models/boletaModel' // Ajusta según tu proyecto

const boletaRepo = AppDataSource.getRepository(Boleta)

export const mostrarFormularioGanancias: RequestHandler = (req, res) => {
  res.render('costosGanancias', {
    pagina: 'Reporte de Costos y Ganancias',
    resultado: null
  })
}

export const generarReporteGanancias: RequestHandler = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.body as { fechaInicio: string; fechaFin: string }

    if (!fechaInicio || !fechaFin) {
      res.status(400).send('Debe ingresar fecha de inicio y fin.')
      return
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    inicio.setHours(0, 0, 0, 0)
    fin.setHours(23, 59, 59, 999)

    const boletas = await boletaRepo.find({
      where: {
        estado: In(['entregado', 'entregado_no_reparado']),
        fechaEntrega: Between(inicio, fin)
      },
      relations: ['cliente']
    })

    const detalles = boletas.map(b => {
      const costo = b.costo || 0
      const total = b.total || 0
      const ganancia = total - costo
      return { boleta: b, costo, total, ganancia }
    })

    const totalCostos = detalles.reduce((sum, d) => sum + d.costo, 0)
    const totalGanancias = detalles.reduce((sum, d) => sum + d.ganancia, 0)
    const promedioGanancia = detalles.length ? totalGanancias / detalles.length : 0

    res.render('costosGanancias', {
      pagina: 'Reporte de Costos y Ganancias',
      resultado: {
        fechaInicio: inicio.toLocaleDateString(),
        fechaFin: fin.toLocaleDateString(),
        totalCostos: totalCostos.toFixed(2),
        totalGanancias: totalGanancias.toFixed(2),
        promedioGanancia: promedioGanancia.toFixed(2),
        detalles
      }
    })
  } catch (error) {
    next(error)
  }
}
