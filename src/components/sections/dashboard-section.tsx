"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, ClipboardList, CalendarCheck, Award,
  ArrowLeft, BookOpenCheck, ClipboardPlus, UserPlus,
  TrendingUp, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getGradeColor, getLessonDayLabel } from "@/lib/constants";
import { formatDateShortAr, formatTimeAr } from "@/lib/date";
import type { Stats } from "@/types";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#988561", "#b9a779", "#428177", "#054239"];

type TabKey = "dashboard" | "students" | "recording" | "info";

interface Props {
  onNavigate: (t: TabKey) => void;
}

export function DashboardSection({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as Stats;
      setStats(data);
    } catch {
      toast.error("تعذر تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const gradePieData = (["مقبول", "جيد", "جيد جدا", "ممتاز"] as const)
    .map((g) => ({
      name: g,
      value: stats.gradeDistribution.find((x) => x.grade === g)?.count ?? 0,
    }))
    .filter((x) => x.value > 0);

  return (
    <div className="space-y-6">
      {/* العنوان الترحيبي */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        <span>نظرة عامة سريعة على أداء الحلقة</span>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="size-5" />}
          label="إجمالي الطلاب"
          value={stats.totalStudents}
          tint="forest"
        />
        <StatCard
          icon={<ClipboardList className="size-5" />}
          label="إجمالي السجلات"
          value={stats.totalRecords}
          tint="sage"
        />
        <StatCard
          icon={<CalendarCheck className="size-5" />}
          label="سجلات اليوم"
          value={stats.todayRecords}
          tint="wheat"
        />
        <StatCard
          icon={<Award className="size-5" />}
          label="درجات ممتازة"
          value={stats.gradeDistribution.find((g) => g.grade === "ممتاز")?.count ?? 0}
          tint="olive"
        />
      </div>

      {/* أزرار الوصول السريع */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            الوصول السريع
          </CardTitle>
          <CardDescription className="text-xs">انتقل مباشرة إلى الإجراء المطلوب</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickButton
            onClick={() => onNavigate("recording")}
            icon={<ClipboardPlus className="size-5" />}
            title="تسجيل حفظ جديد"
            desc="ابحث عن طالب وسجّل حفظه"
          />
          <QuickButton
            onClick={() => onNavigate("students")}
            icon={<UserPlus className="size-5" />}
            title="إضافة طالب"
            desc="أضف طالباً جديداً للحلقة"
          />
          <QuickButton
            onClick={() => onNavigate("info")}
            icon={<BookOpenCheck className="size-5" />}
            title="سجل التسميع"
            desc="استعرض السجلات أسبوعياً"
          />
        </CardContent>
      </Card>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">السجلات خلال الأسابيع الأخيرة</CardTitle>
            <CardDescription className="text-xs">آخر 8 أسابيع</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.weeklyCounts.every((w) => w.count === 0) ? (
              <EmptyMini text="لا توجد سجلات بعد" />
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyCounts} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.5 0.02 145)" }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.02 145)" }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 145)", fontSize: 13, fontFamily: "inherit" }}
                      cursor={{ fill: "oklch(0.95 0.03 150)" }}
                    />
                    <Bar dataKey="count" name="عدد السجلات" fill="#054239" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزيع الدرجات</CardTitle>
            <CardDescription className="text-xs">إجمالي السجلات حسب الدرجة</CardDescription>
          </CardHeader>
          <CardContent>
            {gradePieData.length === 0 ? (
              <EmptyMini text="لا توجد درجات بعد" />
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {gradePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 145)", fontSize: 13, fontFamily: "inherit" }} />
                    <Legend wrapperStyle={{ fontSize: 12, fontFamily: "inherit" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* توزيع الطلاب حسب اليوم + أحدث السجلات */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">الطلاب حسب يوم الدرس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <DayRow label="السبت" count={stats.saturdayStudents} total={stats.totalStudents} color="bg-[#054239]" />
            <DayRow label="الثلاثاء" count={stats.tuesdayStudents} total={stats.totalStudents} color="bg-[#428177]" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/60 shadow-sm">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">أحدث السجلات</CardTitle>
              <CardDescription className="text-xs">آخر 5 تسجيلات</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("info")} className="text-primary">
              عرض الكل
              <ArrowLeft className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentRecords.length === 0 ? (
              <EmptyMini text="لا توجد سجلات بعد" />
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pl-1">
                {stats.recentRecords.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div className="grid place-items-center size-9 rounded-full bg-primary/10 text-primary shrink-0">
                      <Users className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm truncate">{r.student?.name ?? "طالب محذوف"}</span>
                        <Badge variant="outline" className={`text-[10px] border ${getGradeColor(r.grade)}`}>
                          {r.grade}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.memorization}
                      </p>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-[11px] text-muted-foreground">{formatDateShortAr(r.date)}</div>
                      <div className="text-[11px] text-muted-foreground nums">{formatTimeAr(r.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: "forest" | "sage" | "wheat" | "olive";
}) {
  // ألوان اللوحة الجديدة
  const tints: Record<string, string> = {
    forest: "bg-[#054239]/12 text-[#054239]",
    sage: "bg-[#428177]/15 text-[#2d5a52]",
    wheat: "bg-[#b9a779]/25 text-[#6b5d3a]",
    olive: "bg-[#988561]/20 text-[#6b5d3a]",
  };
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden relative">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-3xl font-extrabold mt-1 nums">{value}</p>
          </div>
          <div className={`grid place-items-center size-10 rounded-xl shrink-0 ${tints[tint]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickButton({
  onClick, icon, title, desc,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="h-auto justify-start gap-3 py-3 px-4 text-right hover:bg-primary/5 hover:border-primary/40 group"
    >
      <span className="grid place-items-center size-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
        {icon}
      </span>
      <span className="flex flex-col items-start">
        <span className="text-sm font-bold">{title}</span>
        <span className="text-[11px] text-muted-foreground font-normal">{desc}</span>
      </span>
    </Button>
  );
}

function DayRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground nums">{count} طالب</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="h-44 grid place-items-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
