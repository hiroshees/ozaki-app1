'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { Dialog } from '@/components/ui/dialog';
import {
  EVENT_COLOR_CLASSES,
  EVENT_COLOR_LABELS,
} from '@/components/calendar/eventColors';
import { createEvent, updateEvent } from '@/lib/events/actions';
import {
  eventToFormValues,
  formValuesToInput,
  serverErrorsToFormErrors,
  validateFormValues,
  type EventFormField,
  type EventFormValues,
} from '@/lib/events/form';
import {
  EVENT_COLORS,
  MEMO_MAX_LENGTH,
  type CalendarEvent,
} from '@/lib/events/types';

export type EventFormTarget =
  | { kind: 'create'; initial: EventFormValues; token: number }
  | { kind: 'edit'; event: CalendarEvent };

const TITLE_ID = 'event-form-title';

// サーバーと同じ zod スキーマで検証し、エラーを項目に対応づける
const resolver: Resolver<EventFormValues> = async (values) => {
  const result = validateFormValues(values);
  if (result.ok) return { values, errors: {} };
  const errors: FieldErrors<EventFormValues> = {};
  for (const [field, message] of Object.entries(result.errors)) {
    errors[field as EventFormField] = { type: 'validation', message };
  }
  return { values: {}, errors };
};

export function EventFormDialog({
  target,
  onClose,
}: {
  // null のときは閉じている
  target: EventFormTarget | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={target !== null} onClose={onClose} labelledBy={TITLE_ID}>
      {/* 開くたびにフォームの状態を作り直す */}
      {target && (
        <EventForm
          key={
            target.kind === 'create'
              ? `create-${target.token}`
              : target.event.id
          }
          target={target}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

const inputClass =
  'h-9 w-full rounded-md border border-gray-300 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 aria-[invalid=true]:border-red-500';

function EventForm({
  target,
  onClose,
}: {
  target: EventFormTarget;
  onClose: () => void;
}) {
  const router = useRouter();
  const uid = useId();
  const submitting = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = target.kind === 'edit';

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues: isEdit ? eventToFormValues(target.event) : target.initial,
    resolver,
  });
  const allDay = watch('allDay');
  const memoLength = watch('memo')?.length ?? 0;

  const idOf = (field: EventFormField) => `${uid}-${field}`;
  const errorId = (field: EventFormField) => `${idOf(field)}-error`;
  const fieldProps = (field: EventFormField) => ({
    id: idOf(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
  });
  const FieldError = ({ field }: { field: EventFormField }) =>
    errors[field] ? (
      <p id={errorId(field)} className="mt-1 text-xs text-red-700">
        {errors[field]?.message}
      </p>
    ) : null;

  const onSubmit = handleSubmit(async (values) => {
    // Enter キーの連打などによる二重送信を防ぐ
    if (submitting.current) return;
    submitting.current = true;
    setFormError(null);
    try {
      const input = formValuesToInput(values);
      const result = isEdit
        ? await updateEvent({ ...input, id: target.event.id })
        : await createEvent(input);
      if (result.success) {
        onClose();
        router.refresh();
        return;
      }
      Object.entries(serverErrorsToFormErrors(result.fieldErrors)).forEach(
        ([field, message], i) =>
          setError(
            field as EventFormField,
            { type: 'server', message },
            { shouldFocus: i === 0 },
          ),
      );
      setFormError(result.message);
    } catch {
      setFormError('保存に失敗しました。時間をおいて再度お試しください');
    } finally {
      submitting.current = false;
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="p-5">
      <h2 id={TITLE_ID} className="text-lg font-semibold">
        {isEdit ? '予定を編集' : '予定を作成'}
      </h2>

      {formError && (
        <p
          role="alert"
          className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {formError}
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor={idOf('title')}
            className="mb-1 block text-xs text-gray-600"
          >
            タイトル
          </label>
          <input
            type="text"
            autoFocus={!isEdit}
            autoComplete="off"
            className={inputClass}
            {...fieldProps('title')}
            {...register('title')}
          />
          <FieldError field="title" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register('allDay')} />
          終日
        </label>

        <div>
          <span className="mb-1 block text-xs text-gray-600">開始</span>
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="開始日"
              className={inputClass}
              {...fieldProps('startDate')}
              {...register('startDate')}
            />
            {!allDay && (
              <input
                type="time"
                aria-label="開始時刻"
                className={inputClass}
                {...register('startTime')}
              />
            )}
          </div>
          <FieldError field="startDate" />
        </div>

        <div>
          <span className="mb-1 block text-xs text-gray-600">
            終了{allDay && '（最終日）'}
          </span>
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="終了日"
              className={inputClass}
              {...fieldProps('endDate')}
              {...register('endDate')}
            />
            {!allDay && (
              <input
                type="time"
                aria-label="終了時刻"
                className={inputClass}
                {...register('endTime')}
              />
            )}
          </div>
          <FieldError field="endDate" />
        </div>

        <fieldset>
          <legend className="mb-1 text-xs text-gray-600">色</legend>
          <div className="flex gap-3">
            {EVENT_COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  value={color}
                  className="peer sr-only"
                  {...register('color')}
                />
                <span
                  aria-hidden="true"
                  className={`block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 ${EVENT_COLOR_CLASSES[color].dot}`}
                />
                <span className="sr-only">{EVENT_COLOR_LABELS[color]}</span>
              </label>
            ))}
          </div>
          <FieldError field="color" />
        </fieldset>

        <div>
          <label
            htmlFor={idOf('memo')}
            className="mb-1 block text-xs text-gray-600"
          >
            メモ
          </label>
          <textarea
            rows={4}
            className={`${inputClass} h-auto py-1.5`}
            {...fieldProps('memo')}
            {...register('memo')}
          />
          <div className="mt-1 flex justify-between text-xs">
            <span>
              <FieldError field="memo" />
            </span>
            <span
              className={
                memoLength > MEMO_MAX_LENGTH ? 'text-red-700' : 'text-gray-500'
              }
            >
              {memoLength}/{MEMO_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-md border border-gray-300 px-4 text-sm outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
        >
          {isSubmitting ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  );
}
