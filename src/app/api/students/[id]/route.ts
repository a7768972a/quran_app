import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/students/[id] — بروفايل الطالب مع سجل الحفظ
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: {
        records: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("[GET /api/students/[id]]", error);
    return NextResponse.json({ error: "تعذر جلب بيانات الطالب" }, { status: 500 });
  }
}

// PUT /api/students/[id] — تعديل بيانات الطالب
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const student = await db.student.update({
      where: { id },
      data: {
        name: name.trim(),
        age: Number(age),
        lessonDay,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("[PUT /api/students/[id]]", error);
    return NextResponse.json({ error: "تعذر تعديل بيانات الطالب" }, { status: 500 });
  }
}

// DELETE /api/students/[id] — حذف الطالب (مع سجلاته)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/students/[id]]", error);
    return NextResponse.json({ error: "تعذر حذف الطالب" }, { status: 500 });
  }
}
