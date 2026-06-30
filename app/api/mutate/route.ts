import { NextResponse } from "next/server";
import { runMutation } from "@/lib/store";
import type { Action } from "@/lib/reducer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let action: Action;
  try {
    action = (await req.json()) as Action;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!action || typeof action.type !== "string") {
    return NextResponse.json({ error: "Missing action type" }, { status: 400 });
  }
  try {
    const state = await runMutation(action);
    return NextResponse.json(
      { state },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("mutate failed", err);
    return NextResponse.json({ error: "Mutation failed" }, { status: 500 });
  }
}
