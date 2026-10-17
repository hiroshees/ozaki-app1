"use client";

import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormSchema, type ProfileFormType } from "@/types/auth";
import { useAuthUser } from "@/hooks/auth/authUser";
import { TextInput } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/button";
import { SuccessModal } from "@/components/ui/modal";
import { updateProfileAction } from "@/actions/auth";

export function ProfileUpdateForm() {
  const [showModal, setShowModal] = useState(false);
  const {
    authUser: { userName },
    setAuthUser,
  } = useAuthUser();

  const defaultValues = {
    fullname: userName,
  };

  const { register, handleSubmit, reset, formState, setError, clearErrors } =
    useForm<ProfileFormType>({
      resolver: zodResolver(ProfileFormSchema),
      defaultValues,
    });
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<ProfileFormType> = async (
    data: ProfileFormType,
  ) => {
    clearErrors();
    // サーバアクションを起動
    const result = await updateProfileAction(data);
    if (result.success) {
      // update AuthContext
      setAuthUser((e) => ({ ...e, userName: data.fullname }));
      setShowModal(true);
    } else {
      // サーバー側バリデーション失敗なら、エラーを表示する
      Object.entries(result.error!).map(([key, value]) => {
        setError(`root.${key}`, { message: value[0] });
      });
    }
  };

  useEffect(() => {
    if (userName) {
      reset({ fullname: userName });
    }
  }, [userName, reset]);

  return (
    <div className="relative">
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
        <div className="absolute -top-4 bg-white px-4 text-xl">
          プロフィール
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2 mb-6">
              <TextInput
                label="名前"
                name="fullname"
                type="text"
                placeholder="input fullname"
                error={
                  errors.fullname?.message ||
                  errors.root?.fullnamepassword?.message
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
          mainText="プロフィールを更新しました"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
