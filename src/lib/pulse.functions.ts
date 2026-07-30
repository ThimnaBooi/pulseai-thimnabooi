/**
 * Client-callable server functions for PulseAI.
 * Thin wrappers only — implementation lives in *.server.ts modules.
 */
import { createServerFn } from "@tanstack/react-start";

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const { loadDashboardData } = await import("./pulse-data.server");
  return loadDashboardData();
});

export const refreshNews = createServerFn({ method: "POST" }).handler(async () => {
  const { ingestNews } = await import("./pulse-ingest.server");
  try {
    return { ok: true as const, ...(await ingestNews()) };
  } catch (error) {
    console.error("Ingestion failed", error);
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Ingestion failed",
    };
  }
});
