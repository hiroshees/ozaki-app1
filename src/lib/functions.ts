import { decodeHTML } from "entities";

// sec秒待機する
export const timeout = async (sec: number) => {
  await new Promise((resolve) => setTimeout(resolve, sec));
};

// minからmaxの範囲の乱数を返す
export const getRandom = function (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Promiseの配列を受け取り、直列実行を行う
export const sequential = <T>(promises: (() => Promise<T>)[]): Promise<T[]> => {
  return promises.reduce(
    async (res, next) => {
      const r = await res;
      r.push(await next());
      return r;
    },
    Promise.resolve([] as T[]),
  );
};

// HTMLエンティティを文字列に変換する
export function htmlDecode(input: string): string {
  return decodeHTML(input);
}
