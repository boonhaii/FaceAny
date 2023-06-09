import {
  RekognitionClient,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
import { ApiHandler, useJsonBody } from "sst/node/api";

async function callAWSCompareFaces(
  client: RekognitionClient,
  targetImageName: string
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
      S3Object: {
        Bucket: "hackany",
        Name: targetImageName,
      },
    },
  });

  const data = await client.send(command);
  // FaceMatches is an array of faces in the targetImage that matches the sourceImg
  // And the similarity is above the similarityThreshold passed.
  return data;
}

export const handler = ApiHandler(async () => {
  const body = useJsonBody();

  const client = new RekognitionClient({ region: "ap-southeast-1" });
  try {
    const compareResult = await callAWSCompareFaces(
      client,
      body.targetImageName
    );
    if (compareResult.FaceMatches) {
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
