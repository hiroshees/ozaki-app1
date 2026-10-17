import { type LayoutProps } from "@/types/page";
import { AuthUserProvider } from "@/components/states/providers/authUserProvider";
import { getAuth } from "@/hooks/auth/server";
import { Header } from "@/components/layout/headerPrivate";
import { Footer } from "@/components/layout/footer";

export default async function Layout({ children }: LayoutProps) {
  const { userName, email, avatarUrl } = await getAuth();
  const defaultValue = {
    authUser: { userName, email, avatarUrl },
  };

  return (
    <AuthUserProvider {...defaultValue}>
      <Header />
      <div className="mt-16 mb-16">{children}</div>
      <Footer />
    </AuthUserProvider>
  );
}
