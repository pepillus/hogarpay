import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
  UserRound, 
  Calculator, 
  Calendar, 
  History, 
  FileChartLine, 
  Download,
  Home,
  Landmark,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md",
      isActive
        ? "bg-hogar-600 text-white"
        : "text-gray-200 hover:bg-hogar-600 hover:text-white"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  const navItems = [
    { to: "/", icon: <Home className="h-4 w-4" />, label: "Inicio" },
    { to: "/empleados", icon: <UserRound className="h-4 w-4" />, label: "Empleados" },
    { to: "/tarifas", icon: <Calculator className="h-4 w-4" />, label: "Tarifas" },
    { to: "/pagos", icon: <Calendar className="h-4 w-4" />, label: "Registrar Pago" },
    { to: "/historial", icon: <History className="h-4 w-4" />, label: "Historial" },
    { to: "/reportes", icon: <FileChartLine className="h-4 w-4" />, label: "Reportes" },
    { to: "/arca", icon: <Landmark className="h-4 w-4" />, label: "ARCA" },
    { to: "/backup", icon: <Download className="h-4 w-4" />, label: "Respaldo" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-hogar-700 text-white shadow-lg no-print">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4">
            <Link to="/" className="text-2xl font-bold mb-4 sm:mb-0">
              HogarPay Manager
            </Link>
            <div className="flex flex-wrap items-center gap-1">
              <nav className="flex flex-wrap items-center gap-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={location.pathname === item.to}
                  />
                ))}
              </nav>
              {isSupabaseEnabled() && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-gray-200 hover:bg-hogar-600 hover:text-white"
                  title={user.email || "Cerrar sesión"}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1 hidden md:inline">Salir</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="bg-white p-6 rounded-lg shadow">
          <Outlet />
        </Card>
      </main>
    </div>
  );
}
