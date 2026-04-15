import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const d = req.body;
    let warrantyCode = d.warranty_code;

    if (d.status === 'Sold' && d.sale_date && !warrantyCode) {
      const dateStr = d.sale_date.replace(/-/g, '');
      warrantyCode = `APB-${d.serial_number}-${dateStr}`;
    }

    try {
      const { rows } = await pool.query(
        `UPDATE warranties SET
          product_type=$1, model=$2, color=$3, storage=$4, condition=$5,
          battery_health=$6, true_tone=$7, face_id=$8, touch_id=$9,
          original_display=$10, no_screen_scratches=$11, no_body_dents=$12,
          buttons_functional=$13, cameras_functional=$14,
          charging_port_functional=$15, purchase_date=$16,
          sale_date=$17, customer_name=$18, customer_email=$19,
          warranty_months=$20, notes=$21, status=$22, warranty_code=$23
        WHERE id=$24 RETURNING *`,
        [
          d.product_type, d.model, d.color, d.storage, d.condition,
          d.battery_health || null, d.true_tone, d.face_id, d.touch_id,
          d.original_display, d.no_screen_scratches, d.no_body_dents,
          d.buttons_functional, d.cameras_functional, d.charging_port_functional,
          d.purchase_date || null, d.sale_date || null,
          d.customer_name || null, d.customer_email || null,
          d.warranty_months || null, d.notes || null,
          d.status || 'Unsold', warrantyCode || null, id,
        ]
      );
      return res.status(200).json(rows[0]);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM warranties WHERE id=$1', [id]);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
