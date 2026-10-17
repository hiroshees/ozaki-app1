import prisma from "@/db/prisma";

export async function getList() {
  // 全件取得
  const result = await prisma.xxxx.findMany({
    orderBy: {
      id: "asc",
    },
  });
  return result;
}
