/**
 * Load demo SQL seeds after TypeORM migrations (idempotent check).
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const SEED_FILES = [
  "01-schema-fixups.sql",
  "02-seed-users.sql",
  "03-seed-demo-data.sql",
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "lamtek",
    password: process.env.DB_PASSWORD || "lamtek123",
    database: process.env.DB_DATABASE || "lamtek_db",
    multipleStatements: true,
  });

  try {
    const [[{ cnt }]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'akreditasi'",
      [process.env.DB_DATABASE || "lamtek_db"],
    );

    if (Number(cnt) === 0) {
      console.log("[load-sql-seeds] akreditasi table missing — run migrations first");
      return;
    }

    const [[{ rowCount }]] = await conn.query(
      "SELECT COUNT(*) AS rowCount FROM akreditasi",
    );
    if (Number(rowCount) > 0) {
      console.log("[load-sql-seeds] Demo data already present — skipping SQL seeds");
      return;
    }

    const migrationDir = path.join(__dirname, "..", "database", "migration");
    for (const file of SEED_FILES) {
      const filePath = path.join(migrationDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`[load-sql-seeds] Missing ${file} — skipped`);
        continue;
      }
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`[load-sql-seeds] Applying ${file}...`);
      await conn.query(sql);
    }

    console.log("[load-sql-seeds] SQL demo seeds loaded");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.warn(`[load-sql-seeds] Warning: ${err.message}`);
});
