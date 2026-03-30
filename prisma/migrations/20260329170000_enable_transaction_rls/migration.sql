ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname = 'auth'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "transaction_select_own" ON "Transaction"';
    EXECUTE 'DROP POLICY IF EXISTS "transaction_insert_own" ON "Transaction"';
    EXECUTE 'DROP POLICY IF EXISTS "transaction_update_own" ON "Transaction"';
    EXECUTE 'DROP POLICY IF EXISTS "transaction_delete_own" ON "Transaction"';

    EXECUTE '
      CREATE POLICY "transaction_select_own"
      ON "Transaction"
      FOR SELECT
      USING (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "transaction_insert_own"
      ON "Transaction"
      FOR INSERT
      WITH CHECK (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "transaction_update_own"
      ON "Transaction"
      FOR UPDATE
      USING (auth.uid() = "userId")
      WITH CHECK (auth.uid() = "userId")
    ';

    EXECUTE '
      CREATE POLICY "transaction_delete_own"
      ON "Transaction"
      FOR DELETE
      USING (auth.uid() = "userId")
    ';
  END IF;
END
$$;