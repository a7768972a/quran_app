// أنواع البيانات المشتركة

export type LessonDay = "saturday" | "tuesday";

export interface Student {
  id: string;
  name: string;
  age: number;
  lessonDay: LessonDay;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
}

export interface StudentWithRecords extends Student {
  records: RecordItem[];
}

export type Grade = "مقبول" | "جيد" | "جيد جدا" | "ممتاز";

export interface RecordItem {
  id: string;
  studentId: string;
  memorization: string;
  grade: Grade;
  homework: string;
  date: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    lessonDay: LessonDay;
    age?: number;
  };
}

export interface Stats {
  totalStudents: number;
  totalRecords: number;
  todayRecords: number;
  gradeDistribution: { grade: string; count: number }[];
  saturdayStudents: number;
  tuesdayStudents: number;
  recentRecords: (RecordItem & { student?: { id: string; name: string; lessonDay: LessonDay } })[];
  weeklyCounts: { label: string; count: number }[];
}
