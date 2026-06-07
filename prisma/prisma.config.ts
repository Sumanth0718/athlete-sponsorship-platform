import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Path to your Prisma schema file
  schema: 'prisma/schema.prisma',
  // Datasource configuration
  datasource: {
    url: env('DATABASE_URL'),
  },
});
