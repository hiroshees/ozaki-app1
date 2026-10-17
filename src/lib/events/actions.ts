'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import {
  createEventRecord,
  deleteEventRecord,
  updateEventRecord,
  type ActionResult,
} from '@/lib/events/mutations';

// 入力は信頼せず unknown で受け、mutations 側で zod 検証する
export async function createEvent(input: unknown): Promise<ActionResult> {
  return createEventRecord(createAdminClient(), input);
}

export async function updateEvent(input: unknown): Promise<ActionResult> {
  return updateEventRecord(createAdminClient(), input);
}

export async function deleteEvent(id: unknown): Promise<ActionResult> {
  return deleteEventRecord(createAdminClient(), id);
}
