import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "紹介",
};

export default function Page() {
  return (
    <>
      <h1 className="p-4 text-center text-2xl font-semibold">紹介</h1>
      <div className="text-center">
        <h2 className="text-xl">XXXXX</h2>
        <ul>
          <li>XXXX</li>
        </ul>
      </div>
    </>
  );
}
