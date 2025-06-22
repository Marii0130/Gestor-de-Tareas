import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Cliente } from '../models/clienteModel';
import { Boleta } from '../models/boletaModel';

dotenv.config();

const port: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Crea la base de datos si no existe
async function createDatabaseIfNotExists() {
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.end();
}

// Fuente de datos para TypeORM
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Cliente, Boleta],
  synchronize: true,
  logging: true,
});

// Inicializa la base de datos
export async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await AppDataSource.initialize();
}