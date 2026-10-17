"use client";

import { type GlobalErrorProps } from "@/types/page";

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="main">
          <h1 className="p-4 bg-red-500 text-white text-xl">
            Something went wrong!
          </h1>
          <div className="p-4">
            <h3>{error.message}</h3>
            <button
              className="py-2 px-4 m-2 bg-red-500 text-white rounded-md"
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
