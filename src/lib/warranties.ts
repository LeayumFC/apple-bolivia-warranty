export async function getWarranties() {
  const res = await fetch('/api/warranties');
  return res.json();
}

export async function createWarranty(data: any) {
  const res = await fetch('/api/warranties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateWarranty(id: string, data: any) {
  const res = await fetch(`/api/warranties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteWarranty(id: string) {
  await fetch(`/api/warranties/${id}`, { method: 'DELETE' });
}

export async function checkWarranty(serial: string) {
  const res = await fetch(`/api/warranty/check?serial=${serial}`);
  if (res.status === 404) return null;
  return res.json();
}
export interface Warranty {
  id: string;
  product_type: string;
  model: string;
  serial_number: string;
  imei?: string;
  color: string;
  storage: string;
  condition: 'New' | 'Refurbished' | 'Used';
  battery_health?: number;
  true_tone: boolean;
  face_id: boolean;
  touch_id: boolean;
  original_display: boolean;
  no_screen_scratches: boolean;
  no_body_dents: boolean;
  buttons_functional: boolean;
  cameras_functional: boolean;
  charging_port_functional: boolean;
  purchase_date?: string;
  sale_date?: string;
  customer_name?: string;
  customer_email?: string;
  warranty_months?: number;
  warranty_code?: string;
  notes?: string;
  status: 'Unsold' | 'Sold';
  created_at: string;
}

export function getWarrantyExpiration(warranty: Warranty): Date | null {
  if (!warranty.sale_date || !warranty.warranty_months) return null;
  const d = new Date(warranty.sale_date);
  d.setMonth(d.getMonth() + warranty.warranty_months);
  return d;
}

export function getDaysRemaining(warranty: Warranty): number {
  const exp = getWarrantyExpiration(warranty);
  if (!exp) return 0;
  const diff = exp.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isWarrantyActive(warranty: Warranty): boolean {
  return getDaysRemaining(warranty) > 0;
}
