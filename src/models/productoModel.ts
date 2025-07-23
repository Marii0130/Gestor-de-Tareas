import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MovimientoInventario } from './movimientoInventarioModel';

export enum CategoriaProducto {
  ELECTRONICA = 'electronica',
  INSUMOS = 'insumos',
  MATERIALES_ELECTRICOS = 'materiales_electricos'
}

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    type: 'enum',
    enum: CategoriaProducto,
  })
  categoria: CategoriaProducto;

  @Column()
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_compra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_venta: number;

  @Column()
  stock_minimo: number;

  @OneToMany(() => MovimientoInventario, movimiento => movimiento.producto)
  movimientos: MovimientoInventario[];
}