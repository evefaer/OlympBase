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
  Building,
  Trash2,
  User
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOlympiad } from "@/hooks/useOlympiads";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { useCustomOlympiads } from "@/hooks/useCustomOlympiads";
import { cn } from "@/lib/utils";
import { SubjectIcon } from "@/components/SubjectIcon";
import { toast } from "sonner";

const OlympiadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSelected, toggleSelected } = useSelectedOlympiads();
  const { data: olympiad, isLoading } = useOlympiad(id || "");
  const { isCustomOlympiad, deleteOlympiad } = useCustomOlympiads();
  
  const isCustom = id ? isCustomOlympiad(id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 text-center">
          <p className="text-lg text-muted-foreground">Загрузка...</p>
        </main>
      </div>
    );
  }

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
      
      <main className="container py-4 sm:py-8 px-4 sm:px-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="card-olimpiad">
              <div className="flex flex-wrap items-center gap-3 mb-3 sm:mb-4">
                <SubjectIcon subject={olympiad.subject} size="md" />
                {isCustom && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <User className="w-3 h-3" />
                    Моя олимпиада
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{olympiad.scale}</Badge>
                {olympiad.format && (
                  <Badge variant="outline" className="text-xs">{olympiad.format}</Badge>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                {olympiad.title}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                {olympiad.description}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Button
                  onClick={() => toggleSelected(olympiad.id)}
                  variant={selected ? "default" : "outline"}
                  className="gap-2 w-full sm:w-auto"
                  size="default"
                >
                  <Star className={cn("w-4 h-4", selected && "fill-current")} />
                  {selected ? "В избранном" : "В избранное"}
                </Button>

                {olympiad.website && (
                  <a href={olympiad.website} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button variant="outline" className="gap-2 w-full">
                      <ExternalLink className="w-4 h-4" />
                      Сайт олимпиады
                    </Button>
                  </a>
                )}

                {isCustom && (
                  <Button
                    variant="destructive"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      deleteOlympiad(olympiad.id);
                      toast.success("Олимпиада удалена");
                      navigate(-1);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </Button>
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
          <div className="space-y-4 sm:space-y-6">
            <div className="card-olimpiad">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
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
