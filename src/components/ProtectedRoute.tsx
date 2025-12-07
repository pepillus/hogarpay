import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isAuthRequired } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Si no se requiere auth (local o VITE_SKIP_AUTH=true), permitir acceso
  if (!isAuthRequired()) {
    return <>{children}</>;
  }

  // Mostrar loader mientras verifica auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
