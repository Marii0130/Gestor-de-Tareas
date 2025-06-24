import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Cliente } from '../models/clienteModel';
import { Boleta } from '../models/boletaModel';
import { Producto } from '../models/productoModel';
import { Venta } from '../models/ventaModel';
import { DetalleVenta } from '../models/detalleVentaModel';

dotenv.config();

const port: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

async function createDatabaseIfNotExists() {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.end();
    console.log('Base de datos creada o ya existía');
  } catch (error) {
    console.error('Error creando base de datos:', error);
    throw error; // para que se propague y se detenga si falla
  }
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Cliente, Boleta, Producto, Venta, DetalleVenta],
  synchronize: true,
  logging: false, // Puedes activar en true para debug
});

export async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await AppDataSource.initialize();
}