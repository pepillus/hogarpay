import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import EmpleadosPage from "@/pages/EmpleadosPage";
import NuevoEmpleadoPage from "@/pages/NuevoEmpleadoPage";
import TarifasPage from "@/pages/TarifasPage";
import TarifaFormPage from "@/pages/TarifaFormPage";
import PagosPage from "@/pages/PagosPage";
import HistorialPage from "@/pages/HistorialPage";
import ReportesPage from "@/pages/ReportesPage";
import BackupPage from "@/pages/BackupPage";
import ArcaPage from "@/pages/ArcaPage";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/empleados/nuevo" element={<NuevoEmpleadoPage />} />
            <Route path="/empleados/:id/editar" element={<NuevoEmpleadoPage />} />
            <Route path="/tarifas" element={<TarifasPage />} />
            <Route path="/tarifas/nuevo" element={<TarifaFormPage />} />
            <Route path="/tarifas/:id/editar" element={<TarifaFormPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/arca" element={<ArcaPage />} />
            <Route path="/backup" element={<BackupPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
