ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname = 'auth'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "category_select_own" ON "Category"';
    EXECUTE 'DROP POLICY IF EXISTS "category_insert_own" ON "Category"';
    EXECUTE 'DROP POLICY IF EXISTS "category_update_own" ON "Category"';
    EXECUTE 'DROP POLICY IF EXISTS "category_delete_own" ON "Category"';

    EXECUTE '
      CREATE POLICY "category_select_own"
      ON "Category"
      FOR SELECT
      USING (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "category_insert_own"
      ON "Category"
      FOR INSERT
      WITH CHECK (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "category_update_own"
      ON "Category"
      FOR UPDATE
      USING (auth.uid() = "userId")
      WITH CHECK (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "category_delete_own"
      ON "Category"
      FOR DELETE
      USING (auth.uid() = "userId")
    ';
  END IF;
END
$$;
