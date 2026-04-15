import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { rows } = await pool.query(
      'SELECT * FROM warranties ORDER BY created_at DESC'
    );
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const d = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO warranties (
          product_type, model, serial_number, imei, color, storage, condition,
          battery_health, true_tone, face_id, touch_id, original_display,
          no_screen_scratches, no_body_dents, buttons_functional,
          cameras_functional, charging_port_functional,
          purchase_date, notes, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'Unsold')
        RETURNING *`,
        [
          d.product_type, d.model, d.serial_number, d.imei || null,
          d.color, d.storage, d.condition, d.battery_health || null,
          d.true_tone, d.face_id, d.touch_id, d.original_display,
          d.no_screen_scratches, d.no_body_dents, d.buttons_functional,
          d.cameras_functional, d.charging_port_functional,
          d.purchase_date || null, d.notes || null,
        ]
      );
      return res.status(201).json(rows[0]);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}