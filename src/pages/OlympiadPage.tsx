import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  Star, 
  ExternalLink, 
  Clock,
  CheckCircle,
  Award,
  Building
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { olympiadsData, SUBJECT_COLORS } from "@/data/olympiads";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { cn } from "@/lib/utils";

const OlympiadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSelected, toggleSelected } = useSelectedOlympiads();
  
  const olympiad = olympiadsData.find((o) => o.id === id);

  if (!olympiad) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Олимпиада не найдена
          </h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </main>
      </div>
    );
  }

  const startDate = parseISO(olympiad.startDate);
  const endDate = parseISO(olympiad.endDate);
  const regDeadline = parseISO(olympiad.registrationDeadline);
  const isSameDay = olympiad.startDate === olympiad.endDate;
  const isRegClosed = isPast(regDeadline);
  const selected = isSelected(olympiad.id);

  const dateDisplay = isSameDay
    ? format(startDate, "d MMMM yyyy", { locale: ru })
    : `${format(startDate, "d MMMM", { locale: ru })} — ${format(endDate, "d MMMM yyyy", { locale: ru })}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-olimpiad">
              <div className="flex items-center gap-3 mb-4">
                <span className={cn("w-3 h-3 rounded-full", SUBJECT_COLORS[olympiad.subject])} />
                <Badge variant="secondary">{olympiad.subject}</Badge>
                <Badge variant="outline">{olympiad.scale}</Badge>
                {olympiad.format && (
                  <Badge variant="outline">{olympiad.format}</Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {olympiad.title}
              </h1>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {olympiad.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => toggleSelected(olympiad.id)}
                  variant={selected ? "default" : "outline"}
                  className="gap-2"
                >
                  <Star className={cn("w-4 h-4", selected && "fill-current")} />
                  {selected ? "В избранном" : "Добавить в избранное"}
                </Button>

                {olympiad.website && (
                  <a href={olympiad.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Сайт олимпиады
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Requirements */}
            {olympiad.requirements && olympiad.requirements.length > 0 && (
              <div className="card-olimpiad">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Требования к участникам
                </h2>
                <ul className="space-y-3">
                  {olympiad.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prizes */}
            {olympiad.prizes && olympiad.prizes.length > 0 && (
              <div className="card-olimpiad">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-warning" />
                  Призы и награды
                </h2>
                <ul className="space-y-3">
                  {olympiad.prizes.map((prize, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                      {prize}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card-olimpiad">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Информация
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="icon-box-outline w-10 h-10">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Даты проведения</p>
                    <p className="font-medium text-foreground">{dateDisplay}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={cn(
                    "icon-box-outline w-10 h-10",
                    isRegClosed && "bg-destructive/10 text-destructive"
                  )}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Регистрация до</p>
                    <p className={cn(
                      "font-medium",
                      isRegClosed ? "text-destructive" : "text-foreground"
                    )}>
                      {format(regDeadline, "d MMMM yyyy", { locale: ru })}
                      {isRegClosed && " (закрыта)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="icon-box-outline w-10 h-10">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Классы</p>
                    <p className="font-medium text-foreground">
                      {olympiad.grades.join(", ")} класс
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="icon-box-outline w-10 h-10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Масштаб</p>
                    <p className="font-medium text-foreground">{olympiad.scale}</p>
                  </div>
                </div>

                {olympiad.organizer && (
                  <div className="flex items-start gap-3">
                    <div className="icon-box-outline w-10 h-10">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Организатор</p>
                      <p className="font-medium text-foreground">{olympiad.organizer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OlympiadPage;
