import { Request, Response } from 'express'
import { Between, In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Venta } from '../models/ventaModel'
import { Boleta } from '../models/boletaModel'
import { Reporte } from '../models/reporteModel'

const repoVenta = AppDataSource.getRepository(Venta)
const repoBoleta = AppDataSource.getRepository(Boleta)
const repoReporte = AppDataSource.getRepository(Reporte)

// 1. Mostrar formulario sin datos
export const mostrarFormularioIngresos = async (req: Request, res: Response) => {
    res.render('ingresosPorFecha', { datos: null, tipo: null, periodo: null })
}

// 2. Buscar ingresos y mostrar resultados
export const buscarIngresos = async (req: Request, res: Response) => {
    const { tipo, semana, mes } = req.body

    let fechaInicio: Date, fechaFin: Date
    let periodo = ''
    if (tipo === 'semanal' && semana) {
        const [anio, semanaStr] = semana.split('-W')
        const semanaNum = parseInt(semanaStr)
        const primerDia = new Date(`${anio}-01-01`)
        const diasOffset = (semanaNum - 1) * 7
        fechaInicio = new Date(primerDia.getTime() + diasOffset * 86400000)
        fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay() + 1)
        fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 6)
        periodo = semana
    } else if (tipo === 'mensual' && mes) {
        const [anio, mesStr] = mes.split('-')
        const mesNum = parseInt(mesStr)
        fechaInicio = new Date(Number(anio), mesNum - 1, 1)
        fechaFin = new Date(Number(anio), mesNum, 0)
        periodo = mes
    } else {
        // Si no hay fecha válida, renderizamos sin datos
        return res.render('ingresosPorFecha', { datos: null, tipo: null, periodo: null })
    }

    // Ventas registradas
    const ventas = await repoVenta.find({
        where: { fecha: Between(fechaInicio, fechaFin) }
    })

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0)

    // Señales de boletas (boletas con seña, en estado 'reparando' o posterior)
    const boletasConSeña = await repoBoleta.find({
        where: {
            fechaSenado: Between(fechaInicio, fechaFin),
            estado: In(['reparando', 'reparado', 'entregado'])
        }
    })

    const totalSeñas = boletasConSeña.reduce((sum, b) => sum + Number(b.senado || 0), 0)

    // Entregas de boletas (solo las que fueron reparadas)
    const boletasEntregadas = await repoBoleta.find({
        where: {
            fechaEntrega: Between(fechaInicio, fechaFin),
            estado: 'entregado'
        }
    })

    const totalEntregas = boletasEntregadas.reduce((sum, b) => sum + (Number(b.total || 0) - Number(b.senado || 0)), 0)

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
        reporteYaGenerado: !!reporteExistente
    })
}

// 3. Generar y guardar el reporte
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
    res.redirect('/reportes') // Cambia esta ruta si quieres ir a otro lugar después de guardar
}
