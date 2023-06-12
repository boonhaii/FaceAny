"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { S3Client } from "@aws-sdk/client-s3";
import Webcam from "react-webcam";

export const WebcamComponent = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (imgSrc) {
        handleImageUpload(imgSrc);
      }
      console.log("Running function every 5 seconds");
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once on mount

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  return (
    <>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>Capture photo</button>
      {imgSrc && <img src={imgSrc} />}
    </>
  );
};

const handleImageUpload = (imgSrc: string) => {
  // Initialise S3Client to upload data.
  const client = new S3Client({ region: "ap-southeast-1" });
  // Convert the base64 string to a Blob object
  const imageData = atob(imgSrc);
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
};
