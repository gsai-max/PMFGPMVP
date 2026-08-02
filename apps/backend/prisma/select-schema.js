const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const sourceFile = isPostgres ? 'schema.postgresql.prisma' : 'schema.sqlite.prisma';
const targetFile = 'schema.prisma';

const prismaDir = __dirname;
const sourcePath = path.join(prismaDir, sourceFile);
const targetPath = path.join(prismaDir, targetFile);

console.log(`[Prisma Schema Selector] DATABASE_URL detected (${isPostgres ? 'PostgreSQL' : 'SQLite'}). Syncing ${sourceFile} -> ${targetFile}`);
fs.copyFileSync(sourcePath, targetPath);
