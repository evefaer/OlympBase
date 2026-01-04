export type Subject = 
  | "Математика" 
  | "Физика" 
  | "Информатика" 
  | "Химия" 
  | "Биология" 
  | "Русский язык" 
  | "История" 
  | "Обществознание"
  | "Литература"
  | "География";

export type Grade = "5" | "6" | "7" | "8" | "9" | "10" | "11";

export type Scale = "Школьная" | "Муниципальная" | "Региональная" | "Всероссийская" | "Международная";

export interface Olympiad {
  id: string;
  title: string;
  subject: Subject;
  grades: Grade[];
  scale: Scale;
  startDate: string;
  endDate: string;
  description: string;
  registrationDeadline: string;
  website?: string;
}

export const SUBJECTS: Subject[] = [
  "Математика",
  "Физика",
  "Информатика",
  "Химия",
  "Биология",
  "Русский язык",
  "История",
  "Обществознание",
  "Литература",
  "География",
];

export const GRADES: Grade[] = ["5", "6", "7", "8", "9", "10", "11"];

export const SCALES: Scale[] = [
  "Школьная",
  "Муниципальная",
  "Региональная",
  "Всероссийская",
  "Международная",
];

export const SUBJECT_COLORS: Record<Subject, string> = {
  "Математика": "bg-blue-500",
  "Физика": "bg-orange-500",
  "Информатика": "bg-green-500",
  "Химия": "bg-purple-500",
  "Биология": "bg-emerald-500",
  "Русский язык": "bg-red-500",
  "История": "bg-amber-600",
  "Обществознание": "bg-cyan-500",
  "Литература": "bg-pink-500",
  "География": "bg-teal-500",
};

export const olympiadsData: Olympiad[] = [
  {
    id: "1",
    title: "Всероссийская олимпиада школьников по математике",
    subject: "Математика",
    grades: ["9", "10", "11"],
    scale: "Всероссийская",
    startDate: "2026-01-15",
    endDate: "2026-01-15",
    description: "Школьный этап Всероссийской олимпиады по математике",
    registrationDeadline: "2026-01-10",
  },
  {
    id: "2",
    title: "Олимпиада «Физтех» по физике",
    subject: "Физика",
    grades: ["10", "11"],
    scale: "Всероссийская",
    startDate: "2026-01-20",
    endDate: "2026-01-20",
    description: "Отборочный этап олимпиады МФТИ",
    registrationDeadline: "2026-01-15",
  },
  {
    id: "3",
    title: "Московская олимпиада школьников по информатике",
    subject: "Информатика",
    grades: ["7", "8", "9", "10", "11"],
    scale: "Региональная",
    startDate: "2026-01-25",
    endDate: "2026-01-26",
    description: "Региональный этап олимпиады по программированию",
    registrationDeadline: "2026-01-20",
  },
  {
    id: "4",
    title: "Турнир Ломоносова по химии",
    subject: "Химия",
    grades: ["8", "9", "10", "11"],
    scale: "Всероссийская",
    startDate: "2026-02-01",
    endDate: "2026-02-01",
    description: "Многопредметная олимпиада МГУ",
    registrationDeadline: "2026-01-25",
  },
  {
    id: "5",
    title: "Региональная олимпиада по биологии",
    subject: "Биология",
    grades: ["9", "10", "11"],
    scale: "Региональная",
    startDate: "2026-02-05",
    endDate: "2026-02-05",
    description: "Региональный этап ВсОШ по биологии",
    registrationDeadline: "2026-01-30",
  },
  {
    id: "6",
    title: "Олимпиада по русскому языку «Высшая проба»",
    subject: "Русский язык",
    grades: ["7", "8", "9", "10", "11"],
    scale: "Всероссийская",
    startDate: "2026-02-10",
    endDate: "2026-02-10",
    description: "Олимпиада НИУ ВШЭ по русскому языку",
    registrationDeadline: "2026-02-05",
  },
  {
    id: "7",
    title: "Муниципальная олимпиада по истории",
    subject: "История",
    grades: ["6", "7", "8", "9"],
    scale: "Муниципальная",
    startDate: "2026-02-12",
    endDate: "2026-02-12",
    description: "Муниципальный этап олимпиады по истории",
    registrationDeadline: "2026-02-08",
  },
  {
    id: "8",
    title: "Школьная олимпиада по обществознанию",
    subject: "Обществознание",
    grades: ["5", "6", "7", "8"],
    scale: "Школьная",
    startDate: "2026-02-15",
    endDate: "2026-02-15",
    description: "Школьный этап олимпиады по обществознанию",
    registrationDeadline: "2026-02-12",
  },
  {
    id: "9",
    title: "Всероссийская олимпиада по литературе",
    subject: "Литература",
    grades: ["9", "10", "11"],
    scale: "Всероссийская",
    startDate: "2026-02-18",
    endDate: "2026-02-19",
    description: "Региональный этап ВсОШ по литературе",
    registrationDeadline: "2026-02-14",
  },
  {
    id: "10",
    title: "Олимпиада по географии «Покори Воробьёвы горы»",
    subject: "География",
    grades: ["8", "9", "10", "11"],
    scale: "Всероссийская",
    startDate: "2026-02-22",
    endDate: "2026-02-22",
    description: "Заочный отборочный тур олимпиады МГУ",
    registrationDeadline: "2026-02-18",
  },
  {
    id: "11",
    title: "Международная математическая олимпиада",
    subject: "Математика",
    grades: ["10", "11"],
    scale: "Международная",
    startDate: "2026-03-01",
    endDate: "2026-03-03",
    description: "Отборочный этап на международную олимпиаду",
    registrationDeadline: "2026-02-20",
  },
  {
    id: "12",
    title: "Региональная олимпиада по физике",
    subject: "Физика",
    grades: ["7", "8", "9"],
    scale: "Региональная",
    startDate: "2026-03-05",
    endDate: "2026-03-05",
    description: "Региональный этап для младших классов",
    registrationDeadline: "2026-02-28",
  },
  {
    id: "13",
    title: "Олимпиада по информатике им. Кирилла и Мефодия",
    subject: "Информатика",
    grades: ["5", "6", "7"],
    scale: "Муниципальная",
    startDate: "2026-01-08",
    endDate: "2026-01-08",
    description: "Олимпиада для начинающих программистов",
    registrationDeadline: "2026-01-05",
  },
  {
    id: "14",
    title: "Школьный этап ВсОШ по химии",
    subject: "Химия",
    grades: ["8", "9", "10", "11"],
    scale: "Школьная",
    startDate: "2026-01-10",
    endDate: "2026-01-10",
    description: "Школьный этап Всероссийской олимпиады",
    registrationDeadline: "2026-01-07",
  },
  {
    id: "15",
    title: "Городская олимпиада по биологии",
    subject: "Биология",
    grades: ["6", "7", "8"],
    scale: "Муниципальная",
    startDate: "2026-01-18",
    endDate: "2026-01-18",
    description: "Муниципальный этап для средних классов",
    registrationDeadline: "2026-01-14",
  },
];
