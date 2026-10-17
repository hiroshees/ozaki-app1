export type SignInActionReturnType =
  | undefined
  | {
      success: boolean;
      error: {
        email?: string[];
        password?: string[];
      };
    };

export type SignUpActionReturnType =
  | undefined
  | {
      success: boolean;
      error: {
        email?: string[];
        password?: string[];
        password_confirm?: string[];
      };
    };

export type PasswordUpteActionReturnType =
  | {
      success: true;
    }
  | {
      success: boolean;
      error: {
        password?: string[];
        password_confirm?: string[];
      };
    };

export type ProfileUpteActionReturnType =
  | {
      success: true;
    }
  | {
      success: boolean;
      error: {
        fullname?: string[];
      };
    };

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
