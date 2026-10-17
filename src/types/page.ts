import { AuthUser } from "@/types/auth";

export type GlobalErrorProps = {
  error: Error;
  reset: () => void;
};

export type PageProps = {
  children: React.ReactNode;
};

export type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export type AuthUserProviderProps = Readonly<{
  children: React.ReactNode;
  authUser: AuthUser;
}>;

export type SearchPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};
