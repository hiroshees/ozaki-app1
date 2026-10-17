import { APPNAME } from "@/config/data";

export function Footer() {
  return (
    <div className="text-center bg-orange-200 fixed bottom-0 w-full p-0.5">
      <h3 className="p-4 text-lg text-slate-800">-- {APPNAME} --</h3>
    </div>
  );
}
