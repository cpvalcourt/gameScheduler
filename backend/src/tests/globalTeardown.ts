import { pool } from '../config/database';

export default async () => {
  await pool.end();
}; 