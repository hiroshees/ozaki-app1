-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "memo" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_starts_at_ends_at_idx" ON "events"("starts_at", "ends_at");


-- 終了は開始より後であること
ALTER TABLE "events" ADD CONSTRAINT "events_ends_after_starts" CHECK ("ends_at" > "starts_at");

-- 更新時に updated_at を自動更新する（supabase-js 経由の UPDATE 対策）
CREATE FUNCTION "set_events_updated_at"() RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "events_set_updated_at"
  BEFORE UPDATE ON "events"
  FOR EACH ROW EXECUTE FUNCTION "set_events_updated_at"();

-- RLS: ブラウザ（anon）は読み取りのみ。書き込みは secret key（RLS をバイパス）のみ
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON "events"
  FOR SELECT TO anon, authenticated
  USING (true);
