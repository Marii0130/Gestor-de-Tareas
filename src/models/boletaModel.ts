import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { Cliente } from "./clienteModel";

@Entity('boletas')
export class Boleta {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Cliente, cliente => cliente.boleta, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ length: 100 })
  articulo: string;

  @Column({ length: 100 })
  marca: string;

  @Column({ length: 100 })
  modelo: string;

  @Column('text')
  falla: string;

  @Column({
    type: 'enum',
    enum: [
      'recibido',
      'en_diagnostico',
      'presupuesto_enviado',
      'aprobado',
      'reparando',
      'esperando_repuestos',
      'reparado',
      'entregado',
      'cancelado',
      'no_reparado',
      'entregado_no_reparado'
    ],
    default: 'recibido'
  })
  estado: string;

  @Column('text')
  condiciones_iniciales: string;

  @Column('text')
  observaciones: string;

  @Column({ type: 'date' })
  fecha_ingreso: Date;

  @Column({ type: 'date', nullable: true })
  fecha_reparacion: Date | null;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  senado: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costo: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'datetime', nullable: true })
  fechaEntrega: Date

  @Column({ type: 'datetime', nullable: true })
  fechaSenado: Date
}