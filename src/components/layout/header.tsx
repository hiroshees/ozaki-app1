"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPNAME } from "@/config/data";
import { FaAlignJustify } from "react-icons/fa6";
import { BiSolidMoviePlay } from "react-icons/bi";

const links = [
  { title: "ホーム", href: "/" },
  { title: "紹介", href: "/about" },
  { title: "サインアップ", href: "/signup" },
  { title: "サインイン", href: "/signin" },
];

export function Header() {
  const [toggle, setToggle] = useState(false);
  const pathName = usePathname();

  return (
    <div>
      <nav className="fixed z-10 w-full top-0 start-0 bg-white border-gray-200">
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <BiSolidMoviePlay className="text-4xl text-orange-500" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap">
              {APPNAME}
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center p-2 w-8 h-8 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={() => setToggle((t) => !t)}
          >
            <span className="sr-only">Open main menu</span>
            <FaAlignJustify className="text-2xl" />
          </button>
          <div
            className={
              toggle
                ? "block w-full md:block md:w-auto"
                : "hidden w-full md:block md:w-auto"
            }
          >
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
              {links.map((e, i) => (
                <Link
                  key={i}
                  href={e.href}
                  onClick={() => setToggle((t) => !t)}
                  className={
                    pathName === e.href
                      ? "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0"
                      : "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0"
                  }
                >
                  {e.title}
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
