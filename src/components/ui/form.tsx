import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FieldValues } from "react-hook-form";
import {
  type TextInputProps,
  type PasswordInputProps,
  type TextInputNoLabelProps,
  type InputColorStyle,
} from "@/types/form";
import {
  generateInputStyle,
  generateLabelStyle,
  generateHelpStyle,
} from "@/components/ui/formStyle";

export function TextInput<T extends FieldValues>({
  label,
  name,
  placeholder,
  type,
  error,
  register,
  formState,
}: TextInputProps<T>) {
  const { submitCount } = formState;
  let color: InputColorStyle = "default";
  if (submitCount === 0) {
    color = "default";
  } else if (error !== undefined) {
    color = "failure";
  } else {
    color = "success";
  }

  const inputCn = generateInputStyle({ color, full: true });
  const labelCn = generateLabelStyle({ color });
  const helpCn = generateHelpStyle({ color });

  return (
    <>
      <label htmlFor={name} className={labelCn}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        className={inputCn}
        {...register(name)}
      />
      {error && <p className={helpCn}>{error}</p>}
    </>
  );
}

export function PassworInput<T extends FieldValues>({
  label,
  name,
  placeholder,
  error,
  register,
  formState,
}: PasswordInputProps<T>) {
  const [visible, setVisible] = useState(false);
  const { submitCount } = formState;
  const handleToggle = () => setVisible((e) => !e);

  let color: "default" | "success" | "failure" = "default";
  if (submitCount === 0) {
    color = "default";
  } else if (error !== undefined) {
    color = "failure";
  } else {
    color = "success";
  }

  const inputCn = generateInputStyle({ color, full: true });
  const labelCn = generateLabelStyle({ color });
  const helpCn = generateHelpStyle({ color });

  return (
    <div className="relative">
      <label htmlFor={name} className={labelCn}>
        {label}
      </label>
      <input
        id={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className={inputCn}
        {...register(name)}
      />
      <button
        type="button"
        className="absolute right-3 top-10"
        onClick={handleToggle}
      >
        {visible ? <HiEye size="1.5em" /> : <HiEyeOff size="1.5em" />}
      </button>
      {error && <p className={helpCn}>{error}</p>}
    </div>
  );
}

export function TextInputNoLabel<T extends FieldValues>({
  label,
  name,
  placeholder,
  type,
  error,
  register,
  formState,
}: TextInputNoLabelProps<T>) {
  const { submitCount } = formState;

  let color: "default" | "success" | "failure" = "default";
  if (submitCount === 0) {
    color = "default";
  } else if (error !== undefined) {
    color = "failure";
  } else {
    color = "success";
  }

  const inputCn = generateInputStyle({ color, full: true });
  const labelCn = generateLabelStyle({ color });
  const helpCn = generateHelpStyle({ color });

  return (
    <>
      {label && (
        <label htmlFor={name} className={labelCn}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        className={inputCn}
        {...register(name)}
      />
      {error && <p className={helpCn}>{error}</p>}
    </>
  );
}
