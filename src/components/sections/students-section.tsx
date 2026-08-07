"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, UserPlus, Pencil, Trash2, BookOpen,
  Calendar, ClipboardList, ChevronLeft, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LESSON_DAYS, GRADES, getGradeColor, getLessonDayLabel } from "@/lib/constants";
import { formatDateAr } from "@/lib/date";
import type { Student, StudentWithRecords, LessonDay, Grade } from "@/types";
import { toast } from "sonner";

export function StudentsSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [profile, setProfile] = useState<StudentWithRecords | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Student[];
      setStudents(data);
    } catch {
      toast.error("تعذر جلب الطلاب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* شريط الأدوات */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            الطلاب
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة بيانات الطلاب — الإضافة والتعديل والحذف وعرض السجل
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <UserPlus className="size-4" />
          إضافة طالب
        </Button>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن طالب بالاسم..."
          className="pr-10"
        />
      </div>

      {/* قائمة الطلاب */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          query={query}
          hasStudents={students.length > 0}
          onAdd={() => setAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              onView={async () => {
                try {
                  const res = await fetch(`/api/students/${s.id}`, { cache: "no-store" });
                  if (!res.ok) throw new Error();
                  setProfile((await res.json()) as StudentWithRecords);
                } catch {
                  toast.error("تعذر جلب بيانات الطالب");
                }
              }}
              onEdit={() => setEditing(s)}
              onDelete={() => setDeleting(s)}
            />
          ))}
        </div>
      )}

      {/* نموذج الإضافة */}
      <StudentFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => {
          setAddOpen(false);
          load();
        }}
      />

      {/* نموذج التعديل */}
      <StudentFormDialog
        student={editing}
        open={!!editing}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      {/* تأكيد الحذف */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطالب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف «{deleting?.name}»؟ سيتم حذف جميع سجلات حفظه أيضاً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                try {
                  const res = await fetch(`/api/students/${deleting.id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error();
                  toast.success("تم حذف الطالب بنجاح");
                  load();
                } catch {
                  toast.error("تعذر حذف الطالب");
                }
              }}
            >
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* بروفايل الطالب */}
      <StudentProfileDialog
        student={profile}
        onOpenChange={(o) => { if (!o) setProfile(null); }}
      />
    </div>
  );
}

function StudentCard({
  student, onView, onEdit, onDelete,
}: {
  student: Student;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <button onClick={onView} className="flex items-start gap-3 w-full text-right">
          <div className="grid place-items-center size-12 rounded-2xl bg-primary/10 text-primary font-extrabold text-lg shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate group-hover:text-primary transition-colors">{student.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-normal">
                <Calendar className="size-3 ml-1" />
                {student.age} سنة
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                <BookOpen className="size-3 ml-1" />
                {getLessonDayLabel(student.lessonDay)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <ClipboardList className="size-3" />
              {student._count?.records ?? 0} سجل حفظ
            </p>
          </div>
        </button>
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
          <Button variant="ghost" size="sm" onClick={onView} className="flex-1 h-8 text-xs">
            عرض السجل
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={onEdit} title="تعديل">
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="size-8 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={onDelete} title="حذف">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentFormDialog({
  student, open, onOpenChange, onSaved,
}: {
  student?: Student | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [lessonDay, setLessonDay] = useState<LessonDay>("saturday");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(student?.name ?? "");
      setAge(student?.age ? String(student.age) : "");
      setLessonDay(student?.lessonDay ?? "saturday");
    }
  }, [open, student]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("الاسم مطلوب"); return; }
    if (!age || isNaN(Number(age))) { toast.error("العمر مطلوب رقماً"); return; }
    setSaving(true);
    try {
      const url = student ? `/api/students/${student.id}` : "/api/students";
      const method = student ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), age: Number(age), lessonDay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      toast.success(student ? "تم تعديل بيانات الطالب" : "تمت إضافة الطالب بنجاح");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle>
          <DialogDescription>
            {student ? "عدّل بيانات الطالب ثم احفظ" : "أدخل بيانات الطالب الجديد"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">الاسم</Label>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسم الطالب" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-age">العمر</Label>
            <Input id="s-age" type="number" min={3} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="العمر بالسنوات" className="nums" />
          </div>
          <div className="space-y-2">
            <Label>يوم الدرس</Label>
            <RadioGroup
              value={lessonDay}
              onValueChange={(v) => setLessonDay(v as LessonDay)}
              className="grid grid-cols-2 gap-2"
            >
              {LESSON_DAYS.map((d) => (
                <label
                  key={d.value}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                    lessonDay === d.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={d.value} id={`ld-${d.value}`} />
                  <span className="text-sm font-medium">{d.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StudentProfileDialog({
  student, onOpenChange,
}: {
  student: StudentWithRecords | null;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={!!student} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid place-items-center size-10 rounded-2xl bg-primary/10 text-primary font-extrabold">
              {student?.name.charAt(0)}
            </span>
            {student?.name}
          </DialogTitle>
          <DialogDescription>بروفايل الطالب وسجل حفظه</DialogDescription>
        </DialogHeader>

        {student && (
          <div className="space-y-4 overflow-y-auto -mx-1 px-1">
            {/* بطاقة المعلومات */}
            <div className="grid grid-cols-3 gap-2">
              <InfoCell label="العمر" value={`${student.age} سنة`} />
              <InfoCell label="يوم الدرس" value={getLessonDayLabel(student.lessonDay)} />
              <InfoCell label="عدد السجلات" value={String(student.records.length)} />
            </div>

            {/* سجل الحفظ */}
            <div>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" />
                سجل الحفظ
              </h4>
              {student.records.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8 rounded-xl border border-dashed border-border">
                  لا توجد سجلات حفظ بعد
                </div>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto pl-1">
                  {student.records.map((r) => (
                    <li key={r.id} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDateAr(r.date)}
                        </span>
                        <Badge variant="outline" className={`text-[10px] border ${getGradeColor(r.grade)}`}>
                          {r.grade}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground text-xs">الحفظ: </span>
                          <span className="font-medium">{r.memorization}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground text-xs">الوظيفة: </span>
                          <span className="font-medium">{r.homework}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

function EmptyState({ query, hasStudents, onAdd }: { query: string; hasStudents: boolean; onAdd: () => void }) {
  return (
    <Card className="border-dashed border-border">
      <CardContent className="py-14 px-6 text-center">
        <div className="grid place-items-center size-14 rounded-2xl bg-muted mx-auto mb-4">
          <Users className="size-7 text-muted-foreground" />
        </div>
        <h3 className="font-bold mb-1">
          {hasStudents ? "لا توجد نتائج مطابقة" : "لا يوجد طلاب بعد"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasStudents
            ? `لم نجد طالباً باسم «${query}»`
            : "ابدأ بإضافة أول طالب للحلقة"}
        </p>
        {!hasStudents && (
          <Button onClick={onAdd}>
            <UserPlus className="size-4" />
            إضافة طالب
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
