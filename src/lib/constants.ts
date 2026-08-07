// ثوابت مشتركة: أيام الدرس والدرجات

export const LESSON_DAYS = [
  { value: "saturday", label: "السبت" },
  { value: "tuesday", label: "الثلاثاء" },
] as const;

export const GRADES = [
  // الدرجات بألوان اللوحة الجديدة (Forest + Golden Wheat)
  { value: "مقبول", label: "مقبول", color: "bg-stone-200/70 text-stone-700 border-stone-300" },
  { value: "جيد", label: "جيد", color: "bg-[#b9a779]/25 text-[#6b5d3a] border-[#b9a779]/40" },
  { value: "جيد جدا", label: "جيد جدا", color: "bg-[#428177]/20 text-[#2d5a52] border-[#428177]/40" },
  { value: "ممتاز", label: "ممتاز", color: "bg-[#054239]/15 text-[#054239] border-[#054239]/30" },
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
