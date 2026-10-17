import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signupForm";

export const metadata: Metadata = {
  title: "サインアップ",
};

export default function Page() {
  return (
    <>
      <h1 className="p-4 text-center text-2xl font-semibold">サインアップ</h1>
      <div className="flex min-h-full flex-col justify-center px-6 lg:px-8">
        <div className="mt-10 md:mx-auto md:w-full md:max-w-sm text-left">
          <SignupForm />
        </div>
      </div>
    </>
  );
}
