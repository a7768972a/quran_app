"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BookOpenCheck, ChevronRight, ChevronLeft, CalendarDays,
  ClipboardList, Inbox, Users, Award, TrendingUp, CalendarOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GRADES, getGradeColor, getLessonDayLabel } from "@/lib/constants";
import { getWeekStart, addDays, formatDateAr, formatDateShortAr, toDateInputValue } from "@/lib/date";
import type { RecordItem, Grade } from "@/types";
import { toast } from "sonner";

export function InfoSection() {
  const [weekAnchor, setWeekAnchor] = useState<Date>(getWeekStart(new Date()));
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => getWeekStart(weekAnchor), [weekAnchor]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/records?weekStart=${toDateInputValue(weekStart)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as RecordItem[];
      setRecords(data);
    } catch {
      toast.error("تعذر جلب السجلات");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  // تجميع السجلات حسب اليوم
  // نظهر جميع أيام الأسبوع بالترتيب الزمني: السبت → الثلاثاء → السبت → الثلاثاء...
  // الأيام التي ليست سبت/ثلاثاء نظهرها كذلك إذا اختارها المستخدم (لا يوجد درس في هذا التاريخ)
  const grouped = useMemo(() => {
    const map = new Map<string, RecordItem[]>();
    for (let i = 0; i <= 6; i++) {
      const d = addDays(weekStart, i);
      map.set(toDateInputValue(d), []);
    }
    for (const r of records) {
      const key = toDateInputValue(r.date);
      if (map.has(key)) map.get(key)!.push(r);
    }
    // رتّب داخل كل يوم من الأحدث للأقدم
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return Array.from(map.entries())
      .map(([day, recs]) => {
        const d = new Date(day);
        const dayOfWeek = d.getDay(); // 0=أحد, 6=سبت, 2=ثلاثاء
        const isLessonDay = dayOfWeek === 6 || dayOfWeek === 2;
        return { day, recs, date: d, dayOfWeek, isLessonDay };
      })
      // نظهر: أيام الدرس دائماً + أي يوم به سجلات (لو سُجّل في غير يوم درس)
      .filter((g) => g.isLessonDay || g.recs.length > 0);
  }, [records, weekStart]);

  // إحصائيات الأسبوع
  const weekStats = useMemo(() => {
    const total = records.length;
    const students = new Set(records.map((r) => r.studentId)).size;
    const gradeCounts: Record<string, number> = {};
    for (const r of records) {
      gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1;
    }
    const topGrade = GRADES
      .map((g) => ({ grade: g.value as Grade, count: gradeCounts[g.value] ?? 0 }))
      .sort((a, b) => b.count - a.count)[0];
    return { total, students, topGrade: topGrade && topGrade.count > 0 ? topGrade.grade : null };
  }, [records]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <BookOpenCheck className="size-5 text-primary" />
          سجل التسميع
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          استعرض سجلات الحفظ أسبوعياً — تظهر أيام السبت والثلاثاء بالتناوب، والأيام الأخرى تُظهر «لا يوجد درس في هذا التاريخ»
        </p>
      </div>

      {/* شريط اختيار الأسبوع */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setWeekAnchor(addDays(weekStart, -7))} title="الأسبوع السابق">
              <ChevronRight className="size-4" />
            </Button>

            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <span className="text-sm font-bold">
                  {formatDateShortAr(weekStart)} — {formatDateShortAr(weekEnd)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateAr(weekStart)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={toDateInputValue(weekAnchor)}
                onChange={(e) => {
                  if (e.target.value) setWeekAnchor(getWeekStart(new Date(e.target.value)));
                }}
                className="w-auto nums text-xs h-9"
                title="اختر تاريخاً للانتقال لأسبوعه"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeekAnchor(getWeekStart(new Date()))}
                className="text-xs"
              >
                هذا الأسبوع
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWeekAnchor(addDays(weekStart, 7))} title="الأسبوع التالي">
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الأسبوع */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <MiniStat icon={<ClipboardList className="size-4" />} label="إجمالي السجلات" value={weekStats.total} />
          <MiniStat icon={<Users className="size-4" />} label="عدد الطلاب" value={weekStats.students} />
          <MiniStat
            icon={<Award className="size-4" />}
            label="أكثر درجة"
            value={weekStats.topGrade ?? "—"}
            isText
          />
        </div>
      )}

      {/* السجلات حسب اليوم */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : grouped.every((g) => g.recs.length === 0) ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-14 px-6 text-center">
            <div className="grid place-items-center size-14 rounded-2xl bg-muted mx-auto mb-4">
              <Inbox className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-bold mb-1">لا توجد سجلات في هذا الأسبوع</h3>
            <p className="text-sm text-muted-foreground">
              جرّب الانتقال إلى أسبوع آخر أو سجّل حفظاً جديداً
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ day, recs, date, isLessonDay }) => (
            <Card key={day} className={`border-border/60 shadow-sm overflow-hidden ${!isLessonDay ? "opacity-75" : ""}`}>
              <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    {formatDateAr(date)}
                    {!isLessonDay && (
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-muted-foreground/30">
                        <CalendarOff className="size-3 ml-1" />
                        يوم غير درس
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="secondary" className="text-[11px]">
                    {recs.length} سجل
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recs.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {isLessonDay ? "لا توجد سجلات في هذا اليوم" : "لا يوجد درس في هذا التاريخ"}
                  </div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {recs.map((r) => (
                      <li key={r.id} className="flex items-start gap-3 p-3">
                        <div className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary font-bold shrink-0">
                          {r.student?.name?.charAt(0) ?? "؟"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{r.student?.name ?? "طالب محذوف"}</span>
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {r.student?.lessonDay ? getLessonDayLabel(r.student.lessonDay) : ""}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] border ${getGradeColor(r.grade)}`}>
                              {r.grade}
                            </Badge>
                          </div>
                          <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            <div className="text-xs">
                              <span className="text-muted-foreground">الحفظ: </span>
                              <span className="font-medium">{r.memorization}</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-muted-foreground">الوظيفة: </span>
                              <span className="font-medium">{r.homework}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon, label, value, isText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-3 flex items-center gap-2.5">
        <div className="grid place-items-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate">{label}</p>
          <p className={`font-extrabold leading-tight ${isText ? "text-sm" : "text-xl nums"}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
