import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const faceId = searchParams.get("faceId");
  const name = searchParams.get("name");

  await kv.set(`/face/${faceId}`, name);

  return NextResponse.json({ faceId, name });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const faceId = searchParams.get("faceId");

  const name = await kv.get(`/face/${faceId}`);

  return NextResponse.json(name);
}
