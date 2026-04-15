import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Search } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
             Apple Bolivia
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/garantia">Verificar Garantía</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/warranties">Admin</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight gradient-text leading-tight">
            Apple Bolivia
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Importación de productos Apple nuevos y reacondicionados. Calidad garantizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/garantia">
                <Search className="h-4 w-4" />
                Verificar Garantía
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link to="/admin/warranties">
                <Shield className="h-4 w-4" />
                Panel de Administración
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        Apple Bolivia — Importación de productos Apple nuevos y reacondicionados
      </footer>
    </div>
  );
};

export default Index;
