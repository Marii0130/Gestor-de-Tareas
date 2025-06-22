import app from './app';
import { initializeDatabase } from './db/conexion'; // archivo que tenés que crear
import * as dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.PORT || '4102', 10);
const host = process.env.HOST || '0.0.0.0';

async function main() {
  try {
    await initializeDatabase();
    console.log('Base de datos conectada');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log('Error al conectar con la base de datos:', err.message);
    }
  }

  try {
    app.listen(port, host, () => {
      console.log(`Servidor activo en http://${host}:${port}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error al iniciar el servidor:', err.message);
    }
  }
}
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD === '' ? '(vacío)' : process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

main();
