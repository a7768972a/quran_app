"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LESSON_DAYS } from "@/lib/constants";
import type { Student, LessonDay } from "@/types";
import { toast } from "sonner";

interface Props {
  student?: Student | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: (s: Student) => void;
}

/**
 * نموذج إضافة/تعديل طالب — مكوّن مشترك بين قسمي «الطلاب» و«تسجيل الحفظ».
 * عند الحفظ يستدعي onSaved بالطالب الجديد/المعدّل.
 */
export function StudentFormDialog({ student, open, onOpenChange, onSaved }: Props) {
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
      onSaved?.(data as Student);
      onOpenChange(false);
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
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسم الطالب"
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-age">العمر</Label>
            <Input
              id="s-age"
              type="number"
              min={3}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="العمر بالسنوات"
              className="nums"
            />
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
