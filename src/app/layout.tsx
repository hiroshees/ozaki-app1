import type { Metadata } from "next";
import { M_PLUS_1p } from "next/font/google";
import { APPNAME } from "@/config/data";
import "./globals.css";

const mPlus = M_PLUS_1p({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-m-plus",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APPNAME,
    template: `%s | ${APPNAME}`,
  },
  description: APPNAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <body className={`${mPlus.className}`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
