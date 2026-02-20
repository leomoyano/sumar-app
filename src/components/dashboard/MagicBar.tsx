import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseExpenseWithAI } from "@/services/ai";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface MagicBarProps {
  onExpenseParsed: (expense: {
    name: string;
    amount: number;
    tags: string[];
  }) => void;
  isLoading?: boolean;
}

const MagicBar = ({
  onExpenseParsed,
  isLoading: parentLoading,
}: MagicBarProps) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { language } = useLanguage();

  const handleProcess = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const result = await parseExpenseWithAI(input);
      if (!result) {
        toast.error(
          language === "es"
            ? "Lo siento, estamos teniendo problemas. Intentá de nuevo en un momento."
            : "Sorry, we're having problems right now. Please try again in a moment.",
        );
        return;
      }

      if (result.amount > 0) {
        onExpenseParsed(result);
        setInput("");
        toast.success(
          language === "es"
            ? "¡Gasto identificado magistralmente!"
            : "Expense masterfully identified!",
        );
      } else {
        toast.error(
          language === "es"
            ? "No pudimos identificar el monto. ¿Podrías ser más específico?"
            : "We couldn't identify the amount. Could you be more specific?",
        );
      }
    } catch (error) {
      toast.error(
        language === "es"
          ? "Lo siento, estamos teniendo problemas. Intentá de nuevo en un momento."
          : "Sorry, we're having problems right now. Please try again in a moment.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center gap-2 p-1 bg-card border rounded-2xl shadow-sm">
        <div className="flex items-center justify-center pl-3">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <Input
          placeholder={
            language === "es"
              ? "Cargamos algo con IA? Ej: 'Gasté 45k en una cena con amigos'..."
              : "Let's load something with AI? Ex: 'Spent 45k on dinner with friends'..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleProcess()}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6 bg-transparent placeholder:text-muted-foreground/60"
          disabled={isProcessing || parentLoading}
        />
        <Button
          onClick={handleProcess}
          disabled={isProcessing || parentLoading || !input.trim()}
          size="icon"
          className="h-10 w-10 rounded-xl mr-1 shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MagicBar;
