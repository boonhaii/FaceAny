import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  if (!user) {
    throw new Error("User param must be provided");
  }
  const users: string[] | null = (await kv.get(`/users`)) || [];
  users.push(user);

  await kv.set(`/users`, users);

  return NextResponse.json(users);
}

export async function GET(req: Request) {
  const users = await kv.get(`/users`);

  return NextResponse.json(users);
}
