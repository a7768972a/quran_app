// ثوابت مشتركة: أيام الدرس والدرجات

export const LESSON_DAYS = [
  { value: "saturday", label: "السبت" },
  { value: "tuesday", label: "الثلاثاء" },
] as const;

export const GRADES = [
  { value: "مقبول", label: "مقبول", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "جيد", label: "جيد", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { value: "جيد جدا", label: "جيد جدا", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "ممتاز", label: "ممتاز", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
] as const;

export const GRADE_VALUES: Record<string, number> = {
  "مقبول": 1,
  "جيد": 2,
  "جيد جدا": 3,
  "ممتاز": 4,
};

export function getLessonDayLabel(value: string): string {
  return LESSON_DAYS.find((d) => d.value === value)?.label ?? value;
}

export function getGradeColor(grade: string): string {
  return GRADES.find((g) => g.value === grade)?.color ?? "bg-muted text-muted-foreground border-border";
}
