
# TypeORM Migration Conventions

## Naming & Timestamps

- The filename timestamp **must be generated at creation time** using `Date.now()` — never a made-up number.
- The class name and `name` property must match the filename exactly.
- The filename must be **kebab-case and descriptive** — it should read like a sentence of what the migration does.

```
✅ 1775629482950-rag-optimizer-setup.ts
✅ 1775630000000-add-verified-column-to-users.ts

❌ 1234567890000-migration.ts
❌ 1775629482950-update.ts
```

---

## Idempotent DDL — always use safe guards

Every statement must be safe to run more than once. Use `IF NOT EXISTS` / `IF EXISTS` everywhere.

```sql
-- ✅ Tables
CREATE TABLE IF NOT EXISTS "my_table" ( ... );
DROP TABLE IF EXISTS "my_table";

-- ✅ Columns
ALTER TABLE "my_table" ADD COLUMN IF NOT EXISTS "myCol" text;
ALTER TABLE "my_table" DROP COLUMN IF EXISTS "myCol";

-- ✅ Indexes
CREATE INDEX IF NOT EXISTS "IDX_my_table_col" ON "my_table" ("col");
DROP INDEX IF EXISTS "IDX_my_table_col";

-- ✅ Enum types — PostgreSQL has no CREATE TYPE IF NOT EXISTS; use a DO block instead
DO $$ BEGIN
  CREATE TYPE "public"."my_enum" AS ENUM('a', 'b');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DROP TYPE IF EXISTS "public"."my_enum";
```

---

## Enum Changes — never drop & recreate

Dropping and recreating an enum type fails if any column still references it.
Add or remove individual values instead.

```sql
-- ✅ Adding a value (up)
ALTER TYPE "public"."my_enum" ADD VALUE IF NOT EXISTS 'new_value';

-- ✅ Removing a value (up)
--    Postgres has no DROP VALUE — rename the type, recreate without the value, cast, drop old.
ALTER TYPE "public"."my_enum" RENAME TO "my_enum_old";
CREATE TYPE "public"."my_enum" AS ENUM('a', 'b');
ALTER TABLE "my_table"
  ALTER COLUMN "col" TYPE "public"."my_enum"
  USING "col"::text::"public"."my_enum";
DROP TYPE "public"."my_enum_old";

-- ❌ Never do this for an existing type
DROP TYPE "public"."my_enum";
CREATE TYPE "public"."my_enum" AS ENUM('a', 'b', 'new_value');
```

---

## Migrations Must Always Be Fully Revertable

`down()` must undo `up()` completely and safely — including data concerns.

### Reverting an enum value removal

When `up()` removes an enum value, `down()` must restore it.
Before re-adding the value in `down()`, **delete or migrate any rows** that would conflict with the restored state — otherwise the cast back will fail.

```typescript
// up()  — removes 'deprecated_value' from the enum
public async up(queryRunner: QueryRunner): Promise<void> {
  // Remove rows that use the value being dropped so the cast succeeds
  await queryRunner.query(
    `DELETE FROM "my_table" WHERE "col" = 'deprecated_value'`,
  );
  await queryRunner.query(`ALTER TYPE "public"."my_enum" RENAME TO "my_enum_old"`);
  await queryRunner.query(`CREATE TYPE "public"."my_enum" AS ENUM('a', 'b')`);
  await queryRunner.query(
    `ALTER TABLE "my_table" ALTER COLUMN "col" TYPE "public"."my_enum" USING "col"::text::"public"."my_enum"`,
  );
  await queryRunner.query(`DROP TYPE "public"."my_enum_old"`);
}

// down() — restores 'deprecated_value'
public async down(queryRunner: QueryRunner): Promise<void> {
  // No rows with 'deprecated_value' exist (we deleted them in up), so adding
  // the value back is safe without any data migration.
  await queryRunner.query(
    `ALTER TYPE "public"."my_enum" ADD VALUE IF NOT EXISTS 'deprecated_value'`,
  );
}
```

### Reverting an enum value addition

When `up()` adds a value, `down()` must remove it. Since Postgres has no `DROP VALUE`, use the rename-recreate pattern **and** clear any rows using that value first.

```typescript
// up()  — adds 'new_value'
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `ALTER TYPE "public"."my_enum" ADD VALUE IF NOT EXISTS 'new_value'`,
  );
}

// down() — removes 'new_value'
public async down(queryRunner: QueryRunner): Promise<void> {
  // Clear rows that use the value being removed so the cast succeeds
  await queryRunner.query(
    `DELETE FROM "my_table" WHERE "col" = 'new_value'`,
  );
  await queryRunner.query(`ALTER TYPE "public"."my_enum" RENAME TO "my_enum_old"`);
  await queryRunner.query(`CREATE TYPE "public"."my_enum" AS ENUM('a', 'b')`);
  await queryRunner.query(
    `ALTER TABLE "my_table" ALTER COLUMN "col" TYPE "public"."my_enum" USING "col"::text::"public"."my_enum"`,
  );
  await queryRunner.query(`DROP TYPE "public"."my_enum_old"`);
}
```

> **Rule:** before any enum cast, ensure no rows in any affected column contain a value not present in the target enum. Use `DELETE`, `UPDATE`, or a `USING` expression to handle them explicitly.

---

## No Project Imports

Migrations must be **fully self-contained**. Never import types, constants, enums, or anything else from the project source.

If the migration needs a value that exists elsewhere in the codebase (e.g. an enum member, a column default), copy it inline. The migration file must still compile and run correctly even if the referenced source file is later renamed, refactored, or deleted.

```typescript
// ❌ NEVER — breaks if the enum is moved or renamed
import { MyStatus } from 'src/models/my-entity/types/my-status.enum';
await queryRunner.query(`... WHERE "status" = '${MyStatus.Active}'`);

// ✅ CORRECT — inline the value directly
await queryRunner.query(`... WHERE "status" = 'active'`);
```

```typescript
// ❌ NEVER
import { MigrationInterface, QueryRunner } from 'typeorm';
import { ragOptimizerTraceStepList } from 'src/models/rag-optimizer-traces/types/...';

// ✅ CORRECT — only typeorm imports are allowed
import { MigrationInterface, QueryRunner } from 'typeorm';
```

> **Rule:** the only permitted imports in a migration file are from `typeorm`. Everything else must be written inline as a plain string or literal value.

---

## Migration File Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DescriptiveNameHere1775629482950 implements MigrationInterface {
  name = 'DescriptiveNameHere1775629482950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "my_table" ADD COLUMN IF NOT EXISTS "newCol" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "my_table" DROP COLUMN IF EXISTS "newCol"`,
    );
  }
}
```

---

## Checklist

- [ ] Timestamp generated with `Date.now()` at creation time
- [ ] Filename is descriptive and matches class name + `name` property
- [ ] All `CREATE`/`DROP`/`ALTER` use `IF NOT EXISTS` / `IF EXISTS`
- [ ] Enum changes use `ADD VALUE` / rename-recreate pattern — never drop & recreate
- [ ] `down()` fully reverses `up()` using the same safe guards
- [ ] Before any enum cast, rows with invalid values are deleted or migrated first
- [ ] No imports from the project — only `typeorm` imports are allowed; all values are inlined
