import Link from "next/link";
import { FaHouse } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { type BreadcrumbProps } from "@/types/index";

export function Breadcrumb({ bcList }: BreadcrumbProps) {
  return (
    <nav
      className="flex px-5 py-3 text-gray-800 border border-gray-300 rounded-lg bg-gray-100"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {bcList.map(({ title, href, current, home }, index) => {
          if (home) {
            return (
              <li key={index} className="inline-flex items-center">
                <Link
                  href={href}
                  className="inline-flex items-center text-sm font-medium text-gray-800 hover:text-blue-700"
                >
                  <FaHouse className="mr-2.5" />
                  {title}
                </Link>
              </li>
            );
          } else if (current) {
            return (
              <li key={index} aria-current="page">
                <div className="flex items-center">
                  <FaAngleRight />
                  <span className="ms-1 text-sm font-medium text-gray-800 md:ms-2">
                    {title}
                  </span>
                </div>
              </li>
            );
          } else {
            return (
              <li key={index}>
                <div className="flex items-center">
                  <FaAngleRight />
                  <Link
                    href={href}
                    className="ms-1 text-sm font-medium text-gray-800 hover:text-blue-700 md:ms-2"
                  >
                    {title}
                  </Link>
                </div>
              </li>
            );
          }
        })}
      </ol>
    </nav>
  );
}
