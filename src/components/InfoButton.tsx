import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InfoButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/info")}
      className="fixed bottom-6 left-6 z-[9999] p-4 bg-orange-600 text-white rounded-full shadow-xl hover:bg-orange-700 hover:scale-105 transition-all active:scale-95 border-2 border-white/20"
      aria-label="Portal Information"
    >
      <Info className="h-6 w-6" />
    </button>
  );
}