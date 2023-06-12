import {
  RekognitionClient,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
import middy from "@middy/core";
import httpMultipartBodyParser from "@middy/http-multipart-body-parser";
import { ApiHandler } from "sst/node/api";

async function callAWSCompareFaces(
  client: RekognitionClient,
  targetImage: Buffer
) {
  const command = new CompareFacesCommand({
    QualityFilter: "AUTO", // Whether filter is applied, default is none.
    SimilarityThreshold: 70, // Minimal Threshold that must be met indicate same face.
    // Probably will need them to setup with image uploaded to the bucket.
    SourceImage: {
      S3Object: {
        Bucket: "hackany",
        Name: "sourceImg.jpg",
      },
    },
    // Probably using Bytes, we just take the image from the frontend, then send the bytes in.
    TargetImage: {
      Bytes: targetImage,
    },
  });

  const data = await client.send(command);
  // FaceMatches is an array of faces in the targetImage that matches the sourceImg
  // And the similarity is above the similarityThreshold passed.
  return data;
}

const logicHandler = ApiHandler(async (event) => {
  const eventBody = event.body as unknown as {
    targetImage: { content: Buffer };
  };
  if (!eventBody) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No image detected. Please check the check in request again.",
      }),
    };
  }
  const targetImageObject = eventBody.targetImage;
  const targetImageBytes = targetImageObject.content;

  const client = new RekognitionClient({ region: "ap-southeast-1" });
  try {
    const compareResult = await callAWSCompareFaces(client, targetImageBytes);
    const faceMatches = compareResult.FaceMatches;
    if (faceMatches && faceMatches.length !== 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Found a matching face, check in successful.",
        }),
      };
    }
    return {
      statusCode: 204,
      body: JSON.stringify({
        message: "Did not find a matching face, please try again!",
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `An error occurred while processing the request: ${
          (e as Error).message
        }`,
      }),
    };
  }
});

export const handler = middy(logicHandler).use(httpMultipartBodyParser());
