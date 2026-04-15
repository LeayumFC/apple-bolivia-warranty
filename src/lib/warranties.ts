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