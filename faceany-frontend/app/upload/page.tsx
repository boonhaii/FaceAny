"use client";

import { useCallback, useState } from "react";
import { WebcamComponent } from "../webcam";

export default function Upload() {
  const [result, setResult] = useState("");
  const [user, setUser] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (src: string) => {
      if (!user) {
        return;
      }
      const file = await urltoFile(src, user + ".jpg", "image/jpeg");
      console.log("file constructed");
      const success = await uploadPhoto(file, user);
      if (success) {
        setResult("Photo uploaded successfully!");
        return;
      }
      setResult("Upload failed");
    },
    [user]
  );

  return (
    <div className="flex p-10">
      <div className="flex-1">
        <p>User Selection</p>
        <select
          className="bg-black"
          onChange={(e) => {
            setUser(e.target.value);
            setResult("");
          }}
        >
          <option value="">Select a user</option>
          <option value="Boon Hai">Boon Hai</option>
          <option value="Jeremy">Jeremy</option>
          <option value="Vanessa">Vanessa</option>
        </select>
      </div>
      <div className="flex-1">
        {user ? (
          <>
            <p>Snap a photo for {user}!</p>
            <WebcamComponent onCapture={handleUpload} />
            <p>{result}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

const uploadPhoto = async (file: File, user: string) => {
  const filename = encodeURIComponent(user + ".jpg");
  const fileType = encodeURIComponent(file.type);

  const res = await fetch(
    `/api/upload-url?file=${filename}&fileType=${fileType}`
  );
  const { url, fields } = await res.json();
  const formData = new FormData();

  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  const upload = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (upload.ok) {
    const indexFaceResponse = await fetch(
      "https://smh7spdpmi.execute-api.ap-southeast-1.amazonaws.com/setup",
      { method: "POST", body: JSON.stringify({ imageFileName: filename }) }
    );
    if (indexFaceResponse.status === 200) {
      return upload.ok;
    }
  }
  console.error("Upload failed.");
};

function urltoFile(url: string, filename: string, mimeType: string) {
  if (url.startsWith("data:")) {
    var arr = url.split(","),
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var file = new File([u8arr], filename, { type: mime || mimeType });
    return Promise.resolve(file);
  }
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }));
}
