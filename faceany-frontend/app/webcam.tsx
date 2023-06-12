"use client";

import React, { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

interface Props {
  onCapture: (src: string) => void;
}

export const WebcamComponent = ({ onCapture }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="flex-col flex">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        mirrored={true}
      />
      <div className="flex flex-1 justify-center p-5">
        <button className="px-3 rounded-full bg-slate-700" onClick={capture}>
          Capture photo
        </button>
      </div>
      {imgSrc && <img src={imgSrc} />}
    </div>
  );
};
