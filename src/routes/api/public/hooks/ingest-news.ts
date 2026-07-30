/**
 * Scheduled news collection endpoint.
 * Called by the database cron job every 24 hours (fallback: every 72 hours).
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/ingest-news")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { ingestNews } = await import("@/lib/pulse-ingest.server");
          const result = await ingestNews();
          return Response.json({ success: true, ...result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Ingestion failed";
          console.error("Scheduled ingestion failed", error);
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
