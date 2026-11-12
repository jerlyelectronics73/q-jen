import { NextResponse, type NextRequest } from "next/server";
import { searchActiveProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "8");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 30)
    : 8;

  const results = await searchActiveProducts(q, limit);
  return NextResponse.json(
    { query: q, results },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}

