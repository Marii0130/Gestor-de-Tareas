import { Request, Response } from 'express'
import { Between, In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Venta } from '../models/ventaModel'
import { Boleta } from '../models/boletaModel'
import { Reporte } from '../models/reporteModel'

const repoVenta = AppDataSource.getRepository(Venta)
const repoBoleta = AppDataSource.getRepository(Boleta)
const repoReporte = AppDataSource.getRepository(Reporte)

// 🔧 Utilidades de formato
function obtenerRangoSemana(semana: string): string {
  const [anioStr, semanaStr] = semana.split('-W')
  const anio = parseInt(anioStr, 10)
  const semanaNum = parseInt(semanaStr, 10)

  const primerDia = new Date(`${anio}-01-01`)
  const diasOffset = (semanaNum - 1) * 7
  const lunes = new Date(primerDia.getTime() + diasOffset * 86400000)
  lunes.setDate(lunes.getDate() - lunes.getDay() + 1) // lunes real

  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)

  const formato = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`

  return `${formato(lunes)} - ${formato(domingo)}`
}

function obtenerRangoMensual(mes: string): string {
  const [anioStr, mesStr] = mes.split('-')
  const anio = parseInt(anioStr, 10)
  const mesIndex = parseInt(mesStr, 10) - 1

  const inicio = new Date(anio, mesIndex, 1)
  const fin = new Date(anio, mesIndex + 1, 0)

  const formato = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`

  return `${formato(inicio)} - ${formato(fin)}`
}

// 🟡 1. Mostrar el formulario vacío
export const mostrarFormularioIngresos = async (req: Request, res: Response) => {
  res.render('ingresosPorFecha', {
    datos: null,
    tipo: null,
    periodo: null,
    reporteYaGenerado: false,
    semana: null,
    mes: null
  })
}

// 🟢 2. Buscar ingresos según fechas
export const buscarIngresos = async (req: Request, res: Response) => {
  const { tipo, semana, mes } = req.body

  let fechaInicio: Date, fechaFin: Date, periodo = ''

  if (tipo === 'semanal' && semana) {
    const [anio, semanaStr] = semana.split('-W')
    const semanaNum = parseInt(semanaStr)
    const primerDia = new Date(`${anio}-01-01`)
    const diasOffset = (semanaNum - 1) * 7
    fechaInicio = new Date(primerDia.getTime() + diasOffset * 86400000)
    fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay() + 1)
    fechaFin = new Date(fechaInicio)
    fechaFin.setDate(fechaFin.getDate() + 6)
    periodo = obtenerRangoSemana(semana)
  } else if (tipo === 'mensual' && mes) {
    const [anio, mesStr] = mes.split('-')
    const mesNum = parseInt(mesStr)
    fechaInicio = new Date(Number(anio), mesNum - 1, 1)
    fechaFin = new Date(Number(anio), mesNum, 0)
    periodo = obtenerRangoMensual(mes)
  } else {
    return res.render('ingresosPorFecha', {
      datos: null,
      tipo: null,
      periodo: null,
      reporteYaGenerado: false,
      semana,
      mes
    })
  }

  // 🔍 Buscar datos

  // Ventas
  const ventas = await repoVenta.find({
    where: { fecha: Between(fechaInicio, fechaFin) }
  })
  const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0)

  // Señado
  const boletasConSeña = await repoBoleta.find({
    where: {
      fechaSenado: Between(fechaInicio, fechaFin),
      estado: In(['reparando', 'reparado', 'entregado'])
    }
  })
  const totalSeñas = boletasConSeña.reduce((sum, b) => sum + Number(b.senado || 0), 0)

  // Entregas (reparadas y no reparadas)
  const boletasEntregadas = await repoBoleta.find({
    where: [
      {
        fechaEntrega: Between(fechaInicio, fechaFin),
        estado: 'entregado'
      },
      {
        fechaEntrega: Between(fechaInicio, fechaFin),
        estado: 'entregado_no_reparado'
      }
    ]
  })

  let totalEntregas = 0

  for (const b of boletasEntregadas) {
    if (b.estado === 'entregado') {
      totalEntregas += Number(b.total || 0) - Number(b.senado || 0)
    } else if (b.estado === 'entregado_no_reparado') {
      totalEntregas += Number(b.total || 0)
    }
  }

  // Total final
  const totalIngresos = totalVentas + totalSeñas + totalEntregas

  const datos = {
    totalIngresos,
    totalVentas,
    totalSeñas,
    totalEntregas
  }

  const reporteExistente = await repoReporte.findOne({
    where: {
      tipo: 'ingresos',
      parametros: JSON.stringify({ tipo, periodo })
    }
  })

  res.render('ingresosPorFecha', {
    datos,
    tipo,
    periodo,
    reporteYaGenerado: !!reporteExistente,
    semana,
    mes
  })
}

// 🧾 3. Guardar el reporte generado
export const generarReporteIngresos = async (req: Request, res: Response) => {
  const { tipo, periodo, totalIngresos, totalVentas, totalSeñas, totalEntregas } = req.body

  const nuevoReporte = repoReporte.create({
    tipo: 'ingresos',
    parametros: JSON.stringify({ tipo, periodo }),
    resumen: JSON.stringify({
      totalIngresos: Number(totalIngresos) || 0,
      totalVentas: Number(totalVentas) || 0,
      totalSeñas: Number(totalSeñas) || 0,
      totalEntregas: Number(totalEntregas) || 0
    })
  })

  await repoReporte.save(nuevoReporte)
  res.redirect('/reportes')
}
