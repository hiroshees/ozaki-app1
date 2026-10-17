import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { type LayoutProps } from "@/types/page";

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <div className="mt-16 mb-16">{children}</div>
      <Footer />
    </>
  );
}
