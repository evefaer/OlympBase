import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { olympiadParser, ParsedOlympiad } from "@/lib/api/olympiadParser";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const LAST_PARSE_KEY = "olympiad-last-parse";
const PARSED_DATA_KEY = "olympiad-parsed-data";

interface ParserState {
  lastParsedAt: string | null;
  count: number;
}

function getStoredState(): ParserState {
  const stored = localStorage.getItem(LAST_PARSE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { lastParsedAt: null, count: 0 };
    }
  }
  return { lastParsedAt: null, count: 0 };
}

function setStoredState(state: ParserState) {
  localStorage.setItem(LAST_PARSE_KEY, JSON.stringify(state));
}

export function getParsedOlympiads(): ParsedOlympiad[] {
  const stored = localStorage.getItem(PARSED_DATA_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function setParsedOlympiads(olympiads: ParsedOlympiad[]) {
  localStorage.setItem(PARSED_DATA_KEY, JSON.stringify(olympiads));
}

export function ParserControl() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ParserState>(getStoredState);

  const handleParse = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Запуск парсера",
        description: "Получаем данные с olimpiada.ru...",
      });

      const result = await olympiadParser.parse();

      if (result.success && result.data) {
        const newState: ParserState = {
          lastParsedAt: result.data.parsedAt,
          count: result.data.count,
        };
        setState(newState);
        setStoredState(newState);
        setParsedOlympiads(result.data.olympiads);

        toast({
          title: "Парсинг завершён",
          description: `Найдено ${result.data.count} олимпиад`,
        });
      } else {
        toast({
          title: "Ошибка парсинга",
          description: result.error || "Не удалось получить данные",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось запустить парсер",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Парсер олимпиад
        </CardTitle>
        <CardDescription>
          Автоматическое получение актуальных олимпиад с olimpiada.ru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            onClick={handleParse}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Загрузка..." : "Обновить данные"}
          </Button>

          <div className="flex flex-col gap-1 text-sm">
            {state.lastParsedAt ? (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-4 h-4" />
                  <span>Найдено олимпиад: {state.count}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    Последнее обновление:{" "}
                    {format(new Date(state.lastParsedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Данные ещё не загружены</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
