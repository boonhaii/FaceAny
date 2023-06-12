import {
  RekognitionClient,
  SearchFacesByImageCommand,
  Face,
} from "@aws-sdk/client-rekognition";
import middy from "@middy/core";
import httpMultipartBodyParser from "@middy/http-multipart-body-parser";
import { ApiHandler } from "sst/node/api";

import { identityDatabase } from "./identityDatabase";

function mapFaceIdToPerson(faceId: string) {
  return identityDatabase[faceId];
}

async function callAWSSearchCollection(
  client: RekognitionClient,
  targetImage: Buffer
) {
  const command = new SearchFacesByImageCommand({
    CollectionId: "faceAnyUsers",
    FaceMatchThreshold: 70,
    Image: {
      Bytes: targetImage,
    },
    MaxFaces: 1, // Number of matched faces to return.
    QualityFilter: "AUTO",
  });

  const data = await client.send(command);
  return data;
}

// async function callAWSCompareFaces(
//   client: RekognitionClient,
//   targetImage: Buffer
// ) {
//   const command = new CompareFacesCommand({
//     QualityFilter: "AUTO", // Whether filter is applied, default is none.
//     SimilarityThreshold: 70, // Minimal Threshold that must be met indicate same face.
//     // Probably will need them to setup with image uploaded to the bucket.
//     SourceImage: {
//       S3Object: {
//         Bucket: "hackany",
//         Name: "sourceImg.jpg",
//       },
//     },
//     // Probably using Bytes, we just take the image from the frontend, then send the bytes in.
//     TargetImage: {
//       Bytes: targetImage,
//     },
//   });

//   const data = await client.send(command);
//   // FaceMatches is an array of faces in the targetImage that matches the sourceImg
//   // And the similarity is above the similarityThreshold passed.
//   return data;
// }

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
    // const compareResult = await callAWSCompareFaces(client, targetImageBytes);
    // const faceMatches = compareResult.FaceMatches;
    const searchCollectionResult = await callAWSSearchCollection(
      client,
      targetImageBytes
    );
    const faceMatches = searchCollectionResult.FaceMatches;
    if (!faceMatches || faceMatches.length === 0) {
      return {
        statusCode: 204,
        body: JSON.stringify({
          message: "Did not find any matching faces, please try again!",
        }),
      };
    }

    const faceObject = faceMatches[0].Face as unknown as Face;
    const faceId = faceObject.FaceId as string;
    const person = mapFaceIdToPerson(faceId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Check in successful for user: ${person}.`,
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
