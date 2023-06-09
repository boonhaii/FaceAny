import {
  RekognitionClient,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
import * as fs from "fs";
import { ApiHandler, useJsonBody } from "sst/node/api";

function constructCompareFaceParams(targetImage, threshold) {
  return {
    QualityFilter: "AUTO", // Whether filter is applied, default is none.
    SimilarityThreshold: threshold, // Minimal Threshold that must be met indicate same face.
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
  };
}

async function callAWSCompareFaces(client) {
  const targetImage = fs.readFileSync("./testFiles/testImg.jpg");

  const requestParams = constructCompareFaceParams(targetImage, 70);

  const command = new CompareFacesCommand(requestParams);

  try {
    const data = await client.send(command);
    // FaceMatches is an array of faces in the targetImage that matches the sourceImg
    // And the similarity is above the similarityThreshold passed.
    return data;
  } catch (e) {
    throw e;
  }
}

export const handler = ApiHandler(async () => {
  const eventBody = useJsonBody();

  const client = new RekognitionClient({ region: "ap-southeast-1" });
  try {
    const compareResult = await callAWSCompareFaces(client);
    if (compareResult.FaceMatches) {
      return {
        statusCode: 200,
        body: {
          message: "Found a matching face, check in successful.",
        },
      };
    } else {
      return {
        statusCode: 200,
        body: {
          message: "Did not find a matching face, please try again!",
        },
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        message: `An error occurred while processing the request: ${e.message}`,
      },
    };
  }
});

// const client = new RekognitionClient({ region: "ap-southeast-1" });
// const result = await callAWSCompareFaces(client);

// console.log(result);
