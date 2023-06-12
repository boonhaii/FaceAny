import { kv } from "@vercel/kv";
import {
  RekognitionClient,
  IndexFacesCommand,
} from "@aws-sdk/client-rekognition";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("fileName") as string;
  const filename = decodeURI(key);

  const client = new RekognitionClient({ region: "ap-southeast-1" });

  const command = new IndexFacesCommand({
    CollectionId: "faceAnyUsers",
    Image: {
      S3Object: {
        Bucket: "hackany",
        Name: key,
      },
    },
    DetectionAttributes: ["DEFAULT"],
    MaxFaces: 1,
    QualityFilter: "AUTO",
  });

  const registerFaceResponse = await client.send(command);

  const faceId = registerFaceResponse.FaceRecords[0].Face.FaceId;
  const name = filename.split(".")[0];
  console.log(`${faceId}, ${name}`);

  await kv.set(`/face/${faceId}`, name);

  return NextResponse.json({ faceId, name });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const faceId = searchParams.get("faceId");

  const name = await kv.get(`/face/${faceId}`);

  return NextResponse.json(name);
}
