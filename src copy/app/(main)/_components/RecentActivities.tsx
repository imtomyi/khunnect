"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { getRecentActivities, formatTimeAgo, type RecentActivity } from "@/lib/recentActivity";
import type { CSSProperties } from "react";

const TYPE_COLORS: Record<RecentActivity["type"], string> = {
  senior:     "#9A001F",
  roadmap:    "#094F7A",
  curriculum: "#4A7FC1",
  messages:   "#FDDC98",
  mypage:     "#735B24",
  calendar:   "#4CAF50",
};

const TYPE_ICONS: Record<RecentActivity["type"], React.ReactNode> = {
  senior:     "👤",
  roadmap:    "🗺",
  curriculum: "📋",
  messages: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 19" fill="none">
      <path d="M2.4 19C1.74 19 1.175 18.7675 0.705 18.3023C0.235 17.8372 0 17.2781 0 16.625V2.375C0 1.72188 0.235 1.16276 0.705 0.697656C1.175 0.232552 1.74 0 2.4 0H21.6C22.26 0 22.825 0.232552 23.295 0.697656C23.765 1.16276 24 1.72188 24 2.375V16.625C24 17.2781 23.765 17.8372 23.295 18.3023C22.825 18.7675 22.26 19 21.6 19H2.4ZM12 10.6875L2.4 4.75V16.625H21.6V4.75L12 10.6875ZM12 8.3125L21.6 2.375H2.4L12 8.3125Z" fill="#785F28"/>
    </svg>
  ),
  mypage:     "⚙",
  calendar:   "📅",
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    setActivities(getRecentActivities());
  }, []);

  const titleStyle: CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1F1A1A",
    marginBottom: "16px",
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  };

  const emptyStyle: CSSProperties = {
    fontSize: "14px",
    color: "#9CA3AF",
    padding: "24px 0",
  };

  return (
    <section>
      <h2 style={titleStyle}>최근 활동</h2>
      {activities.length === 0 ? (
        <p style={emptyStyle}>아직 최근 활동이 없습니다.</p>
      ) : (
        <div style={gridStyle}>
          {activities.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{
                border: "1px solid #EBE0E0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                backgroundColor: "#FFFFFF",
                textDecoration: "none",
                transition: "box-shadow 150ms ease",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: TYPE_COLORS[item.type],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {TYPE_ICONS[item.type]}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#1F1A1A" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                  {item.sub} · {formatTimeAgo(item.timestamp)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
