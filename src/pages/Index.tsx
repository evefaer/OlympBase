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
      
      <main className="container py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="icon-box mx-auto mb-8">
            <Rocket className="w-7 h-7 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Добро пожаловать в OlimpBase
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Удобный агрегатор олимпиад для школьников. Находите интересующие вас 
            олимпиады, добавляйте их в календарь и не пропускайте важные даты. Все 
            ваши олимпиады в одном месте — от математики до русского языка.
          </p>
          
          <Link to="/calendar" className="btn-primary-gradient inline-block">
            Перейти к олимпиадам
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-olimpiad text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`icon-box-outline mx-auto mb-4 ${feature.bgColor} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
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
