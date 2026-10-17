"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type SearchBoxProps } from "@/types/index";

export const SearchBox = ({ keyword = "" }: SearchBoxProps) => {
  const router = useRouter();
  const [q, setQ] = useState(keyword);

  const handleChange = function (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setQ(event.target.value);
  };

  const handleKeyDown = function (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void {
    if (event.key === "Enter") {
      searchAction();
    }
  };

  const searchAction = function (): void {
    router.push(`/search/${encodeURIComponent(q)}`);
  };

  return (
    <input
      type="text"
      name="q"
      className="inline-block w-full px-2 py-1 text-md mr-2 border border-gray-400 rounded-lg focus:outline-blue-400"
      value={q}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="🔍"
    />
  );
};
