import { Link } from "react-router-dom";
import { Calendar, List, Star, Rocket } from "lucide-react";
import { Header } from "@/components/Header";
import { UpcomingReminder } from "@/components/UpcomingReminder";

const features = [
  {
    icon: Calendar,
    title: "Календарь",
    description: "Отслеживайте важные даты в удобном календаре",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: List,
    title: "Список",
    description: "Отслеживайте олимпиады в удобном списке",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Star,
    title: "Персонализация",
    description: "Добавляйте свои олимпиады и активности в календарь",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UpcomingReminder />
      
      <main className="container py-8 sm:py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16 animate-fade-in">
          <div className="icon-box mx-auto mb-6 sm:mb-8 w-12 h-12 sm:w-14 sm:h-14">
            <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Добро пожаловать в OlimpBase
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Удобный агрегатор олимпиад для школьников. Находите интересующие вас 
            олимпиады, добавляйте их в календарь и не пропускайте важные даты.
          </p>
          
          <Link to="/calendar" className="btn-primary-gradient inline-block text-sm sm:text-base px-6 py-2.5 sm:px-8 sm:py-3">
            Перейти к олимпиадам
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-olimpiad text-center p-4 sm:p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`icon-box-outline mx-auto mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 ${feature.bgColor} ${feature.color}`}>
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
