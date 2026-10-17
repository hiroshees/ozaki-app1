import type { Metadata } from "next";
import { type BreadcrumbList } from "@/types/index";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { getAuth } from "@/hooks/auth/server";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

const bcList: BreadcrumbList = [
  {
    title: "Dashboard",
    href: "/dashboard",
    current: true,
    home: true,
  },
];

export default async function Page() {
  const { userName, email, avatarUrl } = await getAuth();

  return (
    <div>
      <h1 className="p-4 text-center text-lg bg-blue-500 text-white">
        ダッシュボード / プレイリスト
      </h1>
      <div className="my-4 px-6">
        <Breadcrumb {...{ bcList }} />
      </div>
      <div className="my-4 px-6"></div>
    </div>
  );
}
