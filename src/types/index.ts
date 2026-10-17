export type SuccessModalProps = {
  mainText: string;
  okButtonText?: string;
  onClose: () => void;
};

export type ErrorModalProps = {
  mainText: string;
  okButtonText?: string;
  onClose: () => void;
};

export type BreadcrumbParam = {
  title: string;
  href: string;
  current: boolean;
  home: boolean;
};

export type BreadcrumbList = BreadcrumbParam[];

export type BreadcrumbProps = {
  bcList: BreadcrumbList;
};

export type MyImageProps = {
  src: string;
  alt: string;
  className: string;
  errorClassName: string;
  width: number;
  height: number;
};

export type SearchBoxProps = {
  keyword?: string;
};
