import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/records — جلب السجلات (يدعم تصفية حسب التاريخ أو الأسبوع)
// ?date=YYYY-MM-DD  =>  كل سجلات ذلك اليوم
// ?weekStart=YYYY-MM-DD => كل سجلات الأسبوع الذي يبدأ من هذا التاريخ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const weekStartStr = searchParams.get("weekStart");

    let where: { date?: { gte?: Date; lte?: Date } } = {};

    if (weekStartStr) {
      const start = new Date(weekStartStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      where.date = { gte: start, lte: end };
    } else if (dateStr) {
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lte: end };
    }

    const records = await db.record.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        student: {
          select: { id: true, name: true, lessonDay: true, age: true },
        },
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[GET /api/records]", error);
    return NextResponse.json({ error: "تعذر جلب السجلات" }, { status: 500 });
  }
}

// POST /api/records — تسجيل حفظ جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, memorization, grade, homework, date } = body;

    if (!studentId) {
      return NextResponse.json({ error: "يجب اختيار الطالب" }, { status: 400 });
    }
    if (!memorization || typeof memorization !== "string" || memorization.trim() === "") {
      return NextResponse.json({ error: "الحفظ مطلوب" }, { status: 400 });
    }
    if (!["مقبول", "جيد", "جيد جدا", "ممتاز"].includes(grade)) {
      return NextResponse.json({ error: "الدرجة غير صحيحة" }, { status: 400 });
    }
    if (!homework || typeof homework !== "string") {
      return NextResponse.json({ error: "الوظيفة مطلوبة" }, { status: 400 });
    }

    // التحقق من وجود الطالب
    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    const record = await db.record.create({
      data: {
        studentId,
        memorization: memorization.trim(),
        grade,
        homework: homework.trim(),
        date: date ? new Date(date) : new Date(),
      },
      include: {
        student: { select: { id: true, name: true, lessonDay: true } },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("[POST /api/records]", error);
    return NextResponse.json({ error: "تعذر تسجيل الحفظ" }, { status: 500 });
  }
}
