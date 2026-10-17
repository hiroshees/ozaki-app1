import { FcGoogle } from "react-icons/fc";
import { SignInWithOAuthAction } from "@/actions/auth";

export function GoogleLoginButton() {
  return (
    <form>
      <button
        formAction={SignInWithOAuthAction}
        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-md font-medium rounded-lg border border-gray-500 bg-slate-100 text-gray-800 shadow-sm hover:bg-gray-200 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
      >
        <FcGoogle />
        Googleでサインイン
      </button>
    </form>
  );
}
