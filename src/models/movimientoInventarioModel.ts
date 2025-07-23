import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Producto } from './productoModel';

export enum TipoMovimiento {
  ENTRADA = 'entrada',
  SALIDA = 'salida'
}

@Entity()
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, producto => producto.id, { onDelete: 'CASCADE' })
  producto: Producto;

  @Column({
    type: 'enum',
    enum: TipoMovimiento
  })
  tipo: TipoMovimiento;

  @Column()
  cantidad: number;

  @Column({ nullable: true })
  motivo: string; // opcional, p. ej. "pérdida por rotura"

  @CreateDateColumn()
  fecha: Date;
}
