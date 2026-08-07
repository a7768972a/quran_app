import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stats — إحصائيات لوحة التحكم
export async function GET() {
  try {
    const totalStudents = await db.student.count();
    const totalRecords = await db.record.count();

    // إحصائيات اليوم
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayRecords = await db.record.count({
      where: { date: { gte: todayStart, lte: todayEnd } },
    });

    // توزيع الدرجات
    const gradeDistributionRaw = await db.record.groupBy({
      by: ["grade"],
      _count: { grade: true },
    });

    const gradeDistribution = gradeDistributionRaw.map((g) => ({
      grade: g.grade,
      count: g._count.grade,
    }));

    // عدد الطلاب حسب يوم الدرس
    const saturdayStudents = await db.student.count({
      where: { lessonDay: "saturday" },
    });
    const tuesdayStudents = await db.student.count({
      where: { lessonDay: "tuesday" },
    });

    // أحدث 5 سجلات
    const recentRecords = await db.record.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        student: { select: { id: true, name: true, lessonDay: true } },
      },
    });

    // السجلات حسب الأسبوع (لآخر 8 أسابيع)
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      weeks.push({
        label: `${start.toLocaleDateString("ar", { day: "numeric", month: "short" })}`,
        start,
        end,
        count: 0,
      });
    }

    const weeklyCountsRaw = await db.record.groupBy({
      by: ["date"],
      _count: { date: true },
    });

    // عدّ السجلات ضمن كل أسبوع
    for (const w of weeks) {
      w.count = weeklyCountsRaw.filter(
        (r) => r.date >= w.start && r.date <= w.end
      ).reduce((sum, r) => sum + r._count.date, 0);
    }

    return NextResponse.json({
      totalStudents,
      totalRecords,
      todayRecords,
      gradeDistribution,
      saturdayStudents,
      tuesdayStudents,
      recentRecords,
      weeklyCounts: weeks.map((w) => ({ label: w.label, count: w.count })),
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json({ error: "تعذر جلب الإحصائيات" }, { status: 500 });
  }
}
