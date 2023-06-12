"use client";
import { useCallback, useEffect, useState } from "react";
import { WebcamComponent } from "../webcam";
import { AddUser } from "./AddUser";

export default function Upload() {
  const [result, setResult] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const usersFromFetch = await (await fetch("/api/users")).json();
      console.log(usersFromFetch);
      if (usersFromFetch) {
        setUsers(usersFromFetch);
      }
    })();
  }, []);

  const handleUpload = useCallback(
    async (src: string) => {
      if (!selectedUser) {
        return;
      }
      const file = await urltoFile(src, selectedUser + ".jpg", "image/jpeg");
      console.log("file constructed");
      const success = await uploadPhoto(file, selectedUser);
      if (success) {
        setResult("Photo uploaded successfully!");
        return;
      }
      setResult("Upload failed");
    },
    [selectedUser]
  );

  return (
    <div className="flex flex-col p-10">
      <div className="flex flex-1">
        <div>
          <p>User Selection</p>
          <select
            className="bg-black"
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setResult("");
            }}
            value={selectedUser ?? ""}
          >
            <option value="">Select a user</option>
            {users.map((userName) => (
              <option key={userName} value={userName}>
                {userName}
              </option>
            ))}
          </select>
        </div>
        <AddUser
          className="ml-10"
          onSubmit={async (newUser) => {
            const response = await fetch(`/api/users?user=${newUser}`, {
              method: "POST",
            });
            setUsers(await response.json());
          }}
        />
      </div>
      <div className="flex-1 max-w-xs">
        {selectedUser ? (
          <>
            <p>Snap a photo for {selectedUser}!</p>
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

  if (!upload.ok) {
    console.error("Upload failed");
    return false;
  }

  const indexFaceResponse = await fetch(
    "https://smh7spdpmi.execute-api.ap-southeast-1.amazonaws.com/setup",
    { method: "POST", body: JSON.stringify({ imageFileName: filename }) }
  );

  if (indexFaceResponse.status !== 200) {
    console.error("Upload failed");
    return false;
  }

  const { faceId } = await indexFaceResponse.json();
  await fetch(`/api/face?faceId=${faceId}&name=${user}`, { method: "PUT" });

  return true;
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
