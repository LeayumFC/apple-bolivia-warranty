import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { checkWarranty, getWarrantyExpiration, getDaysRemaining, isWarrantyActive, Warranty } from '@/lib/warranties';

const Garantia = () => {
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<Warranty | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    const w = checkWarranty(serial.trim());
    setResult(w);
    setNotFound(!w);
    setSearched(true);
  };

  const renderResult = () => {
    if (!searched) return null;
    if (notFound) {
      return (
        <Card className="glass-card mt-8">
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No encontramos garantía registrada para este número de serie.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (!result) return null;

    const exp = getWarrantyExpiration(result);
    const days = getDaysRemaining(result);
    const active = isWarrantyActive(result);
    const totalDays = result.warranty_months ? result.warranty_months * 30 : 1;
    const progress = Math.min(100, ((totalDays - days) / totalDays) * 100);

    return (
      <Card className="glass-card mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{result.model}</CardTitle>
            <Badge variant={active ? 'default' : 'destructive'} className={active ? 'bg-success text-success-foreground' : ''}>
              {active ? '✅ Vigente' : '❌ Vencida'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Producto</p>
              <p className="font-medium">{result.product_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Condición</p>
              <p className="font-medium">{result.condition}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Venta</p>
              <p className="font-medium">{result.sale_date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inicio de Garantía</p>
              <p className="font-medium">{result.sale_date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiración</p>
              <p className="font-medium">{exp?.toLocaleDateString('es-BO') || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Días Restantes</p>
              <p className="font-medium">{days}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso de Garantía</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <span className="font-semibold">Verificar Garantía</span>
        </div>
      </nav>

      <main className="flex-1 container mx-auto max-w-lg px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Consulta tu Garantía</h1>
          <p className="text-muted-foreground">Ingresa el número de serie de tu producto Apple</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Número de Serie"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </form>

        {renderResult()}
      </main>
    </div>
  );
};

export default Garantia;
