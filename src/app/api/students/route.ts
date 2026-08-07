import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/students — جلب كل الطلاب مع عدد السجلات
export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { records: true } },
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json(
      { error: "تعذر جلب الطلاب" },
      { status: 500 }
    );
  }
}

// POST /api/students — إضافة طالب جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, lessonDay } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }
    if (age === undefined || age === null || isNaN(Number(age))) {
      return NextResponse.json({ error: "العمر مطلوب" }, { status: 400 });
    }
    if (!["saturday", "tuesday"].includes(lessonDay)) {
      return NextResponse.json(
        { error: "يوم الدرس غير صحيح (سبت أو ثلاثاء)" },
        { status: 400 }
      );
    }

    const student = await db.student.create({
      data: {
        name: name.trim(),
        age: Number(age),
        lessonDay,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("[POST /api/students]", error);
    return NextResponse.json(
      { error: "تعذر إضافة الطالب" },
      { status: 500 }
    );
  }
}
