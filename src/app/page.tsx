"use client";

import { useState } from "react";
import { BookOpenCheck, Users, ClipboardList, BarChart3, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { StudentsSection } from "@/components/sections/students-section";
import { RecordingSection } from "@/components/sections/recording-section";
import { InfoSection } from "@/components/sections/info-section";

type TabKey = "dashboard" | "students" | "recording" | "info";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/40 via-background to-background">
      {/* الرأس */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-11 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight">
                نظام تسجيل حضور الطلاب
              </h1>
              <p className="text-xs text-muted-foreground">
                تسجيل الحفظ والوظائف ومتابعة الطلاب
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1.5 gap-1 bg-card border border-border/60 shadow-sm">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1.5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="size-4" />
              <span className="text-xs sm:text-sm">لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col sm:flex-row items-center gap-1.5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="size-4" />
              <span className="text-xs sm:text-sm">الطلاب</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex flex-col sm:flex-row items-center gap-1.5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="size-4" />
              <span className="text-xs sm:text-sm">تسجيل الحفظ</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex flex-col sm:flex-row items-center gap-1.5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpenCheck className="size-4" />
              <span className="text-xs sm:text-sm">المعلومات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 focus-visible:outline-none">
            <DashboardSection onNavigate={setTab} />
          </TabsContent>
          <TabsContent value="students" className="mt-6 focus-visible:outline-none">
            <StudentsSection />
          </TabsContent>
          <TabsContent value="recording" className="mt-6 focus-visible:outline-none">
            <RecordingSection />
          </TabsContent>
          <TabsContent value="info" className="mt-6 focus-visible:outline-none">
            <InfoSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* التذييل الثابت */}
      <footer className="mt-auto border-t border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          نظام تسجيل الحضور والحفظ — أيام الدرس: السبت والثلاثاء
        </div>
      </footer>
    </div>
  );
}
