import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "NotFound",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="text-center mt-16 mb-16">
        <h1 className="p-4 bg-gray-500 text-white text-2xl">404 Not Found</h1>
        <div className="p-4">Page is not found</div>
        <div className="p-4">Check url and try again</div>
        <Link href="/" className="text-blue-500 underline">
          Home
        </Link>
      </div>
      <Footer />
    </>
  );
}
