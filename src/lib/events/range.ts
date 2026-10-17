// 表示範囲と重なる予定: starts_at < 範囲の終わり AND ends_at > 範囲の始まり
// 端が接しているだけ（終了ちょうどに開始など）の予定は含まない

type Period = { startsAt: Date; endsAt: Date };

export function overlapsRange(
  event: Period,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  return (
    event.startsAt.getTime() < rangeEnd.getTime() &&
    event.endsAt.getTime() > rangeStart.getTime()
  );
}

// DB のフィルタ条件に渡す値（ISO 文字列）を作る
export function buildRangeFilter(rangeStart: Date, rangeEnd: Date) {
  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    throw new Error('表示範囲の日時が不正です');
  }
  if (rangeEnd.getTime() <= rangeStart.getTime()) {
    throw new Error('表示範囲の終わりは始まりより後にしてください');
  }
  return {
    startsBefore: rangeEnd.toISOString(),
    endsAfter: rangeStart.toISOString(),
  };
}
