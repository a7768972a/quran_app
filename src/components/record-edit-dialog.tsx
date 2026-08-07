"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GRADES } from "@/lib/constants";
import { toDateInputValue } from "@/lib/date";
import type { RecordItem, Grade } from "@/types";
import { toast } from "sonner";

interface Props {
  record: RecordItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}

/**
 * نموذج تعديل سجل حفظ — يستخدم في بروفايل الطالب وقسم المعلومات.
 */
export function RecordEditDialog({ record, open, onOpenChange, onSaved }: Props) {
  const [memorization, setMemorization] = useState("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [homework, setHomework] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && record) {
      setMemorization(record.memorization);
      setGrade(record.grade);
      setHomework(record.homework);
      setDate(toDateInputValue(record.date));
    }
  }, [open, record]);

  const handleSubmit = async () => {
    if (!record) return;
    if (!memorization.trim()) { toast.error("الحفظ لا يمكن أن يكون فارغاً"); return; }
    if (!grade) { toast.error("اختر الدرجة"); return; }
    if (!homework.trim()) { toast.error("الوظيفة لا يمكن أن تكون فارغة"); return; }
    if (!date) { toast.error("اختر التاريخ"); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/records/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorization: memorization.trim(),
          grade,
          homework: homework.trim(),
          date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      toast.success("تم تعديل السجل بنجاح");
      onSaved?.();
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
          <DialogTitle>تعديل سجل الحفظ</DialogTitle>
          <DialogDescription>
            {record?.student?.name ? `الطالب: ${record.student.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>الحفظ</Label>
            <Textarea
              value={memorization}
              onChange={(e) => setMemorization(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>الدرجة</Label>
            <RadioGroup
              value={grade}
              onValueChange={(v) => setGrade(v as Grade)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {GRADES.map((g) => (
                <label
                  key={g.value}
                  className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 cursor-pointer transition-all text-center ${
                    grade === g.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={g.value} id={`er-${g.value}`} className="sr-only" />
                  <span className={`text-xs font-bold ${grade === g.value ? "text-primary" : ""}`}>
                    {g.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-1.5">
            <Label>الوظيفة</Label>
            <Textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>تاريخ التسميع</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="nums"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
