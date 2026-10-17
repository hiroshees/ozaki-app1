import { z } from 'zod';
import {
  DEFAULT_EVENT_COLOR,
  EVENT_COLORS,
  MEMO_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '@/lib/events/types';

// 作成・更新に共通する入力（ISO 文字列も Date に変換する）
export const eventInputSchema = z
  .object({
    title: z
      .string({ required_error: 'タイトルは必須です' })
      .min(1, 'タイトルは必須です')
      .max(
        TITLE_MAX_LENGTH,
        `タイトルは${TITLE_MAX_LENGTH}文字以内にしてください`,
      ),
    // 不正な日時（Invalid Date）も同じメッセージにする
    startsAt: z.coerce.date({
      errorMap: () => ({ message: '開始日時が不正です' }),
    }),
    endsAt: z.coerce.date({
      errorMap: () => ({ message: '終了日時が不正です' }),
    }),
    allDay: z.boolean().default(false),
    color: z.enum(EVENT_COLORS).default(DEFAULT_EVENT_COLOR),
    memo: z
      .string()
      .max(MEMO_MAX_LENGTH, `メモは${MEMO_MAX_LENGTH}文字以内にしてください`)
      .default(''),
  })
  .superRefine((v, ctx) => {
    // DB の CHECK 制約（ends_at > starts_at）と揃える。終日予定の終了は含まない日付
    if (v.endsAt.getTime() <= v.startsAt.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: '終了は開始より後にしてください',
      });
    }
  });

export const eventUpdateSchema = eventInputSchema.and(
  z.object({ id: z.string().uuid('IDが不正です') }),
);

export type EventInput = z.infer<typeof eventInputSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
