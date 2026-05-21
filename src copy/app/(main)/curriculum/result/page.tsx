"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCatalogCourses, getCurriculumRequirement, getCheckedCourses, saveCheckedCourses } from "@/services/curriculum";
import { getCurrentUser } from "@/services/user";
import type { CatalogCourse, CurriculumRequirement } from "@/types";

import { CATEGORY_ORDER } from "./_lib/constants";
import type { CategoryType } from "./_lib/constants";
import { GraduationStatusCard } from "./_components/GraduationStatusCard";
import { CourseSection } from "./_components/CourseSection";
import { SimulatorPanel } from "./_components/SimulatorPanel";

export default function CurriculumResultPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [requirement, setRequirement] = useState<CurriculumRequirement | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [planned, setPlanned] = useState<Set<string>>(new Set());

  // ── 데이터 로드 ──────────────────────────────────────────────
  useEffect(() => {
    getCurrentUser().then(async (user) => {
      setUserId(user.id);
      const [courses, req, savedChecked] = await Promise.all([
        getCatalogCourses(),
        getCurriculumRequirement(),
        getCheckedCourses(user.id),
      ]);
      setCatalog(courses);
      setRequirement(req);
      setChecked(savedChecked);
    });
  }, []);

  if (!requirement) return null;

  // ── 학점 계산 ─────────────────────────────────────────────────
  const reqByType: Record<CategoryType, number> = {
    "전공기초": requirement.basic,
    "전공필수": requirement.required,
    "전공선택": requirement.elective,
  };

  const completedByType = CATEGORY_ORDER.reduce((acc, type) => {
    acc[type] = catalog
      .filter(c => c.type === type && checked.has(c.id))
      .reduce((s, c) => s + c.credits, 0);
    return acc;
  }, {} as Record<CategoryType, number>);

  const plannedByType = CATEGORY_ORDER.reduce((acc, type) => {
    acc[type] = catalog
      .filter(c => c.type === type && planned.has(c.id) && !checked.has(c.id))
      .reduce((s, c) => s + c.credits, 0);
    return acc;
  }, {} as Record<CategoryType, number>);

  const totalRequired = Object.values(reqByType).reduce((a, b) => a + b, 0);
  const totalCompleted = Object.values(completedByType).reduce((a, b) => a + b, 0);
  const remaining = totalRequired - totalCompleted;

  // ── 핸들러 ───────────────────────────────────────────────────
  function togglePlanned(id: string) {
    setPlanned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleRecord() {
    if (!userId) return;
    localStorage.setItem(`last_planned_${userId}`, JSON.stringify([...planned]));
    router.push("/curriculum/result/summary");
  }

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "var(--font-roboto), sans-serif", minHeight: "100vh", backgroundColor: "transparent" }}>

      {/* 히어로 카드 (sticky) */}
      <GraduationStatusCard
        remaining={remaining}
        totalCompleted={totalCompleted}
        totalRequired={totalRequired}
        completedByType={completedByType}
        plannedByType={plannedByType}
        reqByType={reqByType}
      />

      {/* 본문 */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", justifyContent: "center" }}>

          {/* 과목 리스트 */}
          <div style={{ width: "700px", flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "32px 36px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            {CATEGORY_ORDER.map((type, idx) => (
              <CourseSection
                key={type}
                type={type}
                courses={catalog.filter(c => c.type === type)}
                completed={completedByType[type]}
                total={reqByType[type]}
                checked={checked}
                planned={planned}
                onTogglePlanned={togglePlanned}
                isLast={idx === CATEGORY_ORDER.length - 1}
              />
            ))}
          </div>

          {/* 시뮬레이터 */}
          <SimulatorPanel
            remaining={remaining}
            planned={planned}
            catalog={catalog}
            onRecord={handleRecord}
          />

        </div>
      </div>
    </div>
  );
}
