import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, FileText, Edit } from 'lucide-react';
import { Warranty, getWarranties, createWarranty, updateWarranty, deleteWarranty } from '@/lib/warranties';
import { generateWarrantyPdf } from '@/lib/generatePdf';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'appleBolivia2024';
const PRODUCT_TYPES = ['iPhone', 'iPad', 'MacBook', 'AirPods', 'Apple Watch', 'Accessory'];
const CONDITIONS: Warranty['condition'][] = ['New', 'Refurbished', 'Used'];

const emptyForm = {
  product_type: '', model: '', serial_number: '', imei: '', color: '', storage: '',
  condition: 'New' as Warranty['condition'], battery_health: 100,
  true_tone: false, face_id: false, touch_id: false, original_display: false,
  no_screen_scratches: false, no_body_dents: false, buttons_functional: false,
  cameras_functional: false, charging_port_functional: false,
  purchase_date: '', sale_date: '', customer_name: '', customer_email: '',
  warranty_months: undefined as number | undefined, notes: '',
};

const AdminWarranties = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadWarranties = async () => {
    setLoading(true);
    try {
      const data = await getWarranties();
      setWarranties(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error al cargar garantías', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) loadWarranties();
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      toast({ title: 'Contraseña incorrecta', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateWarranty(editingId, form);
        toast({ title: 'Garantía actualizada' });
      } else {
        await createWarranty(form as any);
        toast({ title: 'Garantía registrada' });
      }
      await loadWarranties();
      setForm(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (w: Warranty) => {
    setForm({
      product_type: w.product_type, model: w.model, serial_number: w.serial_number,
      imei: w.imei || '', color: w.color, storage: w.storage, condition: w.condition,
      battery_health: w.battery_health || 100, true_tone: w.true_tone, face_id: w.face_id,
      touch_id: w.touch_id, original_display: w.original_display,
      no_screen_scratches: w.no_screen_scratches, no_body_dents: w.no_body_dents,
      buttons_functional: w.buttons_functional, cameras_functional: w.cameras_functional,
      charging_port_functional: w.charging_port_functional,
      purchase_date: w.purchase_date || '', sale_date: w.sale_date || '',
      customer_name: w.customer_name || '', customer_email: w.customer_email || '',
      warranty_months: w.warranty_months, notes: w.notes || '',
    });
    setEditingId(w.id);
    setDialogOpen(true);
  };

  const handleMarkSold = (w: Warranty) => {
    setForm({
      ...emptyForm, product_type: w.product_type, model: w.model,
      serial_number: w.serial_number, imei: w.imei || '', color: w.color,
      storage: w.storage, condition: w.condition, battery_health: w.battery_health || 100,
      true_tone: w.true_tone, face_id: w.face_id, touch_id: w.touch_id,
      original_display: w.original_display, no_screen_scratches: w.no_screen_scratches,
      no_body_dents: w.no_body_dents, buttons_functional: w.buttons_functional,
      cameras_functional: w.cameras_functional, charging_port_functional: w.charging_port_functional,
      purchase_date: w.purchase_date || '',
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: '', customer_email: '', warranty_months: 3, notes: w.notes || '',
    });
    setEditingId(w.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteWarranty(id);
    await loadWarranties();
    toast({ title: 'Garantía eliminada' });
  };

  const handleMarkSoldSubmit = async () => {
    if (!editingId) return;
    await updateWarranty(editingId, { ...form, status: 'Sold' });
    await loadWarranties();
    toast({ title: 'Marcado como vendido' });
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const showChecklist = form.condition === 'Refurbished' || form.condition === 'Used';

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="glass-card w-full max-w-sm">
          <CardHeader><CardTitle className="text-center">Admin — Apple Bolivia</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
              <Button type="submit" className="w-full">Ingresar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="font-semibold">Gestión de Garantías</span>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nuevo Producto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Producto' : 'Registrar Producto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Producto</Label>
                    <Select value={form.product_type} onValueChange={v => setForm(f => ({ ...f, product_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="iPhone 14 Pro Max" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Serie</Label>
                    <Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>IMEI (opcional)</Label>
                    <Input value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Almacenamiento</Label>
                    <Input value={form.storage} onChange={e => setForm(f => ({ ...f, storage: e.target.value }))} placeholder="256GB" />
                  </div>
                  <div className="space-y-2">
                    <Label>Condición</Label>
                    <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v as Warranty['condition'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Compra</Label>
                    <Input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
                  </div>
                </div>

                {showChecklist && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Estado del Dispositivo</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Salud de Batería (%)</Label>
                        <Input type="number" min={0} max={100} value={form.battery_health} onChange={e => setForm(f => ({ ...f, battery_health: Number(e.target.value) }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['true_tone', 'True Tone funcional'], ['face_id', 'Face ID funcional'],
                          ['touch_id', 'Touch ID funcional'], ['original_display', 'Pantalla original'],
                          ['no_screen_scratches', 'Sin rayones en pantalla'], ['no_body_dents', 'Sin abolladuras'],
                          ['buttons_functional', 'Botones funcionales'], ['cameras_functional', 'Cámaras funcionales'],
                          ['charging_port_functional', 'Puerto de carga funcional'],
                        ] as const).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between gap-2">
                            <Label className="text-sm font-normal">{label}</Label>
                            <Switch checked={form[key] as boolean} onCheckedChange={v => setForm(f => ({ ...f, [key]: v }))} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {editingId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Venta</Label>
                      <Input type="date" value={form.sale_date} onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Duración Garantía</Label>
                      <Select value={form.warranty_months?.toString()} onValueChange={v => setForm(f => ({ ...f, warranty_months: Number(v) }))}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meses</SelectItem>
                          <SelectItem value="6">6 meses</SelectItem>
                          <SelectItem value="12">12 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre del Cliente</Label>
                      <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email del Cliente</Label>
                      <Input type="email" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Guardar Cambios' : 'Registrar Producto'}
                  </Button>
                  {editingId && form.sale_date && form.customer_name && form.warranty_months && (
                    <Button type="button" variant="secondary" onClick={handleMarkSoldSubmit}>
                      Marcar como Vendido
                    </Button>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Cargando...</div>
        ) : warranties.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No hay productos registrados aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead><TableHead>Serie</TableHead>
                  <TableHead>Condición</TableHead><TableHead>Estado</TableHead>
                  <TableHead>Cliente</TableHead><TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.model}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{w.serial_number}</TableCell>
                    <TableCell><Badge variant="secondary">{w.condition}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={w.status === 'Sold' ? 'default' : 'outline'}>
                        {w.status === 'Sold' ? 'Vendido' : 'Sin vender'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{w.customer_name || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(w)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {w.status === 'Unsold' && (
                          <Button variant="ghost" size="icon" onClick={() => handleMarkSold(w)} title="Vender">
                            <Badge className="text-xs">$</Badge>
                          </Button>
                        )}
                        {w.status === 'Sold' && (
                          <Button variant="ghost" size="icon" onClick={() => generateWarrantyPdf(w)} title="PDF">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} title="Eliminar">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminWarranties;
