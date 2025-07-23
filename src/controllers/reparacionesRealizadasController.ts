import { Request, Response } from 'express'
import { Between, In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Boleta } from '../models/boletaModel'
import { Reporte } from '../models/reporteModel'

const repoBoleta = AppDataSource.getRepository(Boleta)
const repoReporte = AppDataSource.getRepository(Reporte)

// Obtener lunes de la semana ISO
function getMondayOfWeek(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay() || 7
  const monday = new Date(simple)
  monday.setDate(simple.getDate() - dow + 1)
  return monday
}

export const mostrarFormularioReparaciones = async (req: Request, res: Response) => {
  res.render('reparacionesRealizadas', {
    datos: null,
    tipo: 'semanal',
    periodo: null,
    reporteYaGenerado: false,
    semana: '',
    mes: ''
  })
}

export const buscarReparaciones = async (req: Request, res: Response) => {
  const { tipo, semana, mes } = req.body

  let fechaInicio: Date, fechaFin: Date
  let periodoTexto = ''
  let semanaFinal = '', mesFinal = ''

  if (tipo === 'semanal' && semana) {
    const [anioStr, semanaStr] = semana.split('-W')
    const anio = Number(anioStr)
    const semanaNum = parseInt(semanaStr)
    fechaInicio = getMondayOfWeek(anio, semanaNum)
    fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaFin.getDate() + 6)
    periodoTexto = `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`
    semanaFinal = semana
  } else if (tipo === 'mensual' && mes) {
    const [anioStr, mesStr] = mes.split('-')
    const anio = Number(anioStr)
    const mesNum = parseInt(mesStr)
    fechaInicio = new Date(anio, mesNum - 1, 1)
    fechaFin = new Date(anio, mesNum, 0)
    periodoTexto = `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`
    mesFinal = mes
  } else {
    return res.render('reparacionesRealizadas', {
      datos: null,
      tipo,
      periodo: null,
      reporteYaGenerado: false,
      semana: '',
      mes: ''
    })
  }

  const [boletasEntregadas, boletasEntregadasNoReparadas, boletasRecibidas] = await Promise.all([
    repoBoleta.find({
      where: {
        fechaEntrega: Between(fechaInicio, fechaFin),
        estado: In(['entregado'])
      }
    }),
    repoBoleta.find({
      where: {
        fechaEntrega: Between(fechaInicio, fechaFin),
        estado: 'entregado_no_reparado'
      }
    }),
    repoBoleta.find({
      where: {
        fecha_ingreso: Between(fechaInicio, fechaFin)
      }
    })
  ])

  const totalEntregadas = boletasEntregadas.length
  const totalEntregadasNoReparadas = boletasEntregadasNoReparadas.length
  const totalRecibidas = boletasRecibidas.length

  const datos = {
    totalEntregadas,
    totalEntregadasNoReparadas,
    totalRecibidas
  }

  const reporteExistente = await repoReporte.findOne({
    where: {
      tipo: 'reparaciones',
      parametros: JSON.stringify({ tipo, periodo: periodoTexto })
    }
  })

  res.render('reparacionesRealizadas', {
    datos,
    tipo,
    periodo: periodoTexto,
    reporteYaGenerado: !!reporteExistente,
    semana: semanaFinal,
    mes: mesFinal
  })
}

export const generarReporteReparaciones = async (req: Request, res: Response) => {
  const { tipo, periodo, totalEntregadas, totalEntregadasNoReparadas, totalRecibidas } = req.body

  const reporteExistente = await repoReporte.findOne({
    where: {
      tipo: 'reparaciones',
      parametros: JSON.stringify({ tipo, periodo })
    }
  })

  if (reporteExistente) {
    return res.redirect('/reportes')
  }

  const nuevoReporte = repoReporte.create({
    tipo: 'reparaciones',
    parametros: JSON.stringify({ tipo, periodo }),
    resumen: JSON.stringify({
      totalEntregadas: Number(totalEntregadas) || 0,
      totalEntregadasNoReparadas: Number(totalEntregadasNoReparadas) || 0,
      totalRecibidas: Number(totalRecibidas) || 0
    })
  })

  await repoReporte.save(nuevoReporte)
  res.redirect('/reportes')
}
