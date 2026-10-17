import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "エラー",
};

export default function Page() {
  return (
    <>
      <h1 className="p-4 text-center text-2xl font-semibold bg-red-500 text-white">
        メールエラー
      </h1>
      <ul className="text-center p-4">
        <li className="m-4">
          <ButtonLink href="signup" text="サインアップ" color="blue" />
        </li>
        <li className="m-4">
          <ButtonLink href="signin" text="サインイン" color="blue" />
        </li>
      </ul>
    </>
  );
}
