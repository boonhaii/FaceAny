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
  const imageData = atob(
    imgSrc.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
  );
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
};
