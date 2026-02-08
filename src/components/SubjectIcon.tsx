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
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  const containerSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18,
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
