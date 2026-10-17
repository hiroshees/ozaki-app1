"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdatePasswordFormSchema,
  type UpdatePasswordFormType,
} from "@/types/auth";
import { PassworInput } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/button";
import { SuccessModal } from "@/components/ui/modal";
import { updatePasswordAction } from "@/actions/auth";

export const PasswordUpdateForm = () => {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, formState, setError, clearErrors } =
    useForm<UpdatePasswordFormType>({
      resolver: zodResolver(UpdatePasswordFormSchema),
    });
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<UpdatePasswordFormType> = async (
    data: UpdatePasswordFormType,
  ) => {
    clearErrors();
    // サーバアクションを起動
    const result = await updatePasswordAction(data);
    if (result.success) {
      setShowModal(true);
    } else {
      // サーバー側バリデーション失敗なら、エラーを表示する
      Object.entries(result.error!).map(([key, value]) => {
        setError(`root.${key}`, { message: value[0] });
      });
    }
  };

  return (
    <div className="relative">
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
        <div className="absolute -top-4 bg-white px-4 text-xl">パスワード</div>
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2 mb-6">
              <PassworInput
                label="パスワード"
                name="password"
                placeholder="input password"
                error={
                  errors.password?.message || errors.root?.password?.message
                }
                register={register}
                formState={formState}
              />
            </div>
            <div className="mt-2 mb-6">
              <PassworInput
                label="パスワード確認用"
                name="password_confirm"
                placeholder="input password"
                error={
                  errors.password_confirm?.message ||
                  errors.root?.password_confirm?.message
                }
                register={register}
                formState={formState}
              />
            </div>
            <LoadingButton
              label="更新"
              type="submit"
              full={true}
              color="blue"
              isProcessing={isSubmitting}
              disabled={!isDirty || !isValid || isSubmitting}
            />
          </form>
        </div>
      </div>
      {showModal && (
        <SuccessModal
          mainText="パスワードを更新しました"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
