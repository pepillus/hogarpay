import { Link } from "react-router-dom";
import { 
  UserRound, 
  Calculator, 
  Calendar, 
  History, 
  Download,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const menuItems = [
  {
    title: "Empleados",
    description: "Gestiona la información de tus empleados domésticos",
    icon: UserRound,
    href: "/empleados",
    buttonText: "Ver Empleados"
  },
  {
    title: "Tarifas",
    description: "Configura tarifas de pago para cada empleado",
    icon: Calculator,
    href: "/tarifas",
    buttonText: "Ver Tarifas"
  },
  {
    title: "Registrar Pago",
    description: "Registra pagos por trabajo o aportes mensuales",
    icon: Calendar,
    href: "/pagos",
    buttonText: "Ver Pagos"
  },
  {
    title: "Historial",
    description: "Consulta el historial completo de pagos realizados",
    icon: History,
    href: "/historial",
    buttonText: "Ver Historial"
  },
  {
    title: "Respaldo",
    description: "Exporta e importa datos para mantener respaldos seguros",
    icon: Download,
    href: "/backup",
    buttonText: "Ver Respaldo"
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hogar-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido a HogarPay Manager</h1>
          <p className="text-xl text-hogar-100">
            Sistema de gestión de pagos para empleados domésticos
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {menuItems.map((item) => (
            <Card key={item.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <item.icon className="h-12 w-12 mx-auto text-hogar-600 mb-2" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full">
                  <Link to={item.href}>{item.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-hogar-600" />
              Instrucciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Registra a tus empleados en la sección <strong>Empleados</strong></li>
              <li>Configura las tarifas de pago en la sección <strong>Tarifas</strong></li>
              <li>Registra los pagos semanales o aportes mensuales en <strong>Registrar Pago</strong></li>
              <li>Consulta el historial y genera reportes cuando lo necesites</li>
              <li>No olvides hacer respaldos periódicos de tus datos</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
