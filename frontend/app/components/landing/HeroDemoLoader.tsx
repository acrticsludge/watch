"use client";

import dynamic from "next/dynamic";

const HeroDashboardDemo = dynamic(
  () => import("./HeroDashboardDemo").then((m) => m.HeroDashboardDemo),
  { ssr: false, loading: () => <div style={{ width: 459, height: 459 }} /> }
);

export function HeroDemoLoader() {
  return <HeroDashboardDemo />;
}
