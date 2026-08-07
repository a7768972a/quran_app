"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ClipboardList, Search, CheckCircle2, Calendar, User,
  BookOpen, Award, NotebookPen, Send, X, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GRADES, getGradeColor, getLessonDayLabel } from "@/lib/constants";
import { toDateInputValue, formatDateAr } from "@/lib/date";
import type { Student, Grade } from "@/types";
import { toast } from "sonner";

export function RecordingSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [memorization, setMemorization] = useState("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [homework, setHomework] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<{ name: string; grade: Grade } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setStudents((await res.json()) as Student[]);
    } catch {
      toast.error("تعذر جلب الطلاب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, 8);
    return students.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 12);
  }, [students, query]);

  const resetForm = () => {
    setMemorization("");
    setGrade("");
    setHomework("");
    setDate(toDateInputValue(new Date()));
  };

  const handleSubmit = async () => {
    if (!selected) { toast.error("اختر الطالب أولاً"); return; }
    if (!memorization.trim()) { toast.error("اكتب الحفظ"); return; }
    if (!grade) { toast.error("اختر الدرجة"); return; }
    if (!homework.trim()) { toast.error("اكتب الوظيفة"); return; }
    if (!date) { toast.error("اختر التاريخ"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected.id,
          memorization: memorization.trim(),
          grade,
          homework: homework.trim(),
          date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التسجيل");
      toast.success("تم تسجيل الحفظ بنجاح");
      setLastSaved({ name: selected.name, grade });
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر التسجيل");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          تسجيل الحفظ
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          ابحث عن الطالب ثم أدخل الحفظ والدرجة والوظيفة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* عمود اختيار الطالب */}
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                اختيار الطالب
              </CardTitle>
              <CardDescription className="text-xs">ابحث بالاسم ثم اضغط لاختيار الطالب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* الطالب المختار */}
              {selected && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="grid place-items-center size-11 rounded-2xl bg-primary text-primary-foreground font-extrabold shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{selected.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-normal">{selected.age} سنة</Badge>
                      <Badge variant="outline" className="text-[10px] font-normal">{getLessonDayLabel(selected.lessonDay)}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setSelected(null)} title="إلغاء الاختيار">
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              {!selected && (
                <>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ابحث بالاسم..."
                      className="pr-10"
                      autoFocus
                    />
                  </div>

                  <div className="rounded-xl border border-border/50 max-h-72 overflow-y-auto">
                    {loading ? (
                      <div className="p-2 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        {students.length === 0 ? "لا يوجد طلاب بعد" : "لا توجد نتائج"}
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/40">
                        {filtered.map((s) => (
                          <li key={s.id}>
                            <button
                              onClick={() => setSelected(s)}
                              className="flex items-center gap-3 w-full text-right p-2.5 hover:bg-muted/50 transition-colors"
                            >
                              <div className="grid place-items-center size-9 rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
                                {s.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{s.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {s.age} سنة • {getLessonDayLabel(s.lessonDay)}
                                </p>
                              </div>
                              {s._count && s._count.records > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {s._count.records} سجل
                                </Badge>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* آخر تسجيل ناجح */}
          {lastSaved && (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-800">تم تسجيل حفظ {lastSaved.name}</p>
                  <p className="text-xs text-emerald-700">الدرجة: {lastSaved.grade}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLastSaved(null)} className="text-emerald-700">
                  <X className="size-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* عمود النموذج */}
        <Card className={`border-border/60 shadow-sm transition-opacity ${!selected ? "opacity-60 pointer-events-none" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <NotebookPen className="size-4 text-primary" />
              بيانات التسميع
            </CardTitle>
            <CardDescription className="text-xs">املأ الحقول التالية ثم سجّل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* الحفظ */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary" />
                الحفظ
              </Label>
              <Textarea
                value={memorization}
                onChange={(e) => setMemorization(e.target.value)}
                placeholder="ماذا حفظ الطالب؟ (مثال: سورة الفاتحة، من الآية 1 إلى 5)"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* الدرجة */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Award className="size-3.5 text-primary" />
                الدرجة
              </Label>
              <RadioGroup
                value={grade}
                onValueChange={(v) => setGrade(v as Grade)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                {GRADES.map((g) => (
                  <label
                    key={g.value}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 cursor-pointer transition-all text-center ${
                      grade === g.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={g.value} id={`gr-${g.value}`} className="sr-only" />
                    <span className={`text-xs font-bold ${grade === g.value ? "text-primary" : ""}`}>
                      {g.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* الوظيفة */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <NotebookPen className="size-3.5 text-primary" />
                الوظيفة
              </Label>
              <Textarea
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="ما الواجب على الطالب؟ (مثال: مراجعة سورة الناس)"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* التاريخ */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                تاريخ التسميع
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="nums"
                />
                {date && (
                  <Badge variant="secondary" className="shrink-0 text-xs whitespace-nowrap">
                    {formatDateAr(date)}
                  </Badge>
                )}
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={saving} className="w-full h-11">
              {saving ? (
                <>
                  <Clock className="size-4 animate-spin" />
                  جارٍ التسجيل...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  تسجيل الحفظ
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
