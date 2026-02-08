Manual SQL migration: add reminder preferences to `User` and create `ReminderLog` table.

Run this migration manually against your MySQL database if you cannot run `prisma migrate` here.

SQL file: `migration.sql`

Steps:
1. Backup your database.
2. Run the SQL in `migration.sql` against your database (e.g. using `mysql` CLI).
3. Run `npx prisma generate`.

Note: This migration was generated manually to reflect schema.prisma changes that add `reminderEnabled`, `reminderWindowDays`, `reminderChannel` on the `User` model and create `ReminderLog`.
