"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa6";
import { BiSolidMoviePlay } from "react-icons/bi";
import { APPNAME, PAGE_AFTER_LOGIN } from "@/config/data";
import { useAuthUser } from "@/hooks/auth/authUser";
import { Signout } from "@/components/auth/signout";
import { SearchBox } from "@/components/common/searchBox";

const avatarLinks = [
  { title: "ダッシュボード", href: "/dashboard" },
  { title: "設定", href: "/settings" },
];

export function Header() {
  const [userToggle, setUserToggle] = useState(false);
  const {
    authUser: { avatarUrl, email, userName },
  } = useAuthUser();

  return (
    <nav className="fixed z-10 w-full top-0 start-0 bg-white border-gray-200">
      <div className="mx-auto flex justify-start p-4">
        <Link
          href={PAGE_AFTER_LOGIN}
          className="justify-self-start flex items-center space-x-3 grow"
        >
          <BiSolidMoviePlay className="text-4xl text-orange-500" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            {APPNAME}
          </span>
        </Link>

        <div className=" flex items-center ml-4 w-[350px]">
          <SearchBox />
          <button
            type="button"
            className="flex text-sm rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom"
            onClick={() => setUserToggle((t) => !t)}
          >
            <span className="sr-only">Open user menu</span>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                className="w-8 h-8 rounded-full"
                width={200}
                height={200}
                alt={`${email} avataricon`}
              />
            ) : (
              <FaUser className="w-8 h-8 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div
        className={
          userToggle ? "z-50 block fixed top-0 w-full h-full" : "z-50 hidden"
        }
        onClick={() => setUserToggle(false)}
      >
        <div className="my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg fixed top-12 right-3 drop-shadow-lg border border-1 border-gray-200">
          <div className="px-4 py-3">
            <span className="block text-sm text-gray-900 dark:text-white">
              {userName ? userName : "[notset]"}
            </span>
            <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
              {email}
            </span>
          </div>
          <ul className="py-2" aria-labelledby="user-menu-button">
            {avatarLinks.map((e, i) => (
              <li key={i}>
                <Link
                  href={e.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {e.title}
                </Link>
              </li>
            ))}
            <li>
              <Signout />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
