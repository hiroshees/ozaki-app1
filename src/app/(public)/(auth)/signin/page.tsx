import type { Metadata } from "next";
import { SigninForm } from "@/components/auth/signinForm";
import { GoogleLoginButton } from "@/components/auth/googleLoginButton";

export const metadata: Metadata = {
  title: "サインイン",
};

export default function Page() {
  return (
    <>
      <h1 className="p-4 text-center text-2xl font-semibold">サインイン</h1>
      <div className="flex min-h-full flex-col justify-center px-6 lg:px-8">
        <div className="mt-10 md:mx-auto md:w-full md:max-w-sm text-left">
          <div className="mb-4">
            <GoogleLoginButton />
          </div>
          <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
            or
          </div>
          <SigninForm />
        </div>
      </div>
    </>
  );
}
