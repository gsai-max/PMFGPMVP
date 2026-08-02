const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const sourceFile = isPostgres ? 'schema.postgresql.prisma' : 'schema.sqlite.prisma';
const targetFile = 'schema.prisma';

const prismaDir = __dirname;
const sourcePath = path.join(prismaDir, sourceFile);
const targetPath = path.join(prismaDir, targetFile);

console.log(`[Prisma Schema Selector] DATABASE_URL detected (${isPostgres ? 'PostgreSQL' : 'SQLite'}). Syncing ${sourceFile} -> ${targetFile}`);

const currentContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

if (currentContent !== sourceContent) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`[Prisma Schema Selector] Updated ${targetFile} to ${sourceFile}. Regenerating Prisma Client...`);
  try {
    execSync(`npx prisma generate --schema="${targetPath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('[Prisma Schema Selector] Warning: npx prisma generate failed:', err.message);
  }
} else {
  console.log(`[Prisma Schema Selector] ${targetFile} is already up to date.`);
}

