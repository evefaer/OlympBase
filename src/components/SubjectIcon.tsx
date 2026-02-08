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
  Languages,
  Palette,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { Subject, SUBJECT_COLORS } from "@/data/olympiads";
import { cn } from "@/lib/utils";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
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
  "Английский язык": Languages,
  "Искусство": Palette,
};

const DEFAULT_ICON = HelpCircle;
const DEFAULT_COLOR = "bg-gray-500";

interface SubjectIconProps {
  subject: Subject | string;
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
  const Icon = SUBJECT_ICONS[subject] || DEFAULT_ICON;
  const bgColor = SUBJECT_COLORS[subject as Subject] || DEFAULT_COLOR;
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };
  
  const containerSizes = {
    sm: "w-11 h-11",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 24,
    md: 36,
    lg: 52,
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
        bgColor,
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
  subject: Subject | string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <SubjectIcon subject={subject} size={size} />
      <span className="text-xs text-muted-foreground">{subject}</span>
    </div>
  );
}
