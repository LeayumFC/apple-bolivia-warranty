import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { serial } = req.query;
  if (!serial) return res.status(400).json({ error: 'Serial requerido' });

  const { rows } = await pool.query(
    `SELECT * FROM warranties 
     WHERE serial_number=$1 AND status='Sold' LIMIT 1`,
    [serial]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  return res.status(200).json(rows[0]);
}