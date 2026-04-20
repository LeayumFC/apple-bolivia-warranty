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

const STORAGE_KEY = 'apple_bolivia_warranties';

function readAll(): Warranty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: Warranty[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getWarranties(): Promise<Warranty[]> {
  return readAll().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createWarranty(data: Partial<Warranty>): Promise<Warranty> {
  const items = readAll();
  if (items.some(w => w.serial_number === data.serial_number)) {
    throw new Error('Ya existe una garantía con ese número de serie');
  }
  const newItem: Warranty = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: 'Unsold',
    true_tone: false, face_id: false, touch_id: false, original_display: false,
    no_screen_scratches: false, no_body_dents: false, buttons_functional: false,
    cameras_functional: false, charging_port_functional: false,
    product_type: '', model: '', serial_number: '', color: '', storage: '',
    condition: 'New',
    ...data,
  } as Warranty;
  items.push(newItem);
  writeAll(items);
  return newItem;
}

export async function updateWarranty(id: string, data: Partial<Warranty>): Promise<Warranty | null> {
  const items = readAll();
  const idx = items.findIndex(w => w.id === id);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...data };
  if (updated.status === 'Sold' && updated.sale_date && !updated.warranty_code) {
    const dateStr = updated.sale_date.replace(/-/g, '');
    updated.warranty_code = `APB-${updated.serial_number}-${dateStr}`;
  }
  items[idx] = updated;
  writeAll(items);
  return updated;
}

export async function deleteWarranty(id: string): Promise<void> {
  writeAll(readAll().filter(w => w.id !== id));
}

export async function checkWarranty(serial: string): Promise<Warranty | null> {
  const items = readAll();
  return items.find(w => w.serial_number === serial && w.status === 'Sold') || null;
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
