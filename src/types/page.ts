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
