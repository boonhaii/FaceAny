import S3 from "aws-sdk/clients/s3";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    region: "ap-southeast-1",
  });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("file");
  const contentType = searchParams.get("fileType");

  const post = await s3.createPresignedPost({
    Bucket: process.env.BUCKET_NAME,
    Fields: {
      key,
      "Content-Type": contentType,
    },
    Expires: 3600, // seconds
    Conditions: [
      ["content-length-range", 0, 1048576], // up to 1 MB
    ],
  });

  return NextResponse.json(post);
}
