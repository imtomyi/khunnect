"use client";

import React from "react";

export default function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
