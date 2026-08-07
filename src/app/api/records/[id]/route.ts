import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/records/[id] — تعديل سجل حفظ
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { memorization, grade, homework, date } = body;

    // تحقق من وجود السجل
    const existing = await db.record.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }

    // تحقق من القيم
    if (memorization !== undefined && (typeof memorization !== "string" || memorization.trim() === "")) {
      return NextResponse.json({ error: "الحفظ لا يمكن أن يكون فارغاً" }, { status: 400 });
    }
    if (grade !== undefined && !["مقبول", "جيد", "جيد جدا", "ممتاز"].includes(grade)) {
      return NextResponse.json({ error: "الدرجة غير صحيحة" }, { status: 400 });
    }
    if (homework !== undefined && (typeof homework !== "string" || homework.trim() === "")) {
      return NextResponse.json({ error: "الوظيفة لا يمكن أن تكون فارغة" }, { status: 400 });
    }

    const updated = await db.record.update({
      where: { id },
      data: {
        ...(memorization !== undefined ? { memorization: memorization.trim() } : {}),
        ...(grade !== undefined ? { grade } : {}),
        ...(homework !== undefined ? { homework: homework.trim() } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
      include: {
        student: { select: { id: true, name: true, lessonDay: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/records/[id]]", error);
    return NextResponse.json({ error: "تعذر تعديل السجل" }, { status: 500 });
  }
}

// DELETE /api/records/[id] — حذف سجل حفظ
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.record.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }
    await db.record.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/records/[id]]", error);
    return NextResponse.json({ error: "تعذر حذف السجل" }, { status: 500 });
  }
}
