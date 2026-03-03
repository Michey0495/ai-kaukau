import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    const count = await kv.incr(`likes:kaukau:${id}`);
    await kv.zadd("kaukau:popular", { score: count, member: id });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ count: 0 });
    }
    const count = (await kv.get<number>(`likes:kaukau:${id}`)) ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
