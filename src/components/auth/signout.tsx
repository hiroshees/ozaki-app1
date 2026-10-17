"use client";

import { SignoutAction } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// サインアウト
export function Signout() {
  const handleSubmit = async () => {
    await SignoutAction();
  };

  return (
    <form action={handleSubmit}>
      <SignoutButton />
    </form>
  );
}

function SignoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      onClick={(e) => e.stopPropagation()}
      className="block px-4 py-2 text-left text-sm w-full text-gray-700 hover:bg-gray-100"
      disabled={pending ? true : false}
    >
      サインアウト
      {pending ? (
        <AiOutlineLoading3Quarters className="inline w-4 h-4 ml-3 text-gray-700 animate-spin" />
      ) : (
        ""
      )}
    </button>
  );
}
