import * as z from "zod";

export const SigninFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールは必須です" })
    .email({ message: "メールの形式を入力してください" }),
  password: z
    .string()
    .min(1, { message: "パスワードは必須です" })
    .min(8, "パスワードが短いです"),
});

export const SignupFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "メールは必須です" })
      .email({ message: "メールの形式を入力してください" }),
    password: z
      .string()
      .min(1, { message: "パスワードは必須です" })
      .min(8, "パスワードが短いです"),
    password_confirm: z
      .string()
      .min(1, { message: "パスワードは必須です" })
      .min(8, "パスワードが短いです"),
  })
  .superRefine(({ password, password_confirm }, ctx) => {
    if (password !== password_confirm) {
      ctx.addIssue({
        path: ["password_confirm"],
        code: "custom",
        message: "確認用パスワードがマッチしません",
      });
    }
  });

// パスワード更新
export const UpdatePasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "パスワードは必須です" })
      .min(8, "パスワードが短いです"),
    password_confirm: z
      .string()
      .min(1, { message: "パスワードは必須です" })
      .min(8, "パスワードが短いです"),
  })
  .superRefine(({ password, password_confirm }, ctx) => {
    if (password !== password_confirm) {
      ctx.addIssue({
        path: ["password_confirm"],
        code: "custom",
        message: "確認用パスワードがマッチしません",
      });
    }
  });

// プロフィール更新
export const ProfileFormSchema = z.object({
  fullname: z.string().min(1, { message: "必須です" }),
});

export type AuthSignData = {
  email: string;
  password: string;
};

export type AuthUser = {
  userName: string | undefined;
  email: string | undefined;
  avatarUrl: string | undefined;
};

export type AuthUserContext = {
  authUser: AuthUser;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser>>;
};

// スキーマ定義から型を定義
export type SigninFormType = z.infer<typeof SigninFormSchema>;
export type SignupFormType = z.infer<typeof SignupFormSchema>;
export type UpdatePasswordFormType = z.infer<typeof UpdatePasswordFormSchema>;
export type ProfileFormType = z.infer<typeof ProfileFormSchema>;
