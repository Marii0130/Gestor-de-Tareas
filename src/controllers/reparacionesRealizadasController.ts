import { RequestHandler } from 'express'
import { Between, In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Boleta } from '../models/boletaModel' // Ajusta según tu proyecto

const boletaRepo = AppDataSource.getRepository(Boleta)

export const mostrarFormularioReparaciones: RequestHandler = (req, res) => {
  res.render('reparacionesRealizadas', {
    pagina: 'Reporte de Reparaciones',
    resultado: null
  })
}

export const generarReporteReparaciones: RequestHandler = async (req, res, next) => {
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

    const reparadas = boletas.filter(b => b.estado === 'entregado').length
    const noReparadas = boletas.filter(b => b.estado === 'entregado_no_reparado').length
    const totalCobrado = boletas.reduce((sum, b) => sum + (b.total || 0), 0)
    const promedio = boletas.length ? totalCobrado / boletas.length : 0

    res.render('ReparacionesRealizadas', {
      pagina: 'Reporte de Reparaciones',
      resultado: {
        fechaInicio: inicio.toLocaleDateString(),
        fechaFin: fin.toLocaleDateString(),
        totalReparaciones: boletas.length,
        reparadas,
        noReparadas,
        totalCobrado: totalCobrado.toFixed(2),
        promedioPorReparacion: promedio.toFixed(2),
        boletas
      }
    })
  } catch (error) {
    next(error)
  }
}
