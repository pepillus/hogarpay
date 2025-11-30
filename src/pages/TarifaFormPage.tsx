import { TarifaForm } from "@/components/tarifas/TarifaForm";
import { useParams } from "react-router-dom";

export default function TarifaFormPage() {
  const { id } = useParams();
  
  return <TarifaForm empleadoId={id} />;
}
