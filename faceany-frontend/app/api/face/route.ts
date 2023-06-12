import { kv } from "@vercel/kv";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const faceId = searchParams.get("faceId");
  const name = searchParams.get("name");

  await kv.set(`/face/${faceId}`, name);

  return;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const faceId = searchParams.get("faceId");

  await kv.get(`/face/${faceId}`);

  return;
}
