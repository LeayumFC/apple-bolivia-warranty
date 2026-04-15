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
  purchase_date: string;
  sale_date?: string;
  customer_name?: string;
  customer_email?: string;
  warranty_months?: number;
  warranty_code?: string;
  notes?: string;
  status: 'Unsold' | 'Sold';
  created_at: string;
}

const STORAGE_KEY = 'apple_bolivia_warranties';

export function getWarranties(): Warranty[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWarranties(warranties: Warranty[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(warranties));
}

export function createWarranty(data: Omit<Warranty, 'id' | 'created_at' | 'warranty_code' | 'status'>): Warranty {
  const warranties = getWarranties();
  if (warranties.find(w => w.serial_number === data.serial_number)) {
    throw new Error('Ya existe un producto con este número de serie');
  }
  const warranty: Warranty = {
    ...data,
    id: crypto.randomUUID(),
    status: 'Unsold',
    created_at: new Date().toISOString(),
  };
  warranties.push(warranty);
  saveWarranties(warranties);
  return warranty;
}

export function updateWarranty(id: string, updates: Partial<Warranty>): Warranty {
  const warranties = getWarranties();
  const idx = warranties.findIndex(w => w.id === id);
  if (idx === -1) throw new Error('Garantía no encontrada');

  if (updates.status === 'Sold' && updates.sale_date) {
    const dateStr = updates.sale_date.replace(/-/g, '');
    updates.warranty_code = `APB-${warranties[idx].serial_number}-${dateStr}`;
  }

  warranties[idx] = { ...warranties[idx], ...updates };
  saveWarranties(warranties);
  return warranties[idx];
}

export function deleteWarranty(id: string): void {
  const warranties = getWarranties().filter(w => w.id !== id);
  saveWarranties(warranties);
}

export function checkWarranty(serial: string): Warranty | null {
  return getWarranties().find(w => w.serial_number === serial && w.status === 'Sold') || null;
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
