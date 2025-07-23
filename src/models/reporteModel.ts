import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50 })
  tipo: 'ingresos' | 'reparaciones' | 'ganancias'

  @Column({ type: 'text', nullable: true })
  parametros: string // JSON string con parámetros usados, por ejemplo: {"fechaInicio":"2025-06-01","fechaFin":"2025-06-24"}

  @Column({ type: 'text', nullable: true })
  resumen: string // JSON string con datos resumidos del reporte (totales, cantidades, etc)

  @CreateDateColumn()
  fechaCreacion: Date
}
