ALTER TABLE "Category" ADD COLUMN "userId" UUID;

CREATE TEMP TABLE "_CategoryUserMap" AS
SELECT
  gen_random_uuid()::text AS "newId",
  c."id" AS "oldId",
  t."userId" AS "userId",
  c."name" AS "name",
  c."type" AS "type"
FROM "Category" c
JOIN "Transaction" t ON t."categoryId" = c."id"
GROUP BY c."id", t."userId", c."name", c."type";

INSERT INTO "Category" ("id", "userId", "name", "type")
SELECT "newId", "userId", "name", "type"
FROM "_CategoryUserMap";

UPDATE "Transaction" t
SET "categoryId" = m."newId"
FROM "_CategoryUserMap" m
WHERE t."categoryId" = m."oldId"
  AND t."userId" = m."userId";

DELETE FROM "Category"
WHERE "userId" IS NULL;

ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX "Category_userId_idx" ON "Category"("userId");
CREATE UNIQUE INDEX "Category_userId_type_name_key" ON "Category"("userId", "type", "name");
