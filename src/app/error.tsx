"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <>
      <Header />
      <div className="mt-16 mb-16 text-center">
        <h1 className="text-center bg-red-500 text-white text-2xl">
          {error.message}
        </h1>
        <button
          className="py-2 px-4 m-2 bg-red-500 text-white rounded-md"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
      <Footer />
    </>
  );
}
