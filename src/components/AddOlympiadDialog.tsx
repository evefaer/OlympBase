import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SUBJECTS, GRADES, SCALES, Subject, Grade, Scale, Olympiad } from "@/data/olympiads";
import { useCustomOlympiads } from "@/hooks/useCustomOlympiads";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не менее 3 символов").max(200, "Название слишком длинное"),
  subject: z.string().min(1, "Выберите предмет"),
  grades: z.array(z.string()).min(1, "Выберите хотя бы один класс"),
  scale: z.string().optional(),
  date: z.date({ required_error: "Выберите дату" }),
  notes: z.string().max(1000, "Заметки слишком длинные").optional(),
  website: z.string().url("Введите корректный URL").optional().or(z.literal("")),
  organizer: z.string().max(200, "Название организатора слишком длинное").optional(),
  format: z.enum(["Онлайн", "Очный", "Смешанный"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddOlympiadDialogProps {
  trigger?: React.ReactNode;
}

export function AddOlympiadDialog({ trigger }: AddOlympiadDialogProps) {
  const [open, setOpen] = useState(false);
  const { addOlympiad } = useCustomOlympiads();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      grades: [],
      scale: "",
      notes: "",
      website: "",
      organizer: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const dateStr = format(values.date, "yyyy-MM-dd");
    const olympiad: Omit<Olympiad, "id"> = {
      title: values.title,
      subject: values.subject as Subject,
      grades: values.grades as Grade[],
      scale: (values.scale as Scale) || "Всероссийская",
      startDate: dateStr,
      endDate: dateStr,
      description: values.notes || "",
      registrationDeadline: dateStr,
      website: values.website || undefined,
      organizer: values.organizer || undefined,
      format: values.format || undefined,
    };

    addOlympiad(olympiad);
    toast.success("Олимпиада добавлена!");
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить олимпиаду
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить свою олимпиаду</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название *</FormLabel>
                  <FormControl>
                    <Input placeholder="Название олимпиады" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Предмет *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите предмет" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Масштаб</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите масштаб" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SCALES.map((scale) => (
                          <SelectItem key={scale} value={scale}>
                            {scale}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="grades"
              render={() => (
                <FormItem>
                  <FormLabel>Классы *</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map((grade) => (
                      <FormField
                        key={grade}
                        control={form.control}
                        name="grades"
                        render={({ field }) => (
                          <label
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-colors",
                              field.value?.includes(grade)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary border-border hover:border-primary"
                            )}
                          >
                            <Checkbox
                              checked={field.value?.includes(grade)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), grade]
                                  : field.value?.filter((v) => v !== grade) || [];
                                field.onChange(newValue);
                              }}
                              className="hidden"
                            />
                            <span className="text-sm">{grade}</span>
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy", { locale: ru })
                          ) : (
                            <span>Выберите</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заметки</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сайт</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Организатор</FormLabel>
                    <FormControl>
                      <Input placeholder="Название организации" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Формат</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите формат" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Онлайн">Онлайн</SelectItem>
                      <SelectItem value="Очный">Очный</SelectItem>
                      <SelectItem value="Смешанный">Смешанный</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
