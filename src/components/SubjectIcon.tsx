import {
  Calculator,
  Atom,
  Code,
  FlaskConical,
  Leaf,
  BookOpen,
  Landmark,
  Users,
  Feather,
  Globe,
  LucideIcon,
} from "lucide-react";
import { Subject, SUBJECT_COLORS } from "@/data/olympiads";
import { cn } from "@/lib/utils";

const SUBJECT_ICONS: Record<Subject, LucideIcon> = {
  "Математика": Calculator,
  "Физика": Atom,
  "Информатика": Code,
  "Химия": FlaskConical,
  "Биология": Leaf,
  "Русский язык": BookOpen,
  "История": Landmark,
  "Обществознание": Users,
  "Литература": Feather,
  "География": Globe,
};

interface SubjectIconProps {
  subject: Subject;
  size?: "sm" | "md" | "lg";
  showBackground?: boolean;
  className?: string;
}

export function SubjectIcon({
  subject,
  size = "sm",
  showBackground = true,
  className,
}: SubjectIconProps) {
  const Icon = SUBJECT_ICONS[subject];
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };
  
  const containerSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
  };

  if (!showBackground) {
    return (
      <Icon
        className={cn(sizeClasses[size], "text-current", className)}
        size={iconSizes[size]}
      />
    );
  }

  return (
    <div
      className={cn(
        containerSizes[size],
        SUBJECT_COLORS[subject],
        "rounded flex items-center justify-center flex-shrink-0",
        className
      )}
    >
      <Icon className="text-white" size={iconSizes[size]} />
    </div>
  );
}

export function SubjectIconWithLabel({
  subject,
  size = "sm",
}: {
  subject: Subject;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <SubjectIcon subject={subject} size={size} />
      <span className="text-xs text-muted-foreground">{subject}</span>
    </div>
  );
}
