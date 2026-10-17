export type Color =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone";

export type Size = "small" | "base" | "large";
export type Full = "full" | "base";

// Button
export type ButtonProps = {
  type: "button" | "submit";
  label: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  full?: true;
  color?: Color;
  size?: Size;
};

// LoadingButton
export type LoadingButtonProps = ButtonProps & {
  isProcessing: boolean;
};

// IconButton
export type IconButtonProps = ButtonProps & {
  icon: React.ReactNode;
};

// CircleIconButton
export type CircleIconButtonProps = Omit<IconButtonProps, "full">;

// ButtonLink
export type ButtonLinkProps = {
  href: string;
  text: string;
  blank?: boolean;
  className?: string;
  full?: true;
  color?: Color;
  size?: Size;
};

// IconBUttonLink
export type IconButtonLinkProps = ButtonLinkProps & {
  icon: React.ReactNode;
};

// Spinner for Loading
export type SpinnerProps = {
  className?: string;
  color?: Color;
  size?: Size;
};

// generate Button Style
export type BtnStyleArgsType = {
  color?: Color;
  size?: Size;
  full?: boolean;
  className?: string;
};

// generate Circle Button Style
export type CircleIconBtnStyleArgsType = {
  color?: Color;
  size?: Size;
  className?: string;
};

// generate Button Link Style
export type BtnLinkStyleArgsType = BtnStyleArgsType;

// generate Loading Spinner Style
export type SpinnerStyleArgsType = CircleIconBtnStyleArgsType;
