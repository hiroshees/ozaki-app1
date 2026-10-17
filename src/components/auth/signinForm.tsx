"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninFormSchema, type SigninFormType } from "@/types/auth";
import { TextInput, PassworInput } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/button";
import { signInAction } from "@/actions/auth";

export function SigninForm() {
  const { register, handleSubmit, formState, setError, clearErrors } =
    useForm<SigninFormType>({
      resolver: zodResolver(SigninFormSchema),
    });
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<SigninFormType> = async (
    data: SigninFormType,
  ) => {
    clearErrors();
    // サーバアクションを起動
    const result = await signInAction(data);
    if (result && !result.success) {
      // サーバー側バリデーション失敗なら、エラーを表示する
      Object.entries(result.error!).map(([key, value]) => {
        setError(`root.${key}`, { message: value[0] });
      });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-2 mb-6">
        <TextInput
          label="メールアドレス"
          name="email"
          placeholder="input email"
          type="text"
          error={errors.email?.message || errors.root?.email?.message}
          register={register}
          formState={formState}
        />
      </div>
      <div className="mt-2 mb-6">
        <PassworInput
          label="パスワード"
          name="password"
          placeholder="input password"
          error={errors.password?.message || errors.root?.password?.message}
          register={register}
          formState={formState}
        />
      </div>
      <LoadingButton
        label="サインイン"
        type="submit"
        full={true}
        color="blue"
        isProcessing={isSubmitting}
        disabled={!isDirty || !isValid || isSubmitting}
      />
    </form>
  );
}
