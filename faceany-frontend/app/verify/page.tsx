"use client";

import { useState } from "react";
import { WebcamComponent } from "../webcam";
import { handleImageVerify } from "./handleImageVerify";

export default function Home() {
  const [name, setName] = useState("");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex"></div>

      {name ? (
        <div>Welcome back, {name}!</div>
      ) : (
        <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
          <WebcamComponent
            onCapture={async (imgSrc) => {
              const matchedName = await handleImageVerify(imgSrc);
              console.log(matchedName);
              if (matchedName) {
                setName(matchedName);
              }
            }}
          />
        </div>
      )}

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
