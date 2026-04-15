import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warranties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_type VARCHAR(50),
        model VARCHAR(100),
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        imei VARCHAR(20),
        color VARCHAR(50),
        storage VARCHAR(20),
        condition VARCHAR(20) CHECK (condition IN ('New', 'Refurbished', 'Used')),
        battery_health INTEGER,
        true_tone BOOLEAN DEFAULT false,
        face_id BOOLEAN DEFAULT false,
        touch_id BOOLEAN DEFAULT false,
        original_display BOOLEAN DEFAULT false,
        no_screen_scratches BOOLEAN DEFAULT false,
        no_body_dents BOOLEAN DEFAULT false,
        buttons_functional BOOLEAN DEFAULT false,
        cameras_functional BOOLEAN DEFAULT false,
        charging_port_functional BOOLEAN DEFAULT false,
        purchase_date DATE,
        sale_date DATE,
        customer_name VARCHAR(150),
        customer_email VARCHAR(150),
        warranty_months INTEGER CHECK (warranty_months IN (3, 6, 12)),
        warranty_code VARCHAR(100),
        notes TEXT,
        status VARCHAR(10) DEFAULT 'Unsold' CHECK (status IN ('Unsold', 'Sold')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}