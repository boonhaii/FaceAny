import {
  RekognitionClient,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
import * as fs from "fs";

const SIMILARITY_THRESHOLD = 80;
const client = new RekognitionClient({ region: "ap-southeast-1" });

function constructCompareFaceParams(targetImage) {
  return {
    QualityFilter: "AUTO", // Whether filter is applied, default is none.
    SimilarityThreshold: SIMILARITY_THRESHOLD, // Minimal Threshold that must be met indicate same face.
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

async function callAWSCompareFaces(client, targetImage) {
  targetImage = fs.readFileSync("./testFiles/testImg.jpg");

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

exports.new = function (req, res) {
  // const targetImg = null;
  const compareFacesResult = callAWSCompareFaces(client, targetImg);
  if (err) {
    res.status(500).json({ status: "error", message: err });
  }

  const message = compareFacesResult.FaceRes

  res.status(200).json({
    status: "success",
    message:
  });
};
