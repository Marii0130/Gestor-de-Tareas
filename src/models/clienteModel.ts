import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Boleta } from "./boletaModel";

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150 })
  domicilio: string;

  @Column({ length: 30 })
  telefono: string;

  @OneToMany(() => Boleta, (boleta) => boleta.cliente)
  boletas: Boleta[];
}