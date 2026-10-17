import { ButtonLink } from "@/components/ui/link";

export default function Page() {
  const message = "不明なエラーです";

  return (
    <div className="text-center">
      <h1 className="p-4 text-center text-2xl text-white bg-red-500 font-semibold">
        認証エラー
      </h1>
      <h2 className="m-4 p-4 text-xl">{message}</h2>
      <ButtonLink href="/" color="blue" text="HOME" />
    </div>
  );
}
