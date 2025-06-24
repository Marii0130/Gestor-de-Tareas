import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { DetalleVenta } from './detalleVentaModel';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @OneToMany(() => DetalleVenta, detalle => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];
}