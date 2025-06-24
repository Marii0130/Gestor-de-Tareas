import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Venta } from './ventaModel';
import { Producto } from './productoModel';

@Entity()
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, venta => venta.detalles, { onDelete: 'CASCADE' })
  venta: Venta;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_unitario: number;
}
