import {
  RekognitionClient,
  IndexFacesCommand,
} from "@aws-sdk/client-rekognition";
import middy from "@middy/core";
import { ApiHandler, useJsonBody } from "sst/node/api";

async function addImageToCollection(
  client: RekognitionClient,
  imageFile: string
) {
  const command = new IndexFacesCommand({
    CollectionId: "faceAnyUsers",
    Image: {
      S3Object: {
        Bucket: "hackany",
        Name: imageFile,
      },
    },
    DetectionAttributes: ["DEFAULT"],
    MaxFaces: 1,
    QualityFilter: "AUTO",
  });

  const data = await client.send(command);
  return data;
}

const logicHandler = ApiHandler(async (event) => {
  const eventBody = useJsonBody();
  const imageFileName = eventBody.imageFileName;

  if (!imageFileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `No filename detected. Please check the request and try again.`,
      }),
    };
  }

  const client = new RekognitionClient({ region: "ap-southeast-1" });
  try {
    const data = await addImageToCollection(client, imageFileName);
    if (data.FaceRecords && data.FaceRecords.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successfully added photo to database.",
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No faces detected in the photo. Please try again.",
        }),
      };
    }
  } catch (e) {
    console.log(e);
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

export const handler = middy(logicHandler);
