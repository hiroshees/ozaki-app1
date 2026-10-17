import { UseFormRegister, FieldValues, Path, FormState } from "react-hook-form";

export type InputColorStyle = "default" | "success" | "failure";
export type Size = "small" | "base" | "large";
export type Full = "full" | "base";

// テキストボックス
export type TextInputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  placeholder: string;
  type: "text" | "number" | "email" | "password";
  error?: string;
  register: UseFormRegister<T>;
  formState: FormState<T>;
};

// パスワードテキストボックス
export type PasswordInputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  placeholder: string;
  error?: string;
  register: UseFormRegister<T>;
  formState: FormState<T>;
};

// labelのみをオプショナルにする
type Optional<T extends FieldValues, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type TextInputNoLabelProps<T extends FieldValues> = Optional<
  TextInputProps<T>,
  "label"
>;

// generate Input Text Style
export type InputStyleArgsType = {
  color?: InputColorStyle;
  size?: Size;
  full?: boolean;
  className?: string;
};

// generate Label Style
export type LabelStyleArgsType = {
  color?: InputColorStyle;
  size?: Size;
  className?: string;
};

// generate Help Style
export type HelpStyleArgsType = {
  color?: InputColorStyle;
  size?: Size;
  className?: string;
};
