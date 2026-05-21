import { revalidatePath, revalidateTag } from "next/cache";
import { INDICES } from "@/lib/indices";

export const dynamic = "force-dynamic";

/**
 * Daily refresh endpoint — triggered by Vercel Cron at 03:00 UTC (see vercel.json).
 * Drops the WB/OWID data caches and revalidates every page so the next visitor
 * gets the freshest numbers.
 *
 * Protected by CRON_SECRET. Vercel Cron sends `Authorization: Bearer <secret>`
 * automatically when the env var is set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  revalidateTag("wb", "max");
  revalidateTag("owid", "max");
  revalidateTag("rsf", "max");
  revalidatePath("/");
  for (const spec of INDICES) {
    revalidatePath(`/index/${spec.slug}`);
  }

  return Response.json({
    revalidated: true,
    paths: 1 + INDICES.length,
    tags: ["wb", "owid"],
    at: new Date().toISOString(),
  });
}
