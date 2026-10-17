import { type Metadata } from "next";
import { MdSearch } from "react-icons/md";
import { type SearchPageProps } from "@/types/page";

export const metadata: Metadata = {
  title: "検索",
};

export default async function Page({ params }: SearchPageProps) {
  // /seach/{keyword}
  const { slug } = await params;
  const [q = ""] = slug || [];
  const keyword = decodeURIComponent(q);

  return (
    <div className="text-center">
      <h1 className="mb-4 p-4 bg-violet-400 text-white text-2xl">
        <MdSearch className="inline align-bottom mr-2 text-2xl" />
        Search: {keyword}
      </h1>
    </div>
  );
}
