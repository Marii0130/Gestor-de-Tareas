import { Request, Response } from 'express'
import { In } from 'typeorm'
import { AppDataSource } from '../db/conexion'
import { Boleta } from '../models/boletaModel'

const boletaRepository = AppDataSource.getRepository(Boleta)

function extraerPulgadas(articulo: string): number | null {
  const regex = /(\d{1,2})"/
  const match = articulo.match(regex)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

function obtenerPrecioPorPulgadas(pulgadas: number): number {
  if (pulgadas >= 50) return 8000
  if (pulgadas >= 43) return 7000
  if (pulgadas >= 40) return 6000
  if (pulgadas >= 32) return 4000
  return 0
}

export const mostrarReparaciones = async (req: Request, res: Response) => {
  const boletas = await boletaRepository.find({
    where: { estado: In(['aprobado', 'reparado', 'cancelado', 'no_reparado']) },
    relations: ['cliente']
  })
  res.render('listarReparaciones', { boletas })
}

export const mostrarFormSenar = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id)
  const boleta = await boletaRepository.findOneBy({ id })

  if (!boleta || boleta.estado !== 'aprobado') {
    res.status(400).send('No se puede señar esta boleta.')
    return
  }

  res.render('senarBoleta', { boleta, pagina: 'Señar Boleta' })
}

export const senarBoleta = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id)
  const boleta = await boletaRepository.findOneBy({ id })

  if (!boleta || boleta.estado !== 'aprobado') {
    res.status(400).send('No se puede señar esta boleta.')
    return
  }

  const senado = parseFloat(req.body.senado)
  if (isNaN(senado) || senado < 0) {
    res.status(400).send('Monto inválido.')
    return
  }

  boleta.senado = senado
  boleta.fechaSenado = new Date()
  boleta.estado = 'reparando'

  await boletaRepository.save(boleta)

  res.redirect('/reparaciones')
}

export const entregarBoleta = async (req: Request, res: Response): Promise<void> => {
  const boleta = await boletaRepository.findOneBy({ id: Number(req.params.id) })

  if (!boleta) {
    res.status(404).send('Boleta no encontrada')
    return
  }

  const nuevoTotal = parseFloat(req.body.total)
  if (!isNaN(nuevoTotal) && nuevoTotal >= 0) {
    boleta.total = nuevoTotal
  }

  if (boleta.estado === 'reparado') {
    boleta.estado = 'entregado'
  } else if (['cancelado', 'no_reparado'].includes(boleta.estado)) {
    boleta.estado = 'entregado_no_reparado'
  } else {
    res.status(400).send('No se puede entregar esta boleta.')
    return
  }

  boleta.fechaEntrega = new Date()

  await boletaRepository.save(boleta)

  res.render('entregaExitosa', {
    boleta,
    totalPagado: boleta.total - (boleta.senado || 0),
    fechaEntrega: boleta.fechaEntrega.toLocaleString()
  })
}

export const mostrarEntrega = async (req: Request, res: Response): Promise<void> => {
  const boleta = await boletaRepository.findOne({
    where: { id: Number(req.params.id) },
    relations: ['cliente']
  })

  if (!boleta) {
    res.status(404).send('Boleta no encontrada')
    return
  }

  let totalAPagar = boleta.total

  if (boleta.estado === 'reparado') {
    totalAPagar = boleta.total - (boleta.senado || 0)
  }

  res.render('confirmarEntrega', {
    boleta,
    totalAPagar
  })
}

export const mostrarConfirmarEntrega = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id)
  const boleta = await boletaRepository.findOne({
    where: { id },
    relations: ['cliente']
  })

  if (!boleta) {
    res.status(404).send('Boleta no encontrada')
    return
  }

  let totalAPagar = boleta.total

  if (['cancelado', 'no_reparado'].includes(boleta.estado)) {
    const pulgadas = extraerPulgadas(boleta.articulo)
    if (pulgadas !== null) {
      const precioConsulta = obtenerPrecioPorPulgadas(pulgadas)
      if (precioConsulta > 0) {
        boleta.total = precioConsulta
        totalAPagar = precioConsulta
      }
    }
  } else if (boleta.estado === 'reparado') {
    totalAPagar = boleta.total - (boleta.senado || 0)
  }

  res.render('confirmarEntrega', {
    boleta,
    totalAPagar
  })
}

export const mostrarHistorial = async (req: Request, res: Response) => {
  try {
    const boletas = await boletaRepository.find({
      where: { estado: In(['reparando', 'reparado', 'cancelado', 'no_reparado', 'entregado', 'entregado_no_reparado']) },
      relations: ['cliente']
    })

    interface MovimientoHistorial {
      id: number
      tipo: 'Seña' | 'Entrega'
      fecha: Date
      totalPagado: number
      tipoReparacion: string
      senado: number
      boleta: Boleta
    }

    const historial: MovimientoHistorial[] = []

    boletas.forEach(b => {
      if (b.senado && b.senado > 0) {
        historial.push({
          id: b.id,
          tipo: 'Seña',
          fecha: b.fechaSenado || new Date(),
          totalPagado: Number(b.senado),
          tipoReparacion: ['reparado', 'entregado'].includes(b.estado) ? 'Reparado' : 'No Reparado',
          senado: Number(b.senado),
          boleta: b
        })
      }
      if (['entregado', 'entregado_no_reparado'].includes(b.estado)) {
        const totalPagadoEntrega = Number(b.total) - Number(b.senado || 0)
        historial.push({
          id: b.id,
          tipo: 'Entrega',
          fecha: b.fechaEntrega || new Date(),
          totalPagado: totalPagadoEntrega,
          tipoReparacion: b.estado === 'entregado' ? 'Reparado' : 'No Reparado',
          senado: Number(b.senado || 0),
          boleta: b
        })
      }
    })

    historial.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

    res.render('historialReparaciones', { historial, pagina: 'Historial de Movimientos' })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error al cargar el historial de reparaciones')
  }
}
