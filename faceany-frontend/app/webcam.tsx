"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  // Convert the base64 string to a Blob object
  const imageData = atob(imgSrc);
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

  // Create a new FormData object
  const formData = new FormData();
  formData.append("targetImage", blob, "image.jpg"); // Append the image to the FormData

  // Make a POST request with the FormData
  fetch("https://example.com/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      // Handle the response
      console.log(response);
      if (response.status === 200) {
        alert("facial recognition successful");
      } else if (response.status === 204) {
        alert("facial recognition failed");
      } else {
        throw new Error(
          "Bad Response: " +
            response.status +
            ", " +
            response.json().then((body) => body)
        );
      }
    })
    .catch((error) => {
      // Handle errors
      alert("Error uploading image: " + error);
    });
};
