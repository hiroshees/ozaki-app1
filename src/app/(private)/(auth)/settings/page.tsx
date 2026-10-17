import type { Metadata } from "next";
import { PasswordUpdateForm } from "@/components/auth/passwordForm";
import { ProfileUpdateForm } from "@/components/auth/profileForm";

export const metadata: Metadata = {
  title: "設定",
};

export default async function Page() {
  return (
    <>
      <h1 className="mb-4 p-4 text-center text-lg bg-blue-500 text-white">
        設定
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 mb-4">
        <div className="space-y-6 md:col-start-4 md:col-span-6 mb-6">
          <PasswordUpdateForm />
        </div>
        <div className="space-y-6 md:col-start-4 md:col-span-6 mb-6">
          <ProfileUpdateForm />
        </div>
      </div>
    </>
  );
}
