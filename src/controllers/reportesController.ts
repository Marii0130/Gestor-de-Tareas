import { Request, Response } from 'express'
import { AppDataSource } from '../db/conexion'
import { Reporte } from '../models/reporteModel'

const repoReporte = AppDataSource.getRepository(Reporte)

// Mostrar la lista de reportes guardados
export const mostrarListaReportes = async (req: Request, res: Response) => {
  try {
    const reportes = await repoReporte.find({ order: { fechaCreacion: 'DESC' } })

    // Convertimos los strings JSON para mostrarlos más fácil en la vista
    const reportesConResumen = reportes.map(r => ({
      ...r,
      parametrosObj: r.parametros ? JSON.parse(r.parametros) : null,
      resumenObj: r.resumen ? JSON.parse(r.resumen) : null
    }))

    res.render('listarReportes', {
      pagina: 'Reportes guardados',
      reportes: reportesConResumen
    })
  } catch (error) {
    console.error('Error al obtener lista de reportes:', error)
    res.status(500).send('Error al obtener la lista de reportes')
  }
}
